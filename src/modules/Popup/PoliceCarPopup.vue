<template>
  <MoveBox ref="dialog" title="警车详情" width="450px" :is-center="true" @close="handleClose">
    <div class="container">
      <Box padding="8px 12px">
        <div
          v-loading="isLoading"
          class="popup-border"
          element-loading-text="警车加载中..."
          element-loading-background="rgba(122, 122, 122, 0.2)"
        >
          <Row>
            <Col style="margin: 12px 12px">
              <div class="avatar">
                <img v-if="policeCar?.photo" class="avatar-img" :src="policeCar?.photo" />
                <img
                  v-else
                  class="avatar-img"
                  style="object-fit: fill"
                  src="@/assets/images/car2.png"
                />
              </div>
            </Col>
            <Col flex="auto" style="padding: 10px 8px 10px 0">
              <Cell label="车辆名称：">{{ policeCar?.device_name }}</Cell>
              <Cell v-if="!isPoliceLoading" label="状态：">
                <span
                  v-if="policeCar?.isOnline === isOnline.Yes"
                  class="online"
                  :class="policeList?.length > 0 ? device.getStatus(policeCar?.deptCode).color : ''"
                  @click="handleToAlarm(policeCar?.deptCode)"
                >
                  {{ policeList?.length > 0 ? device.getStatus(policeCar?.deptCode).text : "在线" }}
                </span>
                <span v-else class="gray1">离线</span>
              </Cell>
              <Cell label="车型：">{{ carType?.[policeCar?.deviceInfo?.category] || "" }}</Cell>
              <Cell label="管辖单位：">{{ policeCar?.deptName }}</Cell>
              <Cell label="更新时间：">
                {{ moment(policeCar?.gps_time).format("YYYY-MM-DD HH:mm") }}
              </Cell>
              <Cell label="点位二维码：">
                <span class="qr-text" @click="handleShowQrCode">查看详情</span>
              </Cell>
              <Cell label="任务展示：">
                <div class="qr-row">
                  <span class="qr-text" @click="handleToPos('Polygon')">巡逻区域</span>
                  <span class="qr-text" @click="handleToPos('LineString')">巡逻路线</span>
                  <span class="qr-text" @click="handleToPos('Point')">巡逻点位</span>
                </div>
              </Cell>
            </Col>
          </Row>
          <div class="button-group">
            <div
              :class="[{ 'gray': policeCar?.isOnline === isOnline.No }]"
              @click="policeCar?.isOnline === isOnline.No ? false : handlePreviewClick(policeCar)"
            >
              <BIcon icon="yl" text="预览"></BIcon>
            </div>
            <div
              :class="[{ 'gray': policeCar?.isOnline === isOnline.No }]"
              @click="policeCar?.isOnline === isOnline.No ? false : handleTrackClick(policeCar)"
            >
              <BIcon icon="dw" :text="`${isTracking ? '取消跟踪' : '跟踪'}`"></BIcon>
            </div>
            <div @click="handleTrajectoryClick(policeCar)">
              <BIcon icon="track" text="轨迹"></BIcon>
            </div>
            <div>
              <Follow
                v-if="properties?.id"
                keys="isCollect"
                :data="policeCar"
                :options="options"
                :code="policeCar?.device_code"
                :follow-type="RM.POLICE_EQUIP"
                @on-follow="handleFollow"
                @on-change-follow="handleFollowUpdate"
              >
                <BIcon
                  :icon="`${`${policeCar?.isCollect}` === isCollect.Yes ? 'ff-a' : 'ff'}`"
                  text="关注"
                />
              </Follow>
            </div>
            <div
              :class="[{ 'gray': policeCar?.isOnline === isOnline.No }]"
              @click="policeCar?.isOnline === isOnline.No ? false : handleJingShi(policeCar)"
            >
              <BIcon
                :icon="`${isAlert ? 'js-a' : 'js'}`"
                :text="isAlert ? '取消警视' : '警视'"
              ></BIcon>
            </div>
            <div
              :class="[{ 'gray': policeCar?.isOnline === isOnline.No }]"
              @click="handlePositionClick(policeCar)"
            >
              <BIcon icon="dw" text="定位"></BIcon>
            </div>
            <div @click="isShowCapture = !isShowCapture">
              <BIcon :icon="`${isShowCapture ? 'zp-a' : 'zp'}`" text="抓拍"></BIcon>
            </div>
          </div>
        </div>
      </Box>
      <template v-if="policeList?.length > 0">
        <div class="h1-title">出勤警员</div>
        <el-scrollbar height="225px" always>
          <Box padding="8px 12px">
            <div class="card-list">
              <div v-for="item in policeList" :key="item?.id" class="card-item">
                <div v-for="v in item?.policearry" :key="v?.idCard">
                  <div class="card-title">警员姓名：{{ v?.name }}（{{ v?.policeNo }}）</div>
                  <div>
                    <span class="label">电话号码：</span>
                    {{ v?.phone }}
                  </div>
                  <div>
                    <span class="label">所属机构：</span>
                    {{ v?.orgName }}
                  </div>
                  <div>
                    <span class="label">任务盘查量：</span>
                    {{ v?.checkNumbr || 0 }}
                  </div>
                  <div>
                    <span class="label">警情处置量：</span>
                    {{ v?.jqczl || 0 }}
                  </div>
                  <div v-for="(val, i) in v.equipments" :key="i" class="device">
                    <img
                      v-if="val?.classify"
                      class="card-icon"
                      :src="getNewPng(equipMap?.[val?.classify])"
                    />
                    {{ val?.name }}
                    <div
                      v-if="val?.classify === 'recorder'"
                      class="preview"
                      @click="handlePreview(val.code, v?.orgName)"
                    >
                      <el-icon class="icon"><View class="icon" /></el-icon>
                      预览
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Box>
        </el-scrollbar>
      </template>
      <el-scrollbar max-height="300px" always>
        <Box padding="8px 12px">
          <div class="card">
            <div v-for="item in list" :key="item.policeIdCard" class="police-box">
              <div class="left-box">
                <Row>
                  <Col style="margin: 12px 12px">
                    <div class="avatar">
                      <img
                        v-if="!item?.userPoliceVO?.photo"
                        class="avatar-img"
                        src="@/assets/images/men2.png"
                      />
                      <img v-else class="avatar-img" :src="item?.userPoliceVO?.photo" />
                    </div>
                  </Col>
                  <Col flex="auto" style="padding: 10px 8px 10px 0">
                    <div style="font-size: 18px; font-weight: 500; color: #ffffff">
                      {{ item?.userPoliceVO?.policeName || item?.policeIdCard }}
                    </div>
                    <Cell label="联系方式：">{{ item?.userPoliceVO?.phone }}</Cell>
                    <Cell label="所属单位：">
                      <div class="dw-row">
                        <div
                          class="row-text"
                          :title="item?.userPoliceVO?.deptName || item?.placeDeptName || ''"
                        >
                          {{ item?.userPoliceVO?.deptName || item?.placeDeptName || "" }}
                        </div>
                      </div>
                    </Cell>
                  </Col>
                </Row>
                <div v-if="item?.policeEquipVoList?.length > 0" class="device-box">
                  <Device :data="item?.policeEquipVoList" />
                </div>
              </div>
              <div class="right-box">
                <div class="line" />
                <div class="title">打卡照片</div>
                <el-image
                  v-if="item.psbPicMinioUrl"
                  style="width: 100%; height: 100px; margin-top: 4px"
                  :zoom-rate="1.2"
                  :preview-teleported="true"
                  :max-scale="2"
                  :min-scale="0.2"
                  :preview-src-list="[item.psbPicMinioUrl]"
                  :src="item.psbPicMinioUrl"
                  :fit="'cover'"
                >
                  <template #error>打卡图片加载失败</template>
                </el-image>
                <JQEmpty v-else text="无打卡图片" />
              </div>
            </div>
          </div>
        </Box>
      </el-scrollbar>
    </div>
  </MoveBox>
</template>

<script lang="ts" setup>
import * as turf from "@turf/turf";
import moment from "moment";
import { View } from "@element-plus/icons-vue";
import { usePopup } from "@/hooks/usePopup";
import { Dictionary, RM, isCollect, isOnline } from "@/common/const";
import { MoveBox, Row, Col, Cell, BIcon, JQEmpty, Box } from "@/components";
import { batchFollowAdd, batchFollowUpdate, queryPoliceCarDetail } from "@/services/patrol";
import { getDictByCode } from "@/services/common";
import { Popup } from ".";
import { getCarDetail, getDutyArea, getDutyLine, getDutyPoint } from "@/services/api15";
import { useDevice } from "@/hooks/sharedData";
import { getPoliceByCar } from "@/services/dkl";
import { MapConfig } from "@/components/map/MapConfig";
import { openVideo } from "@/utils/monitorVideo";
import { useFollowType, useJingShi, useTrace } from "@/hooks/PoliceVideo";
import { useAction } from "@/store/position";
import { getNewPng } from "@/utils/utils";
import Device from "./components/Device.vue";
import { _CarConfig } from "./_Config";
import { useUser } from "@/store";
import { useModalStore } from "@/store/modal";
import { DialogType } from "@/hooks/useDialog";

type propertiesType = Record<string, any>;
const props = defineProps<{
  properties: propertiesType;
}>();

const dialog = ref<InstanceType<typeof MoveBox>>();
const { typeData: options } = useFollowType("警用装备", RM.POLICE_EQUIP);

const { isAlert, setJS, close } = useJingShi();
const { isTracking, setTrace, clearTrace } = useTrace();

const _config = new MapConfig();
const { showPopup, hidePopup } = usePopup();
const device = useDevice();
const actionStore = useAction();
const modalStore = useModalStore();

const userStore = useUser();
const { user } = storeToRefs(userStore);

const isLoading = ref(false);
const isPoliceLoading = ref(false);
/** 抓拍是否显示 */
const isShowCapture = ref(false);
/** 查询详情异常 */
const isException = ref(false);
/** 警车信息 */
const policeCar = ref<any>({});
/** 打卡警员列表 */
const list = ref<any[]>([]);
/** 同行警员列表 */
const policeList = ref<any[]>([]);
/** 车型 */
const carType = ref<Record<string, string>>({});
/** 类型转换 */
const equipMap: Record<string, string> = {
  "recorder": "jyzbl_zfjly",
  "twoWayRadio": "jyzbl_djj",
  "policeTong": "jyzbl_jwt",
};

onMounted(() => {
  _config.loadFromJSON(_CarConfig);
  getDetail();
});

tryOnBeforeUnmount(() => {
  _config.clearFromJSON(_CarConfig);
});

/** 跳转警情 */
const handleToAlarm = (code: string) => {
  showPopup(Popup.Alarm, {
    orgCode: code,
  });
};

/** 显示二维码 */
const handleShowQrCode = () => {
  modalStore.showModal(DialogType.QRCODE, {
    data: {
      name: policeCar.value?.device_name,
      businessKey: policeCar.value?.device_code,
      qrType: "report",
    },
  });
};

/** 跟踪 */
const handleTrackClick = (val: { device_code: string }) => {
  setTrace(val.device_code, "source-jyzbl_zj_jc");
};

/** 定位 */
const handlePositionClick = (val: { device_code: string }) => {
  _config.getFeatureItem<GeoJSON.Point>("source-jyzbl_zj_jc", val.device_code).then((point) => {
    _config.position(point);
  });
};

/** 轨迹 */
const handleTrajectoryClick = (val: { device_code: string }) => {
  actionStore.showAction(
    {
      type: "DeviceTrack",
      id: val?.device_code,
      iconType:
        props.properties?.deviceSonType === Dictionary.WURENJI
          ? props.properties?.deviceSonType
          : props.properties?.type,
    },
    true,
  );
};

/** 警车摄像头预览 */
const handlePreviewClick = (val: { policeCarCamera: any[]; device_name: string }) => {
  const playType = 0;
  const cameralist = (val?.policeCarCamera || []).map((v) => {
    return { cameraGBCode: v.code, cameraGBName: v.name };
  });
  if (cameralist.length > 0) {
    openVideo(playType, cameralist, 16);
  } else {
    ElMessage({
      message: "暂无可预览摄像头！",
      type: "warning",
      offset: 92,
    });
  }
};

// 警视
const handleJingShi = (val: { device_code: string }) => {
  if (!isAlert.value) {
    setJS(val.device_code, () => {
      //
    });
  } else {
    close();
  }
};

/**
 * 任务点位定位
 * @param type 点 线 面
 */
const handleToPos = (type: "Point" | "LineString" | "Polygon") => {
  const feature = _config.getMapSource("source-duty");
  const data = feature.filter((v) => v.geometry.type === type);
  if (data.length > 0) {
    const collect = turf.featureCollection([...data]);
    _config.position(collect);
  }
};

/** 1.5预览 */
const handlePreview = (code: string, orgName: string) => {
  openVideo(0, [{ cameraGBCode: code, cameraGBName: orgName }]);
};

/** 关注 */
const handleFollow = (
  followTypeList: string[],
  followTagTypeList: string[],
  data: { device_code: string; device_name: string },
) => {
  batchFollowAdd({
    followTagTypeList,
    followTypeList: followTypeList.length > 0 ? [RM.POLICE_EQUIP] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.device_code,
    sourceFollowType: RM.POLICE_EQUIP,
    sourceName: data.device_name,
  }).then(() => {
    policeCar.value.isCollect =
      followTagTypeList.length > 0 || followTypeList.length > 0
        ? Number(isCollect.Yes)
        : Number(isCollect.No);
  });
};

/** 更新关注 */
const handleFollowUpdate = (
  followTypeList: string[],
  followTagTypeList: string[],
  data: { device_code: string; device_name: string },
) => {
  batchFollowUpdate({
    followTagTypeList,
    followTypeList: followTypeList.length > 0 ? [RM.POLICE_EQUIP] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.device_code,
    sourceFollowType: RM.POLICE_EQUIP,
    sourceName: data.device_name,
  }).then(() => {
    policeCar.value.isCollect =
      followTagTypeList.length > 0 || followTypeList.length > 0
        ? Number(isCollect.Yes)
        : Number(isCollect.No);
  });
};

/** 获取警车详情 */
const getPoliceCarDetail = async (code: string) => {
  try {
    isLoading.value = true;
    const data = await queryPoliceCarDetail(code);
    if (data?.deviceInfo?.deviceSonType) {
      carType.value = await getDictByCode(data?.deviceInfo?.deviceSonType);
    }
    if (data?.data?.photo) {
      const photos = JSON.parse(data?.data?.photo) || [];
      data!.data.photo = photos?.[0];
    }
    policeCar.value = data;
  } catch (error) {
    isException.value = true;
    console.error("error", error);
  } finally {
    isLoading.value = false;
  }
};

/** 获取警车警员 */
const getCarPolice = async (code: string) => {
  isPoliceLoading.value = true;
  getCarDetail(code)
    .then((res) => {
      policeList.value = res?.dutySchedulings || [];
    })
    .finally(() => {
      isPoliceLoading.value = false;
    });
};

/** 警车打卡警员 */
const getPolice = async (code: string) => {
  getPoliceByCar({ usinessKey: code }).then((res) => {
    list.value = res?.data || [];
  });
};

/** 获取1.5巡逻办任务数据 */
const getMapData = (code: string) => {
  Promise.all([
    getDutyArea({
      carCode: code,
    }),
    getDutyLine({
      carCode: code,
    }),
    getDutyPoint({
      carCode: code,
    }),
  ]).then((res) => {
    const [area, line, point] = res;
    const features: GeoJSON.Feature[] = [];
    area.forEach((item: any) => {
      const feature = JSON.parse(item) as any;
      const polygon = turf.polygon(feature.coordinates, {
        name: feature.name,
        lineType: 3,
        lineColour: feature.color,
        areaColour: feature.color,
      });
      features.push(polygon);
    });
    line.forEach((item: any) => {
      const feature = JSON.parse(item) as any;
      const lineString = turf.lineString(feature.coordinates, { name: feature.name });
      features.push(lineString);
    });
    point.forEach((item: any) => {
      const feature = JSON.parse(item) as any;
      const _point = turf.point(feature.coordinates, {
        name: feature.name,
        imageName: "xlb",
      });
      features.push(_point);
    });
    _config.setSource("source-duty", features);
  });
};

const getDetail = () => {
  if (!props.properties?.id) return;
  getPoliceCarDetail(props.properties.id);
  getCarPolice(props.properties.id);
  getPolice(props.properties.id);
  getMapData(props.properties.id);
};

const handleClose = () => {
  clearTrace && clearTrace();
  close && close();
  hidePopup(Popup.PoliceCar);
};
</script>

<style lang="scss" scoped>
.container {
  :deep(.el-scrollbar__bar.is-vertical) {
    width: 4px !important;
  }
  :deep(.el-scrollbar__thumb) {
    background-color: rgba(84, 221, 255, 0.7) !important;
  }
  .popup-border {
    background: rgba(25, 128, 223, 0.1);
    border: 1px solid rgba(83, 176, 255, 0.4);
    border-radius: 4px;
    .avatar {
      width: 76px;
      height: 97px;
      border-radius: 4px;
      box-sizing: border-box;
      &.border {
        border: 1px solid #0dc6dc;
      }
      .avatar-img {
        width: 76px;
        height: 97px;
        object-fit: cover;
      }
    }
  }
}

.qr-row {
  display: flex;
  gap: 0 6px;
}

.qr-text {
  font-size: 16px;
  color: rgba(56, 201, 255, 1);
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}

.gray {
  filter: grayscale(80%);
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
  padding: 0 12px;
  border-top: 1px solid rgba(83, 176, 255, 0.4);
  box-sizing: border-box;
}

.online {
  color: #fff;
}
.green {
  color: #f54242;
  cursor: pointer;
  user-select: none;
  text-decoration: underline;
}
.blue {
  color: #38c9ff;
}
.gray1 {
  color: #a8a8a8;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 12px 0;
  .avatar {
    width: 58px;
    height: 66px;
    border-radius: 4px;
    box-sizing: border-box;
    margin-right: 5px;
    &.border {
      border: 1px solid #0dc6dc;
    }
    .avatar-img {
      width: 58px;
      width: 66px;
      object-fit: contain;
    }
  }
}

.dw-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 8px;
  box-sizing: border-box;
  .row-text {
    width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.device-box {
  padding: 8px 10px;
  padding-top: 0;
}

.police-box {
  border: 1px solid rgba(83, 176, 255, 0.4);
  background: rgba(25, 128, 223, 0.102);
  border-radius: 4px;
  display: flex;
  .left-box {
    flex: 1;
  }
  .right-box {
    width: 160px;
    padding: 20px;
    box-sizing: border-box;
    position: relative;
    .title {
      font-size: 18px;
    }
    .line {
      position: absolute;
      left: 0;
      top: 50px;
      width: 1px;
      height: 110px;
      border-left: 1px solid rgba(83, 176, 255, 0.4);
    }
  }
}

.h1-title {
  margin-top: 6px;
  font-size: 18px;
  margin-left: 16px;
  font-weight: 500;
}

.card-list {
  background: rgba(25, 128, 223, 0.102);
  border-radius: 4px 4px 4px 4px;
  border: 1px solid rgba(83, 176, 255, 0.4);
  .card-item {
    display: flex;
    flex-direction: column;
    gap: 12px 0;
    font-size: 16px;
    line-height: 24px;
    padding: 16px;
    box-sizing: border-box;
    .card-icon {
      width: 12px;
      height: 12px;
      object-fit: contain;
      display: inline;
      margin-right: 6px;
    }
    .preview {
      display: flex;
      gap: 0 6px;
      align-items: center;
      margin-left: 24px;
      cursor: pointer;
      user-select: none;
      .icon {
        line-height: 32px;
      }
    }
    .card-title {
      font-size: 18px;
      line-height: 28px;
    }
    .label {
      color: #b2c3d8;
    }
    .device {
      display: flex;
      align-items: center;
      font-weight: 400;
      font-size: 16px;
      color: #38c9ff;
      line-height: 22px;
    }
  }
}
</style>
