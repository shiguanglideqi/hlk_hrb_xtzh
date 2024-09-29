import * as turf from "@turf/turf";
import { AreaType, PointType } from "@/common/map";
import { useOrg } from "@/store";
import { queryArea, queryPoint } from "@/services/map";
// import { Popup } from "@/views/MapScreenDark/Popup";
import { MapConfig } from "@/components/map/MapConfig";
import { Popup } from "@/modules/Popup";

export const getMapData = () => {
  const _config = new MapConfig();
  const orgStore = useOrg();
  const { orgCode } = storeToRefs(orgStore);

  queryArea({
    areaTypeList: [AreaType.XZQY],
  }).then((result) => {
    const list = setAreaSource(result);
    _config.setSource("source-executives", list);
  });
  queryArea({
    deptCode: orgCode.value,
    areaTypeList: [AreaType.GXQY],
  }).then((result) => {
    const list = setAreaSource(result);
    _config.setSource("source-precinct", list);
  });
  queryArea({
    deptCode: orgCode.value,
    areaTypeList: [AreaType.JDSQ],
  }).then((result) => {
    const list = setAreaSource(result);
    _config.setSource("source-community", list);
  });
  queryArea({
    deptCode: orgCode.value,
    areaTypeList: [AreaType.XLQY],
  }).then((result) => {
    const list = setAreaSource(result);
    _config.setSource("source-grid", list);
  });
  queryPoint({
    deptCode: orgCode.value,
    pointBigTypeList: [PointType.CTDW],
  }).then((result) => {
    const list = setPointSource(result);
    _config.setSource("source-chutu-point", list);
  });
  queryPoint({
    deptCode: orgCode.value,
    pointBigTypeList: [PointType.JWDW],
  }).then((result) => {
    const list = setPointSource(result);
    _config.setSource("source-jingwu-point", list);
  });
  queryPoint({
    deptCode: orgCode.value,
    pointBigTypeList: [PointType.ZAGT],
  }).then((result) => {
    const list = setPointSource(result);
    _config.setSource("source-gangting-point", list);
  });
  queryPoint({
    deptCode: orgCode.value,
    pointBigTypeList: [PointType.GAJCZ],
  }).then((result) => {
    const list = setPointSource(result);
    _config.setSource("source-jianchazhan-point", list);
  });
  queryPoint({
    deptCode: orgCode.value,
    pointBigTypeList: [PointType.ZAKD],
  }).then((result) => {
    const list = setPointSource(result);
    _config.setSource("source-zhian-point", list);
  });
  queryPoint({
    deptCode: orgCode.value,
    pointBigTypeList: [PointType.ZAKD],
  }).then((result) => {
    const list = setPointSource(result);
    _config.setSource("source-zhian-point", list);
  });
  queryPoint({
    deptCode: orgCode.value,
    pointBigTypeList: [PointType.ZQDW],
  }).then((result) => {
    const list = setPointSource(result);
    _config.setSource("source-zhiqin-point", list);
  });
  queryPoint({
    deptCode: orgCode.value,
    pointBigTypeList: [PointType.SJKK],
  }).then((result) => {
    const list = setPointSource(result);
    _config.setSource("source-shiji-point", list);
  });
};

/**
 * 设置区域数据源 属性
 * @description 将后端返回数据  添加到 feature 的 properties 中
 */
const setAreaSource = (result: any[]) => {
  const list: GeoJSON.Feature[] = [];
  result.sort((a, b) => a.orgCode - b.orgCode);
  result.forEach((item) => {
    if (item.areaRange) {
      const feature: GeoJSON.Feature = turf.feature(JSON.parse((item.areaRange as string) || ""));
      feature.properties!.name = item.areaName;
      feature.properties!.lineColour = item.lineColour;
      feature.properties!.lineType = item.lineType;
      feature.properties!.orgCode = item.orgCode;
      feature.properties!.areaOpacity = item.coverArea ? Number(item.coverArea) : 0.4;
      feature.properties!.areaColour = item.areaColour;
      feature.properties!.id = item.id;
      list.push(feature);
    }
  });
  return list;
};

/**
 * 设置点位数据源 属性
 * @description 将后端返回数据  添加到 feature 的 properties 中
 */
const setPointSource = (result: any[], popup?: Popup) => {
  const list: GeoJSON.Feature[] = [];
  result.forEach((item) => {
    if (item.point) {
      const feature: GeoJSON.Feature = turf.feature(JSON.parse((item.point as string) || ""));
      feature.properties!.name = item.pointName;
      feature.properties!.id = item.id;
      feature.properties!.imageName = `${item.pointBigType}-${item.pointSmallType}`;
      feature.properties!.popup = popup || Popup.Point;
      feature.properties!.bigType = item.pointBigType;
      feature.properties!.subClass = item.pointSmallType;
      feature.properties!.key = 1000;
      list.push(feature);
    }
    if (item.pointRange) {
      const feature: GeoJSON.Feature = turf.feature(JSON.parse((item.pointRange as string) || ""));
      feature.properties!.lineColour = item.lineColour || "#409EFF";
      feature.properties!.lineType = item.lineType || 1;
      feature.properties!.areaColour = item.areaColour || "#409EFF";
      feature.properties!.popup = popup || Popup.Point;
      feature.properties!.id = item.id;
      feature.properties!.bigType = item.pointBigType;
      feature.properties!.subClass = item.pointSmallType;
      list.push(feature);
    }
  });

  return list;
};
