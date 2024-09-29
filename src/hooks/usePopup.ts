import { popupMap, Popup } from "@/modules/Popup";
import { createVNode, render } from "vue";

const popupInstance = new Map();

export const usePopup = () => {
  const app = getCurrentInstance() as any;

  const genContainer = () => {
    return document.createElement("div");
  };

  /**
   * 显示popup
   * @param key popup 的key
   * @param data 传递给popup的数据
   */
  const showPopup = (key: Popup, data: any) => {
    hidePopup(key);
    if (popupMap.has(key)) {
      const container = genContainer();
      const vnode = createVNode(
        popupMap.get(key),
        {
          ...data,
        },
        null,
      );
      vnode.appContext = app?._context;
      render(vnode, container);
      popupInstance.set(key, container);
    }
  };

  const hidePopup = (key: Popup) => {
    if (popupInstance.has(key)) {
      const vm = popupInstance.get(key);
      render(null, vm);
      popupInstance.delete(key);
    }
  };

  const closeAllPopup = () => {
    popupInstance.forEach((popup) => {
      render(null, popup);
    });
    popupInstance.clear();
  };

  return {
    showPopup,
    hidePopup,
    closeAllPopup,
  };
};
