<template>
  <Dialog
    v-model="isShow"
    title="自定义配置"
    icon="kz-setting"
    width="580"
    class=""
    :close-on-click-modal="false"
    :is-show-footer="false"
    @close="handleClose"
  >
    <div class="content">
      <el-scrollbar height="450px" class="list">
        <Collapse v-for="item in dataSource.list" :key="item.type">
          <template #header>{{ item.name }} ({{ item.list.length }})</template>
          <Box padding="12px 0px" class="grid">
            <div
              v-for="(val, index) in item.list"
              :key="index"
              class="grid-item button-cursor"
              :class="[{ 'active': isActive(val) }]"
              @click="onItemClick(val, item.type)"
            >
              <div style="display: flex; align-items: center">
                <div class="collapse-item-text">
                  {{ val.name }}
                </div>
              </div>
              <div class="num-text">{{ val.num }}</div>
            </div>
          </Box>
        </Collapse>
        <!-- Collapse -->
      </el-scrollbar>
    </div>
    <div class="footer">
      <div style="display: flex; justify-content: end">
        <el-button class="btn" @click="handleClose">取消</el-button>
        <el-button class="submit-btn" type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </div>
  </Dialog>
</template>
<script setup lang="ts">
import { Dictionary, RM } from "@/common/const";
import { Box, Collapse, Dialog } from "@/components";
import useDialog, { DialogDataType, DialogType } from "@/hooks/useDialog";
import { useOrg, useUser } from "@/store";
import { AreaType, PointType } from "@/common/map";
import {
  getAreaCount,
  getPointBigCount,
  getTypeList,
  queryHotsPotsInterestNum,
} from "@/services/map";
import { getCustomTag, queryPoliceNum, saveCustomTag, updateCustomTag } from "@/services/special";
import { getDict, getDictByCode } from "@/services/common";
import { queryEquipmentNum, queryVideoEquipmentNum } from "@/services/patrol";

const { isShow, onDialogShow, hideDialog } = useDialog(DialogType.TCPZ);

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
  /** 图层控制分类 */
  ctrlType?: RM;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClusterType = { name: string; type: string; list: listType[] };
const dataSource: { list: ClusterType[]; rawData: ClusterType[] } = reactive({
  /** 处理后添加分类的数据 */
  list: [
    {
      type: RM.POLICE_AGENCY,
      name: "警务机构",
      list: [
        { isSub: false, name: "派出所", type: PointType.ZAGT, sourceId: "source-gangting-point" },
        { isSub: false, name: "警务点位", type: PointType.JWDW, sourceId: "source-jingwu-point" },
        { isSub: false, name: "市际卡口", type: PointType.SJKK, sourceId: "source-shiji-point" },
        { isSub: false, name: "处突点位", type: PointType.CTDW, sourceId: "source-chutu-point" },
      ],
    },
    { type: RM.HOTSPOTS, name: "兴趣点位", list: [] },
    {
      type: RM.REGION,
      name: "区域划分",
      list: [
        {
          isSub: false,
          name: "行政区域",
          type: AreaType.XZQY,
          sourceId: "source-executives",
        },
        { isSub: false, name: "辖区边界", type: AreaType.GXQY, sourceId: "source-precinct" },
        { isSub: false, name: "社区边界", type: AreaType.JDSQ, sourceId: "source-community" },
        { isSub: false, name: "网格边界", type: AreaType.XLQY, sourceId: "source-grid" },
      ],
    },
    { type: RM.VIDEO_EQUIP, name: "视频装备", list: [] },
    {
      type: RM.POLICE_EQUIP,
      name: "警用装备",
      list: [
        { isSub: false, name: "警车", type: Dictionary.POLICECAR, sourceId: "source-jyzbl_zj_jc" },
        {
          isSub: false,
          name: "警务通",
          type: Dictionary.POLICE_TONG,
          sourceId: "source-jyzbl_jwt",
        },
        { isSub: false, name: "对讲机", type: Dictionary.INTERCOM, sourceId: "source-jyzbl_djj" },
        {
          isSub: false,
          name: "执法记录仪",
          type: Dictionary.RECORDER,
          sourceId: "source-jyzbl_zfjly",
        },
        { isSub: false, name: "无人机", type: Dictionary.WURENJI, sourceId: "source-jyzbl_zj_wrj" },
      ],
    },
    {
      type: RM.DISPOLE,
      name: "处置力量",
      list: [],
    },
  ],
  /** 后端返回的原始数据 */
  rawData: [],
});

const store = useOrg();
const usetStore = useUser();

const { orgCode } = storeToRefs(store);
const { user } = storeToRefs(usetStore);

const active = ref<listType[]>([]);
const customTagId = ref("");
const isActive = (layer: listType) =>
  computed(() =>
    active.value.find((v) => {
      return layer.isSub ? layer.subType === v.subType : v.type === layer.type;
    }),
  ).value;

let DialogOption: DialogDataType[DialogType.TCPZ];

onDialogShow((result) => {
  DialogOption = result;
  getUser();
  getSubList();
});

const onItemClick = (layer: listType, type: RM) => {
  if (
    active.value.find((v) => (layer.isSub ? layer.subType === v.subType : v.type === layer.type))
  ) {
    active.value = active.value.filter((v) =>
      layer.isSub ? layer.subType !== v.subType : v.type !== layer.type,
    );
  } else {
    active.value.push({
      ...layer,
      ctrlType: type,
    });
  }
};

const getUser = async () => {
  const data = await getCustomTag(user.value.idCard);
  if (data) {
    customTagId.value = data.id;
    active.value = data.json ? JSON.parse(data.json) : [];
  } else {
    customTagId.value = "";
  }
};

/** 获取兴趣点位数据数量 */
const getHotPointNum = async (smallTypeList: string[]) => {
  try {
    const data = await queryHotsPotsInterestNum({
      pointBigType: PointType.ZDCS,
      pointSmallTypeList: smallTypeList,
      deptCode: orgCode.value,
    });
    dataSource.list[1].list.forEach((element) => {
      const _element = element;
      const item = data.find(
        (v: { pointSmallType: string }) => v.pointSmallType === element.subType,
      );
      _element.num = item?.count || 0;
    });
  } catch (error) {
    console.log("error", error);
  }
};

/** 获取视频装备数量 */
const getVideoNum = async (videoSmallType: string[]) => {
  try {
    const data = await queryVideoEquipmentNum({
      deptCode: orgCode.value,
      deviceSonTypeList: videoSmallType,
    });
    dataSource.list[3].list.forEach((item) => {
      const _item = item;
      const res = data.find((v: { deviceSonType: string }) => v.deviceSonType === _item.subType);
      _item.num = res?.totalCount || 0;
    });
  } catch (error) {
    console.log("error", error);
  }
};

/** 获取处置力量警种数量 */
const getPoliceNum = async () => {
  try {
    const data = await queryPoliceNum({
      orgCode: orgCode.value,
    });
    dataSource.list[5].list.forEach((item) => {
      const _item = item;
      const res = data.find((v: any) => v.policeClassification === _item.subType);
      _item.num = res?.allStatusCount || 0;
    });
  } catch (error) {
    console.log("error", error);
  }
};

/** 获取警用装备数量 */
const getPoliceDeviceNum = async () => {
  try {
    const data = await queryEquipmentNum({
      deviceTypeList: [
        Dictionary.RECORDER,
        Dictionary.POLICE_TONG,
        Dictionary.INTERCOM,
        Dictionary.WURENJI,
        Dictionary.POLICECAR,
      ],
      deptCode: orgCode.value,
    });
    dataSource.list[4].list.forEach((item) => {
      const _item = item;
      const res = data.find((v: { deviceType: string }) => v.deviceType === item.type);
      _item.num = res?.totalCount || 0;
    });
  } catch (error) {
    console.log("error", error);
  }
};

/** 获取物资点数量 */
// const getSupplyPointNum = async () => {
//   try {
//     const data = await queryMaterial({ deptCode: orgCode.value });
//     dataSource.list[6].list[0].num = data.length;
//   } catch (error) {
//     console.log("error", error);
//   }
// };

/** 获取警务机构数量 */
const getPointBigNum = async () => {
  try {
    const data = await getPointBigCount({
      pointBigTypeList: [PointType.JWDW, PointType.CTDW],
      deptCode: orgCode.value,
    });

    dataSource.list[0].list.forEach((item) => {
      const res = data.find((v: { pointBigType: string }) => v.pointBigType === item.type);
      // eslint-disable-next-line no-param-reassign
      item.num = res?.count || 0;
    });
  } catch (error) {
    console.log("error", error);
  }
};

/** 获取区域数量 */
const getAreaNum = async () => {
  try {
    const data = await getAreaCount({
      areaTypeList: [AreaType.XZQY, AreaType.JDSQ, AreaType.XLQY, AreaType.GXQY],
      deptCode: orgCode.value,
    });
    dataSource.list[2].list.forEach((item) => {
      const _item = item;
      const res = data.find((v: { areaType: string }) => v.areaType === item.type);
      _item.num = res?.count || 0;
    });
  } catch (error) {
    console.log("error", error);
  }
};

/** 处理兴趣点位数据格式 */
const handlePoint = (data: any[]): listType[] => {
  return data.map((item) => {
    return { isSub: true, name: item.levelTwoStr, type: item.levelOne, subType: item.levelTwo };
  });
};

/** 处理监控数据格式 */
const handleMonitor = (data: { [k: string]: string }): listType[] => {
  const list: listType[] = [];
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const element = data[key];
      list.push({ isSub: true, name: element, type: "jk", subType: key });
    }
  }
  return list;
};

/** 处理警种数据格式 */
const handlePoliceKind = (data: any[]): listType[] => {
  const list: listType[] = [];
  data.forEach((item) => {
    list.push({
      isSub: true,
      name: item.dictName,
      type: Dictionary.POLICEKIND,
      subType: item.dictValue,
    });
  });
  list.push({
    isSub: true,
    name: "警员",
    type: Dictionary.POLICEKIND,
    subType: "other",
  });
  return list;
};

const getSubList = () => {
  Promise.all([
    getTypeList({ search: PointType.ZDCS, type: 4 }),
    getDictByCode(Dictionary.MONITOR_TYPE),
    getDict(Dictionary.POLICEKIND),
  ])
    .then((results) => {
      const point = results?.[0] || [];
      const monitor = results?.[1] || {};
      const police = results?.[2] || {};
      const pointList = handlePoint(point);
      const monitorList = handleMonitor(monitor);
      const policeKindList = handlePoliceKind(police);
      dataSource.list[1].list = pointList;
      dataSource.list[3].list = monitorList;
      dataSource.list[5].list = policeKindList;
      return { point: pointList, video: monitorList };
    })
    .then((result) => {
      const pointSmallType = result.point.map((v) => v.subType) as string[];
      const videoSmallType = result.video.map((v) => v.subType) as string[];
      getAllTypeNum(pointSmallType, videoSmallType);
    });
};

const getAllTypeNum = (pointSmallType: string[], videoSmallType: string[]) => {
  getHotPointNum(pointSmallType);
  getVideoNum(videoSmallType);
  getPoliceNum();
  // getSupplyPointNum();
  getPoliceDeviceNum();
  getPointBigNum();
  getAreaNum();
};

const handleSubmit = () => {
  if (customTagId.value) {
    updateCustomTag({
      id: customTagId.value,
      customTagJsonb: JSON.stringify(active.value),
      policeIdCard: user.value.idCard,
    }).then(() => {
      DialogOption.onSubmit?.("200");
      hideDialog();
    });
  } else {
    saveCustomTag({
      customTagJsonb: JSON.stringify(active.value),
      policeIdCard: user.value.idCard,
    }).then(() => {
      DialogOption.onSubmit?.("200");
      hideDialog();
    });
  }
};

const handleClose = () => {
  hideDialog();
};
</script>

<style scoped lang="scss">
.content {
  :deep(.el-scrollbar__bar) {
    width: 3px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 12px;
    .grid-item {
      display: flex;
      justify-content: space-between;
      width: 100%;
      height: 36px;
      line-height: 36px;
      font-size: 16px;
      font-weight: 400;
      color: #ffffff;
      padding: 0 8px;
      background: url("@/assets/images/item.png") no-repeat center;
      background-size: 100% 100%;
      box-sizing: border-box;
      .grid-item-icon {
        width: 18px;
        height: 18px;
        margin-right: 6px;
        object-fit: contain;
      }
      .collapse-item-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100px;
      }
      &.active {
        background: url("@/assets/images/item-a.png") no-repeat center;
        background-size: 100% 100%;
      }
    }
  }
}
.footer {
  text-align: end;
  margin-top: 12px;

  .submit-btn {
    background: linear-gradient(360deg, rgba(#3a75fe, 0.8) 0%, rgba(#5a8cfe, 0.8) 100%);
    color: #e2f7fc;
    text-shadow: 0px 2px 8px rgba(5, 28, 55, 0.42);
  }
  .btn {
    line-height: 32px;
    height: 32px;
    background: rgba(0, 29, 94, 0.5);
    font-size: 16px;
    font-weight: 400;
    color: #00baff;
    border: 1px solid rgba(93, 193, 255, 0.5);
  }
}
</style>
