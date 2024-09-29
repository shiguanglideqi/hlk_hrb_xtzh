<template>
  <div id="main-box" class="bg-mask" :class="[{ hide: hide }]">
    <div id="auto-box" class="auto-box">
      <slot></slot>
    </div>
    <div id="move-box" class="move-box"></div>
  </div>
</template>

<script lang="ts" setup>
import autofit from "autofit.js";

interface Props {
  hide?: boolean;
}

withDefaults(defineProps<Props>(), {
  hide: false,
});

onMounted(async () => {
  autofit.init({
    dh: 1080,
    dw: 1920,
    el: "#auto-box",
    resize: true,
  });
});
</script>

<style lang="scss" scoped>
.bg-mask {
  pointer-events: none;
  position: absolute;
  background: url("/images/mask.png") no-repeat center;
  background-size: 100% 100%;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 999;
  &.hide {
    background: none;
  }
  .auto-box {
    position: relative;
    width: 100%;
    height: 100%;
  }
}
</style>
