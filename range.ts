type Res = any;

export function range(end: number): Res;
export function range(start: number, end: number): Res;
export function range(start: number, end: number, step: number): Res;

export function range(...args: number[]): Res {
  // Parse out start/end/step to handle overload
  const [start, end, step] = (() => {
    if (args.length === 1) {
      return [0, args[0], 1];
    }
    if (args.length === 2) {
      return [args[0], args[1], 1];
    }
    return args.slice(0, 3);
  })();

  const target = {
    start,
    end,
    step,

    /**
     * Use generator for iterator method to handle iteration
     */
    *[Symbol.iterator]() {
      for (let val = start; step > 0 ? val < end : val > end; val += step) {
        yield val;
      }
    },
  };

  const _xmin = Math.min(start, end);
  const _xmax = Math.max(start, end);

  return new Proxy(target, {
    has({ start, end, step }, _y): boolean {
      if (typeof _y === "symbol" || isNaN(Number(_y))) return false;

      const y = Number(_y);
      // Handle boundaries
      if (step > 0 && (y < _xmin || y >= _xmax)) return false;
      if (step <= 0 && (y > _xmax || y <= _xmin)) return false;

      const x = (y - start) / step;

      return Math.abs(x - Math.round(x)) < Number.EPSILON;
    },
  });
}
