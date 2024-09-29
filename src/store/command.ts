/**
 * 下发指令
 */
import { defineStore } from "pinia";

const loginData = JSON.parse(sessionStorage.getItem("loginInfo")!);
export const useCommand = defineStore("darkInstruction", {
  state: (): any => ({
    loginData,
    putUseTo: [], // 调用指令的服务的系统id，必填
    dispatchData: {
      userList: [
        // {
        //   id: "1580453889810993154", // 警员id
        //   deptCode: "230000000000", // 机构编码
        //   fullName: "还是一个警员名字",
        // },
      ], // 下发对象为列表，每个对象必须有 id deptCode fullName 项 可以多条
    },
    path: "", // 当前页面的路由
    status: "0", // 成功返回指令ID， "error" - 错误， "cancel" - 取消
    isShowXfzl: false, // 打开关闭弹窗
    zlId: "", // 下发成功指令ID
    title: "",
  }),
  actions: {
    setdispatchData(data: any) {
      this.dispatchData.userList = data;
    },
    confirm(status: string) {
      // console.log("收到了反馈指令的返回事件，", status);
      this.status = status;
      // 1 - 成功， 2 - 错误， 3 - 取消
    },
    setPath(val: string) {
      this.path = val;
    },
    setPutUseTo(val: string[]) {
      this.putUseTo = val;
    },
  },
});
