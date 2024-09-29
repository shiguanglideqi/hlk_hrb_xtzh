<template>
  <div class="control-container">
    <div
      v-loading="isLoading"
      class="box"
      element-loading-text="警用设备加载中..."
      element-loading-background="rgba(122, 122, 122, 0.2)"
    >
      <Box padding="16px 24px 0px 16px">
        <InputSearch v-model="text" @submit="handleToSearch" />
        <CollapseMore
          v-model="active"
          class="collapse-device"
          :class="{
            offline: onlineStatus === DEVICE_STATUS.NO,
            online: onlineStatus === DEVICE_STATUS.YES,
          }"
          :data="list"
          :default-props="{ numKey: statusMap.get(onlineStatus), label: 'name', key: 'key' }"
        />
      </Box>
      <template v-if="isMounted && isSearch">
        <Box padding="0px 24px 0px 16px">
          <div class="title-box">
            <div>
              <span>共</span>
              <span class="title-box-color">{{ dataSource.rawData?.length || 0 }}</span>
              <span>个</span>
            </div>
          </div>
        </Box>
        <div ref="container" class="xz-container infinite">
          <InfiniteScroll
            v-if="!isLoading && dataSource?.list?.length > 0"
            :data="dataSource.rawData"
            :show-scroll="true"
            class="scroll"
            scroll-bg-color="transparent"
            scroll-thumb-color="#1fedff"
            :height="`${height}px`"
          >
            <template #default="{ node: item }">
              <Panel :style="{ width: `100%` }" style="margin: 6px 6px 6px 0; float: right">
                <Row>
                  <Col flex="auto" class="row" :title="item.deviceName">
                    {{ item.deviceName }}
                  </Col>
                  <Col>
                    <Online :is-online="item.isOnline === DEVICE_STATUS.YES">
                      {{ item.isOnline === DEVICE_STATUS.NO ? "离线" : "在线" }}
                    </Online>
                  </Col>
                </Row>
                <template #footer>
                  <Row>
                    <Col flex="auto" class="row" style="display: flex; gap: 0 20px">
                      <Button text="定位" @click="handlePositionClick(item)" />
                      <!-- 预览：警车和执法记录仪显示 -->
                      <template v-if="$allow('dark_tckz_jyzb_yl', true)">
                        <Button
                          v-if="
                            item.deviceType === Dictionary.VEHICLE ||
                            item.deviceType === Dictionary.RECORDER
                          "
                          :class="[{ gray: item.isOnline === DEVICE_STATUS.NO }]"
                          text="预览"
                          @click="
                            item.isOnline === DEVICE_STATUS.NO
                              ? false
                              : getPoliceCarDetail(item.deviceCode, item)
                          "
                        />
                      </template>
                      <!-- 融合通讯：执法记录仪，对讲机和警务通显示 -->
                      <template v-if="$allow('dark_tckz_jyzb_rhtx', true)">
                        <Button
                          v-if="
                            item.deviceType === Dictionary.RECORDER ||
                            item.deviceType === Dictionary.INTERCOM ||
                            item.deviceType === Dictionary.POLICE_TONG
                          "
                          :class="[{ gray: item.isOnline === DEVICE_STATUS.NO }]"
                          text="融合通讯"
                          @click="handleFusionClick"
                        />
                      </template>
                      <template v-if="$allow('dark_tckz_jyzb_gz', true)">
                        <Button
                          :class="[{ gray: item.isOnline === DEVICE_STATUS.NO }]"
                          :text="deviceCode === item.deviceCode && isTracking ? '取消跟踪' : '跟踪'"
                          @click="
                            item.isOnline === DEVICE_STATUS.NO ? false : handleTrackClick(item)
                          "
                        />
                      </template>
                      <!-- 轨迹 -->
                      <template v-if="$allow('dark_tckz_jyzb_gj', true)">
                        <Button text="轨迹" @click="handleTrajectoryClick(item)" />
                      </template>
                      <!-- 警视：警车显示 -->
                      <template v-if="$allow('dark_tckz_jyzb_js', true)">
                        <Button
                          v-if="item.deviceType === Dictionary.VEHICLE"
                          :class="[{ gray: item.isOnline === DEVICE_STATUS.NO }]"
                          :text="carCode === item.deviceCode && isAlert ? '取消警视' : '警视'"
                          @click="item.isOnline === DEVICE_STATUS.NO ? false : handleJingShi(item)"
                        />
                      </template>
                    </Col>
                    <Col>
                      <Follow
                        keys="isFollowFlag"
                        :data="item"
                        :options="options"
                        :code="item.deviceCode"
                        :follow-type="RM.POLICE_EQUIP"
                        @on-follow="handleFollow"
                        @on-change-follow="handleFollowUpdate"
                      >
                        <Button
                          :is-margin="false"
                          :icon="
                            `${item?.isFollowFlag}` !== isCollect.Yes ? 'public-gz' : 'public-gz-a'
                          "
                        />
                      </Follow>
                    </Col>
                  </Row>
                </template>
              </Panel>
            </template>
          </InfiniteScroll>
        </div>
      </template>
      <template v-else>
        <Box padding="0px 24px 0px 16px">
          <div class="title-box">
            <div></div>
            <div class="online-box">
              <div
                class="online-button button-cursor"
                :class="{ 'active': onlineStatus === DEVICE_STATUS.NO }"
                @click="onlineStatus = DEVICE_STATUS.NO"
              >
                离线({{ dataSource.offline }})
                <div class="button-text">离线({{ dataSource.offline }})</div>
              </div>
              <div
                class="online-button button-cursor"
                :class="{ 'active': onlineStatus === DEVICE_STATUS.YES }"
                @click="onlineStatus = DEVICE_STATUS.YES"
              >
                在线({{ dataSource.online }})
                <div class="button-text">在线({{ dataSource.online }})</div>
              </div>
              <div
                class="online-button button-cursor"
                :class="{ 'active': onlineStatus === DEVICE_STATUS.ALL }"
                @click="onlineStatus = DEVICE_STATUS.ALL"
              >
                全部({{ dataSource.total }})
                <div class="button-text">全部({{ dataSource.total }})</div>
              </div>
            </div>
          </div>
        </Box>
        <div class="xz-container">
          <Tree
            v-if="!isLoading && dataSource?.list?.length > 0"
            class="context"
            :data="dataSource.list"
            scroll-bg-color="transparent"
            scroll-thumb-color="#1fedff"
            :show-count="true"
            :show-line="true"
            :lazy="true"
            :load="loadNode"
            :default-props="{
              children: 'childOrgTrees',
              label: 'deptAlias',
              key: 'deptCode',
            }"
            :is-online="onlineStatus"
            total-key="total"
          >
            <template #default="{ node }">
              <InfiniteScroll
                :data="node.data.data"
                :show-scroll="true"
                class="scroll"
                :height="`${500}px`"
              >
                <template #default="{ node: item }">
                  <Panel
                    :style="{ width: `calc(100% - 16px)` }"
                    style="margin: 6px 6px 6px 0; float: right"
                  >
                    <Row>
                      <Col flex="auto" class="row" :title="item.deviceName">
                        {{ item.deviceName }}
                      </Col>
                      <Col>
                        <Online :is-online="item.isOnline === DEVICE_STATUS.YES">
                          {{ item.isOnline === DEVICE_STATUS.NO ? "离线" : "在线" }}
                        </Online>
                      </Col>
                    </Row>
                    <template #footer>
                      <Row>
                        <Col flex="auto" class="row" style="display: flex; gap: 0 20px">
                          <Button text="定位" @click="handlePositionClick(item)" />
                          <!-- 预览：警车和执法记录仪显示 -->
                          <template v-if="$allow('dark_tckz_jyzb_yl', true)">
                            <Button
                              v-if="
                                item.deviceType === Dictionary.VEHICLE ||
                                item.deviceType === Dictionary.RECORDER
                              "
                              :class="[{ gray: item.isOnline === DEVICE_STATUS.NO }]"
                              text="预览"
                              @click="
                                item.isOnline === DEVICE_STATUS.NO
                                  ? false
                                  : getPoliceCarDetail(item.deviceCode, item)
                              "
                            />
                          </template>
                          <!-- 融合通讯：执法记录仪，对讲机和警务通显示 -->
                          <template v-if="$allow('dark_tckz_jyzb_rhtx', true)">
                            <Button
                              v-if="
                                item.deviceType === Dictionary.RECORDER ||
                                item.deviceType === Dictionary.INTERCOM ||
                                item.deviceType === Dictionary.POLICE_TONG
                              "
                              :class="[{ gray: item.isOnline === DEVICE_STATUS.NO }]"
                              text="融合通讯"
                              @click="handleFusionClick"
                            />
                          </template>
                          <template v-if="$allow('dark_tckz_jyzb_gz', true)">
                            <Button
                              :class="[{ gray: item.isOnline === DEVICE_STATUS.NO }]"
                              :text="
                                deviceCode === item.deviceCode && isTracking ? '取消跟踪' : '跟踪'
                              "
                              @click="
                                item.isOnline === DEVICE_STATUS.NO ? false : handleTrackClick(item)
                              "
                            />
                          </template>
                          <!-- 预览：警车和执法记录仪显示 -->
                          <template v-if="$allow('dark_tckz_jyzb_gj', true)">
                            <Button text="轨迹" @click="handleTrajectoryClick(item)" />
                          </template>
                          <!-- 警视：警车显示 -->
                          <template v-if="$allow('dark_tckz_jyzb_js', true)">
                            <Button
                              v-if="item.deviceType === Dictionary.VEHICLE"
                              :class="[{ gray: item.isOnline === DEVICE_STATUS.NO }]"
                              :text="carCode === item.deviceCode && isAlert ? '取消警视' : '警视'"
                              @click="
                                item.isOnline === DEVICE_STATUS.NO ? false : handleJingShi(item)
                              "
                            />
                          </template>
                        </Col>
                        <Col>
                          <Follow
                            keys="isFollowFlag"
                            :data="item"
                            :options="options"
                            :code="item.deviceCode"
                            :follow-type="RM.POLICE_EQUIP"
                            @on-follow="handleFollow"
                            @on-change-follow="handleFollowUpdate"
                          >
                            <Button
                              :is-margin="false"
                              :icon="
                                `${item?.isFollowFlag}` !== isCollect.Yes
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
            </template>
          </Tree>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DEVICE_STATUS, Dictionary, RM, isCollect } from "@/common/const";
import {
  Box,
  InfiniteScroll,
  Col,
  Row,
  Button,
  CollapseMore,
  InputSearch,
  Online,
  Panel,
  Tree,
} from "@/components";
import { useFollowType, useJingShi, useTrace } from "@/hooks/PoliceVideo";
import { useOrg, useUser } from "@/store";
import { openVideo } from "@/utils/monitorVideo";

import type Node from "element-plus/es/components/tree/src/model/node";
import type { IPoliceDeviceData } from "./type/index";

import Follow from "./components/Follow.vue";
import { MapConfig } from "@/components/map/MapConfig";
import { useCtrlState } from "@/store/ctrlState";
import { useAction } from "@/store/position";
import {
  batchFollowAdd,
  batchFollowUpdate,
  queryEquipment,
  queryEquipmentNum,
  queryPoliceCarDetail,
  searchEquipment,
} from "@/services/patrol";
import { useDevice } from "@/hooks/sharedData";

const { typeData: options } = useFollowType("警用装备", RM.POLICE_EQUIP);
const _config = new MapConfig();

const store = useOrg();
const userstore = useUser();
const actionStore = useAction();
const { setDeviceData } = useDevice();

const { user } = storeToRefs(userstore);
const { orgCode } = storeToRefs(store);
const { getDeviceVisible, setDeviceVisible } = useCtrlState();

const container = ref<HTMLDivElement>();
const height = computed(() => (container.value ? container.value.clientHeight : 0));

const { code: carCode, isAlert, setJS, close } = useJingShi();
const { code: deviceCode, isTracking, setTrace, clearTrace } = useTrace();

/** loading */
const isLoading = ref(false);
/** 页面是否挂载 */
const isMounted = useMounted();
/** 是否有搜索值 */
const isSearch = ref(false);
/** 搜索值 */
const text = ref("");

const statusMap = new Map()
  .set(DEVICE_STATUS.ALL, "total")
  .set(DEVICE_STATUS.YES, "online")
  .set(DEVICE_STATUS.NO, "offline");

const list = ref<Record<string, any>[]>([
  { name: "警车", key: Dictionary.POLICECAR, source: "source-jyzbl_zj_jc", num: "0" },
  { name: "警务通", key: Dictionary.POLICE_TONG, source: "source-jyzbl_jwt", num: "0" },
  { name: "对讲机", key: Dictionary.INTERCOM, source: "source-jyzbl_djj", num: "0" },
  { name: "执法记录仪", key: Dictionary.RECORDER, source: "source-jyzbl_zfjly", num: "0" },
  { name: "无人机", key: Dictionary.WURENJI, source: "source-jyzbl_zj_wrj", num: "0" },
]);

const getActiveDevice = () => {
  const _active = list.value
    .filter((value) => getDeviceVisible(value.source))
    .map((value) => value.key);
  return _active;
};

const onlineStatus = ref(DEVICE_STATUS.YES);
/** 选中的type值 */
const active = ref<string[]>(getActiveDevice());

const params = reactive({
  equipName: "",
  deviceTypeList: active,
  isOnline: onlineStatus,
  deptCode: orgCode.value,
});

const dataSource: {
  list: IPoliceDeviceData[];
  rawData: IPoliceDeviceData[];
  online: number;
  total: number;
  offline: number;
} = reactive({
  list: [],
  /** 搜索的结果数据 */
  rawData: [],
  /** 在线数 */
  online: 0,
  /** 总数 */
  total: 0,
  /** 离线数 */
  offline: 0,
});

onBeforeUnmount(() => {
  clearTrace && clearTrace();
  close && close();
});

const handleToSearch = () => {
  isSearch.value = !!text.value;
  params.equipName = text.value;
  getSearchDataList();
};

/** 定位 */
const handlePositionClick = (val: IPoliceDeviceData) => {
  _config
    .getFeatureItem<GeoJSON.Point>(
      `source-${val?.deviceType === Dictionary.VEHICLE ? val?.deviceSonType : val.deviceType}`,
      val.deviceCode,
    )
    .then((point) => {
      _config.position(point);
    })
    .catch(() => {
      ElMessage({
        message: "未找到该设备坐标位置",
        type: "warning",
        offset: 92,
      });
    });
};

/** 预览 */
const handlePreviewClick = (val: { policeCarCamera: any[]; deviceName: string }) => {
  const playType = 0;

  const cameralist = (val?.policeCarCamera).splice(0, 9).map((v) => {
    return { cameraGBCode: v.code, cameraGBName: v.name };
  });
  if (cameralist.length > 0) {
    openVideo(playType, cameralist);
  } else {
    ElMessage({
      message: "暂无可预览摄像头",
      type: "warning",
      offset: 92,
    });
  }
};

/** 关注 */
const handleFollow = (
  followTypeList: string[],
  followTagTypeList: string[],
  data: IPoliceDeviceData,
) => {
  batchFollowAdd({
    followTagTypeList,
    followTypeList: followTypeList.length > 0 ? [RM.POLICE_EQUIP] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.deviceCode,
    sourceFollowType: RM.POLICE_EQUIP,
    sourceName: data.deviceName,
  }).then(() => {
    treeForeach(dataSource.list, (node) => {
      if (node.data?.length > 0) {
        const res = node.data.find(
          (item: { deviceCode: string }) => item.deviceCode === data.deviceCode,
        );
        if (res) {
          res.isFollowFlag =
            followTagTypeList.length > 0 || followTypeList.length > 0
              ? `${isCollect.Yes}`
              : `${isCollect.No}`;
        }
      }
    });
    const res = dataSource.rawData.find(
      (item: { deviceCode: string }) => item.deviceCode === data.deviceCode,
    );
    if (res) {
      res.isFollowFlag =
        followTagTypeList.length > 0 || followTypeList.length > 0
          ? `${isCollect.Yes}`
          : `${isCollect.No}`;
    }
  });
};

/** 更新关注 */
const handleFollowUpdate = (
  followTypeList: string[],
  followTagTypeList: string[],
  data: IPoliceDeviceData,
) => {
  batchFollowUpdate({
    followTagTypeList,
    followTypeList: followTypeList.length > 0 ? [RM.POLICE_EQUIP] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.deviceCode,
    sourceFollowType: RM.POLICE_EQUIP,
    sourceName: data.deviceName,
  }).then(() => {
    treeForeach(dataSource.list, (node) => {
      if (node.data?.length > 0) {
        const res = node.data.find(
          (item: { deviceCode: string }) => item.deviceCode === data.deviceCode,
        );
        if (res) {
          res.isFollowFlag =
            followTagTypeList.length > 0 || followTypeList.length > 0
              ? `${isCollect.Yes}`
              : `${isCollect.No}`;
        }
      }
    });
    const res = dataSource.rawData.find(
      (item: { deviceCode: string }) => item.deviceCode === data.deviceCode,
    );
    if (res) {
      res.isFollowFlag =
        followTagTypeList.length > 0 || followTypeList.length > 0
          ? `${isCollect.Yes}`
          : `${isCollect.No}`;
    }
  });
};

/** 融合通讯 */
const handleFusionClick = () => {
  ElMessage({
    showClose: true,
    message: "暂无融合通讯",
    type: "warning",
    offset: 100,
  });
};

/** 跟踪 */
const handleTrackClick = (val: IPoliceDeviceData) => {
  const type = val?.deviceType !== Dictionary.VEHICLE ? val?.deviceType : val?.deviceSonType;
  setTrace(val.deviceCode, `source-${type}`);
};

/** 警视 */
const handleJingShi = (val: IPoliceDeviceData) => {
  if (!isAlert.value) {
    setJS(val.deviceCode, () => {
      // position(pos);
    });
  } else {
    close();
  }
};

/** 轨迹 */
const handleTrajectoryClick = (val: IPoliceDeviceData) => {
  actionStore.showAction(
    {
      type: "DeviceTrack",
      id: val.deviceCode,
      iconType: val?.deviceType,
    },
    true,
  );
};

/** 警车详情 */
const getPoliceCarDetail = async (code: string, row?: any) => {
  if (row.deviceType === Dictionary.RECORDER) {
    const cameralist = [{ cameraGBCode: row.deviceCode, cameraGBName: row.deviceName }];
    openVideo(0, cameralist);
  } else {
    try {
      const data = await queryPoliceCarDetail(code);
      if (data?.code === 200) {
        handlePreviewClick(data.data);
      }
    } catch (error) {
      console.error("error", error);
    }
  }
};

const deviceTypeList = [
  { name: "警车", key: "jyzbl_zj_jc" },
  { name: "警务通", key: Dictionary.POLICE_TONG },
  { name: "对讲机", key: Dictionary.INTERCOM },
  { name: "执法记录仪", key: Dictionary.RECORDER },
  { name: "无人机", key: Dictionary.WURENJI },
];

// 动态追加tree 数据
const loadNode = async (node: Node, resolve: (data: any[]) => void) => {
  try {
    if (node.level === 0) {
      return;
    }
    if (node.data.data?.length > 0 && !node.data.type) {
      const typeChild: any = [];
      for (let index = 0; index < node.data.data.length; index++) {
        const item = node.data.data[index];
        const typeItem = deviceTypeList.find((i) => i.key === item.deviceType);
        const data = {
          deptCode: node.data.deptCode,
          id: node.data.id,
          deptAlias: typeItem ? typeItem?.name : "",
          onlineCount: item.onlineCount,
          parentCode: null,
          sort: null,
          total: item.totalCount,
          type: item.deviceType,
        };
        typeChild.push(data);
      }
      if (!node.data.childOrgTrees) {
        // eslint-disable-next-line no-param-reassign
        node.data.childOrgTrees = [];
      }
      node.data.childOrgTrees.unshift(...typeChild);
      // eslint-disable-next-line no-param-reassign, require-atomic-updates
      node.data.data = [];
    } else if (node.data.type) {
      const param = {
        orgCode: node.data.deptCode,
        isOnline: onlineStatus.value,
        deviceTypeList: [node.data.type],
        idCard: user.value?.idCard,
      };
      const data = await searchEquipment(param);

      // eslint-disable-next-line require-atomic-updates, no-param-reassign
      node.data.data = data || [];
    }
    if (node.data.childOrgTrees) {
      const childOrgTrees = node.data.childOrgTrees.filter(
        (item: { total: string; onlineCount: string }) =>
          Number(item.total) !== 0 || Number(item.onlineCount) !== 0,
      );
      resolve([...childOrgTrees]);
    } else {
      return resolve([{}]);
    }
  } catch (error) {
    console.log("error", error);
  }
};

/** 获取搜索列表数据 */
const getSearchDataList = async () => {
  try {
    if (params.deviceTypeList.length === 0) return;
    isLoading.value = true;
    const param = {
      deptCode: orgCode.value,
      isOnline: "",
      deviceTypeList: active.value,
      searchText: text.value,
      idCard: user.value?.idCard,
    };
    const data = await searchEquipment(param);
    dataSource.rawData = data || [];
  } catch (error) {
    console.log("error", error);
  } finally {
    isLoading.value = false;
  }
};

/** 获取警用设备列表 */
const getEquiqList = async () => {
  try {
    if (params.deviceTypeList.length === 0) {
      dataSource.list = [];
      return;
    }
    const data = await queryEquipment(params);
    dataSource.list = data ? [data] : [];
    return data;
  } catch (error) {
    console.log("error", error);
  }
};

function treeForeach(tree: any, func: (node: any) => void) {
  let node;
  const lists = [...tree];
  // eslint-disable-next-line no-cond-assign
  while ((node = lists.shift())) {
    func(node);
    node.childOrgTrees && lists.push(...node.childOrgTrees);
  }
}

/** 获取各分类数量(在线/全部) */
const getEquipNum = async () => {
  try {
    const data = await queryEquipmentNum({
      deviceTypeList: [
        Dictionary.RECORDER,
        Dictionary.POLICE_TONG,
        Dictionary.INTERCOM,
        Dictionary.WURENJI,
        Dictionary.POLICECAR,
      ],
      deptCode: orgCode.value,
    });
    list.value.forEach((item) => {
      const _item = item;
      const res = data.find((v: { deviceType: string }) => v.deviceType === _item.key);
      if (res) {
        _item.online = Number(res.onlineCount);
        _item.offline = Number(res.totalCount) - Number(res.onlineCount);
        _item.total = Number(res.totalCount);
      }
    });
    return data;
  } catch (error) {
    console.log("error", error);
  }
};

const sum = (array: any[], key: "totalCount" | "onlineCount") => {
  return array.reduce((a, b) => {
    if (active.value.includes(b.deviceType)) {
      return a + Number(b?.[key] || 0);
    }
    return a;
  }, 0);
};

watch(
  [() => params.deviceTypeList, () => params.isOnline],
  (newActive) => {
    list.value.forEach((value) => {
      const isShow = active.value.find((item) => item === value.key);
      const status = onlineStatus.value !== "" ? !!onlineStatus.value : "";
      setDeviceVisible(value.source, isShow, status);

      isShow
        ? _config.setCommonFilter(value.source, "isOnline", status)
        : _config.clearCommonFilter(value.source, "isOnline");
    });

    newActive[0].length > 0 && setDeviceData(newActive[0]);
  },
  {
    deep: true,
    immediate: true,
  },
);

watchEffect(() => {
  isLoading.value = true;
  Promise.all([getEquipNum(), getEquiqList()])
    .then((values) => {
      const [total, tree = {}] = values;
      switch (onlineStatus.value) {
        case DEVICE_STATUS.YES:
          {
            const totalNum = sum(total, "totalCount");
            dataSource.total = totalNum;
            dataSource.online = Number(tree?.onlineCount || 0);
            dataSource.offline = totalNum - Number(tree?.onlineCount || 0);
          }
          break;
        case DEVICE_STATUS.NO:
          {
            const totalNum = sum(total, "totalCount") || 0;
            dataSource.total = totalNum;
            dataSource.online = totalNum - Number(tree.total) || 0;
            dataSource.offline = Number(tree.total) || 0;
          }
          break;

        default:
          dataSource.total = Number(tree.total) || 0;
          dataSource.online = Number(tree.onlineCount) || 0;
          dataSource.offline = Number(tree.total) - Number(tree.onlineCount) || 0;
          break;
      }
    })
    .finally(() => {
      isLoading.value = false;
    });
});
</script>

<style lang="scss" scoped>
@import "./ctrl.scss";

.box {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.xz-container {
  padding: 0 6px;
  padding-top: 12px;
  height: 0;
  flex: 1;
  box-sizing: border-box;
  .row {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  &.infinite {
    padding: 12px 6px;
    :deep(.infinite-list) {
      padding: 0 12px;
      box-sizing: border-box;
    }
  }

  :deep(.dark-tree) {
    padding: 0 12px !important;
  }
  :deep(.scrollbar-dark) {
    padding-right: 12px !important;
    box-sizing: border-box;
  }
}

.collapse-device {
  &.offline {
    :deep(.num-text) {
      color: rgba(255, 255, 255, 0.6) !important;
    }
  }

  &.online {
    :deep(.num-text) {
      color: rgba(19, 202, 92, 1) !important;
    }
  }
}

.scroll {
  cursor: default;
}

.online-box {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  line-height: 42px;
  .online-button {
    position: relative;
    height: 24px;
    line-height: 24px;
    padding: 0 6px;
    background: rgba(0, 0, 0, 0.1);
    border: 1px solid #0dc6dc;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    color: #3de3ff;
    &.active {
      border: 1px solid transparent;
      color: #fff;
      &::after {
        content: "";
        position: absolute;
        width: calc(100% - 2px);
        height: calc(100% - 2px);
        background: linear-gradient(0deg, #168da1, #27b2c9);
        border-radius: 4px;
        top: 50%;
        left: 50%;
        z-index: 3;
        transform: translate(-50%, -50%);
      }

      &::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 4px;
        background: linear-gradient(0deg, rgba(161, 220, 255, 1), rgba(78, 181, 241, 1));
        z-index: 2;
      }
    }

    .button-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      object-fit: contain;
      z-index: 4;
      width: 100%;
      text-align: center;
    }
  }
}

.gray {
  filter: grayscale(100%);
}
</style>
