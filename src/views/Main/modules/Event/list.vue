<template>
  <div
    v-loading="loading"
    class="list-box"
    element-loading-text="事件数据加载中..."
    element-loading-background="rgba(12, 46 ,50, 0.1)"
  >
    <div class="header">
      <div class="title">涉亚事件信息</div>
      <div class="btn-box">
        <div class="title-btn pointer" :class="[{ drop: !isVisible }]" @click="handleVisble">
          <img src="@/assets/images/eye.png" />
        </div>
        <div class="title-btn pointer"><img src="@/assets/images/reset.png" /></div>
      </div>
    </div>
    <div class="body">
      <div class="odds-box">
        <div class="search">
          <span class="label">事件检索</span>
          <el-input v-model="params.search" style="flex: 1" placeholder="请输入">
            <template #suffix>
              <SearchIcon @click="handleSearch" />
            </template>
          </el-input>
          <div class="btn pointer" @click.stop="isShowSearch = !isShowSearch">高级检索</div>
        </div>
        <template v-if="isShowSearch">
          <teleport to="#auto-box">
            <div ref="searchRef" class="search-box">
              <div class="content">
                <div class="title">
                  <img src="@/assets/images/sea.png" />
                  高级检索
                </div>
                <div class="search-item">
                  <div class="label">报警时间:</div>
                  <div class="context">
                    <el-date-picker
                      v-model="time"
                      type="datetimerange"
                      :teleported="false"
                      :clearable="false"
                      :editable="false"
                      style="width: 100%"
                      format="YYYY-MM-DD HH:mm:ss"
                      start-placeholder="开始时间"
                      end-placeholder="结束时间"
                      :default-time="[
                        new Date(2000, 1, 1, 0, 0, 0),
                        new Date(2000, 2, 1, 23, 59, 59),
                      ]"
                      :prefix-icon="DateIcon"
                      @change="handleDateChange"
                    />
                  </div>
                </div>
                <div class="search-item">
                  <div class="label">时间范围:</div>
                  <div class="context chunk2">
                    <div
                      v-for="item in timeRange"
                      :key="item.value"
                      :class="[{ selected: timeType.includes(item.value) }]"
                      class="tab-item pointer"
                      @click="handleTimeTypeChange(item.value)"
                    >
                      {{ item.label }}
                    </div>
                  </div>
                </div>
                <div class="search-item">
                  <div class="label">警情级别:</div>
                  <div class="context chunk5">
                    <div
                      class="tab-item pointer"
                      :class="[{ selected: isAllLevelSelect }]"
                      @click="handleLevelAll"
                    >
                      全部
                    </div>
                    <div
                      v-for="item in jqLevel"
                      :key="item.value"
                      class="tab-item pointer"
                      :class="[
                        {
                          selected: !isAllLevelSelect && params.level.includes(item.value),
                        },
                      ]"
                      @click="handleLevelChange(item.value)"
                    >
                      {{ item.label }}
                    </div>
                  </div>
                </div>
                <div class="search-item">
                  <div class="label">警情类型:</div>
                  <div class="context">
                    <el-select
                      v-model="params.type"
                      placeholder="请选择"
                      style="width: 100%"
                      :teleported="false"
                      multiple
                      collapse-tags
                      collapse-tags-tooltip
                      clearable
                    >
                      <el-option
                        v-for="item in jqType"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </div>
                </div>
                <div class="search-item">
                  <div class="label">警情标签:</div>
                  <div class="context">
                    <el-tree-select
                      v-model="params.tags"
                      :data="tagTree"
                      placeholder="请选择"
                      style="width: 100%"
                      :teleported="false"
                      :props="{
                        children: 'children',
                        label: 'bqmc',
                        key: 'bqmc',
                        value: 'bqmc',
                        isLeaf: 'leaf',
                      }"
                      lazy
                      multiple
                      clearable
                      :load="loadNode"
                    />
                  </div>
                </div>
                <div class="btn-box">
                  <div class="btn pointer" @click="isShowSearch = false">关闭</div>
                  <div class="btn pointer active" @click="getList()">检索</div>
                </div>
              </div>
            </div>
          </teleport>
        </template>
        <div class="sub-tab">
          <div
            v-for="(item, index) in statusTab"
            :key="index"
            class="sub-tab-item pointer"
            :title="`${item.label}: ${item.value}`"
            @click="handleTabChange(item.key)"
          >
            {{ item.label }}
            <template v-if="item.value > 99">(99+)</template>
            <template v-else>({{ item.value }})</template>
            <div v-if="tabActive === item.key" class="selected" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
const loading = ref(false);

/** 事件图层是否显示 */
const isVisible = ref(false);
</script>
<style lang="scss" scoped>
.list-box {
  pointer-events: visible;
  width: 100%;
  height: 100%;
  .header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 42px;
    line-height: 42px;
    padding: 0 14px 0 44px;
    background: url("/images/img/tab-header.png") no-repeat center;
    background-size: 100%;
    .title {
      font-family: YouSheBiaoTiHei;
      font-weight: 400;
      font-size: 24px;
      color: #ffffff;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }
    .btn-box {
      display: flex;
      gap: 0 4px;
      .title-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 28px;
        background: url("@/assets/images/icon-bg.png") no-repeat center;
        background-size: 100%;
        &.drop {
          opacity: 0.6;
        }
      }
    }
  }
}
</style>
