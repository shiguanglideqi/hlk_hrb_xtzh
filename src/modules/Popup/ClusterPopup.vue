<template>
  <MoveBox :left="props.left" :top="props.top" @close="handleClose">
    <template #title>
      <div>
        <span>共</span>
        <span class="number">{{ total }}</span>
        <span>{{ desc }}</span>
      </div>
    </template>
    <template #right>
      <template v-if="isChecked">
        <el-space wrap :class="[{ disabled: checkList.length === 0 }]">
          <img src="@/assets/images/play.png" />
          <span class="play" @click.stop="handlePlay">播放</span>
        </el-space>
      </template>
    </template>
    <el-scrollbar max-height="450px">
      <div class="cluster-box">
        <el-checkbox-group
          v-model="checkList"
          style="font-size: 14px; line-height: initial"
          :max="9"
        >
          <Collapse v-for="(value, index) in list" :key="value.type" :show="index === 0">
            <template #header>{{ value.name }} ({{ value.list.length }})</template>
            <Box padding="12px 16px">
              <InfiniteScroll
                height="200px"
                style="gap: 8px 0; display: flex; flex-direction: column"
                :data="value.list || []"
                :size="14"
                :show-scroll="true"
                scroll-thumb-color="#3de3ff"
              >
                <template #default="{ node: item }">
                  <div class="cluster-item button-cursor">
                    <Row>
                      <Col class="ellipsis pointer" flex="auto" @click="handleClick(item)">
                        <!-- 抓拍机（jyzbl_jk_jklx_8）不可播放 -->
                        <el-checkbox
                          v-if="isChecked && item?.subClass !== 'jyzbl_jk_jklx_8'"
                          style="margin-right: 4px"
                          :value="item?.id"
                          size="large"
                          :disabled="!item.isOnline"
                        >
                          {{ "" }}
                        </el-checkbox>
                        <span :title="item?.name">{{ item.name }}</span>
                      </Col>
                      <Col v-if="isHideOnline" @click="handleClick(item)">
                        <Online :is-online="item.isOnline" style="cursor: pointer">
                          {{ !item.isOnline ? "离线" : "在线" }}
                        </Online>
                      </Col>
                    </Row>
                  </div>
                </template>
              </InfiniteScroll>
            </Box>
          </Collapse>
          <template v-if="unknownTypeList.length > 0">
            <Box padding="0px 16px">
              <InfiniteScroll
                height="300px"
                style="gap: 8px 0; display: flex; flex-direction: column"
                :data="unknownTypeList"
                :size="14"
                :show-scroll="true"
                scroll-thumb-color="#3de3ff"
              >
                <template #default="{ node: item }">
                  <div class="cluster-item button-cursor">
                    <Row>
                      <Col class="ellipsis pointer" flex="auto" @click="handleClick(item)">
                        <el-checkbox
                          v-if="isChecked && item?.subClass !== 'jyzbl_jk_jklx_8'"
                          style="margin-right: 4px"
                          :value="item?.id"
                          size="large"
                          :disabled="!item.isOnline"
                        >
                          {{ "" }}
                        </el-checkbox>
                        <span :title="item?.name">{{ item.name }}</span>
                      </Col>
                      <Col v-if="isHideOnline" @click="handleClick(item)">
                        <Online :is-online="item.isOnline">
                          {{ !item.isOnline ? "离线" : "在线" }}
                        </Online>
                      </Col>
                    </Row>
                  </div>
                </template>
              </InfiniteScroll>
            </Box>
          </template>
        </el-checkbox-group>
      </div>
    </el-scrollbar>
  </MoveBox>
</template>

<script lang="ts" setup>
import { usePopup } from "@/hooks/usePopup";
import { MoveBox, Collapse, InfiniteScroll, Row, Col, Online } from "@/components";
import { Popup } from ".";
import { Dictionary } from "@/common/const";
import { getDictByCode } from "@/services/common";
import { queryCarPlay } from "@/services/patrol";
import { openVideo } from "@/utils/monitorVideo";

const clusterInfo: Record<string, any> = {
  [Dictionary.POLICEKIND]: {
    unit: "名",
    desc: "警员",
  },
  [Dictionary.MONITOR_TYPE]: {
    unit: "个",
    desc: "监控",
  },
  [Dictionary.VEHICLE]: {
    unit: "辆",
    desc: "警车",
  },
  [Dictionary.WURENJI]: {
    unit: "台",
    desc: "无人机",
  },
  [Dictionary.POLICE_TONG]: {
    unit: "个",
    desc: "警务通",
  },
  [Dictionary.INTERCOM]: {
    unit: "个",
    desc: "对讲机",
  },
  [Dictionary.RECORDER]: {
    unit: "个",
    desc: "执法记录仪",
  },
  [Dictionary.LDXX_DJH]: {
    unit: "个",
    desc: "楼栋",
    isHideOnline: true,
  },
  [Dictionary.DZXX_DJH]: {
    unit: "个",
    desc: "地址",
    isHideOnline: true,
  },
};

const { showPopup, hidePopup } = usePopup();

const props = defineProps<{
  data: any[];
  left: number;
  top: number;
}>();

/** 总数 */
const total = ref(0);
/** 聚合描述 */
const desc = ref("个");
/** 选中播放的数据 */
const checkList = ref<string[]>([]);
/** 聚合数据 */
const list = ref<any[]>([]);
/** 无分类聚合数据 */
const unknownTypeList = ref<any[]>([]);
/** 是否可播放监控 */
const isChecked = ref(false);
/** 是否隐藏在线状态 */
const isHideOnline = ref(false);

onMounted(() => {
  total.value = props.data?.length || 0;
  const _type = props.data?.[0]?.properties?.type || "";
  if (_type) {
    desc.value = clusterInfo?.[_type]?.unit
      ? `${clusterInfo?.[_type]?.unit}${clusterInfo?.[_type]?.desc}`
      : "个";

    isHideOnline.value = clusterInfo?.[_type]?.isHideOnline || true;
  }
  setPlayList(_type);
  setClusterData(_type);
});

const playTypeSet = new Set([Dictionary.MONITOR_TYPE, Dictionary.VEHICLE, Dictionary.RECORDER]);

const handlePlay = async () => {
  if (checkList.value.length === 0) return;
  const _list = props.data?.filter((x) => checkList.value.includes(x.properties?.id));
  const type = props.data?.[0]?.properties?.type || "";
  const cameraList = [];
  if (type === Dictionary.VEHICLE) {
    const result = await queryCarPlay({ carCodeList: checkList.value });
    result.forEach((car: { deviceCode: string; deviceName: string }) => {
      cameraList.push({ cameraGBCode: car.deviceCode, cameraGBName: car.deviceName });
    });
  } else {
    const cameras = _list.map((equip) => {
      return { cameraGBCode: equip.properties?.id, cameraGBName: equip.properties?.name };
    });
    cameraList.push(...cameras);
  }
  const newList = cameraList.splice(0, 9);
  if (newList.length > 0) {
    openVideo(1, newList, 16, 9);
  } else {
    ElMessage({
      message: "没有可查看摄像头!",
      type: "warning",
      offset: 92,
    });
  }
};

const handleClick = (item: any) => {
  showPopup(item?.popup, {
    properties: item,
  });
};

/** 设置可播放列表 */
const setPlayList = (type: string) => {
  checkList.value = [];
  if (playTypeSet.has(type)) {
    isChecked.value = true;
  } else {
    isChecked.value = false;
  }
};

/** 监控默认选中过滤条件 */
const videoFilter = (item: any) =>
  item.properties?.subClass &&
  item.properties?.isOnline &&
  item.properties?.subClass !== "jyzbl_jk_jklx_8";
/** 设备默认选中过滤条件 */
const deviceFilter = (item: any) => item.properties?.isOnline;

/** 设置聚合数据 */
const setClusterData = async (type: string) => {
  const data = type ? await getDictByCode(type) : {}; // 获取类型字典项
  /** 未知类型列表 */
  const unknownList: any = [];
  const groupedData = props.data?.reduce((acc, value) => {
    if (!acc[value.properties?.subClass]) {
      if (value.properties?.subClass) {
        acc[value.properties?.subClass] = {
          name:
            data?.[value.properties?.category] ||
            data?.[value.properties?.subClass] ||
            "未分类设备",
          type: value.properties?.subClass,
          list: [],
        };
      } else {
        unknownList.push({ ...value.properties });
      }
    }
    value.properties?.subClass &&
      acc[value.properties?.subClass].list.push({ ...value.properties });
    return acc;
  }, {} as any);

  list.value = Object.values(groupedData);
  unknownTypeList.value = unknownList;
  /** 设置默认选中播放的设备 */
  checkList.value =
    props.data
      ?.filter((item) =>
        type === Dictionary.MONITOR_TYPE ? videoFilter(item) : deviceFilter(item),
      )
      .splice(0, 9)
      .map((item) => item.properties?.id) || [];
};

const handleClose = () => {
  hidePopup(Popup.Cluster);
};
</script>

<style lang="scss" scoped>
.pointer {
  cursor: pointer;
  user-select: none;
}

.cluster-box {
  padding: 12px 0 12px;
  box-sizing: border-box;
  width: 376px;
  .cluster-item {
    width: 100%;
    height: 39px;
    line-height: 39px;
    color: #ffffff;
    background: rgba(61, 227, 255, 0.1);
    border-radius: 4px;
    padding: 0 12px;
    box-sizing: border-box;
  }
}

.ellipsis {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-align: start;
  span {
    cursor: pointer;
    user-select: none;
  }
}

.popup {
  pointer-events: visible;
  width: 400px;
  height: 300px;
  display: inline-block;
  vertical-align: middle;
  background: rgba(0, 16, 44, 0.87);
  border-radius: 8px;
  border: 1px solid rgba(0, 116, 183, 0.97);
  overflow: hidden;
  .header {
    user-select: none;
    width: 100%;
    height: 40px;
    .number {
      font-size: 18px;
      font-family: Source Han Sans CN-Bold;
      font-weight: 500;
      color: #38c9ff;
      margin: 0 4px;
    }
    .disabled {
      cursor: no-drop;
      color: #a8abb2;
      filter: grayscale(1);
      .play {
        cursor: no-drop;
      }
    }
    .play {
      font-size: 14px;
      color: #3de3ff;
      margin-right: 12px;
      cursor: pointer;
      user-select: none;
    }
  }
}
</style>
