/* eslint-disable no-param-reassign */
import * as turf from "@turf/turf";
import localForage from "localforage";

class MapLayer {
  /** source ID */
  public id: string;
  /** source 配置 */
  public layerConfig: MapSetting.Layer;
  constructor(config: MapSetting.Layer) {
    this.id = config.id;
    this.layerConfig = config;
  }
}

class MapSource {
  /** source ID */
  public id: string;
  /** source 配置 */
  public config: MapSetting.Config;
  /** 图层配置集合 */
  public layers: MapLayer[];
  /** 数据源过滤集合 */
  public filter: Record<string, any>;
  constructor(id: string, config: MapSetting.Config, filter?: Record<string, any>) {
    this.id = id;
    this.config = config;
    this.filter = filter || {};
    this.layers = [];
  }

  addLayer(layerConfig: MapSetting.Layer) {
    const _layerConfig = { ...layerConfig };
    /** 判断图层是否是 symbol 获取缓存的地图文字颜色配置 */
    if (_layerConfig.type === "symbol") {
      const paint = $config.minemap?.color
        ? {
            "text-halo-blur": 1,
            "text-halo-width": 1,
            "text-color": $config.minemap?.color,
            "text-halo-color": $config.minemap?.haloColor,
          }
        : {};
      _layerConfig.paint = {
        ...paint,
        ...layerConfig.paint,
      };
    }
    const layer = new MapLayer(_layerConfig);
    this.layers.push(layer);
  }
}

type OrderItemType = { sort: number; layerId: string };

const symbolOrderItems: OrderItemType[] = [];
const lineOrderItems: OrderItemType[] = [];
const heatmapOrderItems: OrderItemType[] = [];
const fillOrderItems: OrderItemType[] = [];

export class MapConfig {
  private static instance: any | null;
  /** 地图实例 */
  public map: minemap.Map | null = null;
  /** 第一个图层ID */
  public firstID = "";
  /** 常规数据源集合 */
  public sources: Record<string, MapSource> = {};
  /** 共享数据源集合 */
  public sharedSources: Record<string, MapSource> = {};

  constructor(map?: minemap.Map, firstID?: string) {
    if (MapConfig.instance) {
      return MapConfig.instance;
    }
    if (map && firstID) {
      this.map = map;
      this.sources = {};
      this.sharedSources = {};
      this.firstID = firstID;
      localForage.config({
        name: "map",
        storeName: "source",
      });
    }
    MapConfig.instance = this;
  }

  public get _map() {
    return this.map;
  }

  /** 获取除热力图的所有图层 */
  getLayers() {
    const symbolLayers = symbolOrderItems.map((v) => v.layerId);
    const fillLayers = fillOrderItems.map((v) => v.layerId);
    const lineLayers = lineOrderItems.map((v) => v.layerId);
    return [...symbolLayers, ...lineLayers, ...fillLayers];
  }

  /**
   * 设置数据源集合
   * @param source
   * @param shared 是否是共享数据源
   */
  addSourceMap(source: MapSource, shared = false) {
    const target = shared ? this.sharedSources : this.sources;
    if (target[source.id]) return;
    target[source.id] = source;
  }

  /**
   * 设置数据源
   * @param sourceID 数据源id
   * @param feature 数据集合
   * @param isCache 是否缓存
   * @returns
   */
  async setSource(sourceID: string, feature: GeoJSON.Feature[], isCache = true) {
    const _source = this.map?.getSource(sourceID) as minemap.GeoJSONSource;
    if (!_source) return console.warn(`未找到数据源 ID: ${sourceID}`);
    const _feature = this.filterData(sourceID, feature);
    isCache && (await localForage.setItem(sourceID, feature));
    this.setBorderSource(sourceID, _feature);
    _source.setData({ type: "FeatureCollection", features: [..._feature] });
    return true;
  }

  /**
   * 设置边框数据源
   * @param sourceID 数据源id
   * @param feature 数据集合
   */
  setBorderSource(sourceID: string, feature: GeoJSON.Feature[]) {
    const _borderSource = this.map?.getSource(`${sourceID}-border`) as minemap.GeoJSONSource;
    const borderSource =
      this.sources[`${sourceID}-border`] || this.sharedSources[`${sourceID}-border`];
    /** 如果有border 则添加border feature 到 FeatureCollection */
    if (borderSource && _borderSource) {
      const lineFeature: GeoJSON.Feature<GeoJSON.LineString>[] = [];
      feature.forEach((data) => {
        if (data.geometry.type === "MultiPolygon" || data.geometry.type === "Polygon") {
          const line = turf.polygonToLine(data as GeoJSON.Feature<GeoJSON.MultiPolygon>) as any;
          if (line.type === "FeatureCollection") {
            lineFeature.push(...line.features);
          } else {
            lineFeature.push(line);
          }
        }
      });
      _borderSource.setData({ type: "FeatureCollection", features: [...lineFeature] });
    }
  }

  /**
   * 单个图层是否显示
   * @param layerID 图层id
   * @param visible
   */
  setLayerVisible(layerID: string, visible: boolean) {
    const _layer = this.map?.getLayer(layerID);
    if (_layer) {
      this.map?.setLayoutProperty(layerID, "visibility", visible ? "visible" : "none");
    }
    /** 判断是否带边框 */
    const _borderLayer = this.map?.getLayer(`${layerID}-border`);
    if (_borderLayer) {
      this.map?.setLayoutProperty(`${layerID}-border`, "visibility", visible ? "visible" : "none");
    }
  }

  /**
   * 是否显示图层 可多个图层id
   * @param layerID 图层id
   * @param visible
   */
  setVisible(layerID: string | string[], visible: boolean) {
    if (Array.isArray(layerID)) {
      layerID.forEach((id) => {
        this.setLayerVisible(id, visible);
      });
    } else {
      this.setLayerVisible(layerID, visible);
    }
  }

  /**
   * 是否显示数据源图层
   * @param sourceId id
   * @param visible
   */
  setSourceVisible(sourceId: string, visible: boolean) {
    const target = this.sharedSources[sourceId] || this.sources[sourceId];
    if (!target) return;
    target.layers.forEach((layer) => {
      layer.layerConfig.layout.visibility = visible ? "visible" : "none";
      this.setLayerVisible(layer.id, visible);
    });
  }

  /**
   * 获取数据源图层是否有显示的
   * @param sourceId id
   */
  getSourceVisible(sourceId: string) {
    const target = this.sharedSources[sourceId] || this.sources[sourceId];
    if (!target) return;

    return target.layers.some((layer) => {
      const _layer = this.map?.getLayer(layer.id);
      if (_layer) {
        return this.map?.getLayoutProperty(layer.id, "visibility") === "visible";
      } else {
        return false;
      }
    });
  }

  /**
   * 获取图层数据源的单个数据
   * @param {string} sourceId 查询的数据源id
   * @param {string | string[]} data 查询的id 可以为数组
   * @param {string} key 过滤的类型 默认过滤id
   *
   * @example
   * getFeatureItem(sourceId, 'xxxx')
   * getFeatureItem(sourceId, ['xxxx'])
   */
  async getFeatureItem<G extends GeoJSON.Geometry | null = GeoJSON.Geometry>(
    sourceId: string,
    data: string,
    key = "id",
  ): Promise<GeoJSON.Feature<G>> {
    const source = await this.getRawSource(sourceId);
    if (source) {
      const feature = source.find((item) => item?.properties?.[key] === data) as GeoJSON.Feature<G>;
      if (feature) {
        return feature;
      } else {
        throw new Error(`未找到数据：${data}`);
      }
    }
    throw new Error(`未找到数据源：${sourceId}`);
  }

  /** 设置点位纠偏坐标  */
  setFeatureItem = (sourceId: string, data: any, id: string, key = "id") => {
    const features = this.getMapSource(sourceId);
    if (features) {
      const feature = features.find(
        (v) => v.properties?.[key] === id,
      ) as GeoJSON.Feature<GeoJSON.Point>;
      if (feature) {
        feature.geometry.coordinates = data;
        this.setSource(sourceId, features);
      }
    }
  };

  /**
   * 获取储存的数据源
   * @param sourceId 数据源id
   * @returns GeoJSON.Feature[]
   */
  async getRawSource(sourceId: string) {
    return (await localForage.getItem(sourceId)) as GeoJSON.Feature[];
  }

  /**
   * 获取当前地图内的数据源数据
   * @param sourceId 数据源id
   * @returns GeoJSON.Feature[]
   */
  getMapSource(sourceId: string): GeoJSON.Feature[] {
    const source = this.map?.getSource(sourceId) as any;
    return source?._data?.features || [];
  }

  /** 设置通用过滤 */
  async setCommonFilter(sourceId: string, key: string, data: any) {
    const target = this.sharedSources[sourceId] || this.sources[sourceId];
    if (!target) return;
    target.filter[key] = data;
    const _feature = ((await localForage.getItem(sourceId)) as GeoJSON.Feature[]) || [];
    this.setSource(sourceId, _feature, false);
    target.layers.forEach((layer) => {
      layer.layerConfig.layout.visibility = "visible";
      this.setLayerVisible(layer.id, true);
    });
  }

  /** 清空通用过滤 */
  async clearCommonFilter(sourceId: string, key: string) {
    const target = this.sharedSources[sourceId] || this.sources[sourceId];
    if (!target) return;
    delete target.filter[key];
    const _feature = ((await localForage.getItem(sourceId)) as GeoJSON.Feature[]) || [];
    this.setSource(sourceId, _feature, false);

    /** 判断是否还存在其他过滤条件 */
    const isHasFilter = Object.keys(target.filter).length > 0;

    target.layers.forEach((layer) => {
      layer.layerConfig.layout.visibility = isHasFilter ? "visible" : "none";
      this.setLayerVisible(layer.id, isHasFilter);
    });
  }

  /** 过滤id和在线状态 警用设置常用 */
  filterData(sourceId: string, features: GeoJSON.Feature[]) {
    const target = this.sharedSources[sourceId] || this.sources[sourceId];
    if (!target) return features;
    const conditions: any = [];
    /** 过滤设备在线状态 */
    if ("isOnline" in target.filter) {
      conditions.push((item: any) =>
        target.filter.isOnline !== "" ? item.properties?.isOnline === target.filter.isOnline : true,
      );
    }
    /** 过滤id 单个或数组 */
    if ("id" in target.filter) {
      if (Array.isArray(target.filter.id)) {
        const ids = new Set([...target.filter.id]);
        conditions.push((item: any) => ids.has(item.properties?.id) && item.properties?.isOnline);
      } else {
        conditions.push((item: any) => target.filter.id === item.properties?.id);
      }
    }
    /** 过滤监控子分类 */
    if ("video" in target.filter) {
      const types = target.filter.video as { isOnline: any; subClass: string }[];
      conditions.push((item: any) =>
        types.some((condition) => {
          /** 过滤子类型和在线状态 当isOnline为""不过滤在线状态  */
          if (condition.isOnline !== "") {
            return (
              item.properties?.isOnline === condition.isOnline &&
              item.properties?.subClass === condition.subClass
            );
          } else {
            return item.properties?.subClass === condition.subClass;
          }
        }),
      );
    }
    /** 过滤子分类 */
    if ("subClass" in target.filter) {
      const types = new Set([...target.filter.subClass]);
      conditions.push((item: any) => types.has(item.properties?.subClass));
    }
    /** 过滤子分类 */
    if ("mapAreaType" in target.filter) {
      const types = new Set([...target.filter.mapAreaType]);
      conditions.push((item: any) => types.has(item.properties?.mapAreaType));
    }
    return conditions.length > 0
      ? features.filter((v) => conditions.some((condition: any) => condition(v)))
      : features;
  }

  /**
   * 设置minimap原生图层过滤
   * @param layerID 图层id
   * @param filter 过滤条件
   */
  setFilter(layerID: string, filter: any) {
    const _layer = this.map?.getLayer(layerID);
    if (_layer) {
      this.map?.setFilter(layerID, filter);
    }
    /** 判断是否带边框 */
    const _borderLayer = this.map?.getLayer(`${layerID}-border`);
    if (_borderLayer) {
      this.map?.setFilter(`${layerID}-border`, filter);
    }
  }

  /**
   * 定位
   * @param geoJson
   * @param padding
   * @param maxZoom
   */
  position(geoJson: GeoJSON.Feature | GeoJSON.FeatureCollection, padding = 150, maxZoom = 18) {
    if (!this.map) {
      console.warn("缺少 map 实例");
      return;
    }
    const bbox = turf.bbox(geoJson) as minemap.LngLatBoundsLike;
    this.map.fitBounds(bbox, {
      padding: {
        left: padding,
        top: padding,
        bottom: padding,
        right: padding,
      },
      maxZoom: maxZoom || this.map.getMaxZoom(),
    });
  }

  /**
   * 创建边框图层配置
   * @param fillLayerConfig
   * @param lineColor
   * @param lineWidth
   * @returns
   */
  buildBorderConfig(
    fillLayerConfig: MapSetting.Layer,
    lineColor: string | minemap.StyleFunction | minemap.Expression,
    lineWidth?: number | minemap.StyleFunction | minemap.Expression,
    opacity?: number | minemap.StyleFunction | minemap.Expression,
  ): MapSetting.Layer {
    return {
      id: `${fillLayerConfig.id}-border`,
      layout: {
        visibility: fillLayerConfig.layout.visibility ?? "none",
        "line-join": "round",
      },
      filter: ["==", "$type", "LineString"],
      paint: {
        "line-color": lineColor,
        "line-opacity": opacity || 1,
        "line-width": lineWidth || 1,
      },
      type: "line",
    };
  }

  /** 应用配置 */
  applyConfigurations(shared = false) {
    const target = shared ? this.sharedSources : this.sources;
    if (!this.map || typeof this.map?.addSource !== "function") {
      console.warn("缺少 map 实例");
      return;
    }
    for (const source of Object.values(target)) {
      if (!this.map.getSource(source.id)) {
        if (source.config.type !== "geojson") {
          this.map.addSource(source.id, {
            ...source.config,
          } as minemap.GeoJSONSourceRaw);
        } else {
          this.map.addSource(source.id, {
            ...source.config,
            data: {
              "type": "FeatureCollection",
              "features": [],
            },
          } as minemap.GeoJSONSourceRaw);
        }
        /** 添加图层配置到地图 */
        for (const layer of source.layers) {
          if (!this.map.getLayer(layer.id)) {
            if (!layer.layerConfig.layout.visibility) {
              layer.layerConfig.layout.visibility = "none";
            }
            const _layerConfig = {
              minzoom: 5,
              maxzoom: 18,
              ...layer.layerConfig,
            };
            this.map.addLayer({ ..._layerConfig, source: source.id } as minemap.AnyLayer);
          }
        }
      }
    }
    this.sortLayer();
  }

  /** 图层排序 */
  sortLayer() {
    fillOrderItems.forEach(
      (item) => this.map?.getLayer(item.layerId) && this.map?.moveLayer(item.layerId),
    );
    heatmapOrderItems.forEach(
      (item) => this.map?.getLayer(item.layerId) && this.map?.moveLayer(item.layerId),
    );
    lineOrderItems.forEach(
      (item) => this.map?.getLayer(item.layerId) && this.map?.moveLayer(item.layerId),
    );
    symbolOrderItems.forEach(
      (item) => this.map?.getLayer(item.layerId) && this.map?.moveLayer(item.layerId),
    );
  }

  /** 生成图层排序 */
  insertLayerOrder(data: any) {
    const orderItems = new Map<string, OrderItemType[]>()
      .set("symbol", symbolOrderItems)
      .set("line", lineOrderItems)
      .set("heatmap", heatmapOrderItems)
      .set("fill", fillOrderItems);
    const item = orderItems.get(data.type);
    if (item) {
      let insertIndex = item.findIndex((v) => v.sort === data.sort);
      if (insertIndex === -1) {
        insertIndex = 0;
      }
      item.splice(insertIndex, 0, {
        layerId: data.id,
        sort: data.sort,
      });
    } else {
      console.warn(`未找到此图层类型：${data.type}}`);
    }
  }

  /**
   * 设置数据源是否聚合
   * @param sourceIds 需要聚合的数据源id集合
   * @param cluster 是否聚合
   */
  setSourceCluster(sourceIds: string[], cluster: boolean) {
    sourceIds.forEach(async (sourceId) => {
      const target = this.sharedSources[sourceId] || this.sources[sourceId];
      if (!target) return;
      this.map?.getSource(sourceId) && this.map?.removeSource(sourceId);
      for (const layerConfig of target.layers || []) {
        this.map?.getLayer?.(layerConfig.id) && this.map?.removeLayer(layerConfig.id);
      }
      target.config.cluster = cluster;
      const feature = ((await localForage.getItem(sourceId)) as GeoJSON.Feature[]) || [];
      const _feature = this.filterData(sourceId, feature);
      this.map?.addSource(sourceId, {
        ...target.config,
        data: {
          "type": "FeatureCollection",
          "features": [..._feature],
        },
      } as minemap.GeoJSONSourceRaw);

      /** 添加图层配置到地图 */
      for (const layer of target.layers) {
        if (!this.map?.getLayer(layer.id)) {
          const _layerConfig = {
            minzoom: 5,
            maxzoom: 18,
            ...layer.layerConfig,
          };
          this.map?.addLayer({ ..._layerConfig, source: sourceId } as minemap.AnyLayer);
        }
      }
    });
    this.sortLayer();
  }

  /**
   * 加载地图配置
   * @param json 配置
   * @param shared 是否是共享数据源
   */
  loadFromJSON(json: MapSetting.RootObject, shared = false) {
    if (!json) return;
    for (const [sourceId, sourceConfig] of Object.entries(json)) {
      const source = new MapSource(sourceId, sourceConfig.config, sourceConfig.filter);
      if (sourceConfig.layers) {
        for (const layerConfig of sourceConfig.layers) {
          /** 判断是否是fill图层 */
          if (layerConfig.type === "fill") {
            const {
              "fill-border-width": lineWidth,
              "fill-border-color": lineColor,
              ...fillPaint
            } = layerConfig.paint as MapSetting.FillPaint;
            const _layerConfig = {
              ...layerConfig,
              paint: fillPaint,
            };
            this.insertLayerOrder(_layerConfig);
            source.addLayer(_layerConfig);
            /** 判断是否是fill图层 有则添加边框线图层 */
            if (lineColor) {
              const _source = new MapSource(
                `${sourceId}-border`,
                sourceConfig.config,
                sourceConfig.filter,
              );
              const config = this.buildBorderConfig(layerConfig, lineColor, lineWidth);
              this.insertLayerOrder(config);
              _source.addLayer(config);
              this.addSourceMap(_source, shared);
            }
          } else {
            this.insertLayerOrder(layerConfig);
            source.addLayer(layerConfig);
          }
        }
      }
      this.addSourceMap(source, shared);
    }
    this.applyConfigurations(shared);
  }

  /** 清除配置的属于和图层 */
  clearFromJSON(json: MapSetting.RootObject) {
    if (!json) return;
    for (const [sourceId, sourceConfig] of Object.entries(json)) {
      this.removeSourceAndLayer(sourceId, sourceConfig.layers);
      delete this.sources[sourceId];
      delete this.sharedSources[sourceId];
    }
  }

  /**
   * 清空地图数据源和图层
   * @param sourceId 数据源id
   * @param sourceConfig 数据源配置
   */
  removeSourceAndLayer(sourceId: string, layers: MapSetting.Layer[]) {
    for (const layerConfig of layers || []) {
      this.map?.getLayer?.(layerConfig.id) && this.map?.removeLayer(layerConfig.id);
    }
    const borderSource =
      this.sources[`${sourceId}-border`] || this.sharedSources[`${sourceId}-border`];
    /** 删除border 相关数据源图层 */
    if (borderSource) {
      for (const _layerConfig of borderSource?.layers || []) {
        this.map?.getLayer?.(_layerConfig.id) && this.map?.removeLayer(_layerConfig.id);
      }
      this.map?.getSource(borderSource.id) && this.map?.removeSource(borderSource.id);
      delete this.sources[borderSource.id];
      delete this.sharedSources[borderSource.id];
    }
    this.map?.getSource(sourceId) && this.map?.removeSource(sourceId);
  }

  /**
   * 清空数据源及图层数据
   */
  clearSource() {
    for (const [sourceId, sourceConfig] of Object.entries(this.sources)) {
      this.map?.getSource(sourceId) && this.map?.removeSource(sourceId);
      for (const layConfig of sourceConfig.layers) {
        this.map?.getLayer(layConfig.id) && this.map?.removeLayer(layConfig.id);
      }
    }
  }

  /** 清空地图实例 */
  clearMap() {
    this.map = null;
    MapConfig.instance = null;
  }
}
