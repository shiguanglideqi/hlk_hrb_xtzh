import moment from "moment";

/** 处理警情时间 */
export function useTime() {
  /**
   * @description 获取警情时间
   */
  const getTime = () => {
    const days = moment().format("H");
    let startTime = "";
    let endTime = "";

    /**
     * 判断当前时间是否大于8点
     * 如果当前时间早于8点 返回昨天的早8到今天的早8
     * 如果当前时间大于8点 返回今天的早8到明天的早8
     */
    if (Number(days) < 8) {
      startTime = `${moment().subtract(1, "days").format("YYYY-MM-DD")} 08:00:00`;
      endTime = `${moment().format("YYYY-MM-DD")} 08:00:00`;
    } else {
      startTime = `${moment().format("YYYY-MM-DD")} 08:00:00`;
      endTime = `${moment().subtract(-1, "days").format("YYYY-MM-DD")} 08:00:00`;
    }

    return { startTime, endTime };
  };

  return {
    getTime,
  };
}
