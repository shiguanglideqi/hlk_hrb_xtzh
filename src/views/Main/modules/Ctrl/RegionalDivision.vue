<template>
  <div class="control-container">
    <div
      v-loading="isLoading"
      class="box"
      element-loading-text="区域数据加载中..."
      element-loading-background="rgba(122, 122, 122, 0.2)"
    >
      <Box padding="16px 24px 0px 16px">
        <InputSearch v-model="text" @submit="handleToSearch" />
        <Tabs
          v-model="active"
          :data="tabs"
          :default-props="{ label: 'text', key: 'type' }"
          style="margin: 16px 0"
          @on-change="handleChange"
        ></Tabs>

        <Tabs
          v-model="active"
          :data="tabs2"
          :default-props="{ label: 'text', key: 'type' }"
          style="margin: 16px 0"
          @on-change="handleChange"
        ></Tabs>
        <div class="title-box">
          <div>
            <span>共</span>
            <span class="title-box-color">{{ dataSource.rawList?.length }}</span>
            <span>个</span>
          </div>
        </div>
      </Box>
      <div
        v-if="(active === AreaType.XZQY || isSearch) && isMounted"
        ref="container"
        class="xz-container infinite"
      >
        <template v-if="(height > 0 && active === AreaType.XZQY) || isSearch">
          <InfiniteScroll
            v-if="!isLoading && dataSource?.rawList?.length > 0"
            :data="dataSource.rawList"
            :show-scroll="true"
            class="scroll"
            scroll-bg-color="transparent"
            scroll-thumb-color="#1fedff"
            :height="`${height}px`"
          >
            <template #default="{ node: item }">
              <Panel :style="{ width: `100%` }" style="float: right; margin: 4px 0">
                <Row>
                  <Col flex="auto" class="row" :title="item.areaName">
                    {{ item.areaName }}
                  </Col>
                  <Col style="display: flex; gap: 12px">
                    <Button icon="rd-dw" text="定位" @click="handlePositionClick(item)" />
                    <Follow
                      keys="isFollowFlag"
                      :data="item"
                      :options="options"
                      :code="item.id"
                      :follow-type="RM.REGION"
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
              </Panel>
            </template>
          </InfiniteScroll>
          <JQEmpty v-if="!isLoading && dataSource.rawList.length === 0" text="暂无区域数据" />
        </template>
      </div>
      <template v-else>
        <div class="xz-container">
          <Tree
            v-if="!isLoading && dataSource.list.length > 0"
            class="context"
            :data="dataSource.list"
            scroll-bg-color="transparent"
            scroll-thumb-color="#1fedff"
            :lazy="true"
            :load="loadNode"
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
                    :style="{ width: `calc(100% - ${16 * node.level}px)` }"
                    style="float: right; margin: 4px 0"
                  >
                    <Row>
                      <Col flex="auto" class="row" :title="item.areaName">
                        {{ item.areaName }}
                      </Col>
                      <Col style="display: flex; gap: 12px">
                        <Button icon="rd-dw" text="定位" @click="handlePositionClick(item)" />
                        <Follow
                          keys="isFollowFlag"
                          :data="item"
                          :options="options"
                          :code="item.id"
                          :follow-type="RM.REGION"
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
                  </Panel>
                </template>
              </InfiniteScroll>
            </template>
          </Tree>
          <JQEmpty v-if="!isLoading && dataSource.list.length === 0" text="暂无区域数据" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as turf from "@turf/turf";
import type Node from "element-plus/es/components/tree/src/model/node";
import { useOrg, useUser } from "@/store";
import { RM, isCollect } from "@/common/const";
import { AreaType } from "@/common/map";
import {
  InfiniteScroll,
  Box,
  Row,
  Col,
  InputSearch,
  Tabs,
  Tree,
  Panel,
  Button,
  JQEmpty,
} from "@/components";
import Follow from "./components/Follow.vue";
import { treeForeach } from "@/utils/utils";
import { _AreaConfig } from "./_CtrlConfig";
import { batchFollowAdd, batchFollowUpdate, getRegionList } from "@/services/patrol";
import { getOrgList, queryArea } from "@/services/map";
import { useCtrlState } from "@/store/ctrlState";
import { MapConfig } from "@/components/map/MapConfig";
import { fillBorder, useFollowType } from "@/hooks/PoliceVideo";

type ItemType = {
  id: string;
  areaType: string;
  areaName: string;
  isFollowFlag: number;
};

const _config = new MapConfig();

/** 数据源与字典类型映射 */
const sourceMap = new Map()
  .set(AreaType.XZQY, "source-executives")
  .set(AreaType.JDSQ, "source-community")
  .set(AreaType.GXQY, "source-precinct")
  .set(AreaType.XLQY, "source-grid")
  .set(AreaType.HCQ, "source-hcq")
  .set(AreaType.HHQ, "source-hhq")
  .set(AreaType.QYQ, "source-qyq")
  .set(AreaType.XQQ, "source-xqy");

const { setFillBorder, clearFillBorder } = fillBorder();

const { typeData: options } = useFollowType("区域划分", RM.REGION);

const store = useOrg();
const userstore = useUser();

const { visible } = useCtrlState();
const { orgCode } = storeToRefs(store);
const { user } = storeToRefs(userstore);

const container = ref<HTMLDivElement>();
const height = computed(() => (container.value ? container.value.clientHeight : 0));

const tabs = [
  { text: "行政区域", type: AreaType.XZQY },
  { text: "辖区边界", type: AreaType.GXQY },
  { text: "社区边界", type: AreaType.JDSQ },
  { text: "网格边界", type: AreaType.XLQY },
];

const tabs2 = [
  { text: "环城圈", type: AreaType.HCQ },
  { text: "环哈圈", type: AreaType.HHQ },
  { text: "区域圈", type: AreaType.QYQ },
  { text: "辖区圈", type: AreaType.XQQ },
];

/** 图层面板控制 */
const control = reactive({
  community: visible("source-community"),
  jurisdiction: visible("source-precinct"),
  xingzheng: visible("source-executives"),
  xunluo: visible("source-grid"),

  hcq: visible("source-hcq"),
  hhq: visible("source-hhq"),
  qyq: visible("source-qyq"),
  xqq: visible("source-xqy"),
});

/** 是否有搜索值 */
const isSearch = ref(false);
/** 是否加载 */
const isLoading = ref(false);
/** 页面是否挂载 */
const isMounted = useMounted();
/** 搜索值 */
const text = ref("");
/** 当前选中的tab */
const active = ref("");

const params = reactive({
  deptCode: orgCode,
  searchText: "",
  areaType: active,
  idCard: user.value?.idCard,
});

const dataSource: { list: ItemType[]; rawList: ItemType[] } = reactive({
  list: [],
  rawList: [],
});

const getAreaActive = () => {
  const _list = [
    AreaType.XZQY,
    AreaType.JDSQ,
    AreaType.XLQY,
    AreaType.GXQY,
    AreaType.HCQ,
    AreaType.HHQ,
    AreaType.QYQ,
    AreaType.XQQ,
  ];
  return _list.find((key) => visible(sourceMap.get(key))) || AreaType.XZQY;
};

onMounted(() => {
  _config.loadFromJSON(_AreaConfig);
  if (!active.value) {
    active.value = getAreaActive();
  }
  getMapData();
  getTreeData();
});

onUnmounted(() => {
  _config.clearFromJSON(_AreaConfig);
  control.community = false;
  control.jurisdiction = false;
  control.xingzheng = false;
  control.xunluo = false;

  control.hcq = false;
  control.hhq = false;
  control.qyq = false;
  control.xqq = false;
  clearFillBorder();
});

/** 获取四门落锁数据 */
const getMapData = () => {
  queryArea({
    deptCode: orgCode.value,
    areaTypeList: [AreaType.HCQ],
  }).then((result) => {
    const list = setAreaSource(result);
    _config.setSource("source-hcq", list);
  });
  queryArea({
    deptCode: orgCode.value,
    areaTypeList: [AreaType.HHQ],
  }).then((result) => {
    const list = setAreaSource(result);
    _config.setSource("source-hhq", list);
  });
  queryArea({
    deptCode: orgCode.value,
    areaTypeList: [AreaType.QYQ],
  }).then((result) => {
    const list = setAreaSource(result);
    _config.setSource("source-qyq", list);
  });
  queryArea({
    deptCode: orgCode.value,
    areaTypeList: [AreaType.XQQ],
  }).then((result) => {
    const list = setAreaSource(result);
    _config.setSource("source-xqy", list);
  });
};

/**
 * 设置区域数据源 属性
 * @description 将后端返回数据  添加到 feature 的 properties 中
 */
const setAreaSource = (result: any[]) => {
  const list: GeoJSON.Feature[] = [];
  result.sort((a, b) => a.orgCode - b.orgCode);
  result.forEach((item) => {
    if (item.areaRange) {
      const feature: GeoJSON.Feature = turf.feature(JSON.parse((item.areaRange as string) || ""));
      feature.properties!.name = item.areaName;
      feature.properties!.lineColour = item.lineColour;
      feature.properties!.lineType = item.lineType;
      feature.properties!.orgCode = item.orgCode;
      feature.properties!.areaOpacity = item.coverArea ? Number(item.coverArea) : 0.4;
      feature.properties!.areaColour = item.areaColour;
      feature.properties!.id = item.id;
      list.push(feature);
    }
  });
  return list;
};

const handleChange = () => {
  clearFillBorder();
};

const handleToSearch = () => {
  isSearch.value = !!text.value;
  params.searchText = text.value;
};

/** 关注 */
const handleFollow = (followTypeList: string[], followTagTypeList: string[], data: ItemType) => {
  batchFollowAdd({
    followTagTypeList,
    followTypeList: followTypeList.length > 0 ? [RM.REGION] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.id,
    sourceFollowType: RM.REGION,
    sourceName: data.areaName,
  }).then(() => {
    if (active.value === AreaType.XZQY) {
      getDataList();
    } else {
      treeForeach(dataSource.list, (node) => {
        if (node.data?.length > 0) {
          const res = node.data.find((item: { id: string }) => item.id === data.id);
          if (res) {
            res.isFollowFlag =
              followTagTypeList.length > 0 || followTypeList.length > 0
                ? Number(isCollect.Yes)
                : Number(isCollect.No);
          }
        }
      });
      const res = dataSource?.rawList.find((item: { id: string }) => item.id === data.id);
      if (res) {
        res.isFollowFlag =
          followTagTypeList.length > 0 || followTypeList.length > 0
            ? Number(isCollect.Yes)
            : Number(isCollect.No);
      }
    }
  });
};

/** 更新关注 */
const handleFollowUpdate = (
  followTypeList: string[],
  followTagTypeList: string[],
  data: ItemType,
) => {
  batchFollowUpdate({
    followTagTypeList,
    followTypeList: followTypeList.length > 0 ? [RM.REGION] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.id,
    sourceFollowType: RM.REGION,
    sourceName: data.areaName,
  }).then(() => {
    if (active.value === AreaType.XZQY) {
      getDataList();
    } else {
      treeForeach(dataSource.list, (node) => {
        if (node.data?.length > 0) {
          const res = node.data.find((item: { id: string }) => item.id === data.id);
          if (res) {
            res.isFollowFlag =
              followTagTypeList.length > 0 || followTypeList.length > 0
                ? Number(isCollect.Yes)
                : Number(isCollect.No);
          }
        }
      });
      const res = dataSource?.rawList.find((item: { id: string }) => item.id === data.id);
      if (res) {
        res.isFollowFlag =
          followTagTypeList.length > 0 || followTypeList.length > 0
            ? Number(isCollect.Yes)
            : Number(isCollect.No);
      }
    }
  });
};

const handlePositionClick = (val: ItemType) => {
  _config.getFeatureItem<GeoJSON.Polygon>(sourceMap.get(val.areaType), val.id).then((areaRange) => {
    _config.position(areaRange);
    setFillBorder(_config._map!, areaRange);
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadNode = async (node: Node, resolve: (data: any[]) => void) => {
  try {
    if (node.level === 0) {
      return;
    }
    const nodeData = dataSource.rawList.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => item.orgCode === node.data.deptCode,
    );
    // eslint-disable-next-line no-param-reassign
    node.data.data = nodeData;
    if (node.data.children) {
      resolve([...node.data.children]);
    } else {
      return resolve([{}]);
    }
  } catch (error) {
    console.log("error", error);
  }
};

/** 获取区域列表数据 */
const getDataList = async () => {
  try {
    isLoading.value = true;
    const data = await getRegionList(params);
    dataSource.rawList = data || [];
  } catch (error) {
    console.log("error", error);
  } finally {
    isLoading.value = false;
  }
};

/** 获取组织机构列表数据 */
const getTreeData = async () => {
  try {
    isLoading.value = true;
    const data: [] = await getOrgList({
      token: sessionStorage.getItem("token") || "",
      orgCode: orgCode.value,
    });
    dataSource.list = data || [];
  } catch (error) {
    console.log("error", error);
  } finally {
    isLoading.value = false;
  }
};

watchEffect(() => {
  control.xingzheng = active.value === AreaType.XZQY;
  control.community = active.value === AreaType.JDSQ;
  control.jurisdiction = active.value === AreaType.GXQY;
  control.xunluo = active.value === AreaType.XLQY;

  control.hcq = active.value === AreaType.HCQ;
  control.hhq = active.value === AreaType.HHQ;
  control.qyq = active.value === AreaType.QYQ;
  control.xqq = active.value === AreaType.XQQ;
});

watchEffect(() => {
  getDataList();
  getTreeData();
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

.infinite {
  .scroll {
    padding: 0px 24px 12px 12px !important;
    box-sizing: border-box;
  }
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
  :deep(.dark-tree) {
    padding-right: 12px !important;
  }
  :deep(.scrollbar-dark) {
    padding-right: 12px !important;
    box-sizing: border-box;
  }
}
</style>
