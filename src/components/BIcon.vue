<template>
  <div class="icon-button">
    <div class="icon-container">
      <img v-if="icon" class="icon-image" :src="getNewPng(icon)" />
      <div v-if="text">{{ text }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getNewPng } from "@/utils/utils";

interface Props {
  icon?: string;
  text?: string;
  isActive?: boolean;
}

withDefaults(defineProps<Props>(), {
  icon: "",
  text: "",
  isActive: false,
});
</script>

<style scoped lang="scss">
.icon-button {
  display: inline-block;
  cursor: pointer;
  user-select: none;
  font-size: 16px;
  height: 100%;
  line-height: 20px;
  font-weight: 500;
  color: #4ae8fa;
  .icon-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .icon-image {
    width: 40px;
    height: 40px;
    margin-bottom: 4px;
  }
}
</style>
