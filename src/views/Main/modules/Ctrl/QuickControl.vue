<template>
  <div class="control-container">
    <div class="content">
      <el-scrollbar height="670px" class="list">
        <div
          v-for="(item, index) in customList.data"
          :key="index"
          class="list-item"
          :class="[{ active: item.checked }]"
          @click="handleClick(item)"
        >
          <Row>
            <Col flex="auto">
              {{ item.name }}
            </Col>
            <Col>
              <div v-if="item.isShowOnline" class="online-buttons">
                <div class="online-buttons-content">
                  <div
                    class="left"
                    :class="[{ active: item.online }]"
                    @click.stop="setOnline(item, true)"
                  >
                    {{ item.onlineCount }}
                  </div>
                  <div
                    class="right"
                    :class="[{ active: !item.online }]"
                    @click.stop="setOnline(item, '')"
                  >
                    {{ item.totalCount }}
                  </div>
                </div>
              </div>
              <div v-else>{{ item.num }} {{ item.isShowOnline }}</div>
            </Col>
          </Row>
        </div>
      </el-scrollbar>
    </div>
    <div class="footer">
      <div class="footer-icon" :class="{ disabled: !isActive }" @click="isActive && handleClear()">
        <img src="@/assets/images/clear.png" />
      </div>
      <div class="footer-button" @click="handleShowSetting">自定义配置</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrg, useUser } from "@/store";
import { Col, Row } from "@/components";
import { RM } from "@/common/const";
import { PointType } from "@/common/map";
import { getAreaCount, getPointBigCount, queryHotsPotsInterestNum } from "@/services/map";
import { queryEquipmentNum, queryVideoEquipmentNum } from "@/services/patrol";
import { getCustomTag, queryPoliceNum } from "@/services/special";
import { useCtrlState } from "@/store/ctrlState";
import { useModalStore } from "@/store/modal";
import { DialogType } from "@/hooks/useDialog";

type listType = {
  /** 是否是小分类 */
  isSub: boolean;
  /** 名称 */
  name: string;
  /** 字典值类型 */
  type: string;
  /** 个数 */
  num?: string;
  /** 小分类类型 */
  subType?: string;
  /** 小分类类型 */
  onlineCount?: string;
  /** 小分类类型 */
  totalCount?: string;
  /** 是否显示在线 */
  isShowOnline?: boolean;
  /** 是否显示在线 在线：true 离线: false 全部: '' */
  online?: boolean | "";
  /** 图层控制分类 */
  ctrlType?: string;
  /** 数据源id */
  sourceId: string;
  /** 是否选中 */
  checked?: any;
};

const modalStore = useModalStore();

const {
  visible,
  visibleSubPoint,
  visibleDevice,
  visibleDeviceOnline,
  visibleVideo,
  visibleVideoOnline,
  visiblePolice,
  visiblePoliceOnline,
} = useCtrlState();
const usetStore = useUser();
const store = useOrg();

const { orgCode } = storeToRefs(store);
const { user } = storeToRefs(usetStore);

const customList = reactive<{ data: listType[] }>({
  data: [],
});

/** 是否有选中项 */
const isActive = computed(() => customList.data.some((item) => item.checked));

onMounted(() => {
  getAllData();
});

const handleClear = () => {
  customList.data.forEach((item) => {
    const _item = item;
    _item.checked = false;
  });
};

/** 获取所有数据 */
const getAllData = async () => {
  await getUser();
  const data = (customList.data || []).reduce((acc, value) => {
    if (!acc[value.ctrlType!]) {
      acc[value.ctrlType!] = [];
    }
    acc[value.ctrlType!].push({ ...value });
    return acc;
  }, {} as any);
  setDataNum(data);
};

const setDataNum = (data: any) => {
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const element = data[key];
      getDataNum(key, element);
    }
  }
};

/** 获取兴趣点位数据数量 */
const getHotPointNum = async (typeData: listType[]) => {
  try {
    const smallTypeList = typeData.map((v) => v.subType);
    const data = await queryHotsPotsInterestNum({
      pointBigType: PointType.ZDCS,
      pointSmallTypeList: smallTypeList,
      deptCode: orgCode.value,
    });
    customList.data.forEach((hot) => {
      const _hot = hot;
      const result = data.find((val: any) => hot.subType === val.pointSmallType);
      if (result) {
        _hot.checked = visibleSubPoint(result.pointSmallType);
        _hot.num = result?.count || 0;
      }
    });
  } catch (error) {
    console.log("error", error);
  }
};

/** 获取视频装备数量 */
const getVideoNum = async (typeData: listType[]) => {
  try {
    const deviceSonTypeList = typeData.map((v) => v.subType);
    const data = await queryVideoEquipmentNum({
      deptCode: orgCode.value,
      deviceSonTypeList,
    });
    customList.data.forEach((video) => {
      const result = data.find((val: any) => video.subType === val.deviceSonType);
      if (result) {
        const _video = video;
        _video.checked = visibleVideo(result.deviceSonType);
        _video.online = visibleVideoOnline(result.deviceSonType);
        _video.isShowOnline = true;
        _video.onlineCount = result?.onlineCount || 0;
        _video.totalCount = result?.totalCount || 0;
      }
    });
  } catch (error) {
    console.log("error", error);
  }
};

/** 获取警用装备数量 */
const getPoliceDeviceNum = async (typeData: listType[]) => {
  try {
    const deviceTypeList = typeData.map((v) => v.type);
    const data = await queryEquipmentNum({
      deviceTypeList,
      deptCode: orgCode.value,
    });
    customList.data.forEach((device) => {
      const _device = device;
      const result = data.find((val: { deviceType: string }) => _device.type === val.deviceType);
      if (result) {
        _device.checked = visibleDevice(_device.sourceId);
        _device.online = visibleDeviceOnline(_device.sourceId);
        _device.isShowOnline = true;
        _device.onlineCount = result?.onlineCount || 0;
        _device.totalCount = result?.totalCount || 0;
      }
    });
  } catch (error) {
    console.log("error", error);
  }
};

/** 获取警员数量 */
const getPoliceNum = async () => {
  try {
    const data = await queryPoliceNum({
      orgCode: orgCode.value,
    });

    customList.data.forEach((police) => {
      const _police = police;
      const result = data.find((val: any) => _police.subType === val.policeClassification);
      if (result) {
        _police.checked = visiblePolice(police.subType);
        _police.online = visiblePoliceOnline(police.subType);
        _police.isShowOnline = true;
        _police.onlineCount = result?.onLineCount || 0;
        _police.totalCount = result?.allStatusCount || 0;
      }
    });
  } catch (error) {
    console.log("error", error);
  }
};

/** 获取警务机构数量 */
const getPointBigNum = async (data: listType[]) => {
  try {
    const pointBigTypeList = data.filter((v) => v.type !== PointType.FKQ).map((v) => v.type);

    if (pointBigTypeList.length > 0) {
      const res = await getPointBigCount({
        pointBigTypeList,
        deptCode: orgCode.value,
      });
      customList.data.forEach((point) => {
        const _point = point;
        const result = pointBigTypeList.find((val: string) => _point.type === val);
        if (result) {
          _point.checked = visible(_point.sourceId);
          const countItem = res.find(
            (v: { pointBigType: string; count: number }) => v.pointBigType === _point.type,
          );
          _point.num = countItem?.count || 0;
        }
      });
    }
  } catch (error) {
    console.log("error", error);
  }
};

/** 获取区域数量 */
const getAreaNum = async (typeData: listType[]) => {
  try {
    const areaTypeList = typeData.map((v) => v.type);
    const data = await getAreaCount({
      areaTypeList,
      deptCode: orgCode.value,
    });
    customList.data.forEach((area) => {
      const _area = area;
      const result = areaTypeList.find((val: string) => area.type === val);
      if (result) {
        _area.checked = visible(_area.sourceId);
        const countItem = data.find(
          (v: { areaType: string; count: number }) => v.areaType === _area.type,
        );
        _area.num = countItem?.count || 0;
      }
    });
  } catch (error) {
    console.log("error", error);
  }
};

const getDataNum = (type: RM, data: listType[]) => {
  switch (type) {
    case RM.POLICE_AGENCY:
      getPointBigNum(data);
      break;
    case RM.HOTSPOTS:
      getHotPointNum(data);
      break;
    case RM.REGION:
      getAreaNum(data);
      break;
    case RM.VIDEO_EQUIP:
      getVideoNum(data);
      break;
    case RM.POLICE_EQUIP:
      getPoliceDeviceNum(data);
      break;
    case RM.MATERIA:
      // getSupplyPointNum();
      break;
    case RM.DISPOLE:
      getPoliceNum();
      break;
    default:
      break;
  }
};

/** 设置是否在线 */
const setOnline = (data: listType, val: any) => {
  const _data = data;
  _data.online = val;
};

const handleClick = (data: listType) => {
  const _data = data;
  _data.checked = !_data.checked;
};

const handleShowSetting = () => {
  modalStore.showModal(DialogType.TCPZ, {
    onSubmit: () => {
      getAllData();
    },
  });
};

const getUser = async () => {
  const data = await getCustomTag(user.value.idCard);
  if (data) {
    customList.data = data.json ? JSON.parse(data.json) : [];
  }
};
</script>

<style scoped lang="scss">
@import "./ctrl.scss";
.control-container {
  display: flex;
  flex-direction: column;
  grid-template-rows: 42px 1fr 56px;
  padding-top: 20px;
  width: 312px;
  height: 764px;
  box-sizing: border-box;
  .content {
    flex: 0 0 auto;
    :deep(.el-scrollbar__bar) {
      width: 3px;
    }
    .online-buttons {
      display: flex;
      align-items: center;
      height: 100%;
      line-height: 100%;
      .online-buttons-content {
        display: flex;
        height: 24px;
        line-height: 24px;
        border-radius: 4px;
        font-weight: 500;
        .left {
          width: 73px;
          height: 24px;
          text-align: center;
          color: rgba(0, 255, 102, 0.6);
          background: url("@/assets/images/olleft.png") no-repeat right;
          background-size: 100% 100%;
          &.active {
            color: #00ff66;
            background: url("@/assets/images/olleft-a.png") no-repeat center;
            background-size: 100% 100%;
          }
        }
        .right {
          margin-left: -9px;
          width: 73px;
          height: 24px;
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          background: url("@/assets/images/olright.png") no-repeat left;
          background-size: 100% 100%;
          &.active {
            color: #fff;
            background: url("@/assets/images/olright-a.png") no-repeat center;
            background-size: 100% 100%;
          }
        }
      }
    }
    .list {
      padding: 0 28px 0 12px;
      box-sizing: border-box;
      :deep(.el-scrollbar__view) {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .list-item {
        font-size: 16px;
        font-weight: 400;
        color: #ffffff;
        height: 36px;
        line-height: 36px;
        padding: 0 8px;
        box-sizing: border-box;
        background: url("@/assets/images/item.png") no-repeat center;
        background-size: 100% 100%;
        user-select: none;
        cursor: pointer;
        &.active {
          background: url("@/assets/images/item-a.png") no-repeat center;
          background-size: 100% 100%;
        }
      }
    }
  }

  .footer {
    position: relative;
    flex: 1 1 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 42px;
    box-sizing: border-box;
    padding-left: 32px;
    .footer-icon {
      position: absolute;
      width: 48px;
      height: 48px;
      top: 12px;
      left: 25px;
      cursor: pointer;
      user-select: none;
      &.disabled {
        cursor: no-drop;
        filter: grayscale(1);
      }
    }
    .footer-button {
      cursor: pointer;
      user-select: none;
      width: 155px;
      height: 46px;
      line-height: 44px;
      text-align: center;
      background: url("@/assets/images/setting.png") no-repeat center;
      background-size: 100% 100%;
      font-weight: 500;
      font-size: 16px;
      color: #ffffff;
    }
  }
}
</style>
