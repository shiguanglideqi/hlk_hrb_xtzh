<template>
  <div
    ref="el"
    class="infinite-list"
    :class="[{ 'scroll-main': showScroll }]"
    @scroll="debouncedScrollFn"
  >
    <template v-for="(item, index) in filterList" :key="index">
      <slot :node="item" :index="index"></slot>
    </template>
  </div>
</template>
<script setup lang="ts">
interface Props {
  data: any;
  size?: number;
  height?: string;
  showScroll?: boolean;
  scrollBgColor?: string;
  scrollTrackBg?: string;
  scrollThumbColor?: string;
}
const el = ref();
const count = ref(1);

onMounted(() => {
  useInfiniteScroll(
    el,
    () => {
      onLoadMore();
    },
    { distance: 20 },
  );
});

const props = withDefaults(defineProps<Props>(), {
  data: [],
  size: 10,
  height: "300px",
  showScroll: false,
  scrollBgColor: "transparent",
  scrollTrackBg: "#003846",
  scrollThumbColor: "#1fedff",
});

const filterList = computed(() => {
  return props.data.filter((_v: any, i: number) => i <= count.value * props.size) || [];
});

const total = computed(() => Math.ceil(props.data.length / props.size));

const onLoadMore = () => {
  if (count.value === total.value) return;
  count.value++;
};

const emit = defineEmits<{
  (e: "scrollTop", top: number): void;
}>();

/** 滚动条滚动返回 scrollTop */
const debouncedScrollFn = useDebounceFn((event: Event) => {
  const { scrollTop } = event.target as HTMLElement;
  emit("scrollTop", scrollTop || 0);
}, 300);

defineExpose({
  el,
});
</script>

<style scoped lang="scss">
.infinite-list {
  height: 100%;
  max-height: v-bind(height);
  padding: 0;
  margin: 0;
  list-style: none;
  overflow-y: auto;
}

.infinite-list::-webkit-scrollbar {
  display: none;
}

.scroll-main::-webkit-scrollbar {
  display: block;
  width: 4px;
  background: v-bind(scrollBgColor);
}

.scroll-main::-webkit-scrollbar-corner, /* Scroll bar corner */
  .scroll-main::-webkit-scrollbar-thumb,
  .scroll-main::-webkit-scrollbar-track {
  border-radius: 10px;
}
.scroll-main::-webkit-scrollbar-corner,
.scroll-main::-webkit-scrollbar-track {
  background-color: v-bind(scrollTrackBg);
  box-shadow: inset 0 0 1px v-bind(scrollThumbColor);
}
.scroll-main::-webkit-scrollbar-thumb {
  background-color: v-bind(scrollThumbColor);
}
</style>
