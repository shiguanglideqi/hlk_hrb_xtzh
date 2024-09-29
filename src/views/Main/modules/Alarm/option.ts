/** 时间范围默认配置 */
export const timeRange = [
  {
    value: "ins",
    label: "30分钟内",
  },
  {
    value: "out",
    label: "30分钟外",
  },
];

/** 警情级别默认配置 */
export const jqLevel = [
  {
    value: "1",
    label: "一级",
  },
  {
    value: "2",
    label: "二级",
  },
  {
    value: "3",
    label: "三级",
  },
  {
    value: "4",
    label: "四级",
  },
];

/** 警情类别字典配置 */
export const jqTypeMap = new Map()
  .set("20", "治安事件")
  .set("30", "交通事件")
  .set("40", "抢险救援")
  .set("10", "刑事案件")
  .set("50", "群众求助")
  .set("60", "社会联动")
  .set("70", "群体事件")
  .set("80", "灾害事故")
  .set("90", "举报线索")
  .set("95", "投诉监督")
  .set("99", "其它类别");

/** 警情类别字典配置 */
export const jqType = [
  { value: "20", label: "治安事件" },
  { value: "30", label: "交通事件" },
  { value: "40", label: "抢险救援" },
  { value: "10", label: "刑事案件" },
  { value: "50", label: "群众求助" },
  { value: "60", label: "社会联动" },
  { value: "70", label: "群体事件" },
  { value: "80", label: "灾害事故" },
  { value: "90", label: "举报线索" },
  { value: "95", label: "投诉监督" },
  { value: "99", label: "其它类别" },
];

/** 警情执勤状态 */
export const status = [
  {
    value: "30",
    label: "待到场",
    class: "ddc",
    type: "3",
  },
  {
    value: "10",
    label: "待签收",
    class: "dqs",
    type: "2",
  },
  {
    value: "20",
    label: "待签收",
    class: "dqs",
    type: "2",
  },
  {
    value: "40",
    label: "待处置",
    class: "dcz",
    type: "4",
  },
  {
    value: "50",
    label: "待处置",
    class: "dcz",
    type: "4",
  },
  {
    value: "60",
    label: "已完结",
    class: "ywj",
    type: "4",
  },
  {
    value: "100",
    label: "已办结",
    class: "ybj",
    type: "5",
  },
];

/** 警情图片与等级映射 */
export const jqImgs: Record<string, string> = {
  "1": "warn1",
  "2": "warn2",
  "3": "warn3",
  "4": "warn4",
};

/** 设备类型与icon映射 */
export const equipType: Record<string, string> = {
  "jyzbl_jwt": "xiaotubiao-jingwutong1",
  "jyzbl_djj": "xiaotubiao-duijiangji1",
  "jyzbl_zfjly": "xiaotubiao-zhifajiluyi1",
};

/** 处置力量区域类型 */
export const areaType: Record<string, string> = {
  "1": "巡逻区",
  "2": "协作区",
  "3": "支援区",
  "4": "支撑区",
};

/** 处置进度-step类型 */
export const setpType: Record<string, string> = {
  "1": "下发",
  "2": "签收",
  "3": "到场",
  "4": "反馈",
  "5": "处置结果",
};

/** 处置进度-按钮类型 */
export const setpBtn: Record<string, string> = {
  "1": "下发",
  "2": "签收",
  "3": "到场",
  "4": "反馈",
  "5": "完结",
};

/** 处置进度-反馈成功状态图片 */
export const successImg: Record<string, string> = {
  "2": "yqs",
  "3": "ydc",
  "4": "yfk",
  "5": "ybj",
};

/** 处置进度-反馈是否状态图片 */
export const failImg: Record<string, string> = {
  "2": "wqs",
  "3": "wdc",
  "4": "wfk",
  "5": "wbj",
};
/** 警情类型 */
export const jqtype: any = {
  "20": "治安事件",
  "30": "交通事件",
  "40": "抢险救援",
  "10": "刑事案件",
  "50": "群众求助",
  "60": "社会联动",
  "70": "群体事件",
  "80": "灾害事故",
  "90": "举报线索",
  "95": "投诉监督",
  "99": "其它报警类别",
};

/** 执勤状态 */
export const taskStatus = ref<any[]>([
  {
    value: "30",
    label: "待到场",
    color: "var(--main-sider-bg)",
    fontColor: "var(--level-two-text)",
    borderColor: "var(---level-two-text)",
    class: "ddc",
  },
  {
    value: "10",
    label: "待签收",
    color: "var(--main-sider-bg)",
    fontColor: "var(--dot-bg)",
    borderColor: "var(--dot-bg)",
    class: "dqs",
  },
  {
    value: "20",
    label: "待签收",
    color: "var(--main-sider-bg)",
    fontColor: "var(--dot-bg)",
    borderColor: "var(--dot-bg)",
    class: "dqs",
  },
  {
    value: "40",
    label: "待处置",
    color: "var(--main-sider-bg)",
    fontColor: "var(--main-border)",
    borderColor: "var(--main-border)",
    class: "dcz",
  },
  {
    value: "50",
    label: "待处置",
    color: "var(--main-sider-bg)",
    fontColor: "var(--main-border)",
    borderColor: "var(--main-border)",
    class: "dcz",
  },
  {
    value: "60",
    label: "已完结",
    color: "var(--main-sider-bg)",
    fontColor: "var(--complete-text)",
    borderColor: "var(--complete-border)",
    class: "ywj",
  },
  {
    value: "100",
    label: "已办结",
    color: "var(--main-sider-bg)",
    fontColor: "var(--complete-text)",
    borderColor: "var(--complete-border)",
    class: "ywj",
  },
]);
