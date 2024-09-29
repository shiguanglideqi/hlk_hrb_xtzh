const ID = ref("");
const modalShow = createEventHook<string>();
const modalHide = createEventHook();
let func: any;

const useToDetail = () => {
  /**
   * 进入警情详情
   * @param id
   * @param fn
   */
  const toDetail = (id: string, fn?: any) => {
    func = fn;
    ID.value = id;
    modalShow.trigger(id);
  };

  const toBack = () => {
    ID.value = "";
    modalHide.trigger(true);
    func?.();
  };

  return {
    ID,
    toDetail,
    toBack,
    onDetailShow: modalShow.on,
    onDetailHide: modalHide.on,
  };
};

export default useToDetail;
