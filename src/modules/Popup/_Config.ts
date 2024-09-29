/** 警车任务配置 */
export const _CarConfig: MapSetting.RootObject = {
  /** 警车任务巡逻数据源 */
  "source-duty": {
    config: {
      type: "geojson",
      data: [],
    },
    layers: [
      {
        id: "layer-duty-symbol",
        type: "symbol",
        filter: ["==", "$type", "Point"],
        layout: {
          visibility: "visible",
          "icon-image": ["get", "imageName"],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 5, 0.6, 8, 0.7, 16, 0.8, 18, 1],
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "text-allow-overlap": false,
          "text-field": "{name}",
          "text-anchor": "top",
          "text-size": 12,
          "text-optional": true,
        },
        paint: {},
      },
      {
        id: "layer-duty-line",
        type: "line",
        sort: 3,
        filter: ["==", "$type", "LineString"],
        layout: {
          visibility: "visible",
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-width": 8,
          "line-color": "#03c670",
        },
      },
      {
        id: "layer-duty-border",
        type: "line",
        sort: 2,
        filter: ["==", "$type", "LineString"],
        layout: {
          visibility: "visible",
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#ffffff",
          "line-width": 12,
          "line-translate-anchor": "viewport",
        },
      },
      {
        id: "layer-duty-icon",
        type: "symbol",
        filter: ["==", "$type", "LineString"],
        layout: {
          visibility: "visible",
          "text-field": "{name}",
          "symbol-placement": "line",
          "symbol-spacing": 50,
        },
        paint: {
          "icon-opacity": 1,
        },
      },
      {
        id: "layer-precinct",
        type: "fill",
        layout: {
          "visibility": "visible",
        },
        filter: ["==", "$type", "Polygon"],
        paint: {
          "fill-color": ["get", "areaColour"],
          "fill-opacity": 0.4,
          "fill-border-width": ["get", "lineType"],
          "fill-border-color": ["get", "lineColour"],
        },
      },
      {
        id: "layer-precinct-text",
        type: "symbol",
        filter: ["==", "$type", "Polygon"],
        layout: {
          visibility: "visible",
          "text-field": "{name}",
          "icon-allow-overlap": true,
          "text-allow-overlap": false,
          "text-anchor": "top",
          "text-size": ["case", ["has", "textsize"], ["get", "textsize"], 14],
        },
        paint: {
          "text-color": ["case", ["has", "textcolor"], ["get", "textcolor"], "#ffffff"],
          "text-halo-color": "#000000",
          "text-halo-width": 1,
        },
      },
    ],
  },
};

/** 警员相关功能配置 */
export const _Config: MapSetting.RootObject = {
  /** 警员计划路线 */
  "police-plan-route": {
    config: {
      type: "geojson",
      data: [],
    },
    layers: [
      {
        id: "track-line",
        type: "line",
        sort: 3,
        layout: {
          visibility: "visible",
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-width": 8,
          "line-color": "#03c670",
        },
      },
      {
        id: "track-border",
        type: "line",
        sort: 2,
        layout: {
          visibility: "visible",
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#ffffff",
          "line-width": 12,
          "line-translate-anchor": "viewport",
        },
      },
      {
        id: "track-symbol",
        type: "symbol",
        layout: {
          visibility: "visible",
          "symbol-placement": "line",
          "symbol-spacing": 50,
          "icon-image": "arrow",
          "icon-size": 0.3,
        },
        paint: {
          "icon-opacity": 1,
        },
      },
    ],
  },
  "start-end-point": {
    config: {
      type: "geojson",
      data: [],
    },
    layers: [
      {
        id: "start-round-icon",
        type: "symbol",
        layout: {
          visibility: "visible",
          "icon-image": ["get", "bimg"],
          "icon-size": 0.5,
          "icon-allow-overlap": true,
          "text-allow-overlap": true,
          "text-optional": false,
        },
        paint: {},
      },
      {
        id: "start-icon",
        type: "symbol",
        layout: {
          visibility: "visible",
          "icon-anchor": "bottom",
          "icon-image": ["get", "aimg"],
          "icon-size": 1,
          "icon-allow-overlap": true,
          "text-allow-overlap": true,
          "text-optional": false,
        },
        paint: {},
      },
    ],
  },
};
