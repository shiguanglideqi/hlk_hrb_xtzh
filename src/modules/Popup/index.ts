const ClusterPopup = defineAsyncComponent(() => import("./ClusterPopup.vue"));
const DevicePopup = defineAsyncComponent(() => import("./DevicePopup.vue"));
const PolicePopup = defineAsyncComponent(() => import("./PolicePopup.vue"));
const PoliceCarPopup = defineAsyncComponent(() => import("./PoliceCarPopup.vue"));
const AlarmPopup = defineAsyncComponent(() => import("./AlarmPopup.vue"));
const ZhbPopup = defineAsyncComponent(() => import("./ZhbPopup.vue"));

/** Popup 枚举值 */
export enum Popup {
  /** 聚合 */
  Cluster = 10,
  /** 设备：对讲机 警务通 执法记录仪 监控 */
  Device,
  /** 点位详情 */
  Point,
  /** 警车 */
  PoliceCar,
  /** 警员 */
  Police,
  /** 指挥部 */
  Zhb,
  /** 框选 */
  FrameSelect,
  /** 地址 */
  Address,
  /** 楼栋 */
  Building,
  /** 房屋 */
  HouseInfo,
  /** 警情 */
  Alarm,
  /** 预警 */
  YJ,
  /** 警情 */
  JQ,
  /** 重点人 */
  KeyPerson,
}

/** key与popup 映射 */
export const popupMap = new Map()
  .set(Popup.Cluster, ClusterPopup)
  .set(Popup.Device, DevicePopup)
  .set(Popup.PoliceCar, PoliceCarPopup)
  .set(Popup.Police, PolicePopup)
  .set(Popup.Zhb, ZhbPopup)
  .set(Popup.Alarm, AlarmPopup);
