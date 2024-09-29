const DISTANCE = 50;
const map = new WeakMap();

const op = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const animation = map.get(entry.target);
      animation && animation.play();
      op.unobserve(entry.target);
    }
  }
});

const isBelowViewport = (el: HTMLDivElement) => {
  const { top } = el.getBoundingClientRect();
  return top - window.innerHeight > 0;
};

export default {
  mounted: (el: HTMLDivElement) => {
    if (!isBelowViewport(el)) return;
    const animation = el.animate(
      [
        {
          transform: `translateY(${DISTANCE}px)`,
          opacity: 0.5,
        },
        {
          transform: "translateY(0)",
          opacity: 1,
        },
      ],
      {
        duration: 400,
        easing: "ease-out",
        fill: "forwards",
      },
    );

    animation.pause();
    map.set(el, animation);
    op.observe(el);
  },
  unmounted(el: HTMLDivElement) {
    op.unobserve(el);
  },
};
