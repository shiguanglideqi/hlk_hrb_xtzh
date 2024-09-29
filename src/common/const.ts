/** 字典项集合 */
export class Dictionary {
  /** @类型 监控类型 */
  static readonly MONITOR_TYPE = "jyzbl_jk_jklx";
  /** @类型 载具 */
  static readonly VEHICLE = "jyzbl_zj";
  /** @类型 警车 */
  static readonly POLICECAR = "jyzbl_zj_jc";
  /** @类型 无人机 */
  static readonly WURENJI = "jyzbl_zj_wrj";
  /** @类型 警务通 */
  static readonly POLICE_TONG = "jyzbl_jwt";
  /** @类型 对讲机 */
  static readonly INTERCOM = "jyzbl_djj";
  /** @类型 执法记录仪 */
  static readonly RECORDER = "jyzbl_zfjly";
  /** @类型 警员类别 */
  static readonly POLICE_TYPE = "zgl_jylb";
  /** @类型 市局 */
  static readonly MUNICIPAL_BUREAU = "SJ";
  /** @类型 分局 */
  static readonly BRANCH_BUREAU = "FXJ";
  /** @类型 派出所 */
  static readonly POLICE_STATION = "PCS";
  /** @类型 地址聚合 */
  static readonly DZXX_DJH = "dzxx_djh";
  /** @类型 楼栋聚合 */
  static readonly LDXX_DJH = "ldxx_djh";
  /** @类型 执勤点位 */
  static readonly ZQ_POINT = "zhiqin_point";
  /** @类型 警种 */
  static readonly POLICEKIND = "zgl_jz";
  /** @类型 公安检查站 */
  static readonly GAJCZ = "gajcz_djh";
  /** @类型 治安卡点 */
  static readonly ZAKD = "zakd_djh";
  /** @类型 执勤点位 */
  static readonly ZQDW = "zqdw_djh";
}

/** 资源管理常量 Resource Management */
export class RM {
  /** @类型 警务机构 */
  static readonly POLICE_AGENCY = "pointBig";
  /** @类型 兴趣热点 */
  static readonly HOTSPOTS = "hotspots";
  /** @类型 区域划分 */
  static readonly REGION = "region";
  /** @类型 巡线划分 */
  static readonly ROUTE = "route";
  /** @类型 视频装备 */
  static readonly VIDEO_EQUIP = "videoEquip";
  /** @类型 警用装备 */
  static readonly POLICE_EQUIP = "policeEquip";
  /** @类型 处置力量 */
  static readonly DISPOLE = "dispole";
  /** @类型 处置力量 - 点位 */
  static readonly DISPOLE_POINT = "dispolePoint";
  /** @类型 物资 */
  static readonly MATERIA = "material";
  /** @类型 楼栋 */
  static readonly LDXX = "ldxx";
  /** @类型 标准地址 */
  static readonly DZXX = "dzxx";
}

/** 资源管理-是否收藏 */
export const enum isCollect {
  /** 收藏 */
  Yes = "1",
  /** 未收藏 */
  No = "0",
}

/** 资源管理-视频是否在线 */
export const enum isVideoOnline {
  /** 在线 */
  Yes = "ON",
  /** 离线 */
  No = "OFF",
  /** 在线 */
  ALL = "",
}

/** 资源管理-是否在线 */
export const enum isOnline {
  ALL = -1,
  Yes = 1,
  No = 0,
}

/** 设备在线状态 */
export const enum DEVICE_STATUS {
  /** 在线 */
  YES = 1,
  /** 离线 */
  NO = 0,
  /** 全部 */
  ALL = "",
}

/** 资源管理-视频在线状态 */
export const enum VIDEO_STATUS {
  /** 在线 */
  YES = "ON",
  /** 离线 */
  NO = "OFF",
  /** 在线 */
  ALL = "",
}
