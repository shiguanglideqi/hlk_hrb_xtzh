import { Dictionary } from "@/common/const";

export const _CtrlConfig: MapSetting.RootObject = {
  /** 治安岗亭 */
  "source-gangting-point": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-gangting-point",
        type: "symbol",
        sort: 8,
        filter: ["==", "$type", "Point"],
        layout: {
          "icon-image": ["get", "imageName"],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.6, 8, 0.7, 16, 0.8, 18, 1],
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "text-allow-overlap": false,
          "symbol-sort-key": ["to-number", ["get", "key"]],
          "text-field": "{name}",
          "text-anchor": "top",
          "text-size": 12,
          "text-optional": true,
        },
        paint: {},
      },
      {
        id: "layer-zhian-area",
        type: "fill",
        sort: 8,
        filter: ["!=", "$type", "Point"],
        layout: {
          "visibility": "none",
        },
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
    ],
  },
  /** 警务点位 */
  "source-jingwu-point": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-jingwu-point",
        type: "symbol",
        sort: 8,
        filter: ["==", "$type", "Point"],
        layout: {
          "icon-image": ["get", "imageName"],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.6, 8, 0.7, 16, 0.8, 18, 1],
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "text-allow-overlap": false,
          "symbol-sort-key": ["to-number", ["get", "key"]],
          "text-field": "{name}",
          "text-anchor": "top",
          "text-size": 12,
          "text-optional": true,
        },
        paint: {},
      },
      {
        id: "layer-jingwu-area",
        type: "fill",
        sort: 8,
        filter: ["!=", "$type", "Point"],
        layout: {
          "visibility": "none",
        },
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
    ],
  },
  /** 市际卡口 */
  "source-shiji-point": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-shiji-point",
        type: "symbol",
        sort: 8,
        filter: ["==", "$type", "Point"],
        layout: {
          "icon-image": ["get", "imageName"],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.6, 8, 0.7, 16, 0.8, 18, 1],
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "text-allow-overlap": false,
          "symbol-sort-key": ["to-number", ["get", "key"]],
          "text-field": "{name}",
          "text-anchor": "top",
          "text-size": 12,
          "text-optional": true,
        },
        paint: {},
      },
      {
        id: "layer-shiji-area",
        type: "fill",
        sort: 8,
        filter: ["!=", "$type", "Point"],
        layout: {
          "visibility": "none",
        },
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
    ],
  },
  /** 处突点位 */
  "source-chutu-point": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-chutu-point",
        type: "symbol",
        sort: 8,
        filter: ["==", "$type", "Point"],
        layout: {
          "icon-image": ["get", "imageName"],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.6, 8, 0.7, 16, 0.8, 18, 1],
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "text-allow-overlap": false,
          "symbol-sort-key": ["to-number", ["get", "key"]],
          "text-field": "{name}",
          "text-anchor": "top",
          "text-size": 12,
          "text-optional": true,
        },
        paint: {},
      },
      {
        id: "layer-shiji-area",
        type: "fill",
        sort: 8,
        filter: ["!=", "$type", "Point"],
        layout: {
          "visibility": "none",
        },
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
    ],
  },
  /** 公安检查站 */
  "source-jianchazhan-point": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-jianchazhan-point",
        type: "symbol",
        sort: 8,
        filter: ["==", "$type", "Point"],
        layout: {
          "icon-image": ["get", "imageName"],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.6, 8, 0.7, 16, 0.8, 18, 1],
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "text-allow-overlap": false,
          "symbol-sort-key": ["to-number", ["get", "key"]],
          "text-field": "{name}",
          "text-anchor": "top",
          "text-size": 12,
          "text-optional": true,
        },
        paint: {},
      },
      {
        id: "layer-jianchazhan-area",
        type: "fill",
        sort: 8,
        filter: ["!=", "$type", "Point"],
        layout: {
          "visibility": "none",
        },
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
    ],
  },
  /** 治安卡点 */
  "source-zhian-point": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-zhian-point",
        type: "symbol",
        sort: 8,
        filter: ["==", "$type", "Point"],
        layout: {
          "icon-image": ["get", "imageName"],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.6, 8, 0.7, 16, 0.8, 18, 1],
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "text-allow-overlap": false,
          "symbol-sort-key": ["to-number", ["get", "key"]],
          "text-field": "{name}",
          "text-anchor": "top",
          "text-size": 12,
          "text-optional": true,
        },
        paint: {},
      },
      {
        id: "layer-interest-area",
        type: "fill",
        sort: 8,
        filter: ["!=", "$type", "Point"],
        layout: {
          "visibility": "none",
        },
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
    ],
  },
  /** 执勤点位 */
  "source-zhiqin-point": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-zhiqin-point",
        type: "symbol",
        sort: 8,
        filter: ["==", "$type", "Point"],
        layout: {
          "icon-image": ["get", "imageName"],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.6, 8, 0.7, 16, 0.8, 18, 1],
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "text-allow-overlap": false,
          "symbol-sort-key": ["to-number", ["get", "key"]],
          "text-field": "{name}",
          "text-anchor": "top",
          "text-size": 12,
          "text-optional": true,
        },
        paint: {},
      },
      {
        id: "layer-interest-area",
        type: "fill",
        sort: 8,
        filter: ["!=", "$type", "Point"],
        layout: {
          "visibility": "none",
        },
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
    ],
  },
  /** 行政区域 */
  "source-executives": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-executives-area",
        type: "fill",
        sort: 8,
        layout: {
          "visibility": "none",
        },
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
    ],
  },
  /** 辖区边界 */
  "source-precinct": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-precinct-area",
        type: "fill",
        sort: 8,
        layout: {
          "visibility": "none",
        },
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
    ],
  },
  /** 社区边界 */
  "source-community": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-community-area",
        type: "fill",
        sort: 8,
        layout: {
          "visibility": "none",
        },
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
    ],
  },
  /** 网格边界 */
  "source-grid": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-grid-area",
        type: "fill",
        sort: 8,
        layout: {
          "visibility": "none",
        },
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
    ],
  },
};

export const _AreaConfig: MapSetting.RootObject = {
  /** 环城圈 */
  "source-hcq": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-hcq-area",
        type: "fill",
        sort: 8,
        layout: {
          "visibility": "none",
        },
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
    ],
  },
  /** 环哈圈 */
  "source-hhq": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-hhq-area",
        type: "fill",
        sort: 8,
        layout: {
          "visibility": "none",
        },
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
    ],
  },
  /** 区域圈 */
  "source-qyq": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-qyq-area",
        type: "fill",
        sort: 8,
        layout: {
          "visibility": "none",
        },
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
    ],
  },
  /** 辖区圈 */
  "source-xqy": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-xqy-area",
        type: "fill",
        sort: 8,
        layout: {
          "visibility": "none",
        },
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
    ],
  },
};

/** 一标三实图层配置 */
export const _OneConfig: MapSetting.RootObject = {
  "source-building-point": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
      clusterRadius: 80,
      cluster: true,
    },
    layers: [
      {
        id: "layer-building-cluster",
        type: "symbol",
        filter: ["has", "point_count"],
        layout: {
          "icon-image": Dictionary.LDXX_DJH,
          "icon-anchor": "bottom",
          "text-field": "{point_count} 栋",
          "icon-text-fit": "both",
          "icon-allow-overlap": true,
          "text-allow-overlap": true,
          "text-size": 14,
          "icon-size": 1,
          "text-offset": [0, 0],
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-width": 0.1,
          "text-halo-color": "#ffffff",
        },
      },
      {
        id: "layer-building-point",
        type: "symbol",
        filter: ["!has", "point_count"],
        layout: {
          "icon-image": ["get", "imageName"],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.6, 8, 0.7, 16, 0.8, 18, 1],
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "text-allow-overlap": false,
          "symbol-sort-key": ["to-number", ["get", "key"]],
          "text-field": "{name}",
          "text-anchor": "top",
          "text-size": 12,
          "text-optional": true,
        },
        paint: {},
      },
    ],
  },
  "source-address-point": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
      clusterRadius: 80,
      cluster: true,
    },
    layers: [
      {
        id: "layer-address-cluster",
        type: "symbol",
        filter: ["has", "point_count"],
        layout: {
          "icon-image": Dictionary.DZXX_DJH,
          "icon-anchor": "bottom",
          "text-field": "{point_count} 个",
          "icon-text-fit": "both",
          "icon-allow-overlap": true,
          "text-allow-overlap": true,
          "text-size": 14,
          "icon-size": 1,
          "text-offset": [0, 0],
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-width": 0.1,
          "text-halo-color": "#ffffff",
        },
      },
      {
        id: "layer-address-point",
        type: "symbol",
        filter: ["!has", "point_count"],
        layout: {
          "icon-image": ["get", "imageName"],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.6, 8, 0.7, 16, 0.8, 18, 1],
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "text-allow-overlap": false,
          "symbol-sort-key": ["to-number", ["get", "key"]],
          "text-field": "{name}",
          "text-anchor": "top",
          "text-size": 12,
          "text-optional": true,
        },
        paint: {},
      },
    ],
  },
};

/** 重点人配置 */
export const _ZdrConfig: MapSetting.RootObject = {
  "source-zdr-point": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-zdr-point",
        type: "symbol",
        layout: {
          "visibility": "visible",
          "icon-image": ["get", "icon"],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.35, 8, 0.45, 16, 0.5, 18, 0.7],
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "text-allow-overlap": true,
          "icon-offset": [0, 24],
          "symbol-sort-key": ["to-number", ["get", "key"]],
          "text-field": "{name}",
          "text-anchor": "top",
          "text-size": 12,
          "text-optional": false,
        },
        paint: {},
      },
    ],
  },
};

/** 指挥部配置 */
export const _ZhbConfig: MapSetting.RootObject = {
  "source-zhb-point": {
    config: {
      type: "geojson",
      data: [],
      maxzoom: 18,
    },
    layers: [
      {
        id: "layer-zhb-point",
        type: "symbol",
        layout: {
          "visibility": "visible",
          "icon-image": ["get", "icon"],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.5, 8, 0.6, 16, 0.8, 18, 1],
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "text-allow-overlap": true,
          "icon-offset": [0, 1],
          "symbol-sort-key": ["to-number", ["get", "key"]],
          "text-field": "{zhbName}",
          "text-anchor": "top",
          "text-size": 12,
          "text-optional": false,
        },
        paint: {},
      },
    ],
  },
};
