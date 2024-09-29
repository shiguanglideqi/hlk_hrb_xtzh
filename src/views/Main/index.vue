<template>
  <div class="main-box">
    <HlkMap @load="handleLoad" />
    <Border>
      <template v-if="isLoad">
        <Header />
        <Modules />
        <Footer />
        <!-- 所有弹出dialog -->
        <component
          :is="item.component"
          v-for="item in modalStore.modalInstanceMap"
          :key="item.type"
        />
      </template>
    </Border>
  </div>
</template>
<script setup lang="ts">
import minemap from "@/components/map/minemap";
import HlkMap from "@/components/map/Map.vue";
import { MapConfig } from "@/components/map/MapConfig";
import { _SharedConfig } from "@/components/map/SharedConfig";
import { Border } from "@/components";
import Header from "./Header.vue";
import Footer from "./Footer.vue";
import Modules from "./modules/index.vue";
import { setInterestPointData, setPoliceData, setVideoData, useDevice } from "@/hooks/sharedData";
import { Dictionary } from "@/common/const";
import { usePopup } from "@/hooks/usePopup";
import { Popup } from "@/modules/Popup";
import { useModalStore } from "@/store/modal";

// const popup = usePopup();
const isLoad = ref(false);
/** 是否是警情模块 */
const isAlarm = ref(true);
provide("MODULE", isAlarm);

const device = useDevice();
const modalStore = useModalStore();
const { showPopup } = usePopup();

const handleLoad = (map: minemap.Map) => {
  isLoad.value = true;
  const loadedLayer = map?.getStyle()?.layers || [];
  const firstID = loadedLayer?.[loadedLayer.length - 1]?.id || "";
  const _config = new MapConfig(map, firstID);
  _config.loadFromJSON(_SharedConfig, true);

  getGeojsonData();
  mapPointer(map);
  setMapEvent(map, _config);
};

/** 设置地图监听事件 */
const setMapEvent = (hlkmap: minemap.Map, _config: MapConfig) => {
  hlkmap.on("click", async (e) => {
    const pos = hlkmap.project(e.lngLat).round();
    const layers = _config.getLayers();
    const features = hlkmap
      ?.queryRenderedFeatures(e.point)
      .filter((item) => layers.find((v) => item.layer.id.indexOf(v) !== -1));
    const [feature = null] = features?.slice(0, 1) || [];
    if (!feature) return;
    if (feature.properties?.cluster) {
      const clusterSource = hlkmap?.getSource(feature.source) as minemap.GeoJSONSource;
      const { cluster_id, point_count } = feature.properties;

      clusterSource?.getClusterLeaves(cluster_id, point_count, 0, (error, children) => {
        if (!error) {
          showPopup(Popup.Cluster, {
            data: children,
            left: pos.x,
            top: pos.y,
          });
        }
      });
    } else if (feature.properties?.popup) {
      showPopup(feature.properties?.popup, {
        properties: feature.properties,
        left: pos.x,
        top: pos.y,
      });
    }
  });
};

/** 获取公用上图数据 */
const getGeojsonData = () => {
  setPoliceData();
  device.getAlarmOrg();
  device.getCarWithPolice();
  device.setDeviceData([
    Dictionary.VEHICLE,
    Dictionary.RECORDER,
    Dictionary.INTERCOM,
    Dictionary.POLICE_TONG,
  ]);
  setVideoData();
  setInterestPointData();
};

/** 图标添加手势按钮 */
const mapPointer = (map: minemap.Map) => {
  const canvas = map.getCanvas();
  map.on("mousemove", (e) => {
    canvas.style.cursor = "";
    const features = map?.queryRenderedFeatures(e.point).filter((item) => {
      if (item.layer.type !== "symbol") return false;
      const _layout = item.layer?.layout as minemap.SymbolLayout;
      return _layout?.["icon-image"] && _layout?.["icon-rotation-alignment"] !== "viewport";
    });
    const [feature = null] = features?.slice(0, 1) || [];
    if (!feature) return;
    canvas.style.cursor = "pointer";
  });
};

onBeforeUnmount(() => {
  const _config = new MapConfig();
  _config.clearMap();
  // popup.closeAllPopup();
});
</script>
<style lang="scss" scoped>
.main-box {
  position: relative;
  width: 100vw;
  height: 100vh;
}
</style>
