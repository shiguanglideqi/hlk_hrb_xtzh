export type MenuType = {
  id: string;
  name: string;
  parentId: string;
  sort: number;
  url: string;
  description: string;
  resCode: string;
  resType: string;
  icon: string;
  attrs: [];
  children?: MenuType[];
};
