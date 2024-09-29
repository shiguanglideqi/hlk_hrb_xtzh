<template>
  <div class="modules-box">
    <Transition :duration="850" name="fade-left">
      <AlarmIndex v-if="isAlarm" />
    </Transition>
    <Transition :duration="850" name="fade-left">
      <EventIndex v-if="!isAlarm" />
    </Transition>
    <teleport to="#auto-box">
      <KeepAlive>
        <LayerCtrl v-if="isAlarm" />
      </KeepAlive>
    </teleport>
  </div>
</template>
<script setup lang="ts">
import AlarmIndex from "./Alarm/index.vue";
import EventIndex from "./Event/index.vue";
import LayerCtrl from "./Ctrl/index.vue";

/** 是否是警情模块 */
const isAlarm = inject("MODULE") as any;
</script>
<style lang="scss" scoped>
.fade-left-enter-active {
  animation: fadeInLeft 0.85s;
}
.fade-left-leave-active {
  animation: fadeOutLeft 0.85s;
}
.fade-right-enter-active {
  animation: fadeInRight 0.85s;
}
.fade-right-leave-active {
  animation: fadeOutRight 0.85s;
}

.fade-left-enter-from,
.fade-left-leave-to,
.fade-right-enter-from,
.fade-right-leave-to {
  opacity: 0;
}

@keyframes fadeInLeft {
  0% {
    transform: translateX(-599px);
    opacity: 0;
  }
  100% {
    transform: translateX(0%);
    opacity: 1;
  }
}
@keyframes fadeInRight {
  0% {
    transform: translateX(599px);
    opacity: 0;
  }
  100% {
    transform: translateX(0%);
    opacity: 1;
  }
}
@keyframes fadeOutLeft {
  0% {
    transform: translateX(0%);
    opacity: 1;
  }
  100% {
    transform: translateX(-599px);
    opacity: 0;
  }
}
@keyframes fadeOutRight {
  0% {
    transform: translateX(0%);
    opacity: 0;
  }
  100% {
    transform: translateX(599px);
    opacity: 1;
  }
}

.modules-box {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
