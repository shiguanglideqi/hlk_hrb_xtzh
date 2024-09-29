<template>
  <Dialog
    v-model="isShow"
    title="查看详情"
    :width="isCar ? 1050 : 800"
    :close-on-click-modal="false"
    :is-show-footer="false"
    @close="handleClose"
  >
    <div style="display: flex; justify-content: space-around">
      <div class="qr-box">
        <div class="qr-bg">
          <img class="image" :src="src" />
        </div>
        <div class="button button-cursor" @click="saveImg(src)">下载二维码</div>
      </div>
      <div v-if="isCar" class="qr-box">
        <div class="qr-bg">
          <img class="image" :src="src1" />
        </div>
        <div class="button button-cursor" @click="saveImg(src1)">下载二维码</div>
      </div>
    </div>
  </Dialog>
</template>
<script setup lang="ts">
import { Dialog } from "@/components";
import useDialog, { DialogType } from "@/hooks/useDialog";
import { creatQrcode } from "@/services/special";

const { isShow, onDialogShow, hideDialog } = useDialog(DialogType.QRCODE);

const src = ref("");
const src1 = ref("");
const name = ref("");

const isCar = ref(false);

onDialogShow(async (data: any) => {
  name.value = data.data.name;
  if (data.data.qrType === "dept") {
    isCar.value = false;
    creatQrcode({
      qrType: "report",
      businessKey: data.data.businessKey,
      businessType: "dept",
    }).then((res) => {
      src.value = res?.qrCodeUrl || "";
    });
  } else if (data.data.qrType !== "car") {
    isCar.value = false;
    creatQrcode({
      qrType: data.data.qrType,
      businessKey: data.data.businessKey,
    }).then((res) => {
      src.value = res?.qrCodeUrl || "";
    });
  } else {
    isCar.value = true;
    creatQrcode({
      qrType: data.data.qrType,
      businessKey: data.data.businessKey,
      businessType: "duty",
    }).then((res) => {
      src.value = res?.qrCodeUrl || "";
    });
    creatQrcode({
      qrType: data.data.qrType,
      businessKey: data.data.businessKey,
      businessType: "report",
    }).then((res) => {
      src1.value = res?.qrCodeUrl || "";
    });
  }
});

const saveImg = (_src: string) => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", _src, true);
  xhr.responseType = "blob";
  xhr.onload = function () {
    if (xhr.status === 200) {
      const blob = xhr.response;
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${name.value}.png`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  xhr.send();
};

const handleClose = () => {
  hideDialog();
};
</script>
<style lang="scss" scoped>
.qr-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .qr-bg {
    width: 475px;
    height: 475px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #fff;
    box-sizing: border-box;
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;
    font-size: 28px;
    color: #3d3d3d;
    text-align: center;
    margin-bottom: 12px;
  }
  .image {
    width: 425px;
    height: 425px;
  }
  .button {
    width: 100px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    color: rgba(56, 201, 255, 1);
    background: #001d5e;
    border-radius: 4px 4px 4px 4px;
    border: 1px solid #5dc1ff;
  }
}
</style>
