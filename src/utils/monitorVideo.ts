import { axiosPost } from "@/utils/request";
import { ElMessage } from "element-plus";

interface videoListType {
  cameraGBCode: string;
  cameraGBName: string;
}

/**
 * 打开视频监控
 * @param playType 0-替换模式播放，将从第一个播放串口进行播放，替换原来播放的视频；
 *                 1-追加播放模式，保留当前正在播放的窗口,若空闲窗口已满，这将最早启动播放的窗口覆盖
 * @param videoList 要播放的摄像头集合 [{cameraGBCode-摄像头国标ID，cameraGBName-摄像头名称}]
 * @param CameraNum 默认为0, 传值16为横显
 * @param length 默认为9, 最多可播放视频
 * @param gbIdList 组织机构权限下的所有摄像头国标Id数组，不填为查看所有
 */
export const openVideo = (
  playType: number,
  videoList: videoListType[],
  CameraNum = 0,
  length = 9,
  gbIdList?: string[],
) => {
  const filterList = videoList.filter(
    (item: videoListType) => item.cameraGBCode && item.cameraGBName,
  );
  if (filterList.length > length) {
    ElMessage.warning(`最多可播放${length}条视频`);
    return false;
  }
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.5)",
  });
  const url = "http://127.0.0.1:6565/startPreview";
  const params = {
    playType,
    cameraCount: filterList.length,
    cameralist: filterList,
    gbIdList,
    cameraNum: CameraNum,
  };
  axiosPost(url, params)
    .then((data: string | any) => {
      console.log(data);
      loading.close();
    })
    .catch(() => {
      loading.close();
      ElMessageBox.confirm("请确定已安装视频插件！", "提示", {
        confirmButtonText: "下载插件",
        cancelButtonText: "关闭",
        type: "warning",
      })
        .then(() => {
          window.open($config.videoDownloadPath);
        })
        .catch(() => {
          return false;
        });
    });
};
