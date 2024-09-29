<template>
  <div class="control-container">
    <div
      v-loading="isLoading"
      class="box"
      element-loading-text="警务机构加载中..."
      element-loading-background="rgba(122, 122, 122, 0.2)"
    >
      <Box padding="16px 24px 0 16px">
        <InputSearch v-model="text" placeholder="输入关键字搜索" @submit="handleToSearch" />
        <CollapseMore v-model="active" class="collapse-device" :data="list" />
        <div class="title-box">
          <div>
            <span>共</span>
            <span class="title-box-color">{{ isCount }}</span>
            <span>个</span>
          </div>
        </div>
      </Box>
      <div v-if="isSearch && isMounted" ref="container" class="xz-container infinite">
        <template v-if="height > 0 || isSearch">
          <InfiniteScroll
            v-if="!isLoading && dataSource?.list?.length > 0"
            :data="dataSource.rawList"
            :show-scroll="true"
            class="scroll"
            scroll-bg-color="transparent"
            scroll-thumb-color="#1fedff"
            :height="`${height}px`"
          >
            <template #default="{ node: item }">
              <Panel :key="item.id" :style="{ width: `100%` }" style="float: right; margin: 4px 0">
                <Row>
                  <Col flex="auto" class="row" :title="item.pointName">
                    {{ item.pointName }}
                  </Col>
                  <Col style="display: flex; gap: 12px">
                    <Button :is-margin="false" icon="public-gz" />
                    <Follow
                      keys="isFollowFlag"
                      :data="item"
                      :options="options"
                      :code="item.id"
                      :follow-type="RM.POLICE_AGENCY"
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
        </template>
      </div>
      <template v-else>
        <div class="xz-container">
          <template v-if="active !== PointType.FKQ">
            <Tree
              v-if="!isLoading && dataSource?.list?.length > 0"
              class="context"
              :data="dataSource.list"
              scroll-bg-color="transparent"
              scroll-thumb-color="#1fedff"
              :lazy="true"
              :default-props="{
                children: 'childOrgTreeList',
                label: 'deptAlias',
                key: 'deptCode',
              }"
              :is-online="false"
              :load="loadNode"
              :show-count="true"
              total-key="total"
            >
              <template #default="{ node }">
                <InfiniteScroll
                  :data="node.data.data"
                  :show-scroll="true"
                  class="scroll"
                  :height="`300px`"
                >
                  <template #default="{ node: item }">
                    <Panel
                      :style="{ width: `calc(100% - ${16 * node.level}px)` }"
                      style="float: right; margin: 4px 0"
                    >
                      <Row>
                        <Col flex="auto" class="row" :title="item.pointName">
                          {{ item.pointName }}
                        </Col>
                        <Col style="display: flex; gap: 12px">
                          <Button icon="rd-dw" text="定位" @click="handlePositionClick(item)" />
                          <Follow
                            keys="isFollowFlag"
                            :data="item"
                            :options="options"
                            :code="item.id"
                            :follow-type="RM.POLICE_AGENCY"
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
            <JQEmpty v-if="!isLoading && dataSource.list.length === 0" text="暂无警务机构数据" />
          </template>
          <template v-else>
            <Tree
              v-if="!isLoading && treeData?.list?.length > 0"
              ref="treeRef"
              :data="treeData.list"
              :show-button="active === PointType.FKQ"
              :lazy="true"
              :load="loadNode"
            >
              <template #button="{ node }">
                <span class="shangka-button" @click.stop="handleShangKa(node)">
                  {{ isKa(node.data?.deptCode) ? "撤卡" : "上卡" }}
                </span>
              </template>
              <template #default="{ node }">
                <Panel
                  v-for="(item, index) in node.data.data || []"
                  :key="index"
                  :style="{ width: `calc(100% - ${16 * node.level}px)` }"
                  style="float: right; margin: 4px 0"
                >
                  <Row>
                    <Col flex="auto" class="row" :title="item.pointName">
                      {{ item.pointName }}
                    </Col>
                    <Col style="display: flex; gap: 12px">
                      <Button icon="rd-dw" text="定位" @click="handlePositionClick(item)" />
                    </Col>
                  </Row>
                </Panel>
                <JQEmpty v-if="(node?.data?.data || []).length === 0" text="暂无防控圈数据" />
              </template>
            </Tree>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RM, isCollect } from "@/common/const";
import { PointType } from "@/common/map";
import {
  Box,
  InfiniteScroll,
  Col,
  Row,
  Button,
  CollapseMore,
  JQEmpty,
  InputSearch,
  Panel,
  Tree,
} from "@/components";
import { useOrg, useUser } from "@/store";
import * as turf from "@turf/turf";
import Follow from "./components/Follow.vue";

import type Node from "element-plus/es/components/tree/src/model/node";
import type { IPointData } from "./type/index";
import { batchFollowAdd, batchFollowUpdate, queryDisposalPowerPonint } from "@/services/patrol";
import { useCtrlState } from "@/store/ctrlState";
import { MapConfig } from "@/components/map/MapConfig";
import { getDefenseCircle, getPointBigCount, getPointList, setShangKa } from "@/services/map";
import minemap from "@/components/map/minemap";
import { useFollowType } from "@/hooks/PoliceVideo";

const treeRef = ref<InstanceType<typeof Tree>>();
const container = ref<HTMLDivElement>();
const height = computed(() => (container.value ? container.value.clientHeight : 0));

const { typeData: options } = useFollowType("警务机构", RM.POLICE_AGENCY);

const _config = new MapConfig();

const store = useOrg();
const userStore = useUser();
const { visible } = useCtrlState();

const { user } = storeToRefs(userStore);
const { orgCode, orgCodes } = storeToRefs(store);

const list = ref<Record<string, any>[]>([
  { name: "派出所", key: PointType.ZAGT, num: "0" },
  { name: "警务点位", key: PointType.JWDW, num: "0" },
  { name: "市际卡口", key: PointType.SJKK, num: "0" },
  { name: "处突点位", key: PointType.CTDW, num: "0" },
  { name: "公安检查站", key: PointType.GAJCZ, num: "0" },
  { name: "治安卡点", key: PointType.ZAKD, num: "0" },
  { name: "执勤点位", key: PointType.ZQDW, num: "0" },
]);

/** 图层面板控制 */
const control = reactive({
  zngt: visible("source-gangting-point"),
  jwdw: visible("source-jingwu-point"),
  sskk: visible("source-shiji-point"),
  ctdw: visible("source-chutu-point"),
  gajcz: visible("source-jianchazhan-point"),
  zakd: visible("source-zhian-point"),
  zqdw: visible("source-zhiqin-point"),
});

/** 常规点位数据 */
const dataSource: { list: IPointData[]; rawList: IPointData[]; pointList: IPointData[] } = reactive(
  {
    list: [],
    rawList: [],
    pointList: [],
  },
);

/** 防控圈数据 */
const treeData = reactive({
  list: [],
  searchList: [],
});

/** 图层与字典类型映射 */
const layerMap = new Map()
  .set(PointType.CTDW, "source-chutu-point")
  .set(PointType.JWDW, "source-jingwu-point")
  .set(PointType.SJKK, "source-shiji-point")
  .set(PointType.ZAGT, "source-gangting-point")
  .set(PointType.GAJCZ, "source-jianchazhan-point")
  .set(PointType.ZAKD, "source-zhian-point")
  .set(PointType.ZQDW, "source-zhiqin-point");

/** 是否有搜索值 */
const isSearch = ref(false);
/** 是否加载 */
const isLoading = ref(false);
/** 页面是否挂载 */
const isMounted = useMounted();
/** 搜索值 */
const text = ref("");
/** 选中的type值 */
const active = ref("");

const getPointActive = () => {
  const _list = [
    PointType.ZAGT,
    PointType.JWDW,
    PointType.CTDW,
    PointType.SJKK,
    // PointType.FKQ,
    PointType.GAJCZ,
    PointType.ZAKD,
    PointType.ZQDW,
  ];
  return _list.find((key) => visible(layerMap.get(key))) || "";
};

const isCount = computed(() => {
  const result = list.value.find((v) => v.key === active.value);
  return result ? result.num : 0;
});

onMounted(() => {
  isLoading.value = true;
  if (!active.value) {
    active.value = getPointActive();
  }
});

onUnmounted(() => {
  control.jwdw = false;
  control.jwdw = false;
  control.zngt = false;
  control.sskk = false;
  control.gajcz = false;
  control.zakd = false;
  control.zqdw = false;
  clearAllMarker();
});

const handleToSearch = () => {
  isSearch.value = !!text.value;
  isLoading.value = true;
  queryDisposalPowerPonint({
    deptCode: orgCode.value,
    pointBigTypeList: [active.value],
    searchText: text.value,
    idCard: user.value?.idCard,
  })
    .then((data) => {
      dataSource.rawList = data;
    })
    .catch((error) => {
      console.log("error", error);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

/** 关注 */
const handleFollow = (followTypeList: string[], followTagTypeList: string[], data: IPointData) => {
  batchFollowAdd({
    followTagTypeList,
    followTypeList: followTypeList.length > 0 ? [RM.POLICE_AGENCY] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.id,
    sourceFollowType: RM.POLICE_AGENCY,
    sourceName: data.pointName,
  }).then(() => {
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
    followTypeList: followTypeList.length > 0 ? [RM.POLICE_AGENCY] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.id,
    sourceFollowType: RM.POLICE_AGENCY,
    sourceName: data.pointName,
  }).then(() => {
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
  });
};

/** 点击定位 */
const handlePositionClick = (value: IPointData) => {
  if (value?.id) {
    _config
      .getFeatureItem<GeoJSON.Point>(layerMap.get(value.pointBigType), value?.id)
      .then((point) => {
        _config.position(point);
      });
  }
};

const getCount = async () => {
  const pointBigTypeList = list.value.map((v) => v.key);
  const res = await getPointBigCount({
    pointBigTypeList,
    deptCode: orgCode.value,
  });
  list.value.forEach((v) => {
    const result = res.find((item: { pointBigType: string }) => v.key === item.pointBigType);
    // eslint-disable-next-line no-param-reassign
    v.num = result ? result.count : 0;
  });
  const data = await getDefenseCircle({ pointName: "", orgCode: orgCodes.value });
  const result = list.value.find((val) => PointType.FKQ === val.key);
  if (result) {
    const total = data.reduce((a: number, b: { pointDraws: unknown[] }) => {
      return a + (b?.pointDraws?.length || 0);
    }, 0);
    result.num = total;
  }
  return { res, data };
};

const markerList: any = [];

const createMarker = (data: any) => {
  const coords = [];
  for (const item of data) {
    const el = document.createElement("div");
    el.className = "marker";
    el.style.height = "20px";
    el.style.padding = "0 8px";
    el.style.color = "#3A75FE";
    el.style.fontSize = "14px";
    el.style.background = "#FFFFFF";
    el.style.borderRadius = "3px";
    el.style.border = "1px solid #3A75FE";
    el.style.textAlign = "center";
    el.innerHTML = `${item.place}%`;
    const point = JSON.parse(item.point);
    // Add markers to the map.
    const p = turf.point(point.coordinates);
    coords.push(p);
    const maker = new minemap.Marker(el, {
      offset: [0, -60],
      anchor: "bottom",
    })
      .setLngLat(point.coordinates)
      .addTo(_config._map!);

    markerList.push(maker);
  }
  _config.position(coords as unknown as GeoJSON.Feature);
};

const clearAllMarker = () => {
  for (let i = markerList.length - 1; i >= 0; i--) {
    markerList[i].remove();
  }
};

const shangka = ref<string[]>([]);

const isKa = (code: string) => computed(() => shangka.value.includes(code)).value;

const handleShangKa = (node: any) => {
  if (node.data?.data?.length === 0) {
    ElMessage({
      message: "暂无可上卡点位",
      type: "warning",
      offset: 92,
    });
    return;
  }
  if (isKa(node.data?.deptCode)) {
    ElMessageBox.confirm("是否确定执行撤卡操作?", "确认提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        treeRef.value!.refs!.store.nodesMap[node.data?.deptCode].expanded = false;
        shangka.value = shangka.value.filter((val) => val !== node.data?.deptCode);
        clearAllMarker();
        // layerStore.clearFilter("police_agency");
      })
      .catch(() => {
        return false;
      });
  } else {
    ElMessageBox.confirm("是否确定执行上卡操作?", "确认提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(async () => {
        treeRef.value!.refs!.store.nodesMap[node.data?.deptCode].expanded = true;
        shangka.value.push(node.data?.deptCode);
        const data = await setShangKa({ code: node.data.deptCode, orgCode: orgCodes.value });
        createMarker(data);
        return (node.data.data || []).map((item: { id: string }) => item.id);
      })
      .then(() => {
        // layerStore.setFilter("source-jingwu-point"!, { id: ids }, "police_agency");
      })
      .catch(() => {
        return false;
      });
  }
};

/** 获取组织机构列表数据 */
const getTreeData = async () => {
  isLoading.value = true;
  Promise.all([
    getPointList({
      pointBigType: active.value,
      deptCode: orgCode.value,
    }),
    queryDisposalPowerPonint({
      deptCode: orgCode.value,
      pointBigTypeList: [active.value],
      searchText: text.value,
      idCard: user.value?.idCard,
    }),
  ])
    .then((res) => {
      const [tree, point] = res;
      dataSource.list = tree ? [tree] : [];
      dataSource.pointList = point || [];
    })
    .finally(() => {
      isLoading.value = false;
    });
};

/** 获取防控圈数据 */
const getFkqTree = async () => {
  try {
    const data = await getDefenseCircle({ pointName: text.value, orgCode: orgCodes.value });
    const resList: any = [];
    data.forEach((item: any) => {
      resList.push({
        name: item.dictName,
        deptCode: item.dictCode,
        data: item.pointDraws,
        children: [{}],
      });
    });
    treeData.list = resList;
    resList.length > 0 && (control.jwdw = true);
  } catch (error) {
    console.error("error", error);
  }
};

const loadNode = async (node: Node, resolve: (data: any[]) => void) => {
  try {
    if (node.level === 0) {
      return;
    }
    if (active.value !== PointType.FKQ) {
      const result = dataSource.pointList.filter(
        (item: { orgCode: string }) => item.orgCode === node.data.deptCode,
      );
      // eslint-disable-next-line no-param-reassign, require-atomic-updates
      node.data.data = result;
    } else {
      resolve([{}]);
      return;
    }
    if (node.data.childOrgTreeList) {
      const childOrgTrees =
        node.data.childOrgTreeList?.filter((item: { total: string }) => Number(item.total) !== 0) ||
        [];
      resolve([...childOrgTrees]);
    } else {
      return resolve([{}]);
    }
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

watch(
  () => active.value,
  () => {
    isLoading.value = true;
    if (active.value === PointType.FKQ) {
      Promise.all([getFkqTree(), getCount()]).finally(() => {
        isLoading.value = false;
      });
    } else {
      Promise.all([getTreeData(), getCount()]).finally(() => {
        isLoading.value = false;
      });
    }
  },
  {
    immediate: true,
  },
);

watchEffect(() => {
  control.zngt = active.value === PointType.ZAGT;
  control.jwdw = active.value === PointType.JWDW;
  control.sskk = active.value === PointType.SJKK;
  control.ctdw = active.value === PointType.CTDW;

  control.gajcz = active.value === PointType.GAJCZ;
  control.zakd = active.value === PointType.ZAKD;
  control.zqdw = active.value === PointType.ZQDW;
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
