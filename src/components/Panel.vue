<template>
  <div class="panel-container">
    <div v-if="slots.header" class="header">
      <slot name="header"></slot>
    </div>
    <div class="content">
      <template v-if="slots.default">
        <slot></slot>
      </template>
      <template v-else>
        <div class="ellipsis">{{ text }}</div>
      </template>
    </div>
    <div v-if="slots.footer" class="footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
const slots = useSlots();

defineProps<{ text?: string }>();
</script>
<style lang="scss" scoped>
.panel-container {
  width: 100%;
  line-height: 30px;
  font-size: 18px;
  border: 1px solid rgba(0, 116, 183, 0.2);
  background: linear-gradient(360deg, rgba(45, 169, 255, 0.15) 0%, rgba(0, 36, 139, 0.15) 100%);
  box-shadow: inset 0px 0px 80px 1px rgba(62, 152, 254, 0.08);
  border-radius: 4px 4px 4px 4px;
  border-radius: 4px;
  box-sizing: border-box;
  color: #fafafa;
  .content {
    padding: 8px 16px;
  }
  .footer {
    height: 42px;
    line-height: 42px;
    padding: 0 16px;
    border-top: 1px solid rgba(56, 201, 255, 0.2);
    box-sizing: border-box;
    font-size: 16px;
    font-weight: 400;
    color: #38c9ff;
  }
  .header {
    height: 42px;
    line-height: 42px;
    padding: 0 16px;
    border-bottom: 1px solid rgba(56, 201, 255, 0.2);
    box-sizing: border-box;
  }
  .ellipsis {
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}
</style>
