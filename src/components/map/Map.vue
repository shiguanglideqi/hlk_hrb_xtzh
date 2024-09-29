<template>
  <div ref="mapRef" class="map-container"></div>
</template>
<script lang="ts" setup>
import _minemap from "./minemap.js";
import "./minemap.css";

const mapRef = ref<HTMLElement>();

const tile = $config?.minemap?.tiles || "";

onMounted(() => {
  initMap();
});

const emit = defineEmits<{
  (e: "load", map: minemap.Map): void;
}>();

/** 初始化地图 */
const initMap = () => {
  _minemap.domainUrl = $config?.minemap.mapAddress;
  _minemap.dataDomainUrl = $config?.minemap.mapAddress;
  _minemap.serverDomainUrl = $config?.minemap.mapAddress;
  _minemap.serviceUrl = `${$config?.minemap.mapAddress}/service/`;
  _minemap.spriteUrl = [...$config?.minemap?.spriteUrl];

  _minemap.key = $config?.minemap?.key;
  _minemap.solution = $config?.minemap?.solution;
  const map = new _minemap.Map({
    container: mapRef.value!,
    style: $config?.minemap?.style,
    center: $config?.minemap?.center,
    zoom: 14,
    pitch: 10,
    maxZoom: $config?.minemap?.maxZoom,
    minZoom: $config?.minemap?.minZoom,
    bearing: 0,
    projection: "MERCATOR",
    logoControl: false,
  });

  map.on("load", () => {
    loadImage(map);
    if (tile) {
      const imageMapStyle: any = {
        sourceId: "IMAGERY_SOURCE",
        source: {
          "type": "raster",
          "tiles": [tile],
          "tileSize": 256,
        },
        layerId: "IMAGERY",
      };
      map?.addSource(imageMapStyle.sourceId, imageMapStyle.source);
      map?.addLayer({
        id: imageMapStyle.layerId,
        type: "raster",
        source: imageMapStyle.sourceId,
        minzoom: $config?.minemap?.minZoom,
        maxzoom: $config?.minemap?.maxZoom,
      });
    }
    emit("load", map);
  });
};

const stretchImage = [
  { name: "jyzbl_djj", path: "./images/sprite/jyzbl_djj.png" },
  { name: "jyzbl_zj", path: "./images/sprite/jyzbl_zj.png" },
  { name: "jyzbl_jwt", path: "./images/sprite/jyzbl_jwt.png" },
  { name: "jyzbl_zfjly", path: "./images/sprite/jyzbl_zfjly.png" },
  { name: "jyzbl_zj_wrj", path: "./images/sprite/jyzbl_zj_wrj.png" },
  { name: "jyzbl_jk_jklx", path: "./images/sprite/jyzbl_jk_jklx.png" },
  { name: "zgl_jylb", path: "./images/sprite/zgl_jylb.png" },
];

const loadImage = (map: minemap.Map) => {
  stretchImage.forEach((item) => {
    map.loadImage(item.path, (_error: any, image: any) => {
      map.addImage(item.name, image, {
        stretchX: [[44, 68]],
        stretchY: [[18, 38]],
        content: [38, 7, 68, 29],
      });
    });
  });
};
</script>
<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
