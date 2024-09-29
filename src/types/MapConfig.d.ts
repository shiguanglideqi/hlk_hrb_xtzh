export as namespace MapSetting;

export type Config = {
  type: string;
  data?: GeoJSON.Feature[];
  maxzoom?: number;
  minzoom?: number;
  clusterRadius?: number;
  cluster?: boolean;
  traffic?: boolean;
  tiles?: string[];
};

export interface FillPaint extends minemap.FillPaint {
  "fill-border-width"?: number | minemap.StyleFunction | minemap.Expression;
  "fill-border-color"?: string | minemap.StyleFunction | minemap.Expression;
}

export type Layer = {
  id: string;
  type: string;
  sort?: number;
  orderId?: string;
  filter?: any[];
  minzoom?: number;
  maxzoom?: number;
  layout: minemap.SymbolLayout | minemap.FillLayout | minemap.LineLayout;
  paint: minemap.SymbolPaint | FillPaint | minemap.HeatmapPaint | minemap.LinePaint;
  "source-layer"?: string;
};

export type sourceType = {
  config: Config;
  layers: Layer[];
  /** 组合过滤，可与默认图层过滤合并 */
  filter?: Record<string, any>;
};

declare type RootObject = Record<string, sourceType>;
