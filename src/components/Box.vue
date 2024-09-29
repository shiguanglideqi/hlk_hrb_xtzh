<template>
  <div class="container" :class="{ 'border-box': isBorder }">
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
interface Props {
  padding?: string;
  isBorder?: boolean;
}

withDefaults(defineProps<Props>(), {
  padding: "12px",
  isBorder: false,
});
</script>
<style lang="scss" scoped>
.container {
  padding: v-bind(padding);
  &.border-box {
    box-sizing: border-box;
  }
}
</style>
