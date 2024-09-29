function moveElement(e: MouseEvent) {
  const hoverTip = document.getElementById("hoverTip") as HTMLDivElement;
  if (hoverTip) {
    hoverTip.style.transform = `translate3d(${e.clientX + 5}px, ${e.clientY + 10}px, 0px)`;
  }
}

const textMap = new Map([
  ["point", "单击确定位置，右键取消绘制"],
  ["path", "左键绘制路线，双击完成绘制，右键取消绘制"],
  ["area", "左键绘制范围，双击完成绘制，右键取消绘制"],
  ["tie", "左键点击地图绘制新位置，右键取消绘制"],
]);

type TextName = "point" | "path" | "area" | "tie";

export const show = (type: TextName) => {
  let HoverTip = document.getElementById("hoverTip") as HTMLDivElement;
  if (!HoverTip) {
    HoverTip = document.createElement("div");
    HoverTip.id = "hoverTip";
    HoverTip.style.position = "fixed";
    HoverTip.style.left = "0";
    HoverTip.style.top = "0";
    HoverTip.style.lineHeight = "20px";
    HoverTip.style.height = "23px";
    HoverTip.style.padding = "0 5px";
    HoverTip.style.color = "#fafafa";
    HoverTip.style.background = "rgba(0, 28, 75, 0.8)";
    HoverTip.style.border = "1px solid #7ab8ff";
    HoverTip.style.zIndex = "10";
    HoverTip.innerHTML = textMap.has(type) ? textMap.get(type)! : textMap.get("point")!;
    document.body.appendChild(HoverTip);
  }
  document.addEventListener("mousemove", moveElement, true);
};

export const hide = () => {
  const hoverTip = document.getElementById("hoverTip");
  hoverTip && document.body.removeChild(hoverTip);
  document.removeEventListener("mousemove", moveElement, true);
};
