import { isNumber, isString, isStringNumber } from "element-plus/es/utils/types";
import { onBeforeUnmount, onMounted, watchEffect } from "vue";
import type { ComputedRef, Ref } from "vue";

function addUnit(value?: string | number, defaultUnit = "px") {
  if (!value) return "";
  if (isNumber(value) || isStringNumber(value)) {
    return `${value}${defaultUnit}`;
  } else if (isString(value)) {
    return value;
  }
  console.warn("binding value must be a string or number");
}

export const useDraggable = (
  targetRef: Ref<HTMLElement | undefined>,
  dragRef: Ref<HTMLElement | undefined>,
  draggable: ComputedRef<boolean>,
  overflow?: ComputedRef<boolean>,
  pos?: ComputedRef<{ left: number; top: number }>,
) => {
  let transform = {
    offsetX: 0,
    offsetY: 0,
  };

  const onMousedown = (_e: MouseEvent) => {
    const downX = _e.clientX;
    const downY = _e.clientY;
    const { offsetX, offsetY } = transform;

    const targetRect = targetRef.value!.getBoundingClientRect();
    const targetLeft = targetRect.left;
    const targetTop = targetRect.top;
    const targetWidth = targetRect.width;
    const targetHeight = targetRect.height;

    const { clientWidth } = document.documentElement;
    const { clientHeight } = document.documentElement;

    const minLeft = -targetLeft + offsetX;
    const minTop = -targetTop + offsetY;
    const maxLeft = clientWidth - targetLeft - targetWidth + offsetX;
    const maxTop = clientHeight - targetTop - targetHeight + offsetY;

    const onMousemove = (e: MouseEvent) => {
      let moveX = offsetX + e.clientX - downX;
      let moveY = offsetY + e.clientY - downY;
      if (!overflow?.value) {
        moveX = Math.min(Math.max(moveX, minLeft), maxLeft);
        moveY = Math.min(Math.max(moveY, minTop), maxTop);
      }

      transform = {
        offsetX: moveX,
        offsetY: moveY,
      };

      if (targetRef.value) {
        // eslint-disable-next-line no-param-reassign
        targetRef.value.style.transform = `translate(${addUnit(moveX)}, ${addUnit(moveY)})`;
      }
    };

    const onMouseup = () => {
      document.removeEventListener("mousemove", onMousemove);
      document.removeEventListener("mouseup", onMouseup);
    };

    document.addEventListener("mousemove", onMousemove);
    document.addEventListener("mouseup", onMouseup);
  };

  const onDraggable = () => {
    if (dragRef.value && targetRef.value) {
      dragRef.value.addEventListener("mousedown", onMousedown);
    }
  };

  const offDraggable = () => {
    if (dragRef.value && targetRef.value) {
      dragRef.value.removeEventListener("mousedown", onMousedown);
    }
  };

  onMounted(() => {
    watchEffect(() => {
      if (draggable.value) {
        onDraggable();
      } else {
        offDraggable();
      }
    });
  });

  watch(
    () => pos?.value,
    () => {
      transform = {
        offsetX: pos?.value.left || 0,
        offsetY: pos?.value.top || 0,
      };
    },
    {
      deep: true,
      immediate: true,
    },
  );

  onBeforeUnmount(() => {
    offDraggable();
  });
};
