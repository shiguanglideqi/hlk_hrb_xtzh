<template>
  <MoveBox title="设备详情" :is-center="true" @close="handleClose">
    <Box padding="8px 16px">
      <div
        v-loading="isLoading"
        class="popup-border"
        element-loading-text="设备加载中..."
        element-loading-background="rgba(122, 122, 122, 0.2)"
      >
        <Box padding="8px 12px">
          <Cell label="设备名称：">{{ deviceData.name }}</Cell>
          <Cell label="设备类型：">{{ deviceData.type }}</Cell>
          <Cell label="所属单位：">{{ deviceData.unit }}</Cell>
          <Cell label="状态：">
            <span v-if="deviceData.isOnline" class="online">在线</span>
            <span v-else>离线</span>
          </Cell>
          <Cell v-if="deviceData.userName" label="使用人：">
            {{ deviceData.userName }}({{ deviceData.policeNumber }})
          </Cell>
          <Cell v-if="deviceData.userTel" label="联系方式：">{{ deviceData.userTel }}</Cell>
        </Box>
        <div class="button-group">
          <template v-if="properties?.type === Dictionary.MONITOR_TYPE">
            <div
              :class="[{ 'gray': !deviceData?.isOnline }]"
              @click="!deviceData?.isOnline ? false : handlePreviewClick(deviceData!)"
            >
              <BIcon icon="yl" text="预览" />
            </div>
            <div>
              <Follow
                keys="isCollect"
                :data="deviceData"
                :options="VideoOptions"
                :code="deviceData.deviceId"
                :follow-type="RM.VIDEO_EQUIP"
                @on-follow="handleFollow"
                @on-change-follow="handleFollowUpdate"
              >
                <BIcon
                  :icon="`${`${deviceData.isCollect}` === isCollect.Yes ? 'ff-a' : 'ff'}`"
                  text="关注"
                />
              </Follow>
            </div>
            <div @click="handleTieClick(deviceData!)">
              <BIcon icon="jp" text="纠偏" />
            </div>
          </template>
          <template v-else>
            <!-- 预览：执法记录仪显示 -->
            <template v-if="deviceData?.deviceType === Dictionary.RECORDER">
              <div
                :class="[{ 'gray': !deviceData?.isOnline }]"
                @click="!deviceData?.isOnline ? false : handlePreviewClick(deviceData!)"
              >
                <BIcon icon="yl" text="预览" />
              </div>
            </template>
            <div @click="handlePositionClick(deviceData!)">
              <BIcon icon="dw" text="定位" />
            </div>
            <div
              :class="[{ 'gray': !deviceData?.isOnline }]"
              @click="!deviceData?.isOnline ? false : handleTrackClick(deviceData!)"
            >
              <BIcon
                :icon="`${isTracking ? 'dw-a' : 'dw'}`"
                :text="`${isTracking ? '取消跟踪' : '跟踪'}`"
              />
            </div>
            <div @click="handleTrajectoryClick(deviceData!)">
              <BIcon icon="track" text="轨迹" />
            </div>
            <div>
              <Follow
                keys="isCollect"
                :data="deviceData"
                :options="options"
                :code="deviceData.deviceId"
                :follow-type="RM.POLICE_EQUIP"
                @on-follow="handleFollow"
                @on-change-follow="handleFollowUpdate"
              >
                <BIcon
                  :icon="`${`${deviceData.isCollect}` === isCollect.Yes ? 'ff-a' : 'ff'}`"
                  text="关注"
                />
              </Follow>
            </div>
          </template>
        </div>
      </div>
    </Box>
  </MoveBox>
</template>

<script lang="ts" setup>
import { usePopup } from "@/hooks/usePopup";
import { MoveBox, Box, Cell, BIcon, Follow } from "@/components";
import { Popup } from ".";
import { DEVICE_STATUS, Dictionary, RM, VIDEO_STATUS, isCollect } from "@/common/const";
import {
  batchFollowAdd,
  batchFollowUpdate,
  postVideoCorrection,
  queryDeviceDetail,
  queryVideoDetail,
} from "@/services/patrol";
import { getDictByCode } from "@/services/common";
import { openVideo } from "@/utils/monitorVideo";
import { mapPointEdit, useFollowType, useTrace } from "@/hooks/PoliceVideo";
import { useUser } from "@/store";
import { MapConfig } from "@/components/map/MapConfig";
import { useAction } from "@/store/position";

const { hidePopup } = usePopup();
type propertiesType = Record<string, any>;
const props = defineProps<{
  properties: propertiesType;
}>();

const _config = new MapConfig();

const { typeData: options } = useFollowType("警用装备", RM.POLICE_EQUIP);
const { typeData: VideoOptions } = useFollowType("视频装备", RM.VIDEO_EQUIP);

const actionStore = useAction();
const { isTracking, setTrace } = useTrace();
const userStore = useUser();
const { user } = storeToRefs(userStore);

const isLoading = ref(false);
/** 设备类型 */
const catType = ref<Record<string, string>>();

const deviceData = reactive({
  id: "",
  deviceId: "",
  name: "",
  type: "",
  deviceType: "",
  unit: "",
  isCollect: 0,
  collectId: "",
  status: "ON",
  userName: "",
  policeNumber: "",
  deviceSonType: "",
  userTel: "",
  isOnline: false,
});

/** 预览 */
const handlePreviewClick = (val: { deviceId: string; name: string }) => {
  const playType = 0;
  const cameralist = [{ cameraGBCode: val.deviceId, cameraGBName: val.name }];
  openVideo(playType, cameralist);
};

/** 关注 */
const handleFollow = (
  followTypeList: string[],
  followTagTypeList: string[],
  data: { deviceId: string; name: string },
) => {
  batchFollowAdd({
    followTagTypeList,
    followTypeList:
      followTypeList.length > 0
        ? [props.properties?.type === Dictionary.MONITOR_TYPE ? RM.VIDEO_EQUIP : RM.POLICE_EQUIP]
        : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.deviceId,
    sourceFollowType:
      props.properties?.type === Dictionary.MONITOR_TYPE ? RM.VIDEO_EQUIP : RM.POLICE_EQUIP,
    sourceName: data.name,
  }).then(() => {
    deviceData.isCollect =
      followTagTypeList.length > 0 || followTypeList.length > 0
        ? Number(isCollect.Yes)
        : Number(isCollect.No);
    if (props.properties?.type === Dictionary.MONITOR_TYPE) {
      props.properties?.id && getVideoInfo(props.properties.id);
    } else {
      props.properties?.id && getDeviceInfo(props.properties.id);
    }
  });
};

/** 定位 */
const handlePositionClick = (val: { deviceType: string; deviceId: string }) => {
  _config.getFeatureItem<GeoJSON.Point>(`source-${val.deviceType}`, val.deviceId).then((point) => {
    _config.position(point);
  });
};

/** 跟踪 */
const handleTrackClick = (val: { deviceId: string; deviceType: string; deviceSonType: string }) => {
  const type = val?.deviceType !== Dictionary.VEHICLE ? val?.deviceType : val?.deviceSonType;
  setTrace(val.deviceId, `source-${type}`);
};

/** 更新关注 */
const handleFollowUpdate = (
  followTypeList: string[],
  followTagTypeList: string[],
  data: { deviceId: string; name: string },
) => {
  batchFollowUpdate({
    followTagTypeList,
    followTypeList:
      followTypeList.length > 0
        ? [props.properties?.type === Dictionary.MONITOR_TYPE ? RM.VIDEO_EQUIP : RM.POLICE_EQUIP]
        : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.deviceId,
    sourceFollowType:
      props.properties?.type === Dictionary.MONITOR_TYPE ? RM.VIDEO_EQUIP : RM.POLICE_EQUIP,
    sourceName: data.name,
  }).then(() => {
    deviceData.isCollect =
      followTagTypeList.length > 0 || followTypeList.length > 0
        ? Number(isCollect.Yes)
        : Number(isCollect.No);
    if (props.properties?.type === Dictionary.MONITOR_TYPE) {
      props.properties?.id && getVideoInfo(props.properties.id);
    } else {
      props.properties?.id && getDeviceInfo(props.properties.id);
    }
  });
};

/** 轨迹 */
const handleTrajectoryClick = (val: { deviceType: string; deviceId: string }) => {
  actionStore.showAction(
    {
      type: "DeviceTrack",
      id: val.deviceId,
      iconType: val?.deviceType,
    },
    true,
  );
};

/** 纠偏 */
const handleTieClick = (val: { id: string; deviceId: string }) => {
  _config.getFeatureItem<GeoJSON.Point>("source-jyzbl_jk_jklx", val.deviceId).then((point) => {
    handleClose();
    _config.position(point);
    mapPointEdit(_config._map!, (coords) => {
      postVideoCorrection({ id: val.id, coordinate: coords.toString() }).then(() => {
        ElMessage({
          message: "纠偏成功!",
          type: "success",
          offset: 92,
        });
        _config.setFeatureItem("source-jyzbl_jk_jklx", coords, val.deviceId);
      });
    });
  });
};

/** 获取警用装备详情 */
const getDeviceInfo = async (id: string) => {
  try {
    isLoading.value = true;
    const data = await queryDeviceDetail(id);
    if (data?.deviceType) {
      const types = await getDictByCode(`${data?.deviceType}_lx`);
      catType.value = types || {};
    }
    deviceData.id = data.id;
    deviceData.deviceId = data.deviceCode;
    deviceData.name = data.deviceName;
    deviceData.type = catType.value?.[data?.deviceSonType] || "";
    deviceData.unit = data.deptName;
    deviceData.deviceType = data.deviceType;
    deviceData.deviceSonType = data.deviceSonType;
    deviceData.status = data.status;
    deviceData.isCollect = data.isCollect;
    deviceData.collectId = data.collectId;
    deviceData.userName = data.deviceInfo.userName;
    deviceData.policeNumber = data.deviceInfo.policeNumber;
    deviceData.userTel = data.deviceInfo.userTel;
    deviceData.isOnline = data.isOnline === DEVICE_STATUS.YES;
  } catch (error) {
    console.error("error", error);
  } finally {
    isLoading.value = false;
  }
};

/** 获取监控详情 */
const getVideoInfo = async (id: string) => {
  try {
    isLoading.value = true;
    const jiankong = await getDictByCode(Dictionary.MONITOR_TYPE);

    const data = await queryVideoDetail(id);
    const jkType: Record<string, string> = jiankong ? JSON.parse(JSON.stringify(jiankong)) : {};

    deviceData.id = data.id;
    deviceData.deviceId = data.deviceID;
    deviceData.name = data.name;
    deviceData.type = jkType?.[data?.deviceSonType] || "";
    deviceData.unit = data.deptName;
    deviceData.deviceType = data.deviceType;
    deviceData.status = data.status;
    deviceData.isCollect = data.isCollect;
    deviceData.collectId = data.collectId;
    deviceData.isOnline = data.status === VIDEO_STATUS.YES;
  } catch (error) {
    console.error("error", error);
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.properties,
  (res) => {
    if (res?.type === Dictionary.MONITOR_TYPE) {
      getVideoInfo(res?.id);
    } else {
      getDeviceInfo(res?.id);
    }
  },
  {
    deep: true,
    immediate: true,
  },
);

const handleClose = () => {
  hidePopup(Popup.Device);
};
</script>

<style lang="scss" scoped>
.online {
  color: rgba(51, 255, 209, 1);
}
.person-box {
  border-top: 1px solid rgba(13, 198, 220, 0.4);
  box-sizing: border-box;
  padding: 8px 12px;
}

.popup-border {
  background: rgba(25, 128, 223, 0.1);
  border: 1px solid rgba(83, 176, 255, 0.4);
  border-radius: 4px;
}

.button-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0 24px;
  height: 82px;
  font-size: 14px;
  font-weight: 500;
  color: #3de3ff;
  border-top: 1px solid rgba(#0074b7, 0.6);
  background: rgba(#0074b7, 0.2)
    linear-gradient(0deg, rgba(#2da9ff, 0.2) 0%, rgba(#00248b, 0.2) 100%);
  box-sizing: border-box;
}

.gray {
  filter: grayscale(80%);
}
</style>
