<template>
  <div v-if="data?.length > 0" class="task-container">
    <div class="header-title">关联设备</div>
    <Box padding="4px 0px">
      <div class="content">
        <InfiniteScroll
          scroll-thumb-color="#4ae8fa"
          class="content-list"
          :data="data || []"
          :show-scroll="true"
          height="80px"
        >
          <template #default="{ node }">
            <div class="content-item">
              <div class="content-left">
                <img class="content-icon" :src="getNewPng(node.equipType)" />
                <Cell :label="`${deviceMap.get(node.equipType) || ''}：`" style="flex: 1; width: 0">
                  <div class="desc" :title="node.equipName">
                    {{ node.equipName }}
                  </div>
                </Cell>
                <img
                  v-if="node.equipType === 'jyzbl_zfjly'"
                  src="@/assets/images/rd-zbjk.png"
                  class="icon"
                  @click="handleVisible(node)"
                />
              </div>
              <Online :is-online="node.onlineStatus === DEVICE_STATUS.YES">
                {{ node.onlineStatus === DEVICE_STATUS.NO ? "离线" : "在线" }}
              </Online>
            </div>
          </template>
        </InfiniteScroll>
      </div>
    </Box>
  </div>
</template>

<script lang="ts" setup>
import { Box, InfiniteScroll, Cell, Online } from "@/components";
import { getNewPng } from "@/utils/utils";
import { Dictionary, DEVICE_STATUS } from "@/common/const";

import { openVideo } from "@/utils/monitorVideo";

defineProps<{ data?: any }>();

const deviceMap = new Map<string, string>()
  .set(Dictionary.RECORDER, "执法记录仪")
  .set(Dictionary.INTERCOM, "对讲机")
  .set(Dictionary.POLICE_TONG, "警务通");

const handleVisible = (node: any) => {
  const cameralist = [{ cameraGBCode: node.equipCode, cameraGBName: node.equipName }];
  openVideo(0, cameralist);
};
</script>

<style lang="scss" scoped>
.task-container {
  width: 100%;
  .header-title {
    font-size: 16px;
    line-height: 28px;
    font-weight: 500;
    color: #ffffff;
    margin-top: 4px;
    box-sizing: border-box;
  }

  .content {
    // padding: 4px 12px;
    background: linear-gradient(360deg, rgba(45, 169, 255, 0.149) 0%, rgba(0, 36, 139, 0.149) 100%);
    border: 1px solid rgba(0, 116, 183, 0.2);
    border-radius: 4px;
    box-sizing: border-box;
    .content-list {
      padding: 4px 12px;
    }
    .content-item {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .content-left {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
      }
      .content-icon {
        width: 12px;
        height: 12px;
        object-fit: contain;
        display: inline;
        margin-right: 6px;
      }
      .text {
        flex: 1 1 0%;
        min-width: 0;
      }
      .desc {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding-right: 8px;
        box-sizing: border-box;
      }
    }
    .online {
      font-size: 16px;
      font-weight: 500;
      color: #13ca5c;
    }
  }

  .icon {
    margin: 0 4px;
    cursor: pointer;
    user-select: none;
  }
}
</style>
