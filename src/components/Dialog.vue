<template>
  <el-dialog
    :class="[dialog.container]"
    :show-close="false"
    align-center
    append-to-body
    destroy-on-close
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    v-bind:="$attrs"
  >
    <template v-if="isShowHeader">
      <div :class="dialog.header">
        <div :class="dialog.title" :text="title">
          <!-- <SvgIcon v-if="icon" :class="dialog.imageSize" :name="icon" /> -->
          <slot name="img"></slot>
          <div :title="title" :class="dialog.titleTxt">
            {{ title }}
          </div>
        </div>
        <div :class="dialog.close">
          <img
            :class="dialog.closeImage"
            src="@/assets/images/close-btn.png"
            @click.capture="handleCancel"
          />
        </div>
      </div>
    </template>
    <div :class="isShowBodyPadding ? dialog.context : ''">
      <slot></slot>
    </div>
    <div v-if="isShowFooter" :class="dialog.footer">
      <el-button v-if="isShowCancel" :class="dialog.btnqu" @click="handleCancel">
        {{ cancelText }}
      </el-button>
      <el-button
        v-if="isShowSubmit"
        :class="dialog.btnconfirm"
        type="primary"
        :loading="submitLoading"
        :disabled="disabled"
        @click="handleSubmit"
      >
        {{ submitText }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
interface Props {
  title: string;
  icon?: string;
  cancelText?: string;
  submitText?: string;
  modalValue?: boolean;
  submitLoading?: boolean;
  isShowFooter?: boolean;
  isShowHeader?: boolean;
  isShowCancel?: boolean;
  isShowSubmit?: boolean;
  disabled?: boolean;
  isShowBodyPadding?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: "",
  icon: "",
  cancelText: "取消",
  submitText: "确定",
  submitLoading: false,
  modalValue: false,
  isShowFooter: true,
  isShowHeader: true,
  isShowCancel: true,
  isShowSubmit: true,
  disabled: false,
  isShowBodyPadding: true,
});

const emit = defineEmits<{
  (e: "submit"): void;
  (e: "close"): void;
}>();

const handleCancel = () => {
  emit("close");
};

const handleSubmit = () => {
  emit("submit");
};
</script>

<style lang="scss" module="dialog">
body {
  .container {
    --dialog-bg: rgba(0, 42, 62, 0.9);
    --dialog-border: rgba(0, 116, 183, 1);
    background: var(--dialog-bg) !important;
    border: 1px solid var(--dialog-border) !important;
    border-radius: 6px !important;
    padding: 0;
    :global(.el-dialog__header) {
      padding: 0px !important;
      margin-right: 0;
    }
    :global(.el-dialog__body) {
      padding: 0px !important;
    }
    .header {
      width: 100%;
      height: 48px;
      line-height: 48px;
      padding: 0 16px;
      margin: 0;
      display: flex;
      border-bottom: 1px solid var(--dialog-border);
      background-size: 1562px 100%;
      justify-content: space-between;
      box-sizing: border-box;
      .title {
        display: flex;
        align-items: center;
        font-size: 18px;
        font-weight: 500;
        color: #ffffff;
        user-select: none;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        width: 200px;
        flex: 1;
        .titleTxt {
          flex: 1;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          padding-right: 12px;
          box-sizing: border-box;
        }

        .imageSize {
          display: inline;
          width: 18px;
          height: 18px;
          margin-right: 8px;
          object-fit: contain;
        }
      }

      .close {
        cursor: pointer;
        user-select: none;
        font-size: 16px;
        display: flex;
        align-items: center;

        .closeImage {
          width: 16px;
          height: 16px;
          object-fit: contain;
          border: 10px solid transparent;
          margin-right: -8px;
        }
      }
    }

    .context {
      padding: 16px;
    }

    .footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      box-sizing: border-box;
      width: 100%;
      height: 62px;
      line-height: 62px;
      padding: 0 15px;
      box-sizing: border-box;
      .btnqu {
        width: 60px;
        text-align: center;
        line-height: 32px;
        height: 32px;
        background: rgba(0, 29, 94, 0.5);
        font-size: 16px;
        font-weight: 400;
        color: #00baff;
        border: 1px solid rgba(93, 193, 255, 0.5);
      }
      .btnconfirm {
        text-align: center;
        line-height: 32px;
        height: 32px;
        background: linear-gradient(360deg, rgba(#3a75fe, 0.8) 0%, rgba(#5a8cfe, 0.8) 100%);
        margin-left: 8px;
        span {
          font-size: 16px;
          font-weight: 400;
          color: #fff;
          line-height: 32px;
        }
      }
    }
  }
}
</style>
