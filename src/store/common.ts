interface MapFilterState {
  /** 用于储存135警员idCard及相关数据 */
  idCards: { [key in string]?: any };
  /** 警情点位 */
  jqLatLng: any;
  /** 已开启路线规划的警员身份身份证号 */
  idCard: string;
  /** 是否有开启的路线规划 */
  isPlanRoute: any;
}

/** 全局通用状态 */
export const useCommonState = defineStore("useCommonState", {
  state: (): MapFilterState => ({
    idCard: "",
    idCards: {},
    jqLatLng: [],
    isPlanRoute: false,
  }),
});
