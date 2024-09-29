export interface IPoliceDeviceData {
  deptId: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  deviceSonType: string;
  deviceType: string;
  followId: string;
  isFollowFlag: string;
  isOnline: string;
}

export interface IVideoData {
  followId: string;
  isFollowFlag: number;
  id: string;
  deviceType: string;
  name: string;
  deviceID: string;
  status: string;
  deptCode: string;
  deptName: string;
  deviceSonType: string;
  deviceSonTypeText: string;
}

export interface IPointData {
  followId: string;
  isFollowFlag: number;
  id: string;
  pointName: string;
  pointBigType: string;
  pointSmallType: string;
  orgCode: string;
  orgName: string;
  extraJson?: string;
}

export interface IInterestCollapseData {
  name: string;
  type: string;
  list: IPointData[];
}

export interface IPoliceData {
  deptCode: string;
  deptName: number;
  followId: string;
  idCard: string;
  isFollowFlag: string;
  isOnline: POLICE_STATUS;
  policeName: string;
  policeNo: string;
}
