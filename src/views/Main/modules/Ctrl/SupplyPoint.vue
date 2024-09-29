<template>
  <div class="control-container">
    <Box
      v-loading="isLoading"
      padding="16px 24px 0 16px"
      is-border
      class="layout"
      element-loading-text="物资点加载中..."
      element-loading-background="rgba(122, 122, 122, 0.2)"
    >
      <InputSearch v-model="text" placeholder="输入关键字搜索" @submit="handleToSearch" />
      <div class="title-box">
        <div>
          <span>共</span>
          <span class="title-box-color">{{ dataSource.list.length || 0 }}</span>
          <span>个</span>
        </div>
      </div>
      <div v-if="isMounted" ref="container" class="list">
        <InfiniteScroll
          v-if="dataSource.list.length > 0"
          :data="dataSource.list"
          :show-scroll="true"
          class="scroll"
          scroll-bg-color="transparent"
          scroll-thumb-color="#1fedff"
          :height="`${height}px`"
        >
          <template #default="{ node: v }">
            <Panel>
              {{ v.materialName }}
              <template #footer>
                <Row>
                  <Col flex="auto">
                    <el-space :size="14" style="height: 100%">
                      <Button icon="rd-dw" text="定位" @click="handlePositionClick(v)" />
                      <Button
                        v-if="$allow('dark_tckz_wzgl_ckwz', true)"
                        icon="layer_materia"
                        text="查看物资"
                        @click="handleToDetail(v)"
                      />
                    </el-space>
                  </Col>
                  <Col>
                    <Follow
                      keys="isFollowFlag"
                      :data="v"
                      :options="options"
                      :code="v.id"
                      :follow-type="RM.MATERIA"
                      @onFollow="handleFollow"
                      @onChangeFollow="handleFollowUpdate"
                    >
                      <Button
                        :is-margin="false"
                        :icon="`${v?.isFollowFlag}` !== isCollect.Yes ? 'public-gz' : 'public-gz-a'"
                      />
                    </Follow>
                  </Col>
                </Row>
              </template>
            </Panel>
          </template>
        </InfiniteScroll>
        <Empty v-if="!isLoading && dataSource.list.length === 0" text="暂无物资点数据" />
      </div>
    </Box>
  </div>
</template>

<script setup lang="ts">
import { LAYER, RM, isCollect } from "@/common/const";
import { Box, InfiniteScroll } from "@/components";
import { Button, Empty, InputSearch, Panel } from "@/components/UI21";
import { Col, Row } from "@/components/UI21/Grid";
import { useMap } from "@/hooks/dark/map";
import useControl, { LControlType } from "@/hooks/dark/useControl";
import { useOrg, useUser } from "@/store";
import * as turf from "@turf/turf";
import { batchFollowAdd, batchFollowUpdate, queryMaterial } from "./services";

import Follow from "./components/Follow.vue";
import { useFollowType } from "./services/useApi";
import { useLocalState } from "@/store/dark/localState";

const { onControlShow, onControlHide } = useControl(LControlType.WZD);

const { typeData: options } = useFollowType("物资点", RM.MATERIA);

/** 物资点列表数据 */
interface IDataItem {
  followId?: string;
  isFollowFlag: string;
  materialPlaceName: string;
  materialName: string;
  phoneNumber: string;
  dutyPerson: string;
  remark: string;
  positionCoordinate: string;
  id: string;
}

const container = ref<HTMLDivElement>();
const height = computed(() => (container.value ? container.value.clientHeight : 0));

const isLoading = ref(false);
const { position } = useMap()!;
const store = useOrg();
const userstore = useUser();

const { visible } = useLocalState();
const { user } = storeToRefs(userstore);
const { orgCode } = storeToRefs(store);
/** 页面是否挂载 */
const isMounted = useMounted();

const text = ref("");
const params = reactive({
  materialPlaceName: "",
  deptCode: orgCode,
});

/** 物资图层控制 */
const materia = reactive({ select: visible(LAYER.MATERIA) });

const dataSource: { list: IDataItem[] } = reactive({
  list: [],
});

onControlShow(() => {
  materia.select = true;
});

onControlHide(() => {
  materia.select = false;
});

/** 点击定位 */
const handlePositionClick = (val: IDataItem) => {
  if (typeof val?.positionCoordinate === "string") {
    const point = JSON.parse(val?.positionCoordinate);
    const feature = turf.point([point.lng, point.lat]);
    position(feature);
  }
};

/** 关注 */
const handleFollow = (followTypeList: string[], followTagTypeList: string[], data: IDataItem) => {
  batchFollowAdd({
    followTagTypeList,
    followTypeList: followTypeList.length > 0 ? [RM.MATERIA] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.id,
    sourceFollowType: RM.MATERIA,
    sourceName: data.materialName,
  }).then(() => {
    getDataList();
  });
};

/** 更新关注 */
const handleFollowUpdate = (
  followTypeList: string[],
  followTagTypeList: string[],
  data: IDataItem,
) => {
  batchFollowUpdate({
    followTagTypeList,
    followTypeList: followTypeList.length > 0 ? [RM.MATERIA] : [],
    policeIdCard: user.value.idCard,
    sourceCode: data.id,
    sourceFollowType: RM.MATERIA,
    sourceName: data.materialName,
  }).then(() => {
    getDataList();
  });
};

/** 查看物资 */
const handleToDetail = (val: IDataItem) => {
  console.log("val", val);
  // showModal("materialDetail", val?.id);
};

/** 获取区域列表数据 */
const getDataList = async () => {
  try {
    isLoading.value = true;
    const data = await queryMaterial(params);
    dataSource.list = data || [];
  } catch (error) {
    console.log("error", error);
  } finally {
    isLoading.value = false;
  }
};

const handleToSearch = () => {
  params.materialPlaceName = text.value;
};

watchEffect(() => {
  getDataList();
});
</script>

<style lang="scss" scoped>
@import "@/styles/dark.scss";
.control-container {
  .layout {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .title-box {
    margin-top: 12px;
  }
  .list {
    flex: 1;
    min-height: 0;
    padding: 12px 0;

    .scroll {
      display: flex;
      gap: 12px;
      flex-direction: column;
      padding: 0 4px;
      box-sizing: border-box;
    }
  }
}
</style>
