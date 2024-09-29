<template>
  <div class="description">
    <div class="lable">{{ lable }}</div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
interface Props {
  lable: string;
}

withDefaults(defineProps<Props>(), {
  lable: "",
});
</script>
<style lang="scss" scoped>
.description {
  display: flex;
  align-items: flex-start;
  .lable {
    color: #b2c3d8;
  }
  .content {
    flex: 1;
  }
}
</style>
