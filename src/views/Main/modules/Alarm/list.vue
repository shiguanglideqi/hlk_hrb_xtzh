<template>
  <div
    v-loading="loading"
    class="list-box"
    element-loading-text="警情数据加载中..."
    element-loading-background="rgba(12, 46 ,50, 0.1)"
  >
    <div class="header">
      <div class="title">涉亚警情信息</div>
      <div class="btn-box">
        <div class="title-btn pointer" :class="[{ drop: !isVisible }]" @click="handleVisble">
          <img src="@/assets/images/eye.png" />
        </div>
        <div class="title-btn pointer"><img src="@/assets/images/reset.png" /></div>
      </div>
    </div>
    <div class="body">
      <div class="odds-box">
        <div class="search">
          <span class="label">警情检索</span>
          <el-input v-model="params.search" style="flex: 1" placeholder="请输入">
            <template #suffix>
              <SearchIcon @click="handleSearch" />
            </template>
          </el-input>
          <div class="btn pointer" @click.stop="isShowSearch = !isShowSearch">高级检索</div>
        </div>
        <template v-if="isShowSearch">
          <teleport to="#auto-box">
            <div ref="searchRef" class="search-box">
              <div class="content">
                <div class="title">
                  <img src="@/assets/images/sea.png" />
                  高级检索
                </div>
                <div class="search-item">
                  <div class="label">报警时间:</div>
                  <div class="context">
                    <el-date-picker
                      v-model="time"
                      type="datetimerange"
                      :teleported="false"
                      :clearable="false"
                      :editable="false"
                      style="width: 100%"
                      format="YYYY-MM-DD HH:mm:ss"
                      start-placeholder="开始时间"
                      end-placeholder="结束时间"
                      :default-time="[
                        new Date(2000, 1, 1, 0, 0, 0),
                        new Date(2000, 2, 1, 23, 59, 59),
                      ]"
                      :prefix-icon="DateIcon"
                      @change="handleDateChange"
                    />
                  </div>
                </div>
                <div class="search-item">
                  <div class="label">时间范围:</div>
                  <div class="context chunk2">
                    <div
                      v-for="item in timeRange"
                      :key="item.value"
                      :class="[{ selected: timeType.includes(item.value) }]"
                      class="tab-item pointer"
                      @click="handleTimeTypeChange(item.value)"
                    >
                      {{ item.label }}
                    </div>
                  </div>
                </div>
                <div class="search-item">
                  <div class="label">警情级别:</div>
                  <div class="context chunk5">
                    <div
                      class="tab-item pointer"
                      :class="[{ selected: isAllLevelSelect }]"
                      @click="handleLevelAll"
                    >
                      全部
                    </div>
                    <div
                      v-for="item in jqLevel"
                      :key="item.value"
                      class="tab-item pointer"
                      :class="[
                        {
                          selected: !isAllLevelSelect && params.level.includes(item.value),
                        },
                      ]"
                      @click="handleLevelChange(item.value)"
                    >
                      {{ item.label }}
                    </div>
                  </div>
                </div>
                <div class="search-item">
                  <div class="label">警情类型:</div>
                  <div class="context">
                    <el-select
                      v-model="params.type"
                      placeholder="请选择"
                      style="width: 100%"
                      :teleported="false"
                      multiple
                      collapse-tags
                      collapse-tags-tooltip
                      clearable
                    >
                      <el-option
                        v-for="item in jqType"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </div>
                </div>
                <div class="search-item">
                  <div class="label">警情标签:</div>
                  <div class="context">
                    <el-tree-select
                      v-model="params.tags"
                      :data="tagTree"
                      placeholder="请选择"
                      style="width: 100%"
                      :teleported="false"
                      :props="{
                        children: 'children',
                        label: 'bqmc',
                        key: 'bqmc',
                        value: 'bqmc',
                        isLeaf: 'leaf',
                      }"
                      lazy
                      multiple
                      clearable
                      :load="loadNode"
                    />
                  </div>
                </div>
                <div class="btn-box">
                  <div class="btn pointer" @click="isShowSearch = false">关闭</div>
                  <div class="btn pointer active" @click="getList()">检索</div>
                </div>
              </div>
            </div>
          </teleport>
        </template>
        <div class="sub-tab">
          <div
            v-for="(item, index) in statusTab"
            :key="index"
            class="sub-tab-item pointer"
            :title="`${item.label}: ${item.value}`"
            @click="handleTabChange(item.key)"
          >
            {{ item.label }}
            <template v-if="item.value > 99">(99+)</template>
            <template v-else>({{ item.value }})</template>
            <div v-if="tabActive === item.key" class="selected" />
          </div>
        </div>
      </div>
      <div class="list-body">
        <InfiniteScroll
          v-if="listData?.length > 0"
          ref="scroll"
          :height="`${newMessageNum > 0 ? 795 : 825}px`"
          :data="listData || []"
          :size="14"
          :show-scroll="true"
          scroll-thumb-color="#00CCFF"
          @scroll-top="handleScrollChange"
        >
          <template #default="{ node: item }">
            <div v-side-in class="list-item down" @click="handleToDetail(item.id)">
              <div class="title">
                <div class="title-left" :title="item?.afAddress">
                  <div
                    class="status"
                    :class="'status-' + status?.find((v) => v.value === item?.zlStatus)?.class"
                  >
                    {{ status?.find((v) => v.value === item?.zlStatus)?.label }}
                  </div>
                  <div class="text">
                    {{ item?.afAddress }}
                  </div>
                  <div class="level" :class="'level' + item?.jqLevel">
                    {{ jqLevel?.find((v) => v.value === item?.jqLevel)?.label }}
                  </div>
                </div>
              </div>
              <div class="text-box">
                <template v-if="Array.isArray(item?.tags) && item?.tags?.length > 0">
                  <div v-for="(v, i) in item?.tags" :key="i" class="single">
                    {{ v }}
                  </div>
                </template>
                <div v-if="item?.ppFlag === '1'" class="single">精准定位</div>
                <div>
                  <div>
                    <span class="text-label">报警时间：</span>
                    {{ moment(item?.bjTime).format("YYYY-MM-DD HH:mm:ss") }}
                  </div>
                  <div>
                    <span class="text-label">警情类别：</span>
                    {{ jqTypeMap.get(item?.ajType) || "--" }}
                  </div>
                  <div>
                    <span class="text-label">报警人：</span>
                    {{ item?.bjrName }}
                  </div>
                  <div>
                    <span class="text-label">报警电话：</span>
                    {{ item?.bjrPhone }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </InfiniteScroll>
        <JQEmpty v-else class="empty" text="暂无警情数据" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import moment from "moment";
import * as turf from "@turf/turf";
import axios, { Canceler } from "axios";
import { useOrg } from "@/store/org";
import { getAlarm, getTags } from "@/services/alarm";
import { AlarmListItem, Datum } from "@/services/types/alarmType";
import { InfiniteScroll, JQEmpty } from "@/components";
import { MapConfig } from "@/components/map/MapConfig";
import { timeRange, jqLevel, jqTypeMap, status, jqImgs, jqType } from "./option";
import vSideIn from "@/directives/vSideIn";
import { useTime } from "@/hooks/useJq";
import useToDetail from "@/hooks/useToDetail";
import { _Config } from "./_Config";
import search from "@/assets/images/search.png";
import date from "@/assets/images/date.png";

/** start 获取各dom */
const searchRef = ref<HTMLDivElement | null>(null);
const ignoreElRef = ref<HTMLDivElement | null>(null);
const scroll = ref<InstanceType<typeof InfiniteScroll>>();
/** end */

const SearchIcon = shallowRef({
  render() {
    return h("img", {
      src: search,
      class: "pointer",
    });
  },
});

const DateIcon = shallowRef({
  render() {
    return h("img", {
      src: date,
      style: "width: 14px;margin-top: -2px;margin-right: 2px;",
    });
  },
});

const _config = new MapConfig();

const { CancelToken } = axios;
/** 取消请求 */
let cancelRequest: Canceler;
const loading = ref(false);

const orgStore = useOrg();
const { orgCode } = storeToRefs(orgStore);
const { getTime } = useTime();
const { toDetail } = useToDetail();

/** 警情图层是否显示 */
const isVisible = ref(false);
/** 缓存警情图层是否显示 */
const cacheVisible = ref(false);
/** tab状态选中 */
const tabActive = ref("0");
/** tab状态切换 */
const statusTab = ref([
  { key: "0", label: "全部", value: 0, param: [] },
  { key: "1", label: "待签收", value: 0, param: ["10", "20"] },
  { key: "2", label: "待到场", value: 0, param: ["30"] },
  { key: "3", label: "待处置", value: 0, param: ["40", "50"] },
  { key: "4", label: "已完结", value: 0, param: ["60", "70", "100"] },
]);
/** 是否显示高级搜索 */
const isShowSearch = ref(false);
/** 记录列表滚动位置 */
const scrollPosition = ref(0);
/** 新消息数量 */
const newMessageNum = ref(0);
/** 列表数据 */
const listData = ref<AlarmListItem[]>([]);
/** 时间范围默认全选 */
const timeType = ref<string[]>(["ins", "out"]);
/** 报警时间选择框 */
const time = ref<any>([]);
/** 标签树 */
const tagTree = ref<Datum[]>([]);

/** 等级相关 */
/** 缓存默认选中等级 */
const cacheDefaultLevel = ref([]);
/** 警情等级是否全部选中 */
const isAllLevelSelect = computed(() => jqLevel.length === params.value?.level.length);
/** --- end --- */

/** 请求参数 */
const params = ref<any>({
  /** 开始时间 */
  es: computed(() => time.value?.[0]),
  /** 结束时间 */
  ef: computed(() => time.value?.[1]),
  /** 时间范围 */
  aging: computed(() => (timeType.value.length <= 1 ? timeType.value?.[0] : "")),
  time: computed(() => (timeType.value.length <= 1 ? 30 * 60 : "")),
  /** 警情状态 */
  status: computed(() => statusTab.value?.find((v) => v.key === tabActive.value)?.param),
  /** 警情等级 */
  level: [],
  /** 警情类型 */
  type: [],
  /** 警情标签 */
  // tags: ["涉亚"],
  /** 检索信息 */
  search: "",
  /** 组织机构 */
  orgCode: computed(() => orgCode.value),
  size: 100000,
});

/** 警情上图数据 */
let features: GeoJSON.Feature[] | null = null;

onMounted(async () => {
  try {
    _config.loadFromJSON(_Config);

    const { startTime, endTime } = getTime();
    time.value = [startTime, endTime];

    getLevelConfig();
    getATags();
    getList();
  } catch (error) {
    console.log("error", error);
  }
});

onClickOutside(
  searchRef,
  () => {
    isShowSearch.value = false;
  },
  {
    ignore: [ignoreElRef],
  },
);

/** 搜索名称 */
const handleSearch = () => {
  getList();
};

/** 修改报警时间 */
const handleDateChange = () => {
  time.value = [
    moment(time.value?.[0]).format("YYYY-MM-DD HH:mm:ss"),
    moment(time.value?.[1]).format("YYYY-MM-DD HH:mm:ss"),
  ];
};

/** 切换列表状态类别 */
const handleTabChange = (type: string) => {
  tabActive.value = type;
  getList();
};

/** 时间范围修改 */
const handleTimeTypeChange = (type: string) => {
  if (timeType.value.includes(type)) {
    if (timeType.value.length === 1) return;
    timeType.value = timeType.value.filter((i: string) => i !== type);
  } else {
    timeType.value = [...timeType.value, type];
  }
};

/** 点击警情级别全部按钮 */
const handleLevelAll = () => {
  getLevelConfig();
};

/** 点击等级按钮切换状态 */
const handleLevelChange = (type: string) => {
  if (isAllLevelSelect.value) {
    params.value.level = [];
  }
  const index = params.value.level.indexOf(type);
  if (index > -1) {
    if (params.value.level.length === 1) return;
    params.value.level.splice(index, 1);
  } else {
    params.value.level.push(type);
  }
};

/** 跳转详情 */
const handleToDetail = (id: string) => {
  isShowSearch.value = false;
  _config.setSource("source-alarm-point", [], false);
  toDetail(id, () => {
    if (features) {
      _config.setSource("source-alarm-point", features ?? []);
    }
    _config.setSourceVisible("source-alarm-point", cacheVisible.value);
  });
};

/** 请求警情列表 */
const getList = () => {
  cancelRequest?.();
  loading.value = true;
  newMessageNum.value = 0;
  const newParams = Object.assign({}, params.value);

  getAlarm(newParams, {
    cancelToken: new CancelToken((c) => {
      cancelRequest = c;
    }),
  })
    .then((res) => {
      listData.value = res?.data || [];
      scrollPosition.value = 0;
      setScrollPosition();
      setMapAlarmData(listData.value);
    })
    .finally(() => {
      loading.value = false;
    });
};

/** 警情图标是否显示 */
const handleVisble = () => {
  isVisible.value = !isVisible.value;
  cacheVisible.value = isVisible.value;
  _config.setSourceVisible("source-alarm-point", isVisible.value);
};

/** 设置警情上图数据 */
const setMapAlarmData = (data: AlarmListItem[]) => {
  const list: GeoJSON.Feature<GeoJSON.Point>[] = [];
  data.forEach((item) => {
    const pos = item.geo?.split(",");
    if (item?.geo && pos?.length === 2) {
      const arr = turf.point([Number(pos[0]), Number(pos[1])], {
        name: item.afAddress ?? "",
        id: item.id,
        cid: item.id,
        imageName: jqImgs?.[item?.jqLevel],
      });
      list.push(arr);
    }
  });
  features = list;
  _config.setSource("source-alarm-point", list);
};

/** 记录滚动条滚动距离 */
const handleScrollChange = (top: number) => {
  scrollPosition.value = top;
};

/** 设置滚动条滚动位置 */
const setScrollPosition = () => {
  if (scroll.value) {
    scroll.value!.el.scrollTop = scrollPosition.value;
  }
};

/** 获取警情等级配置 */
const getLevelConfig = () => {
  params.value.level = jqLevel.map((item) => item.value);
  cacheDefaultLevel.value = params.value.level;
};

/** 懒加载子节点 */
const loadNode = (node: any, resolve: (data: any[]) => void) => {
  if (node.level === 0) {
    return resolve([...node.data.map((item: any) => ({ ...item, leaf: !item.children.length }))]);
  }
  if (node.data.children) {
    const data =
      node.data?.children?.map((v: any) => {
        return { ...v, leaf: !v.children.length };
      }) || [];
    return resolve([...data]);
  } else {
    return resolve([]);
  }
};

/** 获取警情标签配置 */
const getATags = () => {
  getTags().then((tags) => {
    tagTree.value = tags;
  });
};
</script>
<style lang="scss" scoped>
.list-box {
  pointer-events: visible;
  width: 100%;
  height: 100%;
  .header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 42px;
    line-height: 42px;
    padding: 0 14px 0 44px;
    background: url("/images/img/tab-header.png") no-repeat center;
    background-size: 100%;
    .title {
      font-family: YouSheBiaoTiHei;
      font-weight: 400;
      font-size: 24px;
      color: #ffffff;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }
    .btn-box {
      display: flex;
      gap: 0 4px;
      .title-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 28px;
        background: url("@/assets/images/icon-bg.png") no-repeat center;
        background-size: 100%;
        &.drop {
          opacity: 0.6;
        }
      }
    }
  }
  .body {
    width: 100%;
    height: calc(100% - 40px);
    padding: 0 4px 4px 4px;
    .odds-box {
      padding: 0 16px;
      gap: 0 12px;
      .search {
        display: flex;
        align-items: center;
        gap: 0 12px;
        margin-top: 12px;
        .label {
          font-weight: 400;
          font-size: 16px;
          color: #b2c3d8;
        }
        .btn {
          width: 82px;
          height: 32px;
          font-weight: 400;
          font-size: 16px;
          line-height: 30px;
          color: #ffffff;
          text-align: center;
          background: linear-gradient(180deg, #38c9ff 0%, #38c9ff 100%);
          border-radius: 4px 4px 4px 4px;
          border: 1px solid #38c9ff;
        }
      }
      .sub-tab {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        margin-top: 4px;
        height: 40px;
        border-bottom: 1px solid rgba(0, 135, 169, 0.8);
        font-family: Source Han Sans CN-Medium;
        .sub-tab-item {
          position: relative;
          text-align: center;
          line-height: 40px;
          font-size: 16px;
          font-weight: 500;
          color: #38c9ff;
          white-space: nowrap;
          .selected {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, #00ccff 0%, #e9fbff 53%, #00ccff 100%);
            border-radius: 2px 2px 2px 2px;
          }
        }
      }
    }
    .list-body {
      padding: 0 4px 0 16px;
      pointer-events: visible;
      color: #ffffff;
      :deep(.infinite-list) {
        display: flex;
        gap: 8px 0;
        flex-direction: column;
        padding: 6px 8px 8px 0;
        box-sizing: border-box;
      }
      .list-item {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        border: 1px solid transparent;
        background-clip: padding-box, border-box;
        background-origin: padding-box, border-box;
        background-image: linear-gradient(to right, #005b81, #005b81),
          linear-gradient(180deg, transparent 0, transparent, transparent 30%, #00ccff 100%);
        max-height: 100px;
        transition: max-height 0.2s linear;
        &.down {
          max-height: 600px;
        }
        &:hover {
          background-image: linear-gradient(to right, #007eb3, #007eb3),
            linear-gradient(180deg, transparent 0, transparent, transparent 30%, #00ccff 100%);
          .title {
            background: linear-gradient(
              90deg,
              rgba(0, 204, 255, 1) 0%,
              transparent 75%,
              transparent 100%
            );
          }
        }
        .title {
          display: flex;
          align-items: center;
          height: 36px;
          background: linear-gradient(
            90deg,
            rgba(0, 204, 255, 0.7) 0%,
            transparent 75%,
            transparent 100%
          );
          padding-left: 12px;
          box-sizing: border-box;
          .title-left {
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;
            .status {
              display: block;
              width: 48px;
              height: 21px;
              line-height: 18px;
              font-size: 12px;
              border-radius: 4px;
              text-align: center;
              &.status-ddc {
                background: #5d4800;
                border: 1px solid #ffc600;
                color: #ffc600;
              }
              &.status-dqs {
                background: #5d2e00;
                border: 1px solid #ff9600;
                color: #ff9600;
              }
              &.status-dcz {
                background: #105b8a;
                border: 1px solid #00deff;
                color: #00deff;
              }
              &.status-ywj {
                background: #00aef2;
                border: 1px solid #00fffc;
                color: #00fffc;
              }
              &.status-ybj {
                background: rgba($color: #ffc600, $alpha: 0.2);
                border: 1px solid #ffc600;
                color: #ffc600;
              }
            }
            .text {
              margin: 0 10px;
              font-weight: 500;
              font-size: 16px;
              color: #ffffff;
              max-width: 275px;
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
            }
            $tag-colors: (
              1: linear-gradient(135deg, #ff6407 0%, #d10b0c 100%),
              2: linear-gradient(135deg, #dda100 0%, #ff6000 100%),
              3: linear-gradient(135deg, #b8cb19 0%, #ffd200 100%),
              4: linear-gradient(135deg, #0097dd 0%, #005aff 100%),
            );
            .level {
              width: 39px;
              height: 18px;
              text-align: center;
              line-height: 18px;
              font-weight: 400;
              font-size: 12px;
              color: #ffffff;
              border-radius: 9px 9px 9px 0px;
            }
            @each $tag, $color in $tag-colors {
              .level#{$tag} {
                background: $color;
              }
            }
          }

          .title-right {
            display: flex;
            align-items: center;
            gap: 0px;

            .follow {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 40px;
            }
          }
        }
        .text-box {
          position: relative;
          padding: 8px 12px;
          font-size: 16px;
          box-sizing: border-box;
          line-height: 28px;
          .single {
            display: inline-block;
            height: 24px;
            line-height: 22px;
            font-weight: 400;
            font-size: 16px;
            color: #05fff5;
            margin-right: 16px;
          }
          .text-label {
            color: #b8d1e3;
          }
        }
      }
      .empty {
        height: 780px;
      }
    }
  }
}

.search-box {
  pointer-events: visible;
  position: absolute;
  top: 142px;
  left: 477px;
  width: 380px;
  z-index: 5;
  border-radius: 8px;
  background: rgba(0, 42, 62, 0.9);
  border: 1px solid #0074b7;
  .content {
    position: relative;
    width: 100%;
    height: 100%;
    padding-bottom: 16px;
    box-sizing: border-box;
    .title {
      position: relative;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      width: 100%;
      height: 40px;
      line-height: 36px;
      padding-left: 12px;
      font-weight: 500;
      font-size: 18px;
      color: #ffffff;
      border-bottom: 1px solid rgba(0, 139, 247, 0.15);
      gap: 0 6px;
    }
    .search-item {
      display: flex;
      align-items: center;
      gap: 0 6px;
      padding: 0 16px;
      line-height: 44px;
      box-sizing: border-box;
      :deep(.el-date-editor .el-range-separator) {
        width: 14px;
        flex: none;
      }
      :deep(.el-date-editor .el-range__close-icon--hidden) {
        display: none;
      }
      :deep(.el-date-editor .el-range-input) {
        width: 50%;
      }
      .label {
        font-size: 14px;
        color: #86909c;
      }
      .context {
        width: 280px;
        display: grid;
        gap: 0 4px;
        :deep(.el-icon.el-range__icon) {
          position: absolute;
          right: 4px;
        }
        :deep(.el-range-editor.el-input__wrapper) {
          justify-content: flex-start;
          padding: 0 25px 0 8px;
        }
        &.chunk2 {
          grid-template-columns: repeat(2, 74px);
        }
        &.chunk5 {
          grid-template-columns: repeat(5, 1fr);
        }
      }
      .tab-item {
        height: 24px;
        background: rgba(25, 128, 223, 0.12);
        border-radius: 4px;
        text-align: center;
        line-height: 24px;
        font-size: 14px;
        color: #38c9ff;
        &.selected {
          background: linear-gradient(
            0,
            rgba(56, 201, 255, 0.08) 0%,
            rgba(56, 201, 255, 0.73) 100%
          );
          color: #fff;
        }
      }
    }
    .btn-box {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
      padding: 0 16px;
      gap: 0 8px;
      .btn {
        width: 60px;
        height: 32px;
        line-height: 28px;
        font-weight: 400;
        font-size: 16px;
        color: #38c9ff;
        text-align: center;
        border-radius: 4px;
        border: 1px solid #0074b7;
        box-sizing: border-box;
        background: rgba(0, 116, 183, 0.2);

        &.active {
          color: #ffffff;
          background: linear-gradient(0, #008bf7 0%, #38c9ff 100%);
        }
      }
    }
  }
}
</style>
