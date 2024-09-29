<template>
  <Panel v-if="type === RM.HOTSPOTS" style="margin: 6px 0" :text="text">
    {{ sourceName }}
    <template #footer>
      <div class="item-footer">
        <div class="select">
          <Button
            icon="rd-dw"
            style="margin-right: 16px"
            text="定位"
            @click="handlePositionClick(id, RM.HOTSPOTS, 'source-interest-point')"
          />
          <Button icon="rd-zbjk" text="一键播放" @click="handleVideoClick()" />
        </div>
        <div class="follow">
          <Button icon="public-gz-a" @click="handleCancelFollow()" />
        </div>
      </div>
    </template>
  </Panel>
  <Panel v-if="type === RM.POLICE_AGENCY" style="margin: 6px 0" :text="text">
    {{ sourceName }}
    <template #footer>
      <div class="item-footer">
        <div class="select">
          <Button
            icon="rd-dw"
            style="margin-right: 16px"
            text="定位"
            @click="handlePositionClick(id, RM.POLICE_AGENCY, sourceType)"
          />
          <!-- <Button icon="rd-zbjk" text="一键播放" @click="handleVideoClick" /> -->
        </div>
        <div class="follow">
          <Button icon="public-gz-a" @click="handleCancelFollow()" />
        </div>
      </div>
    </template>
  </Panel>
  <Panel v-else-if="type === RM.REGION" style="margin: 6px 0">
    <Row>
      <Col flex="auto" class="row" :title="sourceName">
        {{ sourceName }}
      </Col>
      <Col style="display: flex; gap: 12px">
        <Button icon="rd-dw" text="定位" @click="handlePositionClick(id, RM.REGION)" />
        <Button icon="public-gz-a" @click="handleCancelFollow()" />
      </Col>
    </Row>
  </Panel>
  <Panel v-else-if="type === RM.VIDEO_EQUIP" style="margin: 6px 0">
    <el-row justify="space-between">
      <div class="tree-title" :title="sourceName">{{ sourceName }}</div>
      <Online v-if="sourceStatus" :is-online="sourceStatus !== 'OFF'">{{
        sourceStatus === "OFF" ? "离线" : "在线"
      }}</Online>
    </el-row>
    <template #footer>
      <div class="item-footer">
        <div class="select">
          <Button
            icon="rd-dw"
            style="margin-right: 16px"
            text="定位"
            @click="handlePositionClick(id, RM.VIDEO_EQUIP)"
          />
          <Button
            icon="rd-zbjk"
            style="margin-right: 16px"
            text="周边监控"
            @click="handleVideoClick"
          />
          <Button icon="sp-jp" text="纠偏" @click="handleCorrectionClick()" />
        </div>
        <div class="follow">
          <Button icon="public-gz-a" @click="handleCancelFollow()" />
        </div>
      </div>
    </template>
  </Panel>
  <Panel v-else-if="type === RM.POLICE_EQUIP" style="margin: 6px 0">
    <el-row justify="space-between">
      <div class="tree-title" :title="sourceName">
        {{ sourceName }}
      </div>
      <Online :is-online="sourceStatus === `${isOnline.Yes}`">{{
        sourceStatus === `${isOnline.Yes}` ? "在线" : "离线"
      }}</Online>
    </el-row>
    <template #footer>
      <div class="item-footer">
        <div>
          <Button
            style="margin-right: 16px"
            text="定位"
            @click="handlePositionClick(id, RM.POLICE_EQUIP)"
          />
          <Button
            v-if="sourceType && [Dictionary.VEHICLE, Dictionary.RECORDER].includes(sourceType!)"
            style="margin-right: 16px"
            text="预览"
            :class="[{ gray: sourceStatus === `${isOnline.No}` }]"
            @click="sourceStatus === `${isOnline.No}` ? false : handlePreviewClick()"
          />
          <Button
            v-if="sourceType && [Dictionary.INTERCOM, Dictionary.POLICE_TONG].includes(sourceType!)"
            style="margin-right: 16px"
            text="点调"
            :class="[{ gray: sourceStatus === `${isOnline.No}` }]"
            @click="sourceStatus === `${isOnline.No}` ? false : handleCallClick()"
          />
          <Button
            v-if="sourceType && [Dictionary.RECORDER, Dictionary.INTERCOM, Dictionary.POLICE_TONG].includes(sourceType!)"
            style="margin-right: 16px"
            text="融合通讯"
            class="gray"
          />
          <Button
            style="margin-right: 16px"
            :text="isTracking ? '取消跟踪' : '跟踪'"
            :class="[{ gray: sourceStatus === `${isOnline.No}` }]"
            @click="sourceStatus === `${isOnline.No}` ? false : handleStalkingClick()"
          />
          <Button style="margin-right: 16px" text="轨迹" @click="handlePathClick()" />
          <Button
            v-if="sourceType && [Dictionary.VEHICLE].includes(sourceType!  )"
            :text="isAlert ? '取消警视' : '警视'"
            :class="[{ gray: sourceStatus === `${isOnline.No}` }]"
            @click="sourceStatus === `${isOnline.No}` ? false : handlePoliceLook"
          />
        </div>
        <div class="follow">
          <Button icon="public-gz-a" @click="handleCancelFollow()" />
        </div>
      </div>
    </template>
  </Panel>
  <Panel v-else-if="type === RM.DISPOLE" style="margin: 6px 0">
    <Row>
      <Col flex="auto" class="row" :title="sourceName">
        {{ sourceName }}
      </Col>
      <Col style="display: flex; gap: 12px">
        <Button icon="rd-dw" text="定位" @click="handlePositionClick(id, RM.DISPOLE)" />
        <Button icon="public-gz-a" @click="handleCancelFollow()" />
      </Col>
    </Row>
  </Panel>
  <Panel v-else-if="type === RM.MATERIA" style="margin: 6px 0">
    {{ sourceName }}
    <template #footer>
      <Row>
        <Col flex="auto">
          <el-space :size="14" style="height: 100%">
            <Button icon="rd-dw" text="定位" @click="handlePositionClick(id, RM.MATERIA)" />
            <Button
              v-if="$allow('zygl-wzgl-ckwz')"
              icon="materal"
              text="查看物资"
              @click="handleMaterialDetail()"
            />
          </el-space>
        </Col>
        <Col>
          <Button :is-margin="false" icon="public-gz-a" />
        </Col>
      </Row>
    </template>
  </Panel>
  <Panel v-else-if="type === RM.DISPOLE_POINT" style="margin: 6px 0">
    <div class="item-body">
      <div class="select flex-ellipsis" style="flex: 1">
        {{ sourceName }}
      </div>
      <Button
        icon="rd-dw"
        style="margin-right: 16px"
        text="定位"
        @click="handlePositionClick(id, RM.DISPOLE_POINT)"
      />
      <Button icon="public-gz-a" @click="handleCancelFollow()" />
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { Dictionary, RM, isOnline } from "@/common/const";
import { Online } from "@/components/";
import { Button, Panel } from "@/components/UI21";
import { Col, Row } from "@/components/UI21/Grid";

defineProps<{
  type: string;
  sourceName: string;
  text?: string;
  id: string;
  sourceStatus?: string;
  sourceType?: string;
  isAlert?: boolean;
  isTracking?: boolean;
}>();

const emit = defineEmits<{
  /** 定位 */
  (e: "onLocation", id: string, followType: string, layer?: string): void;
  /** 周边视频 */
  (e: "onVideo"): void;
  /** 取消关注 */
  (e: "onFollowCancel"): void;
  /** 预览 */
  (e: "onPreview"): void;
  /** 跟踪 */
  (e: "onStalking"): void;
  /** 轨迹 */
  (e: "onTrack"): void;
  /** 纠偏 */
  (e: "onCorrection"): void;
  /** 物资详情 */
  (e: "onMaterialDetail"): void;
  /** 点调 */
  (e: "onPointCall"): void;
  /** 警视 */
  (e: "onPoliceLook"): void;
}>();

const handlePositionClick = (id: string, followType: string, layer?: string) => {
  emit("onLocation", id, followType, layer);
};

const handleVideoClick = () => {
  emit("onVideo");
};

const handlePoliceLook = () => {
  emit("onPoliceLook");
};

const handleCancelFollow = () => {
  emit("onFollowCancel");
};

const handlePreviewClick = () => {
  console.log("12", 12);
  emit("onPreview");
};

const handleCallClick = () => {
  emit("onPointCall");
};

const handleStalkingClick = () => {
  emit("onStalking");
};

const handlePathClick = () => {
  emit("onTrack");
};

const handleCorrectionClick = () => {
  emit("onCorrection");
};

const handleMaterialDetail = () => {
  emit("onMaterialDetail");
};
</script>

<style scoped lang="scss">
.scroll-box {
  :deep(.el-scrollbar__bar) {
    width: 3px;
  }
}

.item-footer {
  display: flex;
  justify-content: space-between;
  height: 100%;
}

.tree-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select {
  user-select: none;
}

.icon-size {
  :deep(.svg) {
    width: 14px;
    height: 14px;
  }
}

.add {
  position: relative;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
  margin-bottom: 12px;
  :deep(.hlk-modal) {
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
  }
}
.gray {
  color: #adadad;
  filter: grayscale(100%);
}
</style>
