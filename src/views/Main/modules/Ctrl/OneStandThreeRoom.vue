<template>
  <div
    v-loading="isLoading"
    class="control-container"
    element-loading-text="一标三实加载中..."
    element-loading-background="rgba(122, 122, 122, 0.2)"
  >
    <div class="header-box">
      <Box padding="16px 24px 0 16px">
        <InputSearch v-model="text" placeholder="输入关键字搜索" @submit="handleToSearch" />
        <CollapseMore v-model="active" :data="list" @on-change="handleChange" />
      </Box>
      <div class="split-line" />
    </div>
    <div ref="container" class="list-box">
      <template v-if="isMounted && isSearch">
        <Box padding="12px 24px 12px 16px" is-border style="height: 100%">
          <el-scrollbar>
            <InfiniteScroll
              :data="dataSource.rawData || []"
              :size="10"
              :show-scroll="true"
              height="720px"
              scroll-thumb-color="#1fedff"
              style="display: flex; flex-direction: column; gap: 12px 0; padding: 12px 6px"
            >
              <template #default="{ node: v }">
                <Panel :text="v.pointName">
                  <template #footer>
                    <Row>
                      <Col flex="auto">
                        <el-space :size="14" style="height: 100%">
                          <Button icon="rd-dw" text="定位" @click="handlePositionClick(v)" />
                          <Button icon="detail" text="查看详情" @click="handleToDetail(v)" />
                        </el-space>
                      </Col>
                      <Col></Col>
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
            <Collapse1 v-if="isActive('rd-zs')">
              <template #header>楼栋 ({{ dataSource.list.length }})</template>
              <InfiniteScroll
                :data="dataSource.list || []"
                :size="10"
                :show-scroll="true"
                height="600px"
                scroll-thumb-color="#1fedff"
                style="display: flex; flex-direction: column; gap: 12px 0; padding: 12px 6px"
              >
                <template #default="{ node: v }">
                  <Panel :text="v.pointName">
                    <template #footer>
                      <Row>
                        <Col flex="auto">
                          <el-space :size="14" style="height: 100%">
                            <Button icon="rd-dw" text="定位" @click="handlePositionClick(v)" />
                            <Button icon="detail" text="查看详情" @click="handleToDetail(v)" />
                          </el-space>
                        </Col>
                        <Col></Col>
                      </Row>
                    </template>
                  </Panel>
                </template>
              </InfiniteScroll>
            </Collapse1>
            <Collapse1 v-if="isActive('rd-dd')">
              <template #header>地址 ({{ dataSource.list.length }})</template>
              <InfiniteScroll
                :data="dataSource.list || []"
                :size="10"
                :show-scroll="true"
                height="600px"
                scroll-thumb-color="#1fedff"
                style="display: flex; flex-direction: column; gap: 12px 0; padding: 12px 6px"
              >
                <template #default="{ node: v }">
                  <Panel :text="v.pointName">
                    <template #footer>
                      <Row>
                        <Col flex="auto">
                          <el-space :size="14" style="height: 100%">
                            <Button
                              icon="rd-dw"
                              text="定位"
                              @click="handlePositionClick(v, true)"
                            />
                            <Button
                              icon="rd-135"
                              text="查看详情"
                              @click="handleToDetail(v, true)"
                            />
                          </el-space>
                        </Col>
                        <Col></Col>
                      </Row>
                    </template>
                  </Panel>
                </template>
              </InfiniteScroll>
            </Collapse1>
            <JQEmpty v-if="!isLoading && active.length === 0" text="暂无选中信息" />
          </el-scrollbar>
        </Box>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as turf from "@turf/turf";
import {
  Box,
  InfiniteScroll,
  Col,
  Row,
  Button,
  Collapse1,
  CollapseMore,
  JQEmpty,
  InputSearch,
  Panel,
} from "@/components";
import { useOrg, useUser } from "@/store";
import axios, { Canceler } from "axios";
import type { IInterestCollapseData, IPointData } from "./type/index";
import { _OneConfig } from "./_CtrlConfig";
import { MapConfig } from "@/components/map/MapConfig";
import { PointType } from "@/common/map";
import { queryPoint } from "@/services/map";
import { queryHotsPotsInterest } from "@/services/patrol";
import { usePopup } from "@/hooks/usePopup";
import { Popup } from "@/modules/Popup";

interface ITypeData {
  name: string;
  key: string;
  source: string;
  num: number;
}

const { CancelToken } = axios;
/** 取消请求 */
let cancelRequest: Canceler;

const _config = new MapConfig();
const userStore = useUser();
const { showPopup } = usePopup();
const store = useOrg();

const { orgCode } = storeToRefs(store);
const { user } = storeToRefs(userStore);

const container = ref<HTMLDivElement>();

const active = ref<string[]>([]);

const isActive = (key: string) => computed(() => active.value.includes(key)).value;

const params = reactive({
  pointSmallTypeList: ["qwl_dwlx_ldxx_xz", "qwl_dwlx_ldxx_jlx"],
  pointBigType: PointType.LDXX,
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

const list = ref<ITypeData[]>([
  { name: "楼栋", key: "rd-zs", source: "source-building-point", num: 0 },
  { name: "地址", key: "rd-dd", source: "source-address-point", num: 0 },
]);

const dataSource: { list: IInterestCollapseData[]; rawData: IPointData[] } = reactive({
  /** 处理后添加分类的数据 */
  list: [],
  /** 后端返回的原始数据 */
  rawData: [],
});

onMounted(() => {
  _config.loadFromJSON(_OneConfig);
  if (active.value.length === 0) {
    active.value = ["rd-zs"];
    handleChange();
  }
  getMapData();
});

onBeforeUnmount(() => {
  active.value = [];
  _config.clearFromJSON(_OneConfig);
  cancelRequest?.();
});

/** 获取上图数据 */
const getMapData = () => {
  queryPoint({
    deptCode: orgCode.value,
    pointBigTypeList: [PointType.LDXX],
    pointSmallTypeList: ["qwl_dwlx_ldxx_xz", "qwl_dwlx_ldxx_jlx"],
  }).then((result) => {
    const buildList: GeoJSON.Feature[] = [];
    const addressList: GeoJSON.Feature[] = [];
    result.forEach((item: any) => {
      if (item?.point) {
        const feature1 = turf.feature(JSON.parse((item.point as string) || ""), {
          name: item?.pointName || "",
          imageName: "ldxx",
          type: "housePoint",
          popup: Popup.Building,
          id: item?.id || "",
          point: item?.point,
        });
        buildList.push(feature1);
        const feature2 = turf.feature(JSON.parse((item.point as string) || ""), {
          name: item?.pointName || "",
          imageName: "dzxx",
          type: "dzList",
          popup: Popup.Address,
          id: item?.id || "",
          point: item?.point,
        });
        addressList.push(feature2);
      }
    });
    _config.setSource("source-building-point", buildList);
    _config.setSource("source-address-point", addressList);
  });
};

/** 修改显示状态 */
const handleChange = () => {
  list.value.forEach((v) => {
    const item = active.value.includes(v.key);
    _config.setSourceVisible(v.source, !!item);
  });
};

const handleToSearch = () => {
  isSearch.value = !!text.value;
  params.searchText = text.value;
};

/** 点击定位 */
const handlePositionClick = (value: IPointData, isAddress = false) => {
  if (value?.id) {
    _config
      .getFeatureItem<GeoJSON.Point>(
        isAddress ? "source-address-point" : "source-building-point",
        value.id,
      )
      .then((data) => {
        _config.position(data);
      });
  }
};

/** 点击定位 */
const handleToDetail = (value: IPointData, isAddress = false) => {
  if (value?.id) {
    _config
      .getFeatureItem<GeoJSON.Point>(
        isAddress ? "source-address-point" : "source-building-point",
        value.id,
      )
      .then((data) => {
        showPopup(data.properties?.popup, {
          properties: data.properties,
        });
      });
  }
};

/** 获取列表数据 */
const getDataList = async () => {
  try {
    isLoading.value = true;
    const data = await queryHotsPotsInterest(params, {
      cancelToken: new CancelToken((c) => {
        cancelRequest = c;
      }),
    });
    dataSource.list = data || [];
    dataSource.rawData = data || [];
    list.value.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.num = dataSource.list.length;
    });
  } catch (error) {
    console.log("error", error);
  } finally {
    isLoading.value = false;
  }
};

watchEffect(() => {
  cancelRequest?.();
  getDataList();
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
