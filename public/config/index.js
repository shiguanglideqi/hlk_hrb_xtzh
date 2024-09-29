/* eslint-disable @typescript-eslint/no-unused-vars */
const _mapAddress = "http://192.168.104.246:21180";
const $config = {
  api: "http://192.168.3.237:31443", // 换成线上接口地址
  /** 巡控 */
  patrolApi: "http://192.168.3.237:31443/patrol", // 换成线上接口地址
  /** 1.5接口 */
  api15: "http://192.168.3.237:30023",
  minemap: {
    mapAddress: _mapAddress,
    /** 地图雪碧图图标地址 */
    spriteUrl: [
      "http://localhost:5173/images/sprite/sprite?ddd=123",
      "http://192.168.104.205:9000/hlk-map-service/sprite/sprite?ddd=123",
    ], // localhost:5173 换成线上前端页面访问地址
    style: `${_mapAddress}/service/solu/style/id/222647`,
    key: "16be596e00c44c86bb1569cb53424dc9",
    center: [126.645636, 45.788196], // 设置地图默认中心点
    solution: 12612,
    maxZoom: 16,
    minZoom: 5,
    color: "#ffffff",
    haloColor: "#000000",
  },
};
