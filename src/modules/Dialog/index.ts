import type { Component } from "vue";

const QrcodeCom = defineAsyncComponent(() => import("./qrcode.vue"));
const TcpzCom = defineAsyncComponent(() => import("./tcpz.vue"));

/** Dialog 枚举值 */
export enum ModalType {
  /** 二维码详情 */
  QRCODE,
  /** 图层自定义配置 */
  TCPZ,
}

export interface ModalDataType {
  [ModalType.QRCODE]: {
    onSubmit?: (value: any) => void;
    onClose?: () => void;
    data: {
      name: string;
      businessKey: string;
      qrType: "report" | "dept" | "car";
    };
  };
  [ModalType.TCPZ]: {
    onSubmit?: (value: string) => void;
    onClose?: () => void;
    data?: any;
  };
}

export const modalComponents: { [key in ModalType]: Component } = {
  [ModalType.QRCODE]: markRaw(QrcodeCom),
  [ModalType.TCPZ]: markRaw(TcpzCom),
};

export interface ModalInstance<T extends ModalType> {
  type: T;
  component: Component;
  data?: ModalDataType[T];
  load: () => void;
  onEnter?: (data?: ModalDataType[T]) => void;
  onExit?: (data?: ModalDataType[T]) => void;
}
