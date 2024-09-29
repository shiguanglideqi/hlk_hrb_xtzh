<template>
  <div class="icon-button" :class="[{ gray: !isOnline }]">
    <div class="icon-container">
      <img v-if="icon" :src="getNewPng(icon)" class="icon-image" :class="[{ right: isMargin }]" />
      <span v-if="text">{{ text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getNewPng } from "@/utils/utils";

interface Props {
  icon?: string;
  text?: string;
  isOnline?: boolean;
  isMargin?: boolean;
}

withDefaults(defineProps<Props>(), {
  icon: "",
  text: "",
  isOnline: true,
  isMargin: true,
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

  &.gray {
    filter: grayscale(100%);
  }
  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    .icon-image {
      width: 18px;
      height: 18px;
      object-fit: contain;
      &.right {
        margin-right: 6px;
      }
    }
  }
  .text {
    margin-left: 4px;
    color: var(--main);
    font-size: 14px;
  }
}
</style>
