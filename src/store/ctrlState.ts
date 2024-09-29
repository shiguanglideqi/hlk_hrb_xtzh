import { MapConfig } from "@/components/map/MapConfig";
import { defineStore } from "pinia";

export const useCtrlState = defineStore("ctrlState", {
  state: (): any => ({
    "source-police": [],
    "source-jyzbl_zj_jc": { show: false, isOnline: "" },
    "source-jyzbl_zj_wrj": { show: false, isOnline: "" },
    "source-jyzbl_jwt": { show: false, isOnline: "" },
    "source-jyzbl_djj": { show: false, isOnline: "" },
    "source-jyzbl_zfjly": { show: false, isOnline: "" },
    "source-jyzbl_jk_jklx": [],
    "source-interest-point": [],
    "source-gangting-point": false,
    "source-jingwu-point": false,
    "source-shiji-point": false,
    "source-jianchazhan-point": false,
    "source-zhian-point": false,
    "source-chutu-point": false,
    "source-zhiqin-point": false,
    "source-executives": false,
    "source-precinct": false,
    "source-community": false,
    "source-grid": false,
    "source-hcq": false,
    "source-hhq": false,
    "source-qyq": false,
    "source-xqy": false,
  }),
  actions: {
    /**
     * 获取图层是否显示
     * @param layer 图层名称
     */
    visible(sourceid: string): any {
      if (sourceid in this) {
        return computed({
          get: () => {
            return this[sourceid];
          },
          set: (val) => {
            this[sourceid] = val;
            const _config = new MapConfig();
            _config.setSourceVisible(sourceid, val);
          },
        });
      }
      return false;
    },
    /** 兴趣点位显示隐藏 */
    visibleHotPoint() {
      return computed({
        get: () => this["source-interest-point"],
        set: (val) => {
          this["source-interest-point"] = val;
          const _config = new MapConfig();
          _config.setCommonFilter("source-interest-point", "subClass", val);
        },
      });
    },
    /** 兴趣点位子类显示隐藏 */
    visibleSubPoint(subClass: string) {
      return computed({
        get: () => this["source-interest-point"].includes(subClass),
        set: (val) => {
          if (val) {
            this["source-interest-point"].push(subClass);
          } else {
            this["source-interest-point"] = this["source-interest-point"].filter(
              (v: string) => v !== subClass,
            );
          }
          const _config = new MapConfig();
          _config.setCommonFilter(
            "source-interest-point",
            "subClass",
            this["source-interest-point"],
          );
        },
      });
    },
    /** 警用设备显示隐藏 */
    visibleDevice(sourceid: string) {
      return computed({
        get: () => this[sourceid].show,
        set: (val) => {
          this[sourceid].show = val;
          const _config = new MapConfig();
          if (val) {
            _config.setCommonFilter(sourceid, "isOnline", this[sourceid].isOnline);
          } else {
            _config.clearCommonFilter(sourceid, "isOnline");
          }
        },
      });
    },
    /** 警用设备在线离线显示隐藏 */
    visibleDeviceOnline(sourceid: string) {
      return computed({
        get: () => this[sourceid].isOnline,
        set: (val) => {
          this[sourceid].isOnline = val;
          const _config = new MapConfig();
          _config.setCommonFilter(sourceid, "isOnline", val);
        },
      });
    },
    /** 监控显示隐藏 */
    visibleVideo(subClass: string) {
      return computed({
        get: () =>
          this["source-jyzbl_jk_jklx"].find((v: { subClass: string }) => v.subClass === subClass),
        set: (val) => {
          if (val) {
            this["source-jyzbl_jk_jklx"].push({ subClass, isOnline: true });
          } else {
            const item = this["source-jyzbl_jk_jklx"].filter(
              (v: { subClass: string }) => v.subClass !== subClass,
            );
            this["source-jyzbl_jk_jklx"] = item;
          }
          const _config = new MapConfig();
          _config.setCommonFilter("source-jyzbl_jk_jklx", "video", this["source-jyzbl_jk_jklx"]);
        },
      });
    },
    /** 监控是否在线 */
    visibleVideoOnline(subClass: string) {
      return computed({
        get: () =>
          this["source-jyzbl_jk_jklx"].find((v: { subClass: string }) => v.subClass === subClass)
            ?.isOnline,
        set: (val) => {
          const item = this["source-jyzbl_jk_jklx"].find(
            (v: { subClass: string }) => v.subClass === subClass,
          );
          if (item) {
            item.isOnline = val ? true : "";
          }
          const _config = new MapConfig();
          _config.setCommonFilter("source-jyzbl_jk_jklx", "video", this["source-jyzbl_jk_jklx"]);
        },
      });
    },
    /** 警员显示隐藏 */
    visiblePolice(subClass: string) {
      return computed({
        get: () => this["source-police"].find((v: { subClass: string }) => v.subClass === subClass),
        set: (val) => {
          if (val) {
            this["source-police"].push({ subClass, isOnline: true });
          } else {
            const item = this["source-police"].filter(
              (v: { subClass: string }) => v.subClass !== subClass,
            );
            this["source-police"] = item;
          }
          const _config = new MapConfig();
          _config.setCommonFilter("source-police", "video", this["source-police"]);
        },
      });
    },
    /** 警员是否在线 */
    visiblePoliceOnline(subClass: string) {
      return computed({
        get: () =>
          this["source-police"].find((v: { subClass: string }) => v.subClass === subClass)
            ?.isOnline,
        set: (val) => {
          const item = this["source-police"].find(
            (v: { subClass: string }) => v.subClass === subClass,
          );
          if (item) {
            item.isOnline = val ? true : "";
          }
          const _config = new MapConfig();
          _config.setCommonFilter("source-police", "video", this["source-police"]);
        },
      });
    },
    /** 获取当前警用设备是否在线离线 */
    getDeviceVisible(sourceid: string) {
      return this[sourceid].show;
    },
    /** 设置当前警用设备是否显示 */
    setDeviceVisible(sourceid: string, isShow: boolean, isOnline: boolean | string) {
      this[sourceid].show = isShow;
      this[sourceid].isOnline = isOnline;
    },
    /** 获取当前监控设备选中类型 */
    getVideoActive() {
      return this["source-jyzbl_jk_jklx"].map((v: any) => v.type);
    },
    setVideoActive(active: any) {
      this["source-jyzbl_jk_jklx"] = active;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "ctrlLayerState",
        storage: window.sessionStorage,
      },
    ],
  },
});
