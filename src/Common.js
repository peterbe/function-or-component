export const collect = (label, t) => {
  if (window.beforeSetState) {
    const diff = t - window.beforeSetState;
    if (!(label in window.timings)) {
      window.timings[label] = [];
    }
    window.timings[label].push(diff);
  }
};
