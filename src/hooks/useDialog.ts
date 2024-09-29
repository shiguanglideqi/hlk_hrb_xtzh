import { useModalStore } from "@/store/modal";
import { ModalType, type ModalDataType } from "@/modules/Dialog";

export { ModalDataType as DialogDataType, ModalType as DialogType };

const useDialog = <T extends ModalType>(type: T) => {
  const modalStore = useModalStore();
  const { showModalList } = storeToRefs(modalStore);

  const modalShow = createEventHook<ModalDataType[T]>();
  const modalHide = createEventHook();

  const isShow = computed({
    get: () => new Set([...showModalList.value]).has(type),
    set: (val) => val,
  });

  onMounted(() => {
    modalStore.modalInstanceMap?.[type]?.load();
  });

  modalStore.onEnter(type, (data) => {
    modalShow.trigger(data as any);
  });

  modalStore.onExit(type, () => {
    modalStore.onClose(type);
    modalHide.trigger(true);
  });

  const hideDialog = () => {
    modalStore.hideModal(type);
  };

  return {
    isShow,
    hideDialog,
    onDialogShow: modalShow.on,
    onDialogHide: modalHide.on,
  };
};

export default useDialog;
