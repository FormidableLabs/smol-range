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
    *[Symbol.iterator]() {
      for (let val = start; val < end; val += step) {
        yield val;
      }
    },
  };

  return target;
}
