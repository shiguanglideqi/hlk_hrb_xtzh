<template>
  <div class="collapse" :class="{ active: isActive }">
    <div class="collapse-header" :class="{ border: !isActive }" @click="handleToggle">
      <div class="collapse-header-left">
        <template v-if="slots.header">
          <slot name="header"></slot>
        </template>
        <span v-else>{{ title }}</span>
      </div>
      <div class="collapse-header-right">
        <slot name="right"></slot>
        <el-icon v-if="isActive" size="16px" color="#ffffff"><CaretBottom /></el-icon>
        <el-icon v-else size="16px" color="#3de3ff"><CaretRight /></el-icon>
      </div>
    </div>
    <div class="collapse-content" :style="{ maxHeight: maxHeight }">
      <div
        ref="contentRef"
        class="collapse-content-inner"
        :style="`transform: ${isActive ? 'translateY(0)' : 'translateY(-100% - 42px)'}`"
      >
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElIcon } from "element-plus";
import { CaretBottom, CaretRight } from "@element-plus/icons-vue";

const slots = useSlots();

const maxHeight = ref("0px");
const contentRef = ref<HTMLDivElement>();

interface Props {
  show?: boolean;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  title: "",
});

const isActive = ref(props.show);

const bodyHeight = ref(0);

useResizeObserver(contentRef, (entries) => {
  const entry = entries[0];
  const { height } = entry.contentRect;
  if (height > 0 && height !== bodyHeight.value) {
    maxHeight.value = isActive.value
      ? `${contentRef.value ? contentRef.value?.clientHeight : 0}px`
      : "0px";
    bodyHeight.value = height;
  }
});

const emit = defineEmits<{
  (e: "onShow"): void;
}>();

const handleToggle = () => {
  isActive.value = !isActive.value;
  maxHeight.value = isActive.value
    ? `${contentRef.value ? contentRef.value?.clientHeight : 0}px`
    : "0px";
  isActive.value && emit("onShow");
};

watch(
  () => props.show,
  () => {
    isActive.value = props.show;
    maxHeight.value = isActive.value
      ? `${contentRef.value ? contentRef.value?.clientHeight : 0}px`
      : "0px";
    isActive.value && emit("onShow");
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>

<style lang="scss" scoped>
.collapse {
  overflow: hidden;
  transition: max-height 0.5s ease-out;
  .collapse-header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 42px;
    line-height: 42px;
    padding: 0 16px;
    font-size: 18px;
    font-weight: 500;
    color: #ffffff;
    box-sizing: border-box;
    background: rgba(25, 128, 223, 0.2);
  }
  .collapse-content {
    overflow: hidden;
    transition: all 0.5s ease-out;
    .collapse-content-inner {
      transition: transform 0.5s ease-out;
    }
  }

  .collapse-header-right {
    display: flex;
    align-items: center;
  }
}

.collapse.active {
  max-height: none;
}
</style>
