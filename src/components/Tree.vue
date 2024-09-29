<template>
  <div class="dark-tree">
    <div class="scrollbar-dark">
      <el-tree
        ref="treeRef"
        :props="defaultProps"
        highlight-current
        :node-key="defaultProps.key"
        :indent="0"
        v-bind="$attrs"
        :data="list"
        @node-click="handleNodeClick"
      >
        <template #default="{ node }">
          <div class="dark-custom">
            <span class="dark-custom-tree-node">
              <div
                v-if="node.label"
                class="dark-custom-tree-node-left"
                :style="!node.custom ? `padding-left:${18 * (node.level - 1)}px` : ''"
              >
                <el-icon
                  v-if="node.expanded"
                  class="dark-custom-tree-node-icon"
                  :class="[
                    {
                      'dark-custom-tree-node-hidden':
                        !$attrs.lazy && node.childNodes && node.childNodes.length === 0,
                    },
                    { 'active': node.expanded },
                  ]"
                >
                  <CaretBottom />
                </el-icon>
                <el-icon
                  v-else
                  class="dark-custom-tree-node-icon"
                  :class="[
                    {
                      'dark-custom-tree-node-hidden':
                        !$attrs.lazy && node.childNodes && node.childNodes.length === 0,
                    },
                  ]"
                >
                  <CaretRight />
                </el-icon>
                <span style="line-height: 32px">{{ node.data?.[defaultProps.label] }}</span>
                <div
                  v-if="showLine && node.expanded && node.data.data && node.data.data.length === 0"
                  class="dark-custom-divider"
                ></div>
              </div>
              <span v-if="node.label && showButton">
                <slot name="button" :node="node"></slot>
              </span>
              <span v-if="node.label && showCount">
                <template v-if="isOnline === undefined">
                  <span class="dark-custom-text-color">{{ node.data?.[onlineKey] }}</span>
                  <span>/</span>
                  <span class="dark-custom-text-color default-color">
                    {{ node.data?.[totalKey] }}
                  </span>
                </template>
                <template v-else>
                  <span v-if="isOnline || isOnline === ''" class="dark-custom-text-color">
                    {{ node.data?.[onlineKey] }}
                  </span>
                  <span v-if="isOnline === ''">/</span>
                  <span
                    v-if="!isOnline || isOnline === ''"
                    class="dark-custom-text-color default-color"
                    :class="{ 'offline-color': !isOnline && isOnline !== '' }"
                  >
                    {{ node.data?.[totalKey] }}
                  </span>
                </template>
              </span>
            </span>
            <div v-if="node.expanded" style="cursor: default" @click="handleStop">
              <slot :node="node"></slot>
            </div>
          </div>
        </template>
      </el-tree>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ElTree } from "element-plus";
import { CaretRight, CaretBottom } from "@element-plus/icons-vue";
import { TreeNodeData } from "element-plus/es/components/tree/src/tree.type";
import type Node from "element-plus/es/components/tree/src/model/node";

interface NewNode extends Node {
  type: string;
  deptCode: string;
}

const treeRef = ref<InstanceType<typeof ElTree>>();

interface Props {
  defaultProps?: {
    children: string;
    label: string;
    key: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  showCount?: boolean;
  showLine?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isOnline?: any;
  showButton?: boolean;
  onlineKey?: string;
  totalKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  icons: () => [],
  isOnline: undefined,
  defaultProps: () => {
    return {
      children: "children",
      label: "name",
      key: "deptCode",
    };
  },
  onlineKey: "onlineCount",
  totalKey: "totalCount",
});

const list = computed(() => {
  return props.data;
});

onMounted(() => {
  treeRef.value?.store.setData(props.data);
});

const emit = defineEmits<{
  (e: "node-click", node: Node): void;
}>();

const handleStop = (e: Event) => {
  e.stopPropagation();
};

const handleNodeClick = (node: NewNode, TreeNode: TreeNodeData) => {
  if (TreeNode.expanded || TreeNode.childNodes.length === 0) {
    emit("node-click", node);
  }
};

defineExpose({
  refs: treeRef,
});
</script>
<style lang="scss" scoped>
.scrollbar-dark {
  overflow: auto;
  height: 100%;
}

.scrollbar-dark::-webkit-scrollbar {
  width: 4px;
  background: darken(#1fedff, 60%);
}

.scrollbar-dark::-webkit-scrollbar-corner,
/* Scroll bar corner */
.scrollbar-dark::-webkit-scrollbar-thumb,
.scrollbar-dark::-webkit-scrollbar-track {
  border-radius: 10px;
}

.scrollbar-dark::-webkit-scrollbar-corner,
.scrollbar-dark::-webkit-scrollbar-track {
  background-color: rgba($color: #1fedff, $alpha: 0.2);
  box-shadow: inset 0 0 1px rgba($color: #1fedff, $alpha: 0.8);
}

.scrollbar-dark::-webkit-scrollbar-thumb {
  background-color: #1fedff;
}

.dark-custom {
  width: 100%;
}
.dark-custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  padding-right: 8px;
  user-select: none;
  .dark-custom-tree-node-left {
    display: flex;
    .dark-custom-tree-node-icon {
      width: 32px;
      height: 32px;
      text-align: center;
      line-height: 32px;
      &.active {
        color: #1fedff;
      }
    }
    .dark-custom-tree-node-hidden {
      visibility: hidden;
    }
    .dark-custom-tree-node-left-image {
      width: 14px;
      margin-left: 8px;
      object-fit: contain;
    }
    .dark-custom-divider {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      border-bottom: 1px solid var(--main-box-border);
    }
  }
  .dark-custom-text-color {
    color: var(--online-text);
    &.default-color {
      color: #ffffff;
    }
    &.offline-color {
      color: rgba(255, 255, 255, 0.6) !important;
    }
  }
}
.dark-tree {
  box-sizing: border-box;
  width: auto;
  height: 100%;
}

.dark-tree {
  :deep(.el-tree) {
    background: transparent;
    height: 100%;
  }
  :deep(.el-tree-node__label) {
    font-size: var(--el-font-size-base);
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
  }
  :deep(.el-tree-node__content) {
    background-color: transparent;
    color: #ffffff;
    position: relative;
    height: auto !important;
  }
  :deep(.el-tree-node__content:hover) {
    background-color: transparent;
    color: rgba($color: #1fedff, $alpha: 0.7);
  }
  :deep(.el-tree-node__expand-icon) {
    display: none;
  }
  :deep(.el-tree-node:focus > .el-tree-node__content) {
    background-color: transparent;
    color: #1fedff;
  }
  :deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content) {
    background-color: transparent;
    color: #1fedff;
  }
}
</style>
