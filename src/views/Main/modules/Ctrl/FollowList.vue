<template>
  <div class="control-container">
    <Box padding="16px 24px 0 16px">
      <InputSearch v-model="searchText" @submit="handleChange" @clear="handleClear" />
      <div class="add">
        <!-- v-if="$allow('dark_tckz_gzlb_add')" -->
        <Button icon="gz-add" text="新建分类" @click="handleAddType" />
      </div>
      <div class="context">
        <template v-if="!isSearching">
          <el-scrollbar v-if="!isLoading" height="680px">
            <!-- 系统默认分类列表 -->
            <Collapse v-for="item in data.defaultList" :key="item.id" :title="item.typeName">
              <Box v-loading="item.isLoading" padding="12px">
                <template v-for="(v, index) in item.list || []" :key="index">
                  <TypePanel
                    :id="v.sourceCode"
                    :type="v.followType"
                    :source-name="v?.sourceName"
                    :source-status="v.sourceStatus"
                    :source-type="v.sourceType"
                    :text="v.orgName"
                    :is-alert="isJingShi(v.sourceType, v.sourceCode)"
                    :is-tracking="isGenZong(v.sourceType, v.sourceCode)"
                    @on-location="
                      (id, type, layer) =>
                        handleLocation(
                          [RM.VIDEO_EQUIP, RM.POLICE_EQUIP, RM.REGION].includes(v.followType)
                            ? v
                            : id,
                          type,
                          layer,
                        )
                    "
                    @on-video="handleAroundVideo(v)"
                    @on-correction="handleCorrection(v)"
                    @on-follow-cancel="handleCancel(v)"
                    @on-track="handleTrack(v)"
                    @on-preview="handlePreview(v)"
                    @on-stalking="handleStalk(v)"
                    @on-police-look="handlePoliceLook(v)"
                  />
                </template>
                <Empty v-if="item.list.length === 0" :size="'small'" text="无关注数据" />
              </Box>
            </Collapse>
            <!-- 自定义分类列表 -->
            <Collapse v-for="item in data.customList" :key="item.id">
              <template #header>
                <span style="margin-right: 8px">{{ item.typeName }}</span>
                <!-- v-if="$allow('dark_tckz_gzlb_edit')" -->
                <Button class="icon-size" icon="gz-edit" @click.stop="handleTagEdit(item)" />
              </template>
              <template #right>
                <Button
                  class="icon-size"
                  style="margin-right: 5px"
                  icon="bk-zpsp"
                  text="播放"
                  @click.stop="handlePlayeVideo(item)"
                />
                <!-- v-if="$allow('dark_tckz_gzlb_delete')" -->
                <el-popconfirm title="确认删除分类?" @confirm="() => handleConfirm(item.id)">
                  <template #reference>
                    <Button style="margin-right: 5px" icon="gz-delete" @click.stop="() => true" />
                  </template>
                </el-popconfirm>
              </template>
              <Box v-loading="item.isLoading" padding="12px">
                <template v-for="(v, index) in item.list || []" :key="index">
                  <TypePanel
                    :id="v.sourceCode"
                    :type="v.followType"
                    :source-name="v.sourceName"
                    :source-status="v.sourceStatus"
                    :source-type="v.sourceType"
                    :text="v.orgName"
                    :is-alert="isJingShi(v.sourceType, v.sourceCode)"
                    :is-tracking="isGenZong(v.sourceType, v.sourceCode)"
                    @on-location="
                      (id, type, layer) =>
                        handleLocation(
                          [RM.VIDEO_EQUIP, RM.POLICE_EQUIP, RM.REGION].includes(v.followType)
                            ? v
                            : id,
                          type,
                          layer,
                        )
                    "
                    @on-video="handleAroundVideo(v)"
                    @on-correction="handleCorrection(v)"
                    @on-follow-cancel="handleCancel(v)"
                    @on-track="handleTrack(v)"
                    @on-preview="handlePreview(v)"
                    @on-stalking="handleStalk(v)"
                    @on-police-look="handlePoliceLook(v)"
                  />
                </template>
                <Empty v-if="item.list.length === 0" :size="'small'" text="无关注数据" />
              </Box>
            </Collapse>
          </el-scrollbar>
        </template>
        <template v-else>
          <el-scrollbar>
            <!-- 搜索结果列表 -->
            <Box padding="12px">
              <template v-for="(v, index) in data.searchList || []" :key="index">
                <TypePanel
                  :id="v.sourceCode"
                  :type="v.followType"
                  :source-name="v.sourceName"
                  :source-status="v.sourceStatus"
                  :source-type="v.sourceType"
                  :text="v.orgName"
                  :is-alert="isJingShi(v.sourceType, v.sourceCode)"
                  :is-tracking="isGenZong(v.sourceType, v.sourceCode)"
                  @on-location="
                    (id, type, layer) =>
                      handleLocation(
                        [RM.VIDEO_EQUIP, RM.POLICE_EQUIP, RM.REGION].includes(v.followType)
                          ? v
                          : id,
                        type,
                        layer,
                      )
                  "
                  @on-video="handleAroundVideo(v)"
                  @on-correction="handleCorrection(v)"
                  @on-follow-cancel="handleCancel(v)"
                  @on-track="handleTrack(v)"
                  @on-preview="handlePreview(v)"
                  @on-stalking="handleStalk(v)"
                  @on-police-look="handlePoliceLook(v)"
                />
              </template>
              <Empty v-if="data.searchList.length === 0" :size="'small'" text="未搜索到关注数据" />
            </Box>
          </el-scrollbar>
        </template>
      </div>
    </Box>
  </div>
</template>

<script setup lang="ts">
import { Dictionary, RM, isVideoOnline } from "@/common/const";
import { AreaType, PointType } from "@/common/map";
import { Box } from "@/components";
import { Button, Collapse, Empty, InputSearch } from "@/components/UI21";
import { useJingShi, useTrace } from "@/hooks/PoliceVideo";
import { useVideo } from "@/hooks/useMapData";
import { useAction, useUser } from "@/store";
import { useModalStore } from "@/store/dark/modal";
import { mapPointEdit } from "@/utils/mapEvent";
import { openVideo } from "@/utils/monitorVideo";
import { ModalType } from "@/views/MapScreenDark/Dialog";
import { axiosGet } from "@app/utils";
import TypePanel from "./components/TypePanel.vue";
import {
  deleteFollowTag,
  getFollowList,
  getFollowTypeList,
  postVideoCorrection,
  queryCarPlay,
} from "./services";
import { useFollow } from "./services/useApi";
import { MapConfig } from "@/modules/Manager/MapConfig";

interface IFollowType {
  id: string;
  typeName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: any[];
  isLoading: boolean;
}

const _config = new MapConfig();
const { getSurroundVideo } = useVideo();
const modalStore = useModalStore();
const actionStore = useAction();
const userStore = useUser();
const { cancel } = useFollow();

const { user } = storeToRefs(userStore);
const { code: carCode, isAlert, setJS, close } = useJingShi();
const { code: deviceCode, isTracking, setTrace, clearTrace } = useTrace();

const isLoading = ref(false);
const isSearching = ref(false);

/** 搜索的值 */
const searchText = ref("");

const params = reactive({
  searchText: "",
  idCard: user.value.idCard,
});

const isJingShi = (type: string, id: string) =>
  computed(() => {
    if (type !== Dictionary.VEHICLE) return false;
    return id === carCode.value && isAlert.value;
  }).value;

const isGenZong = (type: string, id: string) =>
  computed(() => {
    const deviceList = new Set([
      Dictionary.VEHICLE,
      Dictionary.RECORDER,
      Dictionary.INTERCOM,
      Dictionary.POLICE_TONG,
      Dictionary.POLICE_TYPE,
    ]);
    if (!deviceList.has(type)) return false;
    return id === deviceCode.value && isTracking.value;
  }).value;

const areaMap = new Map()
  .set(AreaType.XZQY, "source-executives")
  .set(AreaType.GXQY, "source-precinct")
  .set(AreaType.XLQY, "source-grid")
  .set(AreaType.JDSQ, "source-community");

const pointMap = new Map()
  .set(PointType.ZAGT, "source-gangting-point")
  .set(PointType.JWDW, "source-jingwu-point")
  .set(PointType.SJKK, "source-shiji-point")
  .set(PointType.CTDW, "source-chutu-point")
  .set(PointType.GAJCZ, "source-jianchazhan-point")
  .set(PointType.ZAKD, "source-zhian-point")
  .set(PointType.ZQDW, "source-zhiqin-point");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: { customList: IFollowType[]; defaultList: IFollowType[]; searchList: any[] } = reactive(
  {
    defaultList: [
      { list: [], typeName: "兴趣热点", id: RM.HOTSPOTS, isLoading: false },
      { list: [], typeName: "区域划分", id: RM.REGION, isLoading: false },
      { list: [], typeName: "警务机构", id: RM.POLICE_AGENCY, isLoading: false },
      { list: [], typeName: "视频装备", id: RM.VIDEO_EQUIP, isLoading: false },
      { list: [], typeName: "警用装备", id: RM.POLICE_EQUIP, isLoading: false },
      { list: [], typeName: "处置力量", id: RM.DISPOLE, isLoading: false },
    ],
    customList: [],
    searchList: [],
  },
);

/** 添加自定义分类 */
const handleAddType = () => {
  modalStore.showModal(ModalType.GZFL, {
    onSubmit: () => {
      getCustomList();
      getFollow();
    },
    data: {
      type: "add",
    },
  });
};

/** 播放自定义分类 */
const handlePlayeVideo = async (val: {
  id: string;
  list: { followType: string; extraJson: string }[];
}) => {
  const cameraList: { cameraGBCode: string; cameraGBName: string }[] = [];
  const carCodes: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  val.list.forEach((element: any) => {
    if (element.followType === RM.HOTSPOTS) {
      if (element?.extraJson && typeof element?.extraJson === "string") {
        const extraJson = JSON.parse(element?.extraJson);
        const list = (extraJson?.monitorList || []).map(
          (equip: { deviceId: string; name: string }) => {
            return { cameraGBCode: equip.deviceId, cameraGBName: equip.name };
          },
        );
        cameraList.push(...list);
      }
    } else if (element.followType === RM.VIDEO_EQUIP) {
      _config
        .getFeatureItem<GeoJSON.Point>("source-jyzbl_jk_jklx", element.sourceCode, "id")
        .then((video) => {
          cameraList.push({
            cameraGBCode: video?.properties?.id,
            cameraGBName: video?.properties?.name,
          });
        });
    } else if (
      element.followType === RM.POLICE_EQUIP &&
      element?.sourceType === Dictionary.RECORDER
    ) {
      _config
        .getFeatureItem<GeoJSON.Point>("source-jyzbl_zfjly", element.sourceCode, "id")
        .then((recorder) => {
          cameraList.push({
            cameraGBCode: recorder?.properties?.id,
            cameraGBName: recorder?.properties?.name,
          });
        });
    } else if (element?.sourceType === Dictionary.VEHICLE) {
      carCodes.push(element.sourceCode);
    }
  });
  if (carCodes.length > 0) {
    const result = await queryCarPlay({ carCodeList: carCodes });
    result.forEach((car: { deviceCode: string; deviceName: string }) => {
      cameraList.push({ cameraGBCode: car.deviceCode, cameraGBName: car.deviceName });
    });
  }

  const newList = cameraList.splice(0, 16);
  if (newList.length > 0) {
    openVideo(1, newList, 16, 16);
  } else {
    ElMessage({
      message: "未绑定相关摄像头!",
      type: "warning",
      offset: 92,
    });
  }
};

/** 搜索关键字提交 */
const handleChange = () => {
  if (!searchText.value.trim()) {
    searchText.value = "";
    isSearching.value = false;
    return;
  }
  params.searchText = searchText.value;
  isSearching.value = true;
  getFollow();
};

/** 清除搜索关键字 */
const handleClear = () => {
  data.searchList = [];
  searchText.value = "";
  isSearching.value = false;
  params.searchText = "";
  getFollow();
};

/** 周边资源 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleAroundVideo = (val: any) => {
  if (val.followType === RM.HOTSPOTS) {
    if (val?.extraJson && typeof val?.extraJson === "string") {
      const extraJson = JSON.parse(val?.extraJson);
      const cameraList = (extraJson?.monitorList || [])
        .filter((equip: { status: isVideoOnline }) => equip.status === isVideoOnline.Yes)
        .splice(0, 9)
        .map((equip: { deviceId: string; name: string }) => {
          return { cameraGBCode: equip.deviceId, cameraGBName: equip.name };
        });
      if (cameraList.length > 0) {
        openVideo(1, cameraList, 16);
      } else {
        ElMessage({
          message: "未绑定周边摄像头!",
          type: "warning",
          offset: 92,
        });
      }
    } else {
      ElMessage({
        message: "未绑定周边摄像头!",
        type: "warning",
        offset: 92,
      });
    }
  } else {
    _config.getFeatureItem<GeoJSON.Point>("source-jyzbl_jk_jklx", val.sourceCode).then((point) => {
      getSurroundVideo(`${point.geometry.coordinates[1]}`, `${point.geometry.coordinates[0]}`);
    });
  }
};

/** 获取载具子类型 */
const getVehicle = (id: string) => {
  return Promise.allSettled([
    _config.getFeatureItem<GeoJSON.Point>("source-jyzbl_zj_jc", id),
    _config.getFeatureItem<GeoJSON.Point>("source-jyzbl_zj_wrj", id),
  ]).then((points) => {
    const point = points.find((x) => x.status === "fulfilled");
    return point?.value;
  });
};

/** 轨迹 */
const handleTrack = async (val: { sourceType: string; sourceCode: string }) => {
  if (val.sourceType === Dictionary.VEHICLE) {
    getVehicle(val.sourceCode).then((point) => {
      if (point) {
        actionStore.showAction(
          {
            type: "DeviceTrack",
            id: point.properties?.id,
            iconType: point?.properties?.type,
          },
          true,
        );
      }
    });
  } else {
    _config
      .getFeatureItem<GeoJSON.Point>(`source-${val.sourceType}`, val.sourceCode)
      .then((point) => {
        actionStore.showAction(
          {
            type: "DeviceTrack",
            id: point.properties?.id,
            iconType: point?.properties?.type,
          },
          true,
        );
      });
  }
};

/** 取消关注 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleCancel = (val: any) => {
  // TODO:
  cancel({ id: val.id, idCard: user.value.idCard }).then(() => {
    getFollow();
  });
};

const getFollow = () => {
  getFollowList(params).then((res) => {
    data.searchList = res;
    data.defaultList.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.list = [];
      const list = res.filter((e: { followTagType: string }) => e.followTagType === item.id);
      item.list.push(...list);
      if (item.id === "dispole") {
        const pointList = res.filter(
          (e: { followTagType: string }) => e.followTagType === "dispolePoint",
        );
        item.list.push(...pointList);
      }
    });
    data.customList.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.list = [];
      const list = res.filter((e: { followTagType: string }) => e.followTagType === item.id);
      item.list.push(...list);
      if (item.id === "dispole") {
        const pointList = res.filter(
          (e: { followTagType: string }) => e.followTagType === "dispolePoint",
        );
        item.list.push(...pointList);
      }
    });
  });
};

/** 删除自定义分类 */
const handleConfirm = (id: string) => {
  deleteFollowTag({ id }).then((res) => {
    if (res === 0) {
      getCustomList();
      getFollow();
    }
  });
};

/** 警视 */
const handlePoliceLook = (val: { sourceType: string; sourceCode: string; device_code: string }) => {
  _config.getFeatureItem<GeoJSON.Point>("source-jyzbl_zj_jc", val.sourceCode).then((point) => {
    if (!isAlert.value) {
      setJS(point.properties?.id, (pos: GeoJSON.Feature) => {
        _config.position(pos);
      });
    } else {
      close();
    }
  });
};

/* 修改自定义分类 */
const handleTagEdit = (val: { typeName: string; id: string }) => {
  modalStore.showModal(ModalType.GZFL, {
    onSubmit: (text) => {
      const result = data.customList.find((item) => item.id === val.id);
      if (result) {
        result.typeName = text;
      }
    },
    data: {
      type: "edit",
      id: val.id,
      text: val.typeName,
    },
  });
};

/** 纠偏 */
const handleCorrection = (val: { sourceCode: string }) => {
  _config.getFeatureItem<GeoJSON.Point>("source-jyzbl_jk_jklx", val.sourceCode).then((point) => {
    _config.setCommonFilter("source-jyzbl_jk_jklx", "id", val.sourceCode);
    _config.position(point);
    mapPointEdit(_config._map!, (coords) => {
      postVideoCorrection({ id: point.properties!.deviceId, coordinate: coords.toString() }).then(
        () => {
          ElMessage({
            message: "纠偏成功!",
            type: "success",
            offset: 92,
          });
          _config.setFeatureItem("source-jyzbl_jk_jklx", coords, val.sourceCode);
        },
      );
    });
  });
};

/** 预览 */
const handlePreview = async (val: { sourceType: string; sourceCode: string }) => {
  if (val.sourceType === Dictionary.VEHICLE) {
    getVehicle(val.sourceCode).then(async (point) => {
      if (point) {
        try {
          const res = await axiosGet(
            `${$config.patrolApi}/personalPopWindows/queryGuardEquipmentDetail/car`,
            {
              deviceCode: point.properties?.id,
              deviceId: point.properties?.deviceId,
            },
          );
          if (res?.code === 200) {
            const playType = 0;

            const cameralist = (res.data?.policeCarCamera)
              .splice(0, 9)
              .map((v: { code: string; name: string }) => {
                return { cameraGBCode: v.code, cameraGBName: v.name };
              });
            if (cameralist.length > 0) {
              openVideo(playType, cameralist);
            } else {
              ElMessage({
                message: "暂无可预览摄像头",
                type: "warning",
                offset: 92,
              });
            }
          }
        } catch (error) {
          console.error("error", error);
        }
      }
    });
  } else {
    _config
      .getFeatureItem<GeoJSON.Point>(`source-${val.sourceType}`, val.sourceCode)
      .then(async (point) => {
        if (val.sourceType === Dictionary.RECORDER) {
          const cameralist = [
            { cameraGBCode: point.properties?.id, cameraGBName: point.properties?.name },
          ];
          openVideo(0, cameralist);
        }
      });
  }
};

/** 跟踪 */
const handleStalk = (val: { sourceType: string; sourceCode: string; deviceCode: string }) => {
  if (val.sourceType === Dictionary.VEHICLE) {
    getVehicle(val.sourceCode)
      .then((point) => {
        if (point) {
          setTrace(point.properties?.id, `source-${val.sourceType}`);
        }
      })
      .catch(() => {
        ElMessage({
          message: "该设备暂无坐标，无法跟踪!",
          type: "warning",
          offset: 92,
        });
      });
  } else {
    _config
      .getFeatureItem<GeoJSON.Point>(`source-${val.sourceType}`, val.sourceCode)
      .then((point) => {
        setTrace(point.properties?.id, `source-${val.sourceType}`);
      })
      .catch(() => {
        ElMessage({
          message: "该设备暂无坐标，无法跟踪!",
          type: "warning",
          offset: 92,
        });
      });
  }
};

const clearPointItem = () => {
  [
    "source-jyzbl_zj_jc",
    "source-jyzbl_zj_wrj",
    "source-jyzbl_jwt",
    "source-jyzbl_djj",
    "source-jyzbl_zfjly",
    "source-jyzbl_jk_jklx",
    "source-community",
    "source-precinct",
    "source-executives",
    "source-grid",
    "source-hcq",
    "source-hhq",
    "source-qyq",
    "source-xqy",
    "source-interest-point",
    "source-police",
  ].forEach((sourceId) => {
    _config.clearCommonFilter(sourceId, "id");
  });
};

/** 定位 */
const handleLocation = (val: any, followType: RM, layer?: string) => {
  clearPointItem();
  if (followType === RM.REGION) {
    areaMap.forEach((v, k) => {
      if (k === val.sourceType) {
        _config.getFeatureItem<GeoJSON.MultiPolygon>(v, val.sourceCode).then((point) => {
          _config.setCommonFilter(v, "id", val.sourceCode);
          _config.position(point);
        });
      }
    });
  } else if (followType === RM.POLICE_AGENCY) {
    pointMap.forEach((v, k) => {
      if (k === layer) {
        _config.getFeatureItem<GeoJSON.Point>(v, val).then((point) => {
          _config.setCommonFilter(v, "id", val);
          _config.position(point);
        });
      }
    });
  } else if (followType === RM.POLICE_EQUIP) {
    if (val.sourceType === Dictionary.VEHICLE) {
      getVehicle(val.sourceCode).then((point) => {
        if (point) {
          _config.setCommonFilter(
            `source-${point.properties?.deviceSonType}`,
            "id",
            val.sourceCode,
          );
          _config.position(point);
        }
      });
    } else {
      _config
        .getFeatureItem<GeoJSON.Point>(`source-${val.sourceType}`, val.sourceCode)
        .then((point) => {
          _config.setCommonFilter(`source-${val.sourceType}`, "id", val.sourceCode);
          _config.position(point);
        });
    }
  } else if (followType === RM.VIDEO_EQUIP) {
    _config.getFeatureItem<GeoJSON.Point>("source-jyzbl_jk_jklx", val.sourceCode).then((point) => {
      _config.setCommonFilter("source-jyzbl_jk_jklx", "id", point.properties?.id);
      _config.position(point);
    });
  } else {
    _config.getFeatureItem<GeoJSON.Point>(layer!, val).then((point) => {
      _config.setCommonFilter(layer!, "id", val);
      _config.position(point);
    });
  }
};

/** 获取自定义类型列表 */
const getCustomList = async () => {
  try {
    const res = await getFollowTypeList({});
    const customList: any = [];
    res.forEach((item: { typeName: string; id: string }) => {
      customList.push({
        list: [],
        typeName: item.typeName,
        id: item.id,
        isLoading: false,
      });
    });
    data.customList = customList;
  } catch (error) {
    console.log("error", error);
  }
};

watchEffect(async () => {
  await getCustomList();
  getFollow();
});

onBeforeUnmount(() => {
  clearTrace && clearTrace();
  close && close();
  clearPointItem();
});
</script>

<style lang="scss" scoped>
@import "@/styles/dark.scss";

.add {
  position: relative;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
  margin-bottom: 12px;
  margin: 12px 0;
  color: #fff;
  :deep(.hlk-modal) {
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
