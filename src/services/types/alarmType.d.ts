type AlarmCount = {
  /** 环比 */
  ringCompare: string;
  /** 环周期总数 */
  ringTotal: string;
  /** 同比 */
  sameCompare: string;
  /** 同比周期总数 */
  sameTotal: string;
  /** 总数 */
  total: string;
  /** 类型 */
  type: string;
  /** 类型名称 */
  typeStr: string;
};

/** 警情类型统计类型 */
export type AlarmCountType = {
  data: AlarmCount[];
  /** 环比 */
  ringCompare: string;
  /** 环比周期数量 */
  ringTotal: string;
  /** 同比周期数量 */
  sameTotal: string;
  /** 环比 */
  saneCompare: string;
  /** 总数 */
  total: string;
};

export type AlarmList = {
  /**页码 */
  current: number;
  /** 数据 */
  data: AlarmListItem[];
  /** 数量 */
  size: number;
  /** 总数 */
  total: number;
};

export type AlarmListItem = {
  /** 案发地址 */
  afAddress: string;
  /** 案件描述 */
  ajDesc: string;
  /** 案件等级 */
  ajGrade: string;
  /** 案件类别 */
  ajType: string;
  /** 案件类别（二级） */
  ajType2: string;
  /** 案件类别（三级） */
  ajType3: string;
  /** 案件类别名称 */
  ajTypeName: string;
  /** 案件类别名称（二级） */
  ajTypeName2: string;
  /** 报警人姓名 */
  bjrName: string;
  /** 报警人电话 */
  bjrPhone: string;
  /** 报警时间，时间戳 */
  bjTime: number;
  /** 出动单位 */
  cdCodes: string[];
  /** 出动单位名称 */
  cdNames: string[];
  /** 关注用户 */
  concernUsers: string[];
  /** 处置时间，时间戳 */
  czTime: number | null;
  /** 到场时间，时间戳 */
  dcTime: number | null;
  /** 有效警情状态，0-否 1-是 */
  effectiveFlag: string;
  /** 点位坐标 */
  geo: string;
  /** 点位坐标 */
  geoTriangle: string;
  /** 管辖单位 */
  gxCodes: string[];
  /** 管辖单位名称 */
  gxNames: string[];
  /** 警情ID */
  id: string;
  /** 警情级别 */
  jqLevel: string;
  /** 校正地址 */
  jzAddress: null | string;
  /** 是否精准定位，0-否 1-是 */
  ppFlag: string;
  /** 签收用户 */
  qsCard: string[];
  /** 签收报警时间，时间戳 */
  qsTime: number | null;
  /** 事件单编号 */
  sno: string;
  /** 标签列表 */
  tags: string[];
  /** 亮灯状态，0-否 1-是 */
  warningFlag: string;
  /** 指令状态 */
  zlStatus: string;
};

/** 警情标签 */
export interface Datum {
  /**
   * 标签编号
   */
  bqbh: null | string;
  bqbz: null;
  bqcj: null | string;
  bqdy: null | string;
  bqfl: null | string;
  bqlx: null | string;
  /**
   * 标签名称
   */
  bqmc: string;
  bqxz: null | string;
  bqzt: null | string;
  children: ChildrenChild[] | null;
  fbqbh: null | string;
  [property: string]: any;
}

export interface ChildrenChild {
  bqbh: string;
  bqbz: null;
  bqcj: string;
  bqdy: string;
  bqfl: string;
  bqlx: string;
  bqmc: string;
  bqxz: string;
  bqzt: string;
  children: ChildrenChild[];
  fbqbh: string;
  [property: string]: any;
}
