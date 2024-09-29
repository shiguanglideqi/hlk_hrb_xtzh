<template>
  <div class="ctrl-box">
    <div class="top-box">
      <div class="prev pointer" @click="handlePrev">
        <img src="@/assets/images/icon/prev.png" />
      </div>
      <div
        v-for="(item, index) in currentData.slice(0, 3)"
        :key="item.icon"
        class="list-item pointer"
        :style="`margin-left: ${16 - index * 8}px`"
        @click="handleClick(item.type, item.com)"
      >
        <img :src="getNewPng(`${item.icon}${isActive(item.type) ? '-a' : ''}`)" />
        <div :class="[{ selected: isActive(item.type) }]" class="text">{{ item.name }}</div>
      </div>
    </div>
    <div ref="apngBox" class="img-box">
      <img v-show="isShowCollapse" class="default-image" src="/images/img/collapse.png" />
      <img v-show="isShowExpand" class="default-image" src="/images/img/expand.png" />
    </div>
    <div class="bot-box">
      <div
        v-for="(item, index) in currentData.slice(3, 6)"
        :key="item.icon"
        class="list-item pointer"
        :style="`margin-left: ${index * 8}px`"
        @click="handleClick(item.type, item.com)"
      >
        <img :src="getNewPng(`${item.icon}${isActive(item.type) ? '-a' : ''}`)" />
        <div :class="[{ selected: isActive(item.type) }]" class="text">{{ item.name }}</div>
      </div>
      <div class="next pointer" @click="handleNext">
        <img src="@/assets/images/icon/next.png" />
      </div>
    </div>
    <div class="panel-box">
      <component :is="currentCom" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import parseAPNG from "apng-js";
import type Player from "apng-js/types/library/player";
import { getNewPng } from "@/utils/utils";
import {
  FollowList,
  InterestPoint,
  OneStandThreeRoom,
  PoliceAgency,
  PoliceEquip,
  QuickControl,
  RegionalDivision,
  VideoEquip,
  KeyPerson,
  Headquarters,
} from "../Ctrl";
import { _CtrlConfig } from "./_CtrlConfig";
import { getMapData } from "./MapDataFunc";
import { useCtrlState } from "@/store/ctrlState";
import { MapConfig } from "@/components/map/MapConfig";

const expandSrc = "./images/img/collapse-a.png";
const collapseSrc = "./images/img/expand-a.png";

/** 图层控制枚举值 */
enum ControlType {
  /** 快捷控制 */
  KJKZ,
  /** 关注列表 */
  GZLB,
  /** 警务机构 */
  JWJG,
  /** 指挥部 */
  ZHB,
  /** 兴趣热点 */
  XQRD,
  /** 区域划分 */
  QYHF,
  /** 视频装备 */
  SPZB,
  /** 警用装备 */
  JYZB,
  /** 一标三室 */
  YBSS,
  /** 重点人 */
  ZDR,
}

const CtrlStore = useCtrlState();

const apngBox = ref<HTMLDivElement>();
let expandPlayer: Player | undefined;
let collapsePlayer: Player | undefined;

const _config = new MapConfig();
/** 是否收起 */
const isShowCollapse = ref(true);
/** 是否展开 */
const isShowExpand = ref(false);

const activeId = ref<ControlType | null>();
const _cacheActiveId = ref<ControlType | null>();

const isActive = (id: ControlType) => computed(() => activeId.value === id).value;
/** 当前选中com */
const currentCom = shallowRef();

onMounted(async () => {
  _config.loadFromJSON(_CtrlConfig);
  expandPlayer = await createApngPlayer(expandSrc, apngBox.value!, "expand");
  collapsePlayer = await createApngPlayer(collapseSrc, apngBox.value!, "collapse");
  getMapData();

  useEventListener(window, "beforeunload", () => {
    clearAllState();
  });
});

tryOnBeforeUnmount(() => {
  clearAllState();
});

/** 清除图层控制所有状态 */
const clearAllState = () => {
  clearDevice();
  clearLayer();
  _config.clearCommonFilter("source-interest-point", "subClass");
  _config.clearCommonFilter("source-jyzbl_jk_jklx", "video");
  _config.clearCommonFilter("source-police", "video");
  _config.clearFromJSON(_CtrlConfig);
  CtrlStore.$reset();
};

/** 清除设备类型过滤 */
const clearDevice = () => {
  [
    "source-jyzbl_zfjly",
    "source-jyzbl_zj_jc",
    "source-jyzbl_zj_wrj",
    "source-jyzbl_jwt",
    "source-jyzbl_djj",
  ].forEach((sourceId) => {
    _config.clearCommonFilter(sourceId, "isOnline");
  });
};

const clearLayer = () => {
  [
    "source-gangting-point",
    "source-jingwu-point",
    "source-shiji-point",
    "source-chutu-point",
    "source-executives",
    "source-precinct",
    "source-community",
    "source-grid",
  ].forEach((sourceId) => {
    _config.setSourceVisible(sourceId, false);
  });
};

const list = ref([
  {
    type: ControlType.KJKZ,
    com: markRaw(QuickControl),
    name: "快捷控制",
    icon: "kj",
    code: "dark_tckz_kjkz",
  },
  {
    type: ControlType.ZDR,
    com: markRaw(KeyPerson),
    name: "重点人",
    icon: "zdr",
    code: "dark_tckz_zdr",
  },
  {
    type: ControlType.ZHB,
    com: markRaw(Headquarters),
    name: "指挥部",
    icon: "zhb",
    code: "dark_tckz_zhb",
  },
  {
    type: ControlType.XQRD,
    com: markRaw(InterestPoint),
    name: "兴趣热点",
    icon: "xq",
    code: "dark_tckz_xqrd",
  },
  {
    type: ControlType.JWJG,
    com: markRaw(PoliceAgency),
    name: "警务机构",
    icon: "jw",
    code: "dark_tckz_jwjg",
  },
  {
    type: ControlType.QYHF,
    com: markRaw(RegionalDivision),
    name: "区域划分",
    icon: "qy",
    code: "dark_tckz_qyhf",
  },
  {
    type: ControlType.SPZB,
    com: markRaw(VideoEquip),
    name: "视频装备",
    icon: "sp",
    code: "dark_tckz_spzb",
  },
  {
    type: ControlType.JYZB,
    com: markRaw(PoliceEquip),
    name: "警用装备",
    icon: "zb",
    code: "dark_tckz_jyzb",
  },
  {
    type: ControlType.YBSS,
    com: markRaw(OneStandThreeRoom),
    name: "一标三实",
    icon: "yb",
    code: "dark_tckz_ybss",
  },
  {
    type: ControlType.GZLB,
    com: markRaw(FollowList),
    name: "关注列表",
    icon: "gz",
    code: "dark_tckz_gzlb",
  },
]);

/** 当前页 */
const currentPage = ref(1);
/** 总共页 */
const totalPage = computed(() => Math.ceil(list.value.length / 6));
/** 当前显示数据 */
const currentData = computed(() => {
  if (currentPage.value === totalPage.value) {
    return list.value.slice(-6);
  } else {
    return list.value.slice(currentPage.value - 1, currentPage.value - 1 + 6);
  }
});

let expandTimeOut: ReturnType<typeof setTimeout>;
let collapseTimeOut: ReturnType<typeof setTimeout>;

const handleClick = (type: ControlType, com: any) => {
  clearTimeout(expandTimeOut);
  clearTimeout(collapseTimeOut);
  if (activeId.value !== type) {
    activeId.value = type;
    _cacheActiveId.value = type;
    currentCom.value = com;
    handleExpand();
  } else {
    handleCollapse();
    activeId.value = null;
    _cacheActiveId.value = null;
    currentCom.value = null;
  }
};

const handleExpand = () => {
  isShowCollapse.value = false;
  const expand = document.getElementById("expand");
  if (expand) {
    expand.style.visibility = "visible";
    expandPlayer?.play();
    expandTimeOut = setTimeout(() => {
      expand.style.visibility = "hidden";
      isShowExpand.value = true;
      expandPlayer?.stop();
    }, 700);
  }
};

const handleCollapse = () => {
  isShowExpand.value = false;
  const collapse = document.getElementById("collapse");
  if (collapse) {
    collapse.style.visibility = "visible";
    collapsePlayer?.play();
    collapseTimeOut = setTimeout(() => {
      collapsePlayer?.stop();
      collapse.style.visibility = "hidden";
      isShowCollapse.value = true;
    }, 700);
  }
};

/** 上一页 */
const handlePrev = () => {
  if (currentPage.value === 1) return;
  currentPage.value--;
};

/** 下一页 */
const handleNext = () => {
  if (currentPage.value === totalPage.value) return;
  currentPage.value++;
};

const getImgBuffer = (url: string) => {
  return new Promise((resolve) => {
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.onload = () => {
          resolve(reader.result);
        };
      });
  });
};

const createApngPlayer = async (url: string, element: HTMLDivElement, id: string) => {
  const imgBuffer = (await getImgBuffer(url)) as ArrayBuffer;
  const apng = parseAPNG(imgBuffer);
  if (apng instanceof Error) {
    console.log("apng.message", apng.message);
    return;
  }
  const canvas = document.createElement("canvas");
  canvas.width = apng.width;
  canvas.height = apng.height;
  canvas.id = id;
  canvas.style.position = "absolute";
  canvas.style.visibility = "hidden";
  canvas.style.transform = "scale(0.75)";
  element?.appendChild(canvas);
  const player = await apng.getPlayer(canvas.getContext("2d")!);
  return player;
};
</script>

<style lang="scss" scoped>
.ctrl-box {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 167px;
  height: 1080px;
  background: url("@/assets/images/tab.png") no-repeat center center;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  div {
    box-sizing: border-box;
  }
  .panel-box {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
  .top-box {
    position: absolute;
    bottom: 560px;
    width: 122px;
    .text {
      padding-right: 4px;
      width: 98px;
      height: 49px;
      text-align: center;
      font-weight: bold;
      font-size: 14px;
      color: #ffffff;
      line-height: 48px;
      background: url("@/assets/images/text-bg.png") no-repeat center center;
      background-size: 100%;
      &.selected {
        background: url("@/assets/images/text-bg-a.png") no-repeat left 1px center;
        background-size: 100%;
      }
    }
  }
  .bot-box {
    position: absolute;
    top: 635px;
    width: 122px;
    .text {
      padding-right: 4px;
      width: 98px;
      height: 49px;
      text-align: center;
      font-weight: bold;
      font-size: 14px;
      color: #ffffff;
      line-height: 48px;
      background: url("@/assets/images/text-bg.png") no-repeat left 1px center;
      background-size: 100%;
      &.selected {
        background: url("@/assets/images/text-bg-a.png") no-repeat center center;
        background-size: 100%;
      }
    }
  }
  .prev,
  .next {
    pointer-events: visible;
    margin-left: 32px;
    width: 90px;
    height: 80px;
  }
  .list-item {
    position: relative;
    width: 98px;
    height: 110px;
    display: flex;
    align-items: flex-end;
    pointer-events: visible;
    img {
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
  .img-box {
    position: absolute;
    top: 488px;
    right: -15px;
    width: 180px;
    height: 180px;
    canvas {
      transform: scale(0.75);
    }
    .default-image {
      transform: scale(0.75);
    }
  }
}
</style>
