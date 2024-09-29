import { defineStore } from "pinia";

export const useOrg = defineStore("useOrg", {
  state: () => ({
    orgList: [],
    orgCode: "",
    orgName: "",
    orgLevel: "",
    orgCodes: [],
  }),
  actions: {
    changeOrgcode(code: any) {
      const res = breadthQuery(this.orgList, code);
      if (!res || this.orgCode === res?.deptCode) return;
      this.setOrgCode(res.deptCode);
      this.setOrgLevel(res.level);
      this.setOrgName(res.name);
      const codes: string[] = [];
      // 根据用户所属单位判断
      const treeNode = findItemByCode([res], code, []);
      treeForeach(treeNode, (node) => {
        codes.push(node.deptCode);
      });
      this.setOrgCodes(codes);
    },
    /** 设置当前选中管辖机构数据 */
    setOrgList(data: any) {
      this.orgList = data;
      if (data.length > 0) {
        const tags = ["ST", "SJ", "FXJ", "PCS"];
        const { deptCode: departmentCode } = data[0];
        const ids: string[] = [];
        const codes: string[] = [];
        const treeNode = findItemByCode(data, departmentCode, []);
        treeForeach(treeNode, (node) => {
          const item = node;
          const TagSet = new Set([...(node.tags || [])]);
          const arr = tags.filter((v) => TagSet.has(v));
          item.level = arr[0];
          ids.push(node.id);
          codes.push(node.deptCode);
        });
        const { deptAlias: departmentName, level } = data[0];
        this.setOrgCode(departmentCode);
        this.setOrgName(departmentName);
        this.setOrgLevel(level);
        this.setOrgCodes(codes);
      }
    },
    /** 设置当前选中管辖机构的 orgCode */
    setOrgCode(code: string) {
      this.orgCode = code;
    },
    /** 设置当前选中管辖机构的名称 orgName */
    setOrgName(name: string) {
      this.orgName = name;
    },
    /** 设置当前选中管辖机构的 org 标签 */
    setOrgLevel(Id: string) {
      this.orgLevel = Id;
    },
    /** 设置当前选中管辖机构的下的所有 dept code */
    setOrgCodes(codes: any) {
      this.orgCodes = codes;
    },
  },
  persist: {
    enabled: true,
    strategies: [{ key: "org", storage: window.sessionStorage }],
  },
});

function findItemByCode(data: any, code: string, array: string[]) {
  for (const item of data) {
    if (item.deptCode === code) {
      array.push(item);
    }
    if (item.children && item.children.length) findItemByCode(item.children, code, array);
  }
  return array;
}

function breadthQuery(tree: any, code: any) {
  let stark: any = [];
  stark = stark.concat(tree);
  while (stark.length) {
    const temp = stark.shift();
    if (temp.children) {
      stark = stark.concat(temp.children);
    }
    if (temp.deptCode === code) {
      return temp;
    }
  }
}

function treeForeach(tree: any, func: (node: any) => void) {
  let node;
  const lists = [...tree];
  // eslint-disable-next-line no-cond-assign
  while ((node = lists.shift())) {
    func(node);
    node.children && lists.push(...node.children);
  }
}
