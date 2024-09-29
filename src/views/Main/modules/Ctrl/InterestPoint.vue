<template>
  <div
    v-loading="isLoading"
    class="control-container"
    element-loading-text="兴趣热点加载中..."
    element-loading-background="rgba(122, 122, 122, 0.2)"
  >
    <div class="header-box">
      <Box padding="16px 24px 0 16px">
        <InputSearch v-model="text" placeholder="输入关键字搜索" @submit="handleToSearch" />
        <CollapseMore
          v-model="active"
          :default-props="{
            numKey: 'num',
            label: 'levelTwoStr',
            key: 'levelTwo',
          }"
          :data="[...list, ...list]"
        />
      </Box>
      <div class="split-line" />
    </div>
    <div ref="container" class="list-box">
      <template v-if="isMounted && isSearch">
        <Box padding="16px 24px 16px 16px" is-border style="height: 100%">
          <el-scrollbar>
            <InfiniteScroll
              class="scroll"
              :data="dataSource.rawData"
              :show-scroll="true"
              scroll-bg-color="transparent"
              scroll-thumb-color="#1fedff"
              height="500px"
            >
              <template #default="{ node }">
                <Panel :text="node.pointName" style="margin: 6px 0">
                  <template #footer>
                    <Row>
                      <Col flex="auto">
                        <el-space :size="14" style="height: 100%">
                          <Button icon="rd-dw" text="定位" @click="handlePositionClick(node)" />
                          <Button
                            icon="rd-zbjk"
                            text="一键播放"
                            @click="handleCircumStances(node)"
                          />
                        </el-space>
                      </Col>
                      <Col>
                        <Follow
                          keys="isFollowFlag"
                          :data="node"
                          :code="node.id"
                          :options="options"
                          :follow-type="RM.HOTSPOTS"
                          @on-follow="handleFollow"
                          @on-change-follow="handleFollowUpdate"
                        >
                          <Button
                            :is-margin="false"
                            :icon="
                              `${node?.isFollowFlag}` !== isCollect.Yes
                                ? 'public-gz'
                                : 'public-gz-a'
                            "
                          />
                        </Follow>
                      </Col>
                    </Row>
                  </template>
                </Panel>
              </template>
            </InfiniteScroll>
          </el-scrollbar>
        </Box>
      </template>
      <template v-else>
        <Box padding="16px 24px 16px 16px" is-border style="height: 100%">
          <el-scrollbar>
            <Collapse v-for="item in dataSource.list" :key="item.type">
              <template #header>{{ item.name }} ({{ item.list.length }})</template>
              <Box padding="12px 4px">
                <InfiniteScroll
                  :data="item.list || []"
                  :size="20"
                  :show-scroll="true"
                  height="500px"
                  style="display: flex; flex-direction: column; gap: 12px 0"
                >
                  <template #default="{ node: v }">
                    <Panel :text="v.pointName">
                      <template #footer>
                        <Row>
                          <Col flex="auto">
                            <el-space :size="14" style="height: 100%">
                              <Button icon="rd-dw" text="定位" @click="handlePositionClick(v)" />
                              <Button
                                icon="rd-zbjk"
                                text="一键播放"
                                @click="handleCircumStances(v)"
                              />
                            </el-space>
                          </Col>
                          <Col>
                            <Follow
                              keys="isFollowFlag"
                              :data="v"
                              :options="options"
                              :code="v.id"
                              :follow-type="RM.HOTSPOTS"
                              @on-follow="handleFollow"
                              @on-change-follow="handleFollowUpdate"
                            >
                              <Button
                                :is-margin="false"
                                :icon="
                                  `${v?.isFollowFlag}` !== isCollect.Yes
                                    ? 'public-gz'
                                    : 'public-gz-a'
                                "
                              />
                            </Follow>
                          </Col>
                        </Row>
                      </template>
                    </Panel>
                  </template>
                </InfiniteScroll>
              </Box>
            </Collapse>
          </el-scrollbar>
        </Box>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RM, isCollect } from "@/common/const";
import {
  Box,
  InfiniteScroll,
  Col,
  Row,
  Button,
  Collapse,
  CollapseMore,
  InputSearch,
  Panel,
} from "@/components";
import { useOrg, useUser } from "@/store";

import axios, { Canceler } from "axios";
import type { IInterestCollapseData, IPointData } from "./type/index";

import Follow from "./components/Follow.vue";
import { MapConfig } from "@/components/map/MapConfig";
import { useCtrlState } from "@/store/ctrlState";
import { PointType } from "@/common/map";
import { openVideo } from "@/utils/monitorVideo";
import { batchFollowAdd, batchFollowUpdate, queryHotsPotsInterest } from "@/services/patrol";
import { getTypeList, queryHotsPotsInterestNum } from "@/services/map";
import { useFollowType } from "@/hooks/PoliceVideo";

interface ITypeData {
  levelTwo: string;
  levelTwoStr: string;
  /** 总数 */
  num: number;
}

const _config = new MapConfig();
const { CancelToken } = axios;
/** 取消请求 */
let cancelRequest: Canceler;

const { typeData: options } = useFollowType("兴趣点位", RM.HOTSPOTS);

const userStore = useUser();
const store = useOrg();
const { visibleHotPoint } = useCtrlState();

const { orgCode } = storeToRefs(store);
const { user } = storeToRefs(userStore);

const container = ref<HTMLDivElement>();

const active = visibleHotPoint();

const params = reactive({
  pointSmallTypeList: active,
  pointBigType: PointType.ZDCS,
  deptCode: orgCode,
  searchText: "",
  idCard: user.value.idCard,
});

/** loading */
const isLoading = ref(false);
/** 是否有搜索值 */
const isSearch = ref(false);
/** 页面是否挂载 */
const isMounted = useMounted();
/** 搜索值 */
const text = ref("");

const list = ref<ITypeData[]>([]);

/** 所有分类key */
const smallTypeList = computed(() => list.value.map((item) => item.levelTwo));

const dataSource: { list: IInterestCollapseData[]; rawData: IPointData[] } = reactive({
  /** 处理后添加分类的数据 */
  list: [],
  /** 后端返回的原始数据 */
  rawData: [],
});

onMounted(async () => {
  await setTypeList();
});

onUnmounted(async () => {
  cancelRequest?.();
});

const handleToSearch = () => {
  isSearch.value = !!text.value;
  params.searchText = text.value;
};

/** 关注 */
const handleFollow = (followTypeList: string[], followTagTypeList: string[], data: IPointData) => {
  batchFollowAdd({
    followTagTypeList,
    followTypeList: followTypeList.length > 0 ? [RM.HOTSPOTS] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.id,
    sourceFollowType: RM.HOTSPOTS,
    sourceName: data.pointName,
  }).then(() => {
    getDataList();
  });
};

/** 更新关注 */
const handleFollowUpdate = (
  followTypeList: string[],
  followTagTypeList: string[],
  data: IPointData,
) => {
  batchFollowUpdate({
    followTagTypeList,
    followTypeList: followTypeList.length > 0 ? [RM.HOTSPOTS] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.id,
    sourceFollowType: RM.HOTSPOTS,
    sourceName: data.pointName,
  }).then(() => {
    getDataList();
  });
};

/** 设置兴趣热点类型数据 */
const setTypeList = async () => {
  const data = await getTypeList({ search: PointType.ZDCS, type: 4 });
  list.value = data;
};

/** 点击定位 */
const handlePositionClick = (value: IPointData) => {
  if (value?.id) {
    _config.getFeatureItem<GeoJSON.Point>("source-interest-point", value?.id).then((point) => {
      _config.position(point);
    });
  }
};

/** 周边监控 */
const handleCircumStances = async (value: IPointData) => {
  if (value?.extraJson && typeof value?.extraJson === "string") {
    const extraJson = JSON.parse(value?.extraJson);
    const cameraList = (extraJson?.monitorList || [])
      .splice(0, 9)
      .map((equip: { deviceId: string; name: string }) => {
        return { cameraGBCode: equip.deviceId, cameraGBName: equip.name };
      });
    if (cameraList.length > 0) {
      openVideo(1, cameraList, 16);
    } else {
      ElMessage({
        message: "未绑定周边摄像头!",
        type: "warning",
        offset: 92,
      });
    }
  } else {
    ElMessage({
      message: "未绑定周边摄像头!",
      type: "warning",
      offset: 92,
    });
  }
};

/** 获取列表数据 */
const getDataList = async () => {
  try {
    isLoading.value = true;
    const data = await queryHotsPotsInterest(params, {
      cancelToken: new CancelToken((c) => {
        // 参数 c 也是个函数
        cancelRequest = c;
      }),
    });
    dataSource.list = [];
    dataSource.rawData = data || [];

    // 类型分组
    const grouped = data.reduce(
      (acc: { [k: string]: IInterestCollapseData }, cur: IPointData) => {
        if (!acc[cur.pointSmallType]) {
          const name = list.value.find((v) => v.levelTwo === cur.pointSmallType);
          acc[cur.pointSmallType] = {
            name: name?.levelTwoStr || "",
            type: cur.pointSmallType,
            list: [],
          };
        }
        acc[cur.pointSmallType].list.push(cur);
        return acc;
      },
      {} as { [k: string]: IInterestCollapseData },
    );

    dataSource.list = Object.values(grouped);
  } catch (error) {
    console.log("error", error);
  } finally {
    isLoading.value = false;
  }
};

/** 获取各分类数量(在线/全部) */
const getTypeNum = async () => {
  try {
    const data = await queryHotsPotsInterestNum({
      pointBigType: PointType.ZDCS,
      pointSmallTypeList: smallTypeList.value,
      deptCode: orgCode.value,
    });
    return data;
  } catch (error) {
    console.log("error", error);
  }
};

watchEffect(() => {
  Promise.all([getTypeNum(), getDataList()]).then((values) => {
    const [totalNum] = values;

    list.value.forEach((element) => {
      const item = totalNum.find(
        (v: { pointSmallType: string }) => v.pointSmallType === element.levelTwo,
      );
      // eslint-disable-next-line no-param-reassign
      element.num = item?.count || 0;
    });
  });
});
</script>

<style lang="scss" scoped>
@import "./ctrl.scss";

.control-container {
  display: flex;
  flex-direction: column;
  :deep(.el-scrollbar__view) {
    height: 100% !important;
  }

  .header-box {
    flex: 0 0 auto;
  }
  .list-box {
    flex: 1 1 auto;
    min-height: 0;
  }
}
</style>
