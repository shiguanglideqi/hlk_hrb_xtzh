/** 权限判断 */
export function isAllow(code: string, isPrefix = false): boolean {
  const loginInfo = JSON.parse(sessionStorage.getItem("loginInfo") || "{}");
  const resourceCodes = (loginInfo?.resourceCodes as string[]) || [];
  const codes = new Set(resourceCodes);
  let resourceCode = code;
  if (isPrefix) {
    const { hash } = window.location;
    let prefix = "";
    if (hash.includes("patrol_web")) prefix = "patrol_";
    if (hash.includes("visual_web")) prefix = "visual_";
    resourceCode = `${prefix}${code}`;
  }
  return codes.has(resourceCode);
}

export const getNewPng = (name: string): string => {
  if (typeof name === "undefined") return "";
  const path = `../assets/images/icon/${name}.png`;
  const modules = import.meta.glob("../assets/images/icon/*", {
    eager: true,
    import: "default",
  });
  return modules[path] as string;
};

/** 遍历树结构 */
export function treeForeach(tree: any, func: (node: any) => void) {
  let node;
  const lists = [...tree];
  // eslint-disable-next-line no-cond-assign
  while ((node = lists.shift())) {
    func(node);
    node.children && lists.push(...node.children);
  }
}
