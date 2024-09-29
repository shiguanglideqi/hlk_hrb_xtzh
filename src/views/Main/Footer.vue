<template>
  <div class="footer-box">
    <div class="footer-btn pointer" :class="[{ selected: isAlarm }]" @click="isAlarm = true">
      涉亚警情
    </div>
    <div class="footer-btn pointer" :class="[{ selected: !isAlarm }]" @click="isAlarm = false">
      涉亚事件
    </div>
  </div>
  <div class="circle"></div>
</template>
<script setup lang="ts">
/** 是否是警情模块 */
const isAlarm = inject("MODULE") as any;
</script>
<style lang="scss" scoped>
.footer-box {
  position: absolute;
  display: flex;
  justify-content: center;
  gap: 0 170px;
  left: 50%;
  bottom: 0;
  width: 1200px;
  height: 86px;
  transform: translateX(-50%);
  background: url("/images/img/footer.png") no-repeat center bottom;
  background-size: 1200px 76px;
  z-index: 1;
  .footer-btn {
    pointer-events: visible;
    width: 126px;
    height: 75px;
    background: url("/images/img/btn.png") no-repeat center;
    background-size: 100%;
    color: #a1f9ff;
    font-weight: 400;
    font-size: 20px;
    line-height: 36px;
    text-align: center;
    filter: drop-shadow(12px 1px 6px rgb(0, 33, 107));
    &.selected {
      background: url("/images/img/btn-a.png") no-repeat center;
      background-size: 100%;
      color: #ffffff;
      filter: drop-shadow(12px 1px 6px #6b2d00);
    }
  }
}
.circle {
  position: absolute;
  left: 50%;
  bottom: 14px;
  pointer-events: visible;
  width: 132px;
  height: 132px;
  background: url("/images/img/main.png") no-repeat center;
  background-size: 100%;
  transform: translateX(-50%);
  z-index: -12;
}
</style>
