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
          :default-props="{ numKey: 'typeCount', label: 'typeName', key: 'typeName' }"
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
            <Panel :style="{ width: `100%` }" style="margin: 6px 6px 6px 0; float: right">
              <Row>
                <Col flex="auto" class="row" :title="item.name">
                  {{ item.name }}
                  <span v-if="item?.idCard">({{ item.idCard }})</span>
                </Col>
              </Row>
              <template #footer>
                <Row>
                  <Col flex="auto" class="row">
                    <Button text="定位" @click="handlePositionClick(item)" />
                  </Col>
                </Row>
              </template>
            </Panel>
          </template>
        </InfiniteScroll>
        <JQEmpty v-if="!isLoading && dataSource.length === 0" text="暂无相关数据" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as turf from "@turf/turf";
import {
  Box,
  InfiniteScroll,
  Button,
  CollapseMore,
  InputSearch,
  Panel,
  JQEmpty,
  Col,
  Row,
} from "@/components";
import { getZdrList, getZdrTag } from "@/services/keyPerson";
import { MapConfig } from "@/components/map/MapConfig";
import { List } from "@/services/types/zdrtype";
import { _ZdrConfig } from "./_CtrlConfig";
import { Popup } from "@/modules/Popup";

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

const list = ref<Record<string, any>[]>([]);
/** 列表参数 */
const params = reactive({
  content: "",
  tags: active,
});

const dataSource = ref<List[]>([]);

const iconObj: Record<string, string> = {
  "在逃人员": "zdr-ztry",
  "刑满释放人员": "zdr-xmsf",
  "监管人员": "zdr-jgry",
  "吸毒人员": "zdr-xdry",
  "涉稳人员": "zdr-swry",
  "精神障碍患者": "zdr-jsza",
  "协同嫌疑人": "zdr-xt",
  "涉毒人员": "zdr-sdry",
};

onMounted(() => {
  _config.loadFromJSON(_ZdrConfig);
  getTagList();
});

onBeforeUnmount(() => {
  _config.clearFromJSON(_ZdrConfig);
});

const handleToSearch = () => {
  isSearch.value = !!text.value;
  params.content = text.value;
  handleChange();
};

const getTagList = () => {
  getZdrTag().then((res) => {
    list.value = res?.map((v) => ({
      ...v,
      key: "cz-xtj",
    }));
  });
};

const handleChange = () => {
  isLoading.value = true;
  getZdrList(params)
    .then((res) => {
      dataSource.value = res.list;
      const features: GeoJSON.Feature[] = [];
      res.list.forEach((item) => {
        if (item?.point?.[0] && item?.point?.[1]) {
          const point = turf.point(item.point, {
            icon: iconObj?.[params.tags] || "zdr-jgry",
            popup: Popup.KeyPerson,
            ...item,
          });
          features.push(point);
        }
      });
      _config.setSource("source-zdr-point", features);
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
    .getFeatureItem<GeoJSON.Point>("source-zdr-point", val.id)
    .then((point) => {
      _config.position(point);
    })
    .catch(() => {
      ElMessage({
        message: "未找到重点人坐标位置",
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
    padding: 12px 6px;
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
