<template>
  <div class="empty-container">
    <img src="@/assets/images/empty3.png" style="margin-bottom: 5px" />
    <span class="no-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text?: string;
}

withDefaults(defineProps<Props>(), {
  text: "暂无数据",
});
</script>

<style lang="scss" scoped>
.empty-container {
  width: 100%;
  height: 100%;
  min-height: 100px;
  font-size: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-family: Source Han Sans CN;
}
</style>
