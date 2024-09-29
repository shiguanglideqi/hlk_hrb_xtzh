<template>
  <div class="collapse-container">
    <el-scrollbar max-height="500px" :min-size="10">
      <div ref="defaultBox" class="collapse-more">
        <template v-for="(item, index) in data" :key="index">
          <TransitionGroup name="list">
            <div
              v-if="index < showNum || isExpanded"
              class="collapse-item pointer"
              :class="[{ active: isActived(item[props.defaultProps.key]) }]"
              @click="handleClick(item[props.defaultProps.key])"
            >
              <div style="display: flex; align-items: center">
                <div class="collapse-item-text" :title="item[props.defaultProps.label]">
                  {{ item[props.defaultProps.label] }}
                </div>
              </div>
              <div v-if="showCount" class="num-text">{{ item[props.defaultProps.numKey] }}</div>
            </div>
          </TransitionGroup>
        </template>
      </div>
    </el-scrollbar>

    <div
      v-if="data.length > showNum"
      class="expand-btn pointer"
      :style="`transform: rotate(${isExpanded ? '180deg' : '0deg'})`"
      @click="isExpanded = !isExpanded"
    />
  </div>
</template>
<script lang="ts" setup>
type defaultPropsType = {
  label: string;
  icon?: string;
  key: string;
  numKey: string;
};

interface Props {
  showCount?: boolean;
  showNum?: number;
  icon?: string;
  data: any[];
  defaultProps?: defaultPropsType;
  modelValue: string[] | string;
}

const defaultBox = ref<HTMLDivElement>();

const isExpanded = ref(false);

const props = withDefaults(defineProps<Props>(), {
  showCount: true,
  showNum: 6,
  icon: "",
  defaultProps: () => {
    return {
      label: "name",
      icon: "icon",
      key: "key",
      numKey: "num",
    };
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", data: string[] | string): void;
  (e: "onChange", node: string): void;
}>();

/** 判断当前是否选中 */
const isActived = (item: string) =>
  computed(() => {
    // 判断是否是单选
    if (typeof props.modelValue === "string") {
      return props.modelValue === item;
    }
    const actives = new Set(props.modelValue);
    return actives.has(item);
  }).value;

const handleClick = (key: string) => {
  const active = props.modelValue;
  if (typeof active === "string") {
    emit("update:modelValue", key);
    emit("onChange", key);
  } else {
    const setData = new Set(active);
    let _active = JSON.parse(JSON.stringify(active)) as string[];
    if (setData.has(key)) {
      _active = _active.filter((v) => v !== key);
    } else {
      _active = [..._active, key];
    }
    emit("update:modelValue", _active);
    emit("onChange", key);
  }
};
</script>
<style lang="scss" scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.collapse-container {
  position: relative;
  width: 100%;

  :deep(.is-horizontal) {
    display: none !important;
  }

  .collapse-more {
    padding: 12px 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    box-sizing: border-box;
    .collapse-item {
      display: flex;
      justify-content: space-between;
      width: 100%;
      height: 36px;
      line-height: 36px;
      font-size: 16px;
      font-weight: 400;
      color: #ffffff;
      padding: 0 8px;
      background: url("@/assets/images/item.png") no-repeat center;
      background-size: 100% 100%;
      box-sizing: border-box;

      .collapse-item-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100px;
      }
      .collapse-item-icon {
        width: 18px;
        height: 18px;
        margin-right: 6px;
        object-fit: contain;
      }
      &.active {
        background: url("@/assets/images/item-a.png") no-repeat center;
        background-size: 100% 100%;
      }
    }
  }

  .expand-btn {
    width: 100%;
    height: 12px;
    background: url("@/assets/images/collapse-btn.png") no-repeat center;
    background-size: 100% 100%;
  }
}
</style>
