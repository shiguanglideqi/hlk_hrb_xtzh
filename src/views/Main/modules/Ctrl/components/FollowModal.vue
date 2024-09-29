<template>
  <div class="hlk-modal">
    <div class="header">
      <div class="header-title">
        <Icon icon="guanzhu-yiguanzhu" style="margin-right: 5px" />
        添加关注
      </div>
      <div class="hlk-modal-close">
        <Icon icon="tongyiguanbianniu" @click="close" />
      </div>
    </div>
    <div class="form">
      <el-form-item label="关注类型">
        <el-select v-model="option" placeholder="请选择" style="width: 100%" :teleported="false">
          <el-option
            v-for="item in options"
            :key="item.id"
            :label="item.typeName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </div>
    <div class="footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handelModalSubmit">完成</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const option = ref("");

const props = defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "submit", value: { id: string; typeName: string }): void; //
}>();

/** 确认弹窗回调 */
const handelModalSubmit = () => {
  const data = props.options.find((item) => item.id === option.value);
  emit("submit", data);
};

const close = () => {
  emit("close");
};
</script>

<style lang="scss" scoped>
.hlk-modal {
  width: 350px;
  background: var(--main-box);
  box-shadow: 0px 0px 30px 1px var(--main-box-border);
  border-radius: 8px 8px 8px 8px;
  opacity: 1;
  border: 1px solid var(--hlk-form-border);
  z-index: 99;

  .header {
    width: 100%;
    height: 45px;
    line-height: 45px;
    padding: 0 15px;
    margin: 0;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid var(--hlk-form-border);
    box-sizing: border-box;

    .header-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--main-title-text);
    }
    .hlk-modal-close {
      cursor: pointer;
      font-size: 16px;
      margin-right: 1px;
    }
  }
}

.form {
  padding: 16px;
  .el-form-item {
    margin-bottom: 0;
  }
}
.footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 62px;
  line-height: 62px;
  padding: 0 14px;
  box-sizing: border-box;
  border-top: 1px solid var(--hlk-form-border);
}
</style>
