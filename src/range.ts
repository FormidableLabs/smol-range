type Range = {
  start: number;
  end: number;
  step: number;
  [Symbol.iterator](): Generator<number, void, unknown>;
  [i: number]: number | undefined;
  forEach: (fn: (x: number, i: number) => void) => void;
};

/*
 * Overloads for the method
 */
export function range(end: number): Range;
export function range(start: number, end: number): Range;
export function range(start: number, end: number, step: number): Range;

/**
 * Range function implementation
 */
export function range(...args: number[]): Range {
  if (args.length === 0) {
    throw new Error("range requires at least one argument");
  }

  // Parse out start/end/step to handle overload
  const start = args.length > 1 ? args[0] : 0;
  const end = args.length === 1 ? args[0] : args[1] ?? 0;
  const step = args[2] ?? 1;

  // Create a "target" object (that we'll use as proxy target)
  const target: Range = {
    start,
    end,
    step,

    /**
     * Use generator for iterator method to handle iteration
     */
    *[Symbol.iterator]() {
      let i = 0,
        val = start;

      while (step > 0 ? val < end : val > end) {
        yield val;

        i++;
        val = start + i * step;
      }
    },

    /**
     * forEach method, similar to Array.prototype.forEach
     */
    forEach(fn: (x: number, i: number) => void) {
      // If infinite start/end, throw error otherwise we'll end in infinite loop
      if (!(Number.isFinite(start) && Number.isFinite(end))) {
        throw new Error(
          "Cannot call .forEach on range with infinite start/end"
        );
      }

      let i = 0;
      for (const x of this) {
        fn(x, i);
        i++;
      }
    },
  };

  const _rangeMin = Math.min(start, end);
  const _rangeMax = Math.max(start, end);

  return new Proxy(target, {
    /**
     * "has" method to handle "in" keyword, like...
     *   `3 in range(5)`
     */
    has(...args): boolean {
      // Use reflection to first check if target has property.
      const res = Reflect.has(...args);
      if (res) return res;

      // Otherwise, pull what we need and do our custom check
      const [{ start, step }, _y] = args;

      if (typeof _y === "symbol" || isNaN(Number(_y))) return false;

      const y = Number(_y);
      // Handle boundaries
      if (step > 0 && (y < _rangeMin || y >= _rangeMax)) return false;
      if (step <= 0 && (y > _rangeMax || y <= _rangeMin)) return false;

      const x = (y - start) / step;
      return isCloseEnough(y, start + Math.round(x) * step);
    },

    /**
     * "get" trap to handle property lookups, like...
     *    `range(2, 5)[1]`
     */
    get(...args) {
      const [{ start, step, end }, _x] = args;

      if (typeof _x === "string" && IntegerRegex.test(_x)) {
        const x = Number(_x);

        // Positive index
        if (x >= 0) {
          const y = start + x * step;
          return y >= _rangeMax ? undefined : y;
        }
        // Negative index
        else {
          if (end === Infinity) return undefined;

          const numSteps = Math.floor((end - start) / step);
          const modX = numSteps + x;
          const y = start + modX * step;

          return y < _rangeMin ? undefined : y;
        }
      } else {
        return Reflect.get(...args);
      }
    },

    /**
     * Disable setting properties.
     */
    set() {
      return false;
    },
  });
}

const isCloseEnough = (a: number, b: number) =>
  Math.abs(a - b) < Number.EPSILON;

const IntegerRegex = /^-?\d+$/;
