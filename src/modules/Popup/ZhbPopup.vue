<template>
  <MoveBox :is-center="true" icon="alarm" width="450px" title="相关警情" @close="handleClose">
    <div class="container">
      <template v-if="list.length > 0">
        <el-scrollbar height="400px" always>
          <div
            v-for="item in list"
            :key="item.id"
            class="list-item button-cursor"
            @click="handleToDetail(item.id)"
          >
            <div class="title">
              <div>
                <span class=""></span>
                {{ item.afAddress }}
              </div>
              <div class="tag">
                <b class="dot" />
                {{ jqLevel?.find((v) => v.value === item?.jqLevel)?.label }}
              </div>
            </div>
            <Desc lable="报警时间：" style="position: relative">
              {{ item?.bjTime }}
              <div
                class="tips"
                :class="'status-' + status?.find((v) => v.value === item?.zlStatus)?.class"
              >
                {{ status?.find((v) => v.value === item?.zlStatus)?.label }}
              </div>
            </Desc>
            <Desc lable="警情类别：">{{ jqTypeMap.get(item?.ajType) || "--" }}</Desc>
            <Desc lable="报警人员：">{{ item?.bjrName }}</Desc>
            <Desc lable="报警电话：">{{ item?.bjrPhone }}</Desc>
            <div v-if="Array.isArray(item?.tags) && item?.tags?.length > 0" class="row">
              <div v-for="(v, i) in item?.tags" :key="i" class="single">
                {{ v }}
              </div>
            </div>
          </div>
        </el-scrollbar>
      </template>
      <JQEmpty v-else class="empty" text="暂无警情数据" />
    </div>
  </MoveBox>
</template>

<script lang="ts" setup>
import { JQEmpty, MoveBox, Desc } from "@/components";
import { usePopup } from "@/hooks/usePopup";
import { getAlarm } from "@/services/alarm";
import { jqTypeMap, status, jqLevel } from "@/views/Main/modules/Alarm/option";
import { AlarmListItem } from "@/services/types/alarmType";
import { Popup } from ".";
import { useTime } from "@/hooks/useJq";

const props = defineProps<{ orgCode: string; width: number; left?: number; top?: number }>();
const router = useRouter();

const { hidePopup } = usePopup();
const { getTime } = useTime();

const list = ref<AlarmListItem[]>([]);

/** 获取警情列表 */
const getAlarmList = (code: string) => {
  const { startTime, endTime } = getTime();
  getAlarm({
    es: startTime,
    ef: endTime,
    status: ["10", "20", "30", "40", "50"],
    level: [],
    orgCode: code,
    size: 100000,
  }).then((res) => {
    list.value = res.data;
  });
};

/** 跳转警情详情 */
const handleToDetail = (id: string) => {
  router.push({ params: { type: "jq" }, query: { jqId: id } });
};

const handleClose = () => {
  hidePopup(Popup.Alarm);
};

onMounted(() => {
  getAlarmList(props.orgCode);
});
</script>

<style lang="scss" scoped>
.container {
  font-family: Source Han Sans CN;
  :deep(.el-scrollbar__view) {
    gap: 12px 0;
    display: flex;
    flex-direction: column;
    padding: 16px 14px;
    box-sizing: border-box;
  }
  :deep(.el-scrollbar__bar.is-vertical) {
    width: 4px !important;
  }
  :deep(.el-scrollbar__thumb) {
    background-color: rgba(84, 221, 255, 0.7) !important;
  }
  .list-item {
    padding: 12px;
    width: 454px;
    box-sizing: border-box;
    font-size: 16px;
    line-height: 28px;
    background: rgba(0, 116, 183, 0.2);
    box-shadow: inset 0px 0px 80px 0px rgba(62, 152, 254, 0.0784);
    border-radius: 4px 4px 4px 4px;
    border: 1px solid #0074b7;
    .title {
      display: flex;
      justify-content: space-between;
      font-size: 20px;
      color: #ffffff;
      margin-bottom: 12px;
      .tag {
        display: flex;
        align-items: center;
        gap: 0 4px;
        font-size: 16px;
        color: #ff8924;
        .dot {
          display: inline-block;
          height: 6px;
          width: 6px;
          padding: 0;
          right: 0;
          border-radius: 50%;
          background: #ff8924;
        }
      }
    }
    $status-colors: (
      ddc: #ffc600,
      dqs: #ff9600,
      dcz: #00fffc,
      ywj: #30ff00,
    );
    .tips {
      width: 60px;
      height: 24px;
      line-height: 24px;
      background: #00af65;
      border-radius: 12px 0px 0px 12px;
      position: absolute;
      right: -12px;
      font-size: 14px;
      top: 50%;
      text-align: center;
      transform: translateY(-50%);
      @each $status, $color in $status-colors {
        &.status-#{$status} {
          background: $color;
        }
      }
    }
    .row {
      display: flex;
      margin-top: 16px;
      gap: 8px 12px;
      flex-wrap: wrap;
    }
    .single {
      display: inline-block;
      height: 20px;
      line-height: 20px;
      padding: 0 6px;
      font-size: 14px;
      text-align: center;
      background: rgba(255, 128, 0, 0.9);
      border-radius: 4px 4px 4px 4px;
      box-sizing: border-box;
    }
  }
  .empty {
    height: 350px;
  }
}
</style>
