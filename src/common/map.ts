/**
 * @description 绘制点位类别
 * @readonly @enum {string}
 */
export const enum PointType {
  /** @类型 治安岗亭 */
  ZAGT = "qwl_dwlx_zagt",
  /** @类型 市际卡口 */
  SJKK = "qwl_dwlx_sjkk",
  /** @类型 重点场所 */
  ZDCS = "qwl_dwlx_zdcs",
  /** @类型 警务点位 */
  JWDW = "qwl_dwlx_jwdw",
  /** @类型 处突点位 */
  CTDW = "qwl_dwlx_ctdw",
  /** @类型 防空圈 */
  FKQ = "fkq",
  /** @类型 重点目标 */
  FKZDMB = "qwl_dwlx_zdmb",
  /** @类型 卡口点位 */
  KKDW = "qwl_dwlx_xdkd",
  /** @类型 楼栋信息 */
  LDXX = "qwl_dwlx_ldxx",
  /** @类型  公安检查站 */
  GAJCZ = "qwl_dwlx_gajcz",
  /** @类型 治安卡点 */
  ZAKD = "qwl_dwlx_zakd",
  /** @类型 执勤点位 */
  ZQDW = "qwl_dwlx_zqdw",
  LZYC = "qwl_dwlx_lzyc",
}

/**
 * @description 绘制区域类别
 * @readonly @enum {number}
 */
export const enum AreaType {
  /** @类型 行政区域 */
  XZQY = "qwl_qylx_xzqy",
  /** @类型 管辖区域 */
  GXQY = "qwl_qylx_gxqy",
  /** @类型 街道社区 */
  JDSQ = "qwl_qylx_jdsq",
  /** @类型 巡逻区域 */
  XLQY = "qwl_qylx_xlqy",
  /** 环哈圈 */
  HHQ = "qwl_qylx_hhq",
  /** 环城圈 */
  HCQ = "qwl_qylx_hcq",
  /** 区域圈 */
  QYQ = "qwl_qylx_qyq",
  /** 辖区圈 */
  XQQ = "qwl_qylx_xqq",
}
