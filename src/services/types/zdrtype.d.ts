/** ZDR列表 */
export interface ZdrData {
  /**
   * 数据列表
   */
  list: List[];
  /**
   * 总数
   */
  total: number;
  [property: string]: any;
}

export interface List {
  /**
   * 主键
   */
  id: string;
  /**
   * 身份证号
   */
  idCard: string;
  /**
   * 姓名
   */
  name: string;
  /**
   * 电话号
   */
  phone: string;
  /**
   * 点位
   */
  point: number[];
  /**
   * 标签
   */
  tags: string[];
  [property: string]: any;
}
