<template>
  <div>
    <el-popover
      ref="popoverRef"
      :virtual-ref="followRef"
      placement="bottom"
      :width="240"
      trigger="click"
      virtual-triggering
      :popper-class="popover['follow-popover-list']"
      v-bind:="$attrs"
      @show="handleShow"
    >
      <el-scrollbar max-height="300px">
        <el-checkbox-group v-model="checkList">
          <div :class="popover.list">
            <el-checkbox v-for="item in options" :key="item.id" :value="item.id">
              {{ item.typeName }}
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </el-scrollbar>
      <div :class="popover['submit-btn']" @click="handleFollow">确定</div>
    </el-popover>
    <div ref="followRef">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElPopover } from "element-plus";
import { isCollect } from "@/common/const";
import { useUser } from "@/store";
import { queryFollow } from "@/services/patrol";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

const followRef = ref<InstanceType<typeof ElPopover>>();
const popoverRef = ref<InstanceType<typeof ElPopover>>();

const userStore = useUser();

const { user } = storeToRefs(userStore);

const checkList = ref([]);
const props = defineProps<{
  data: AnyData;
  options: AnyData;
  keys?: AnyData;
  followType: string;
  code?: string;
}>();

const emit = defineEmits<{
  (e: "onFollow", followTypeList: string[], followTagTypeList: string[], data: AnyData): void;
  (e: "onChangeFollow", followTypeList: string[], followTagTypeList: string[], data: AnyData): void;
  (e: "onCancel", value: AnyData): void;
}>();

const handleFollow = () => {
  const followTypeList = checkList.value.filter((e) => e === props.followType);
  const followTagTypeList = checkList.value.filter((e) => e !== props.followType);
  checkList.value = [];
  if (`${props.data?.[props.keys]}` === isCollect.Yes) {
    emit("onChangeFollow", followTypeList, followTagTypeList, props.data);
    if (followTagTypeList.length > 0 || followTypeList.length > 0) {
      ElMessage.closeAll();
      ElMessage({
        message: "修改关注成功",
        type: "success",
        offset: 92,
      });
    } else {
      ElMessage.closeAll();
      ElMessage({
        message: "取消关注",
        type: "success",
        offset: 92,
      });
    }
  } else {
    emit("onFollow", followTypeList, followTagTypeList, props.data);
    if (followTagTypeList.length > 0 || followTypeList.length > 0) {
      ElMessage.closeAll();
      ElMessage({
        message: "关注成功",
        type: "success",
        offset: 92,
      });
    }
  }
  handlePopoverClose();
};

const handleShow = () => {
  queryFollow({
    policeIdCard: user.value.idCard,
    sourceCode: props.code,
  }).then((res) => {
    checkList.value = res.map((e: { followTagType: string }) => e.followTagType) || [];
  });
};

const handlePopoverClose = () => {
  popoverRef.value?.hide();
};
</script>
<style lang="scss" module="popover">
body {
  .follow-popover-list {
    background: rgba(0, 39, 44, 0.9) !important;
    border: 1px solid #0dc6dc !important;
    :global(.el-popper__arrow) {
      &::before {
        border: 1px solid #0dc6dc !important;
        background: rgba(0, 39, 44, 0.9) !important;
      }
    }
    :global(.el-checkbox__input.is-checked + .el-checkbox__label) {
      color: #0dc6dc !important;
    }
    :global(.el-checkbox__input.is-checked .el-checkbox__inner) {
      background-color: #0dc6dc !important;
      border-color: #0dc6dc !important;
    }
    :global(.el-checkbox) {
      color: #c3c3c3 !important;
    }
    .list {
      padding: 0 12px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
  }

  .submit-btn {
    text-align: center;
    font-size: 18px;
    font-family: YouSheBiaoTiHei;
    font-weight: 400;
    color: #fff;
    width: 60px;
    height: 32px;
    line-height: 32px;
    cursor: pointer;
    user-select: none;
    float: right;
  }

  .submit-btn {
    background: url("@/assets/imageV211/btn-qd.png") no-repeat center;
    background-size: 100% 100%;
    color: #e2f7fc;
    text-shadow: 0px 2px 8px rgba(5, 28, 55, 0.42);
  }
}
</style>
