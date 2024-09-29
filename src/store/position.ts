/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";

type ActionState = {
  actionLineRef: any;
  actionDarkLineRef: any;
};

interface ITrackConfig {
  type: "PoliceTrack" | "DeviceTrack" | "CaptureTrack" | "AlarmTrack" | "CheckTrack";
  id: string;
  /** 抓拍图片url */
  url?: string;
  /** 任务id */
  taskId?: string;
  /** 设备图标类型 */
  iconType?: string;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
}

/** 储存全局行动轨迹实列及相关调用方法 */
export const useAction = defineStore("useAction", {
  state: (): ActionState => ({
    actionLineRef: null,
    actionDarkLineRef: null,
  }),
  actions: {
    /** 储存全局行动轨迹实列 */
    setRef(data: any) {
      this.actionLineRef = data;
    },
    /** 储存全局行动轨迹实列 */
    setDarkRef(data: any) {
      this.actionDarkLineRef = data;
    },
    /**
     * 显示行动轨迹
     * @param prarms
     */
    showAction(prarms: ITrackConfig, isDark?: boolean) {
      if (isDark) {
        this.actionDarkLineRef?.setPrarms(prarms);
      } else {
        this.actionLineRef?.setPrarms(prarms);
      }
    },
  },
});
