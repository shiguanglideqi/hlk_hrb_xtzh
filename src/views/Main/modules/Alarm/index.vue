<template>
  <div class="index-box">
    <KeepAlive>
      <List v-if="isShowList" />
    </KeepAlive>
    <!-- <Detail v-if="!isShowList" />
    <teleport to="#alarm">
      <KeepAlive>
        <LayerCtrl v-if="isShowList" />
      </KeepAlive>
    </teleport> -->
  </div>
</template>
<script lang="ts" setup>
import List from "./list.vue";
// import Detail from "./Detail.vue";
// import useToDetail from "./useToDetail";
// import LayerCtrl from "./LayerCtrl.vue";

// const { onDetailShow, onDetailHide } = useToDetail();

const isShowList = ref(true);

// onDetailShow(() => {
//   isShowList.value = false;
// });

// onDetailHide(() => {
//   isShowList.value = true;
// });
</script>
<style lang="scss" scoped>
.index-box {
  position: absolute;
  top: 89px;
  left: 24px;
  width: 448px;
  height: 976px;
  background: url("/images/img/tab-bg.png") no-repeat center;
  background-size: 100% 100%;
  z-index: -1;
}
</style>
