export function groupBy<T>(arr: T[], by: (v: T) => number) {
  return arr.reduce((acc: (T[] | undefined)[], elem) => {
    const group = by(elem);
    (acc[group] = acc[group] || []).push(elem);
    return acc;
  }, []);
}
