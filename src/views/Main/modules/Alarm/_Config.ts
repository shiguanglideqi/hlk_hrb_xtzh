export const _Config: MapSetting.RootObject = {
  /** 警情点 */
  "source-alarm-point": {
    config: {
      type: "geojson",
      data: [],
    },
    layers: [
      {
        id: "layer-alarm",
        type: "symbol",
        layout: {
          "icon-image": ["get", "imageName"],
          "icon-anchor": "bottom",
          "text-field": "{name}",
          "text-offset": [0, 0],
          "text-anchor": "top",
          "text-size": 12,
          "text-optional": true,
          "icon-allow-overlap": true,
          "icon-size": {
            stops: [
              [5, 0.6],
              [6, 0.7],
              [7, 0.8],
              [8, 0.9],
              [9, 1],
              [17, 1],
            ],
          },
        },
        paint: {},
      },
    ],
  },
};

export const _detailConfig: MapSetting.RootObject = {
  /** 周边区域 */
  "source-around-area": {
    config: {
      type: "geojson",
      data: [],
    },
    layers: [
      {
        id: "layer-circle-point",
        type: "symbol",
        filter: ["==", "$type", "Point"],
        layout: {
          "visibility": "visible",
          "icon-image": ["get", "icon"],
          "icon-size": {
            stops: [
              [5, 0.1 * 0.5],
              [6, 0.1 * 0.5],
              [7, 0.1 * 0.5],
              [8, 0.1 * 0.5],
              [9, 0.2 * 0.5],
              [10, 0.3 * 0.5],
              [11, 0.4 * 0.5],
              [12, 0.5 * 0.5],
              [13, 0.6 * 0.5],
              [14, 0.7 * 0.5],
              [15, 0.8 * 0.5],
              [16, 0.9 * 0.5],
              [17, 1 * 0.5],
            ],
          },
          "icon-allow-overlap": true,
          "icon-rotate": ["case", ["has", "rotate"], ["get", "rotate"], 0],
          "text-field": "{name}",
          "text-offset": [0, 0],
          "text-anchor": "top",
          "text-size": 14,
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#ff0000",
        },
      },
      {
        id: "layer-circle-line",
        type: "line",
        layout: {
          "visibility": "visible",
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#FF2828",
          "line-opacity": 1,
          "line-width": 2,
          "line-offset": 1,
          "line-dasharray": [4, 8],
        },
      },
      {
        id: "layer-circle-fill",
        type: "fill",
        layout: {
          "visibility": "visible",
        },
        paint: {
          "fill-color": "#FF2828",
          "fill-opacity": 0.25,
        },
      },
    ],
  },
  /** 135  */
  "source-135-circle": {
    config: {
      type: "geojson",
      data: [],
    },
    layers: [
      {
        id: "layer-135-point",
        type: "symbol",
        filter: ["==", "$type", "Point"],
        layout: {
          "visibility": "visible",
          "icon-image": ["get", "icon"],
          "icon-size": {
            stops: [
              [5, 0.1 * 0.5],
              [6, 0.1 * 0.5],
              [7, 0.1 * 0.5],
              [8, 0.1 * 0.5],
              [9, 0.2 * 0.5],
              [10, 0.3 * 0.5],
              [11, 0.4 * 0.5],
              [12, 0.5 * 0.5],
              [13, 0.6 * 0.5],
              [14, 0.7 * 0.5],
              [15, 0.8 * 0.5],
              [16, 0.9 * 0.5],
              [17, 1 * 0.5],
            ],
          },
          "icon-allow-overlap": true,
          "icon-rotate": ["get", "rotate"],
          "text-field": "{name}",
          "text-offset": [0, 0],
          "text-anchor": "top",
          "text-size": 14,
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#ff0000",
        },
      },
      {
        id: "layer-135-line",
        type: "line",
        layout: {
          "visibility": "visible",
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#FF2828",
          "line-opacity": 1,
          "line-width": 2,
          "line-offset": 1,
          "line-dasharray": [4, 8],
        },
      },
      {
        id: "layer-135-fill",
        type: "fill",
        layout: {
          "visibility": "visible",
        },
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": ["get", "opacity"],
        },
      },
    ],
  },
};
