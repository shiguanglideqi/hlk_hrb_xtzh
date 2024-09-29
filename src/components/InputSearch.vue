<template>
  <el-input
    v-model:model-value="value"
    class="dark-input"
    clearable
    placeholder="输入关键字搜索"
    v-bind:="$attrs"
    @clear="handleSubmit"
    @keyup.enter.stop.prevent="handleSubmit"
  >
    <template #append>
      <el-button ref="buttonRef" :icon="Search" @click="handleSubmit" />
    </template>
  </el-input>
</template>

<script lang="ts" setup>
import { Search } from "@element-plus/icons-vue";
import { ElInput } from "element-plus";

const buttonRef = ref<InstanceType<typeof ElInput>>();

const emit = defineEmits<{
  (e: "update:modelValue", data: string[] | string): void;
  (e: "submit"): void;
}>();

const props = defineProps<{ modelValue: string }>();

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const handleSubmit = () => {
  emit("submit");
};

defineExpose({
  ref,
});
</script>
<style lang="scss" scoped>
$border-colot: #53b0ff;
.dark-input {
  :deep(.el-input__wrapper) {
    background: rgba(83, 176, 255, 0.1);
    border: 1px solid #53b0ff;
    box-shadow: unset;
    &:hover {
      box-shadow: 0 0 0 1px darken($border-colot, 10%) inset !important;
    }
  }
  :deep(.el-input__inner) {
    color: #ffffff !important;
  }
  :deep(.el-input-group__append, .el-input-group__prepend) {
    background: linear-gradient(0deg, #3a75fe, #5a8cfe);
    color: #ffffff;
    border-color: #38c9ff;
    box-shadow: unset;
    .el-button {
      padding: 8px 0px !important;
      width: 38px !important;
      border-color: transparent !important;
      background-color: transparent !important;
      color: inherit !important;
    }
  }
}
</style>
