const QuickControl = defineAsyncComponent(() => import("./QuickControl.vue"));
const FollowList = defineAsyncComponent(() => import("./FollowList.vue"));
const PoliceAgency = defineAsyncComponent(() => import("./PoliceAgency.vue"));
const InterestPoint = defineAsyncComponent(() => import("./InterestPoint.vue"));
const RegionalDivision = defineAsyncComponent(() => import("./RegionalDivision.vue"));
const VideoEquip = defineAsyncComponent(() => import("./VideoEquip.vue"));
const PoliceEquip = defineAsyncComponent(() => import("./PoliceEquip.vue"));
const SupplyPoint = defineAsyncComponent(() => import("./SupplyPoint.vue"));
const OneStandThreeRoom = defineAsyncComponent(() => import("./OneStandThreeRoom.vue"));
const KeyPerson = defineAsyncComponent(() => import("./KeyPerson.vue"));
const Headquarters = defineAsyncComponent(() => import("./Headquarters.vue"));

export {
  FollowList,
  InterestPoint,
  OneStandThreeRoom,
  KeyPerson,
  PoliceAgency,
  PoliceEquip,
  QuickControl,
  RegionalDivision,
  SupplyPoint,
  VideoEquip,
  Headquarters,
};
