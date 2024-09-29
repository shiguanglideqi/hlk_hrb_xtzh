<template>
  <div class="online-c" :class="[{ offline: !isOnline }]">
    <div class="dot-c" :class="[{ offline: !isOnline }]"></div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOnline: boolean;
}

withDefaults(defineProps<Props>(), {
  isOnline: false,
});
</script>

<style scoped lang="scss">
.online-c {
  display: flex;
  align-items: center;
  color: rgba(19, 202, 92, 1) !important;
  &.offline {
    color: rgba(255, 255, 255, 0.6) !important;
  }
  .dot-c {
    width: 4px;
    height: 4px;
    background: rgba(19, 202, 92, 1) !important;
    border-radius: 50%;
    margin-right: 5px;
    &.offline {
      background: rgba(255, 255, 255, 0.6) !important;
    }
  }
}
</style>
