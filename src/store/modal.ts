/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalDataType, ModalInstance, ModalType, modalComponents } from "@/modules/Dialog";

type modalInstanceMapItem = { [key in ModalType]: ModalInstance<key> };

export const useModalStore = defineStore("modal", () => {
  const modalInstanceMap = ref({} as modalInstanceMapItem);
  const showModalList = ref<ModalType[]>([]);

  /** 页面是否挂载 */
  const isLoad = <T extends ModalType>(modalType: T, data?: ModalDataType[T]) => {
    modalInstanceMap.value?.[modalType]?.onEnter?.(data as any);
  };

  /** 显示单页面 */
  const showModal = <T extends ModalType>(modalType: T, data?: ModalDataType[T]) => {
    try {
      if (modalInstanceMap.value[modalType]) {
        hideModal(modalType);
      }
      if (!modalInstanceMap.value[modalType]) {
        (modalInstanceMap.value[modalType] as ModalInstance<T>) = {
          type: modalType,
          component: modalComponents[modalType],
          data,
          load: () => isLoad(modalType, data),
        };
      } else {
        modalInstanceMap.value[modalType].data = data;
        isLoad(modalType, data);
      }
      showModalList.value.push(modalType);
    } catch (error) {
      console.log("error", error);
    }
  };

  /** 隐藏单页面 */
  const hideModal = <T extends ModalType>(modalType: T) => {
    try {
      const modalInstance = modalInstanceMap.value[modalType] as ModalInstance<T>;
      if (!modalInstance) return;
      modalInstance.onExit?.(modalInstance.data);
      const index = showModalList.value.findIndex((item) => item === modalType);
      if (index !== -1) showModalList.value.splice(index, 1);
      delete modalInstanceMap.value[modalType];
    } catch (error) {
      console.log("error", error);
    }
  };

  const closeModal = () => {
    if (showModalList.value.length !== 0) {
      showModalList.value.forEach((element) => {
        hideModal(element);
      });
    }
    modalInstanceMap.value = {} as modalInstanceMapItem;
  };

  /** 页面进入 */
  const onEnter = <T extends ModalType>(modalType: T, fn: (data?: ModalDataType[T]) => void) => {
    (modalInstanceMap.value[modalType] as ModalInstance<T>).onEnter = fn;
  };

  /** 页面离开 */
  const onExit = <T extends ModalType>(modalType: T, fn: (data?: ModalDataType[T]) => void) => {
    (modalInstanceMap.value[modalType] as ModalInstance<T>).onExit = fn;
  };

  /** 关闭弹窗回调 */
  const onClose = <T extends ModalType>(modalType: T) => {
    (modalInstanceMap.value[modalType].data as any)?.onClose?.();
  };

  return {
    modalInstanceMap,
    showModalList,
    /** 显示单页面 */
    showModal,
    hideModal,
    closeModal,
    onEnter,
    onExit,
    /** 关闭弹窗回调 */
    onClose,
  };
});
