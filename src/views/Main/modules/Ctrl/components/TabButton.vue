<template>
  <div class="online-button button-cursor" :class="{ 'active': active }">
    {{ text }}
    <div class="button-text">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
  active: boolean;
}>();
</script>
<style lang="scss" scoped>
.online-button {
  position: relative;
  height: 24px;
  line-height: 24px;
  padding: 0 6px;
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid #0dc6dc;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #3de3ff;
  &.active {
    border: 1px solid transparent;
    color: #fff;
    &::after {
      content: "";
      position: absolute;
      width: calc(100% - 2px);
      height: calc(100% - 2px);
      background: linear-gradient(0deg, #168da1, #27b2c9);
      border-radius: 4px;
      top: 50%;
      left: 50%;
      z-index: 3;
      transform: translate(-50%, -50%);
    }

    &::before {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 4px;
      background: linear-gradient(0deg, rgba(161, 220, 255, 1), rgba(78, 181, 241, 1));
      z-index: 2;
    }
  }

  .button-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    object-fit: contain;
    z-index: 4;
    width: 100%;
    text-align: center;
  }
}
</style>
