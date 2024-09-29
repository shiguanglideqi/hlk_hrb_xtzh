<template>
  <div class="control-container">
    <div
      v-loading="isLoading"
      class="box"
      element-loading-text="视频设备加载中..."
      element-loading-background="rgba(122, 122, 122, 0.2)"
    >
      <Box padding="16px 24px 0 16px">
        <InputSearch v-model="text" @submit="handleToSearch" />
        <CollapseMore
          v-model="active"
          :data="list"
          class="collapse-device"
          :class="{
            offline: onlineStatus === VIDEO_STATUS.NO,
            online: onlineStatus === VIDEO_STATUS.YES,
          }"
          :default-props="{
            numKey: statusMap.get(onlineStatus),
            label: 'dictName',
            key: 'dictCode',
          }"
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
                  <Col flex="auto" class="row" :title="item.name">
                    {{ item.name }}
                  </Col>
                  <Col>
                    <Online :is-online="item.status === VIDEO_STATUS.YES">
                      {{ item.status === VIDEO_STATUS.NO ? "离线" : "在线" }}
                    </Online>
                  </Col>
                </Row>
                <template #footer>
                  <Row>
                    <Col flex="auto" class="row" style="display: flex; gap: 0 20px">
                      <Button text="定位" @click="handlePositionClick(item)" />
                      <Button text="预览" @click="handlePreviewClick(item)" />
                      <Button
                        v-if="$allow('dark_tckz_spzb_zbj', true)"
                        text="周边监控"
                        @click="handleVideoClick(item)"
                      />
                      <Button
                        v-if="$allow('dark_tckz_spzb_jp', true)"
                        text="纠偏"
                        @click="handleTieClick(item)"
                      />
                    </Col>
                    <Col>
                      <Follow
                        keys="isFollowFlag"
                        :data="item"
                        :options="options"
                        :code="item.deviceID"
                        :follow-type="RM.VIDEO_EQUIP"
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
          <JQEmpty v-if="!isLoading && dataSource.list.length === 0" text="暂无警用设备" />
        </div>
      </template>
      <template v-else>
        <Box padding="0px 24px 0px 16px">
          <div class="title-box">
            <div></div>
            <div class="online-box">
              <div
                class="online-button button-cursor"
                :class="{ 'active': onlineStatus === VIDEO_STATUS.NO }"
                @click="onlineStatus = VIDEO_STATUS.NO"
              >
                离线({{ dataSource.offline }})
                <div class="button-text">离线({{ dataSource.offline }})</div>
              </div>
              <div
                class="online-button button-cursor"
                :class="{ 'active': onlineStatus === VIDEO_STATUS.YES }"
                @click="onlineStatus = VIDEO_STATUS.YES"
              >
                在线({{ dataSource.online }})
                <div class="button-text">在线({{ dataSource.online }})</div>
              </div>
              <div
                class="online-button button-cursor"
                :class="{ 'active': onlineStatus === VIDEO_STATUS.ALL }"
                @click="onlineStatus = VIDEO_STATUS.ALL"
              >
                全部({{ dataSource.total }})
                <div class="button-text">全部({{ dataSource.total }})</div>
              </div>
            </div>
          </div>
        </Box>
        <div class="xz-container">
          <Tree
            v-if="!isLoading && dataSource.list.length > 0"
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
            :is-online="onlineStatus === VIDEO_STATUS.ALL ? '' : onlineStatus === VIDEO_STATUS.YES"
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
                      <Col flex="auto" class="row" :title="item.name">
                        {{ item.name }}
                      </Col>
                      <Col>
                        <Online :is-online="item.status === VIDEO_STATUS.YES">
                          {{ item.status === VIDEO_STATUS.NO ? "离线" : "在线" }}
                        </Online>
                      </Col>
                    </Row>
                    <template #footer>
                      <Row>
                        <Col flex="auto" class="row" style="display: flex; gap: 0 20px">
                          <Button text="定位" @click="handlePositionClick(item)" />
                          <Button text="预览" @click="handlePreviewClick(item)" />
                          <Button
                            v-if="$allow('dark_tckz_spzb_zbj', true)"
                            text="周边监控"
                            @click="handleVideoClick(item)"
                          />
                          <Button
                            v-if="$allow('dark_tckz_spzb_jp', true)"
                            text="纠偏"
                            @click="handleTieClick(item)"
                          />
                        </Col>
                        <Col>
                          <Follow
                            keys="isFollowFlag"
                            :data="item"
                            :options="options"
                            :code="item.deviceID"
                            :follow-type="RM.VIDEO_EQUIP"
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
          <JQEmpty v-if="!isLoading && dataSource.list.length === 0" text="暂无视频设备" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Dictionary, RM, VIDEO_STATUS, isCollect } from "@/common/const";
import {
  Box,
  InfiniteScroll,
  Button,
  CollapseMore,
  JQEmpty,
  InputSearch,
  Online,
  Panel,
  Tree,
  Col,
  Row,
} from "@/components";
import { useOrg, useUser } from "@/store";

import Follow from "./components/Follow.vue";

import { openVideo } from "@/utils/monitorVideo";
import axios, { Canceler } from "axios";
import type Node from "element-plus/es/components/tree/src/model/node";
import type { IVideoData } from "./type/index";
import { getSurroundVideo, mapPointEdit, useFollowType } from "@/hooks/PoliceVideo";
import {
  batchFollowAdd,
  batchFollowUpdate,
  postVideoCorrection,
  queryVideoEquipment,
  queryVideoEquipmentNum,
  searchVideoDetailList,
} from "@/services/patrol";
import { MapConfig } from "@/components/map/MapConfig";
import { useCtrlState } from "@/store/ctrlState";
import { getDict } from "@/services/common";
import { setVideoData } from "@/hooks/sharedData";

interface ITypeData {
  dictCode: string;
  dictName: string;
  online: number;
  /** 总数 */
  total: number;
  /** 离线数 */
  offline: number;
}

const { CancelToken } = axios;
/** 取消请求 */
let cancelRequest: Canceler;

const { typeData: options } = useFollowType("视频装备", RM.VIDEO_EQUIP);

const _config = new MapConfig();
const store = useOrg();
const userstore = useUser();

const { user } = storeToRefs(userstore);
const { orgCode } = storeToRefs(store);
const { getVideoActive, setVideoActive } = useCtrlState();

const container = ref<HTMLDivElement>();
const height = computed(() => (container.value ? container.value.clientHeight : 0));

/** loading */
const isLoading = ref(false);
/** 页面是否挂载 */
const isMounted = useMounted();
/** 是否有搜索值 */
const isSearch = ref(false);
/** 搜索值 */
const text = ref("");
/** 在线状态 */
const onlineStatus = ref<VIDEO_STATUS>(VIDEO_STATUS.YES);

/** 选中的type值 */
const active = ref<string[]>(getVideoActive());

const statusMap = new Map()
  .set(VIDEO_STATUS.ALL, "total")
  .set(VIDEO_STATUS.YES, "online")
  .set(VIDEO_STATUS.NO, "offline");

/** 请求参数 */
const params = reactive({
  equipName: "",
  deviceSonTypeList: active,
  status: onlineStatus,
  deptCode: orgCode,
});

const list = ref<ITypeData[]>([]);

/** 所有分类key */
const deviceSonTypeList = computed(() => list.value.map((item) => item.dictCode));

const dataSource: {
  list: IVideoData[];
  rawData: IVideoData[];
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

onMounted(() => {
  setTypeList();
});

onUnmounted(() => {
  setVideoActive([]);
  _config.clearCommonFilter("source-jyzbl_jk_jklx", "video");
  cancelRequest?.();
});

const handleToSearch = () => {
  isSearch.value = !!text.value;
  params.equipName = text.value;
  getSearchDataList();
};

/** 关注 */
const handleFollow = (followTypeList: string[], followTagTypeList: string[], data: IVideoData) => {
  batchFollowAdd({
    followTagTypeList,
    followTypeList: followTypeList.length > 0 ? [RM.VIDEO_EQUIP] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.deviceID,
    sourceFollowType: RM.VIDEO_EQUIP,
    sourceName: data.name,
  }).then(() => {
    treeForeach(dataSource.list, (node) => {
      if (node.data?.length > 0) {
        const res = node.data.find((item: { deviceID: string }) => item.deviceID === data.deviceID);
        if (res) {
          res.isFollowFlag =
            followTagTypeList.length > 0 || followTypeList.length > 0
              ? Number(isCollect.Yes)
              : Number(isCollect.No);
        }
      }
    });
    const res = dataSource.rawData.find(
      (item: { deviceID: string }) => item.deviceID === data.deviceID,
    );
    if (res) {
      res.isFollowFlag =
        followTagTypeList.length > 0 || followTypeList.length > 0
          ? Number(isCollect.Yes)
          : Number(isCollect.No);
    }
  });
};

/** 更新关注 */
const handleFollowUpdate = (
  followTypeList: string[],
  followTagTypeList: string[],
  data: IVideoData,
) => {
  batchFollowUpdate({
    followTagTypeList,
    followTypeList: followTypeList.length > 0 ? [RM.VIDEO_EQUIP] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.deviceID,
    sourceFollowType: RM.VIDEO_EQUIP,
    sourceName: data.name,
  }).then(() => {
    treeForeach(dataSource.list, (node) => {
      if (node.data?.length > 0) {
        const res = node.data.find((item: { deviceID: string }) => item.deviceID === data.deviceID);
        if (res) {
          res.isFollowFlag =
            followTagTypeList.length > 0 || followTypeList.length > 0
              ? Number(isCollect.Yes)
              : Number(isCollect.No);
        }
      }
    });
    const res = dataSource.rawData.find(
      (item: { deviceID: string }) => item.deviceID === data.deviceID,
    );
    if (res) {
      res.isFollowFlag =
        followTagTypeList.length > 0 || followTypeList.length > 0
          ? Number(isCollect.Yes)
          : Number(isCollect.No);
    }
  });
};

/** 获取搜索列表数据 */
const getSearchDataList = async () => {
  try {
    if (params.deviceSonTypeList.length === 0) return;
    isLoading.value = true;
    const param = {
      deptCode: orgCode.value,
      status: VIDEO_STATUS.ALL,
      deviceSonTypeList: active.value,
      searchText: text.value,
      idCard: user.value?.idCard,
    };
    dataSource.rawData = [];
    const data = await searchVideoDetailList(param);
    dataSource.rawData = data || [];
  } catch (error) {
    console.log("error", error);
  } finally {
    isLoading.value = false;
  }
};

/** 周边监控 */
const handleVideoClick = (item: IVideoData) => {
  if (!item) return;
  _config.getFeatureItem<GeoJSON.Point>("source-jyzbl_jk_jklx", item.deviceID).then((point) => {
    getSurroundVideo(`${point.geometry.coordinates[1]}`, `${point.geometry.coordinates[0]}`);
  });
};

/** 纠偏 */
const handleTieClick = (val: IVideoData) => {
  _config.getFeatureItem<GeoJSON.Point>("source-jyzbl_jk_jklx", val.deviceID).then((point) => {
    _config.position(point);
    mapPointEdit(_config._map!, (coords) => {
      postVideoCorrection({ id: val.id, coordinate: coords.toString() }).then(() => {
        ElMessage({
          message: "纠偏成功!",
          type: "success",
          offset: 92,
        });
        _config.setFeatureItem("source-jyzbl_jk_jklx", coords, val.deviceID);
      });
    });
  });
};

/** 定位 */
const handlePositionClick = (item: IVideoData) => {
  _config
    .getFeatureItem<GeoJSON.Point>("source-jyzbl_jk_jklx", item.deviceID)
    .then((point) => {
      _config.position(point);
    })
    .catch(() => {
      ElMessage({
        message: "未找到该视频设备坐标位置",
        type: "warning",
        offset: 92,
      });
    });
};

const handlePreviewClick = (item: IVideoData) => {
  const playType = 0;
  const cameralist = [{ cameraGBCode: item.deviceID, cameraGBName: item.name }];
  openVideo(playType, cameralist);
};

const loadNode = async (node: Node, resolve: (data: any[]) => void) => {
  try {
    if (node.level === 0) {
      return;
    }

    if (node.data.data?.length > 0 && !node.data.type) {
      const typeChild = node.data.data.map(
        (item: { onlineCount: string; totalCount: string; deviceSonType: string }) => {
          const typeItem = list.value.find((i) => i.dictCode === item.deviceSonType);
          return {
            deptCode: node.data.deptCode,
            id: node.data.id,
            deptAlias: typeItem ? typeItem?.dictName : "",
            onlineCount: item.onlineCount,
            parentCode: null,
            sort: null,
            total: item.totalCount,
            type: item.deviceSonType,
          };
        },
      );
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
        status: onlineStatus.value,
        deviceSonTypeList: [node.data.type],
        searchText: "",
        idCard: user.value?.idCard,
      };
      const data = await searchVideoDetailList(param);

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

/** 设置type列表数据 获取图标等 */
const setTypeList = async () => {
  const data = await getDict(Dictionary.MONITOR_TYPE);
  list.value = data;
};

/** 获取树列表数据 */
const getDataList = async () => {
  try {
    if (params.deviceSonTypeList.length === 0) {
      dataSource.list = [];
      return;
    }
    const data = await queryVideoEquipment(params, {
      cancelToken: new CancelToken((c) => {
        cancelRequest = c;
      }),
    });
    dataSource.list = data ? [data] : [];
    return data;
  } catch (error) {
    console.log("error", error);
  }
};

/** 获取设备数量 */
const getEquipNum = async () => {
  if (deviceSonTypeList.value.length === 0) return;
  const data = await queryVideoEquipmentNum({
    deptCode: orgCode.value,
    deviceSonTypeList: deviceSonTypeList.value,
  });
  list.value.forEach((item) => {
    const _item = item;
    const res = data.find((v: { deviceSonType: string }) => v.deviceSonType === _item.dictCode);
    if (res) {
      _item.online = Number(res.onlineCount);
      _item.offline = Number(res.totalCount) - Number(res.onlineCount);
      _item.total = Number(res.totalCount);
    }
  });
  return data;
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

const sum = (array: any[], key: "totalCount" | "onlineCount") => {
  return array.reduce((a, b) => {
    if (active.value.includes(b.deviceSonType)) {
      return a + Number(b?.[key] || 0);
    }
    return a;
  }, 0);
};

watch(
  [() => active.value, () => params.status],
  () => {
    const isOnline =
      onlineStatus.value === VIDEO_STATUS.ALL ? "" : onlineStatus.value === VIDEO_STATUS.YES;
    if (active.value.length === 0) {
      setVideoActive([]);
      _config.setSourceVisible("source-jyzbl_jk_jklx", false);
    } else {
      const _active = active.value.map((v) => {
        return {
          subClass: v,
          isOnline,
        };
      });
      setVideoActive(_active);
      _config.setCommonFilter("source-jyzbl_jk_jklx", "video", _active);
    }
  },
  {
    deep: true,
    immediate: true,
  },
);

watch(
  [
    () => params.status,
    () => params.deviceSonTypeList,
    () => params.deptCode,
    () => params.equipName,
    () => deviceSonTypeList.value,
  ],
  () => {
    setVideoData();
    if (deviceSonTypeList.value.length === 0) return;
    isLoading.value = true;
    Promise.all([getEquipNum(), getDataList()])
      .then((values) => {
        const [total, tree = {}] = values;
        switch (onlineStatus.value) {
          case VIDEO_STATUS.YES:
            {
              const totalNum = sum(total || [], "totalCount");
              dataSource.total = totalNum;
              dataSource.online = Number(tree?.onlineCount || 0);
              dataSource.offline = totalNum - Number(tree?.onlineCount || 0);
            }
            break;
          case VIDEO_STATUS.NO:
            {
              const totalNum = sum(total || [], "totalCount") || 0;
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
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<style lang="scss" scoped>
@import "./ctrl.scss";

.control-container {
  :deep(.expand-btn) {
    margin-bottom: 12px;
  }
}

.box {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.xz-container {
  padding: 0 6px 12px;
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
</style>
