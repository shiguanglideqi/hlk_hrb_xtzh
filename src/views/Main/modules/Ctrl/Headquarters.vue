<template>
  <div class="control-container">
    <div
      v-loading="isLoading"
      class="box"
      element-loading-text="警用设备加载中..."
      element-loading-background="rgba(122, 122, 122, 0.2)"
    >
      <Box padding="16px 24px 0px 16px">
        <InputSearch v-model="text" @submit="handleToSearch" />
        <CollapseMore
          v-model="active"
          :show-num="8"
          icon="cz-xtj"
          class="collapse-device"
          :data="list"
          @on-change="handleChange"
        />
      </Box>
      <div ref="container" class="xz-container infinite">
        <InfiniteScroll
          v-if="dataSource.length"
          :data="dataSource"
          :show-scroll="true"
          class="scroll"
          scroll-bg-color="transparent"
          scroll-thumb-color="#1fedff"
          :height="`${height}px`"
        >
          <template #default="{ node: item }">
            <div class="list-item">
              <div class="title">
                <div>{{ item.zhbName }}</div>
                <div class="blue">{{ item.sum }}人</div>
              </div>
              <div v-if="item.zhbCy?.length" class="context">
                <div v-for="v in item.zhbCy" :key="v.id" class="user-list">
                  <div class="avatar">
                    <img class="avatar-img" src="@/assets/images/men2.png" />
                  </div>
                  <div class="text-box">
                    <div class="text-title">{{ v.otherPoliceName }}</div>
                    <div>{{ v.otherBelongUnitName }}</div>
                    <div class="row">
                      <div>
                        <img src="@/assets/images/zh.png" alt="" srcset="" />
                        {{ v.otherJob }}
                      </div>
                      <div>
                        <img src="@/assets/images/dh.png" alt="" srcset="" />
                        {{ v.otherPhone }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="footer">
                <Button icon="rd-dw" text="定位" @click="handlePositionClick(item)" />
              </div>
            </div>
          </template>
        </InfiniteScroll>
        <JQEmpty v-if="!isLoading && dataSource.length === 0" text="暂无相关数据" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as turf from "@turf/turf";
import { Box, InfiniteScroll, CollapseMore, InputSearch, JQEmpty, Button } from "@/components";
import { MapConfig } from "@/components/map/MapConfig";
import { List } from "@/services/types/zdrtype";
import { _ZhbConfig } from "./_CtrlConfig";
import { Popup } from "@/modules/Popup";
import { getZhbList, getZhbType } from "@/services/common";

const _config = new MapConfig();

const container = ref<HTMLDivElement>();
const height = computed(() => (container.value ? container.value.clientHeight : 0));

/** loading */
const isLoading = ref(false);
/** 是否有搜索值 */
const isSearch = ref(false);
/** 搜索值 */
const text = ref("");
/** 选中值 */
const active = ref("");

const list = ref<Record<string, any>[]>([
  { name: "全部", key: "sum", num: "0" },
  { name: "市局", key: "qwl_dwlx_ydhzhb_sj", num: "0" },
  { name: "分县局", key: "qwl_dwlx_ydhzhb_fxj", num: "0" },
  { name: "会场", key: "qwl_dwlx_ydhzhb_hc", num: "0" },
]);
/** 列表参数 */
const params = reactive({
  pointSmallType: computed(() => (active.value === "sum" ? "" : active.value)),
  name: text,
});

const dataSource = ref<any[]>([]);

onMounted(() => {
  _config.loadFromJSON(_ZhbConfig);
  getTagList();
});

onBeforeUnmount(() => {
  _config.clearFromJSON(_ZhbConfig);
});

const handleToSearch = () => {
  isSearch.value = !!text.value;
  handleChange();
};

const getTagList = () => {
  getZhbType({ name: text.value }).then((res) => {
    Object.keys(res).forEach((key) => {
      const item = list.value.find((v) => v.key === key);
      if (item) {
        item.num = res[key];
      }
    });
  });
};

const handleChange = () => {
  isLoading.value = true;
  getTagList();
  getZhbList(params)
    .then((res) => {
      dataSource.value = res;
      const features: GeoJSON.Feature[] = [];
      res.forEach((item) => {
        if (item?.zhbDz) {
          const feature = JSON.parse(item?.zhbDz);
          const point = turf.feature(feature, {
            icon: "zhb",
            popup: Popup.Zhb,
            ...item,
          });
          features.push(point);
        }
      });
      _config.setSource("source-zhb-point", features);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

/** 定位 */
const handlePositionClick = (val: List) => {
  _config
    .getFeatureItem<GeoJSON.Point>("source-zhb-point", val.id)
    .then((point) => {
      _config.position(point);
    })
    .catch(() => {
      ElMessage({
        message: "未找到指挥部坐标位置",
        type: "warning",
        offset: 92,
      });
    });
};
</script>

<style lang="scss" scoped>
@import "./ctrl.scss";

.box {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.xz-container {
  padding: 0 6px;
  padding-top: 12px;
  height: 0;
  flex: 1;
  box-sizing: border-box;
  .row {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  &.infinite {
    padding: 12px 18px 12px 6px;
    :deep(.infinite-list) {
      padding: 0 12px;
      box-sizing: border-box;
    }
  }

  :deep(.dark-tree) {
    padding: 0 12px !important;
  }
  :deep(.scrollbar-dark) {
    padding-right: 12px !important;
    box-sizing: border-box;
  }
  .list-item {
    width: 100%;
    background: linear-gradient(180deg, rgba(45, 169, 255, 0.15) 0%, rgba(0, 36, 139, 0.15) 100%);
    border-radius: 4px;
    border: 1px solid rgba(0, 116, 183, 0.2);
    margin-bottom: 12px;
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 42px;
      font-weight: 400;
      font-size: 18px;
      color: #ffffff;
      padding: 0 12px;
      border-bottom: 1px solid rgba(56, 201, 255, 0.2);
      .blue {
        font-weight: 400;
        font-size: 16px;
        color: #38c9ff;
      }
    }
    .context {
      padding: 12px;
      .user-list {
        padding-bottom: 6px;
        display: flex;
        gap: 0 12px;
        border-bottom: 1px solid rgba(56, 201, 255, 0.2);
        &:last-child {
          border-bottom: none;
          padding-bottom: 0px;
        }
      }
      .text-box {
        width: 260px;
        font-weight: 400;
        font-size: 16px;
        line-height: 26px;
        color: #b2c3d8;
        .text-title {
          color: #ffffff;
          font-size: 18px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          div {
            display: flex;
            align-items: center;
            gap: 0 4px;
          }
        }
      }
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 42px;
      font-weight: 400;
      font-size: 18px;
      color: #ffffff;
      padding: 0 12px;
      border-top: 1px solid rgba(56, 201, 255, 0.2);
    }
  }
}

.collapse-device {
  :deep(.num-text) {
    color: #fff !important;
  }
}

.scroll {
  cursor: default;
}

.gray {
  filter: grayscale(100%);
}
</style>
