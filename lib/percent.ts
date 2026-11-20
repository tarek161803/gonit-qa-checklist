// Percentages of the total, to one decimal, that always add up to exactly 100.0
// (largest-remainder rounding in tenths of a percent).
export const splitPercent = (counts: number[]) => {
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  const exact = counts.map((c) => (c / total) * 1000);
  const tenths = exact.map(Math.floor);
  let left = 1000 - tenths.reduce((a, b) => a + b, 0);
  exact
    .map((e, i) => [e - tenths[i], i] as const)
    .sort((a, b) => b[0] - a[0])
    .forEach(([, i]) => left-- > 0 && tenths[i]++);
  return tenths.map((t) => t / 10);
};
