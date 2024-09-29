<template>
  <MoveBox title="警员详情" :is-center="true" @close="handleClose">
    <Box padding="8px 12px">
      <div
        v-loading="isLoading"
        class="popup-border"
        element-loading-text="警员加载中..."
        element-loading-background="rgba(25, 128, 223, 0.102)"
      >
        <Row>
          <Col style="margin: 12px 12px">
            <div class="avatar">
              <img v-if="!policeInfo?.photo" class="avatar-img" src="@/assets/images/men2.png" />
              <el-image
                v-else
                class="avatar-img"
                :zoom-rate="1.2"
                :preview-teleported="true"
                :max-scale="2"
                :min-scale="0.2"
                :preview-src-list="[policeInfo?.photo]"
                :src="policeInfo?.photo"
                :fit="'fill'"
              >
                <template #error>打卡图片加载失败</template>
              </el-image>
            </div>
          </Col>
          <Col flex="auto" style="padding: 10px 8px 10px 0">
            <Cell label="警员姓名：">{{ policeInfo?.policeName }}</Cell>
            <Cell label="性别：">{{ gender?.[policeInfo?.userGender] }}</Cell>
            <Cell v-if="policeInfo?.policeCategory" label="警员分类：">
              {{ policeInfo?.policeCategory_dictText }}
            </Cell>
            <Cell v-if="policeInfo?.policeClassification_dictText" label="警员种类：">
              {{ policeInfo?.policeClassification_dictText }}
            </Cell>
            <Cell label="警员编号：">{{ policeInfo?.policeNo }}</Cell>
            <Cell label="联系方式：">{{ policeInfo?.policePhone }}</Cell>
            <Cell label="所属单位：">{{ policeInfo?.policeOrgName }}</Cell>
          </Col>
        </Row>
        <div :class="['button-group']">
          <div :class="[{ 'gray': !policeIsOnline }]" @click="handleTrackClick(policeInfo)">
            <BIcon icon="dw" :text="`${isTracking ? '取消跟踪' : '跟踪'}`"></BIcon>
          </div>
          <div @click="handleTrajectoryClick(policeInfo)">
            <BIcon icon="track" text="轨迹"></BIcon>
          </div>
          <div v-if="jqLatLng.length > 0" @click="handleRoute(policeInfo)">
            <BIcon
              :icon="isPlanRoute && idCard === props.properties!.id ? 'gh-a' : 'gh'"
              text="路线规划"
            ></BIcon>
          </div>
          <div>
            <Follow
              v-if="policeInfo?.policeIdCard"
              keys="isFollowFlag"
              :data="policeInfo"
              :options="options"
              :code="policeInfo.policeIdCard"
              :follow-type="RM.DISPOLE"
              @on-follow="handleFollow"
              @on-change-follow="handleFollowUpdate"
            >
              <BIcon
                :icon="`${`${policeInfo.isFollowFlag}` === isCollect.Yes ? 'ff-a' : 'ff'}`"
                text="关注"
              />
            </Follow>
          </div>
          <div
            :class="[{ 'gray': !policeIsOnline }]"
            @click="!policeIsOnline ? false : handleIssued()"
          >
            <BIcon icon="xf" text="下发指令"></BIcon>
          </div>
        </div>
      </div>
      <Device :data="policeInfo?.policeEquipVoList" />
    </Box>
  </MoveBox>
</template>

<script lang="ts" setup>
import { usePopup } from "@/hooks/usePopup";
import { MoveBox, Box, Row, Col, Cell, BIcon } from "@/components";
import Device from "./components/Device.vue";
import { Popup } from ".";
import { MapConfig } from "@/components/map/MapConfig";
import { _Config } from "./_Config";
import { useAction } from "@/store/position";
import { useFollowType, useTrace } from "@/hooks/PoliceVideo";
import { getDictByCode } from "@/services/common";
import { getPoliceInfo } from "@/services/special";
import moment from "moment";
import { useCommonState } from "@/store/common";
import { isOnline, RM, isCollect } from "@/common/const";
import { batchFollowAdd, batchFollowUpdate, getRoute } from "@/services/patrol";
import * as turf from "@turf/turf";
import { useUser } from "@/store";
import { useCommand } from "@/store/command";

type Status = { [key: string]: string };

type propertiesType = Record<string, string>;
const props = defineProps<{ properties?: propertiesType; left?: number; top?: number }>();

const { typeData: options } = useFollowType("处置力量", RM.DISPOLE);

const _config = new MapConfig();
const actionStore = useAction();
const { isTracking, setTrace, clearTrace } = useTrace();
const { hidePopup } = usePopup();
const mapState = useCommonState();
const userStore = useUser();
const commandStore = useCommand();
const { user } = storeToRefs(userStore);
const { jqLatLng, isPlanRoute, idCard } = storeToRefs(mapState);

const isLoading = ref(false);
/** 警员类型 */
const policeType = ref<Status>({});
/** 警员详情 */
const policeInfo = ref<any>({});

/** 警员是否在线 */
const policeIsOnline = computed(() => {
  return (policeInfo.value?.policeEquipVoList || [])?.some(
    (item: { onlineStatus: string }) => Number(item.onlineStatus) === isOnline.Yes,
  );
});

const gender: Status = {
  "1": "男",
  "0": "女",
};

onMounted(() => {
  _config.loadFromJSON(_Config);
  getDetail();
});

tryOnBeforeUnmount(() => {
  clearTrace();
  _config.clearFromJSON(_Config);
});

/** 跟踪 */
const handleTrackClick = (val: { policeIdCard: string; device_type: string }) => {
  setTrace(val.policeIdCard, "source-police");
};

/** 轨迹 */
const handleTrajectoryClick = (val: { policeIdCard: string }) => {
  actionStore.showAction(
    {
      type: "PoliceTrack",
      id: val?.policeIdCard,
    },
    true,
  );
};

/** 路线推荐 */
const handleRoute = (val: { policeIdCard: string }) => {
  _config.getFeatureItem<GeoJSON.Point>("source-police", val.policeIdCard).then((point) => {
    if (idCard.value !== props.properties!.id) {
      isPlanRoute.value = true;
      idCard.value = props.properties!.id;
      getRoute({
        policeLat: point.geometry.coordinates[1],
        policeLng: point.geometry.coordinates[0],
        placeLat: jqLatLng.value[0],
        placeLng: jqLatLng.value[1],
      }).then((res) => {
        const routes = res?.navigationRouteResult?.routes || [];
        const router = routes.map((element: { steps: any[] }) => {
          const points: any = [];
          element.steps.forEach((step) => {
            const item = step.polyline.split(";").map((pair: string) => {
              const data = pair.split(",");
              return [Number(data?.[0] || 0), Number(data?.[1] || 0)];
            });
            points.push(...item);
          });
          return turf.lineString(points);
        });
        clearSource();
        createPath(router);
        createStartAndEnd([...point.geometry.coordinates], [jqLatLng.value[1], jqLatLng.value[0]]);
      });
    } else {
      isPlanRoute.value = false;
      idCard.value = "";
      clearSource();
    }
  });
};

/** 创建路线 */
const createPath = (routers: any) => {
  const collection = turf.featureCollection([...routers]) as GeoJSON.FeatureCollection;
  _config.setSource("police-plan-route", collection.features, false);
};

/** 创建起始结束点 */
const createStartAndEnd = (startPoint: any[], endPoint: any[]) => {
  const collection = turf.featureCollection([
    turf.point(startPoint, { aimg: "start", bimg: "startRound" }),
    turf.point(endPoint, { aimg: "end", bimg: "endRound" }),
  ]);
  _config.setSource("start-end-point", collection.features, false);
};

/** 关注 */
const handleFollow = (
  followTypeList: string[],
  followTagTypeList: string[],
  data: { policeIdCard: string; policeName: string },
) => {
  batchFollowAdd({
    followTagTypeList,
    followTypeList: followTypeList.length > 0 ? [RM.DISPOLE] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.policeIdCard,
    sourceFollowType: RM.DISPOLE,
    sourceName: data.policeName,
  }).then(() => {
    policeInfo.value.isFollowFlag =
      followTagTypeList.length > 0 || followTypeList.length > 0
        ? Number(isCollect.Yes)
        : Number(isCollect.No);
  });
};

/** 更新关注 */
const handleFollowUpdate = (
  followTypeList: string[],
  followTagTypeList: string[],
  data: { policeIdCard: string; policeName: string },
) => {
  batchFollowUpdate({
    followTagTypeList,
    followTypeList: followTypeList.length > 0 ? [RM.POLICE_EQUIP] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.policeIdCard,
    sourceFollowType: RM.POLICE_EQUIP,
    sourceName: data.policeName,
  }).then(() => {
    policeInfo.value.isFollowFlag =
      followTagTypeList.length > 0 || followTypeList.length > 0
        ? Number(isCollect.Yes)
        : Number(isCollect.No);
  });
};

const handleIssued = () => {
  commandStore.setdispatchData([
    {
      id: props.properties?.userId,
      deptId: props.properties?.id,
      deptCode: props.properties?.deptCode,
      fullName: props.properties?.userName,
    },
  ]);
  commandStore.setPutUseTo(["visual_dark_jqzx_detail_xfzl"]);
  commandStore.isShowXfzl = true;
};

commandStore.$subscribe(
  (
    _mutation: any,
    state: { status: string; isShowXfzl: boolean; zlId: string; putUseTo: string[] },
  ) => {
    if (state.zlId !== "" && state.putUseTo[0] === "visual_dark_jqzx_detail_xfzl") {
      commandStore.zlId = "";
    }
  },
  { detached: false },
);

const clearSource = () => {
  _config.setSource("police-plan-route", [], false);
  _config.setSource("start-end-point", [], false);
};

const getDetail = () => {
  getDict("zgl_jylb");
  getPoliceDetail(props.properties!.id);
};

const getPoliceDetail = (id: string) => {
  getPoliceInfo({
    policeIdCard: id,
    nowTime: moment().format("YYYY-MM-DD HH:mm:ss"),
  }).then((res) => {
    policeInfo.value = res;
  });
};

/** 获取字典项 */
const getDict = async (type: string) => {
  getDictByCode(type).then((data) => {
    policeType.value = data;
  });
};

const handleClose = () => {
  hidePopup(Popup.Police);
};
</script>

<style lang="scss" scoped>
.popup-border {
  background: rgba(25, 128, 223, 0.1);
  border: 1px solid rgba(83, 176, 255, 0.4);
  border-radius: 4px;
}

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
    object-fit: fill;
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
  background: rgba(0, 92, 95, 0.4);
  border-top: 1px solid rgba(#0074b7, 0.6);

  box-sizing: border-box;
  background: rgba(25, 128, 223, 0.102) !important;
}
</style>
