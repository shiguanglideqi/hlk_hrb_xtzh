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
    <div v-if="isActive" class="collapse-content">
      <div ref="contentRef" class="collapse-content-inner">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElIcon } from "element-plus";
import { CaretBottom, CaretRight } from "@element-plus/icons-vue";

const slots = useSlots();

// const isActive = ref(false);
// const isMounted = useMounted();
const maxHeight = ref("0px");
const contentRef = ref<HTMLDivElement>();

const isMounted = useMounted();

interface Props {
  show?: boolean;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  title: "",
});

const isActive = ref(props.show);

watch(
  () => props.show,
  () => {
    isActive.value = props.show;
  },
);

watchEffect(async () => {
  if (isMounted.value && isActive.value) {
    maxHeight.value = isActive.value
      ? `${contentRef.value ? contentRef.value?.clientHeight : 0}px`
      : "0px";
  }
});

watchEffect(async () => {
  if (isMounted.value && !isActive.value) {
    maxHeight.value = isActive.value
      ? `${contentRef.value ? contentRef.value?.clientHeight : 0}px`
      : "0px";
  }
});

const handleToggle = () => {
  isActive.value = !isActive.value;
  maxHeight.value = isActive.value
    ? `${contentRef.value ? contentRef.value?.clientHeight : 0}px`
    : "0px";
};
</script>

<style lang="scss" scoped>
.collapse {
  overflow: hidden;
  transition: max-height 0.5s ease-out;
  .collapse-header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 38px;
    line-height: 38px;
    padding: 0 16px;
    font-size: 16px;
    font-weight: 500;
    color: #ffffff;
    box-sizing: border-box;
    // background: rgba($color: #0074b7, $alpha: 0.6);
    border-bottom: 1px solid rgba(56, 201, 255, 0.2);
    border-top: 1px solid rgba(56, 201, 255, 0.2);
    background: rgba(0, 116, 183, 0.5) !important;
    &.border {
      border-bottom: 1px solid rgba($color: #0074b7, $alpha: 0.4);
    }
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
