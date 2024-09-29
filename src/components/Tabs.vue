<template>
  <div class="tabs-container">
    <div
      v-for="item in data"
      :key="item[props.defaultProps.key]"
      class="tab-item"
      :class="{ active: modelValue === item[props.defaultProps.key] }"
      @click="handleClick(item[props.defaultProps.key])"
    >
      {{ item[props.defaultProps.label] }}
    </div>
  </div>
</template>

<script setup lang="ts">
type defaultPropsType = {
  label: string;
  key: string;
  numKey?: string;
};

interface Props {
  data: any[];
  defaultProps?: defaultPropsType;
  modelValue: string[] | string;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  defaultProps: () => {
    return {
      label: "name",
      key: "key",
      numKey: "num",
    };
  },
});

const repeatLength = computed(() => {
  return props.data ? props.data.length : 0;
});

const emit = defineEmits<{
  (e: "update:modelValue", data: string): void;
  (e: "onChange", data: string): void;
}>();

const handleClick = (key: string) => {
  emit("update:modelValue", key);
  emit("onChange", key);
};
</script>

<style scoped lang="scss">
.tabs-container {
  display: grid;
  grid-template-columns: repeat(v-bind(repeatLength), auto);
  width: 100%;
  height: 32px;
  line-height: 32px;
  background: #005375;
  border-radius: 4px;
  padding: 4px;
  box-sizing: border-box;
  .tab-item {
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 4px;
    font-weight: 500;
    font-size: 14px;
    color: #ffffff;
    cursor: pointer;
    user-select: none;
    &.active {
      background: #00ccff;
    }
  }
}
</style>
