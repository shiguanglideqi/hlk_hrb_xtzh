import { h, defineComponent, useSlots, renderSlot } from "vue";

export const Row = /* @__PURE__ */ defineComponent(() => {
  const slots = useSlots();
  const props = {
    style: { display: "flex", flexFlow: "row wrap", minWidth: 0, flexWrap: "nowrap" },
  };
  return () => h("div", props, [renderSlot(slots, "default")]);
});

export const Col = /* @__PURE__ */ defineComponent(() => {
  const slots = useSlots();
  const attrs = useAttrs();
  const props = {
    style: { flex: attrs.flex ? "1 1 auto" : "0 0 auto", minWidth: "0px" },
  };
  return () => h("div", props, [renderSlot(slots, "default")]);
});

export const Cell = /* @__PURE__ */ defineComponent(() => {
  const slots = useSlots();
  const attrs = useAttrs();
  const props = {
    style: {
      display: "flex",
      fontSize: "16px",
      fontWeight: "500",
      color: "#ffffff",
      lineHeight: "28px",
    },
  };
  const labelPorps = {
    style: { color: "#B2C3D8" },
  };
  const contentPorps = {
    style: { flex: "1", minWidth: "0", maxWidth: "300px", textAlign: "start" },
    class: "content",
  };
  return () =>
    h("div", props, [
      h("span", labelPorps, `${attrs.label}`),
      h("span", contentPorps, renderSlot(slots, "default")),
    ]);
});
