<template>
  <teleport to="#main-box">
    <div id="move-box" class="move-box">
      <div ref="rootRef" class="popup" :style="{ 'z-index': zIndex }">
        <div class="header">
          <div ref="headerRef" class="left">
            <template v-if="slots.title">
              <slot name="title"></slot>
            </template>
            <div v-else>{{ title }}</div>
          </div>
          <div class="right">
            <template v-if="slots.right">
              <slot name="right"></slot>
            </template>
            <img
              class="close-image"
              src="@/assets/images/close-btn.png"
              @click.capture="handleClose"
            />
          </div>
        </div>
        <slot></slot>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import { useZIndex } from "element-plus";
import { useDraggable } from "@/hooks/useDraggable";

const rootRef = ref<HTMLElement>();
const headerRef = ref<HTMLElement>();

const slots = useSlots();
const { nextZIndex } = useZIndex();

const zIndex = ref(nextZIndex());

interface Props {
  /** 标题 */
  title?: string;
  left?: number;
  top?: number;
  /** 宽度 */
  width?: string;
  /** 是否居中 */
  isCenter?: boolean;
  /** 是否显示头部 */
  isShowHeader?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  left: 0,
  top: 0,
  width: "376px",
  isCenter: false,
  isShowHeader: true,
});

const initPos = ref({
  left: 0,
  top: 0,
});

useDraggable(
  rootRef,
  headerRef,
  computed(() => true),
  computed(() => false),
  computed(() => initPos.value),
);

onMounted(async () => {
  if (!props.isCenter) {
    setBoxPosition();
  }
});

/** 设置位置 */
const setBoxPosition = () => {
  if (rootRef.value && headerRef.value) {
    const { clientWidth } = document.documentElement;
    const { clientHeight } = document.documentElement;
    const halfWidth = clientWidth / 2;
    const halfHeight = clientHeight / 2;
    const left =
      props.left < halfWidth
        ? props.left - halfWidth + headerRef.value.clientWidth / 2
        : props.left - halfWidth - headerRef.value.clientWidth / 2;
    const top =
      props.top > halfHeight
        ? props.top - halfHeight + headerRef.value.clientHeight / 2
        : props.top - halfHeight - headerRef.value.clientHeight / 2;
    rootRef.value!.style.transform = `translate(${left}px, ${top}px)`;
    initPos.value.left = left;
    initPos.value.top = top;
  }
};

const emit = defineEmits<{
  (e: "close"): void;
}>();

const handleClose = () => {
  emit("close");
};

defineExpose({
  el: rootRef,
});
</script>

<style lang="scss" scoped>
.move-box {
  pointer-events: none;
  text-align: center;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;

  &::after {
    content: "";
    display: inline-block;
    height: 100%;
    width: 0;
    vertical-align: middle;
  }

  .popup {
    --popup-border: #0074b7;
    --popup-bg: rgba(0, 42, 62, 0.9);
    pointer-events: visible;
    min-width: v-bind(width);
    height: auto;
    display: inline-block;
    vertical-align: middle;
    background: var(--popup-bg);
    border-radius: 8px;
    border: 1px solid var(--popup-border);
    overflow: hidden;
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
      height: 44px;
      line-height: 44px;
      padding: 0 16px;
      font-size: 18px;
      font-weight: 500;
      font-style: normal;
      color: #ffffff;
      background: url("@/assets/images/header-bg.png") no-repeat left bottom;
      background-size: 400px 30px;
      cursor: move;
      .left {
        flex: 1 1 auto;
        text-align: start;
      }
      .right {
        user-select: none;
        display: flex;
        align-items: center;
      }
      .close-image {
        width: 20px;
        cursor: pointer;
        user-select: none;
      }
    }
  }
}
</style>
