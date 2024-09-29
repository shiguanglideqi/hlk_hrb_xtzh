<template>
  <div class="header-box">
    <div class="header">
      <div>1</div>
      <div class="header-text" text="协同指挥">协同指挥</div>
      <div>2</div>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
<style lang="scss" scoped>
.header-box {
  pointer-events: visible;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 93px;
  background: url("/images/img/header.png") no-repeat center;
  background-size: 100%;
  z-index: 1;
  .header {
    display: flex;
    justify-content: space-between;
    .header-text {
      position: relative;
      height: 53px;
      line-height: 48px;
      background: linear-gradient(0deg, #a6faff 0%, #ffffff 50%, #c0fbff 100%);
      text-align: center;
      font-size: 50px;
      letter-spacing: 12px;
      margin-top: 12px;
      font-family: YouSheBiaoTiHei;
      color: #fff;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      &::before {
        content: attr(text);
        position: absolute;
        z-index: -1;
        text-shadow: 3px 0px 8px #011f90;
      }
    }
  }
}
</style>
