import { describe, expect, test, vi } from "vitest";
import { range } from "./range";

describe("range", () => {
  test("0 arguments: throw", () => {
    expect(() => {
      // @ts-expect-error Range requires at least one argument
      range();
    }).toThrow("range requires at least one argument");
  });

  test("single positive integer argument: iterates from 0 to arg, step of 1", () => {
    expect([...range(3)]).toEqual([0, 1, 2]);
  });

  test("single positive float argument: iterates from 0 to floor(arg)", () => {
    expect([...range(3.3)]).toEqual([0, 1, 2, 3]);
  });

  test("single negative argument: empty iteration", () => {
    expect([...range(-3)]).toEqual([]);
    expect([...range(-3.3)]).toEqual([]);
  });

  test("handles positive integers for start/end", () => {
    expect([...range(2, 5)]).toEqual([2, 3, 4]);
    expect([...range(5, 2)]).toEqual([]);
  });

  // TODO: Handle float start/ends

  test("handles negative integers for start/end", () => {
    expect([...range(-5, -2)]).toEqual([-5, -4, -3]);
    expect([...range(-2, -5)]).toEqual([]);
  });

  // TODO: handle negative float start/ends

  test("handles positive integer step", () => {
    expect([...range(1, 9, 2)]).toEqual([1, 3, 5, 7]);
    expect([...range(-3, 14, 4)]).toEqual([-3, 1, 5, 9, 13]);
  });

  test("handles negative integer step", () => {
    expect([...range(10, 2, -2)]).toEqual([10, 8, 6, 4]);
    expect([...range(-3, -11, -3)]).toEqual([-3, -6, -9]);
  });

  test("handles 'in' keyword for properties on the object", () => {
    const r = range(3);

    expect("start" in r).toBe(true);
    expect("end" in r).toBe(true);
    expect("step" in r).toBe(true);
    expect("plop" in r).toBe(false);
  });

  test("handles 'in' keyword for single-arg", () => {
    const r = range(3);
    expect(-2 in r).toBe(false);
    expect(-1 in r).toBe(false);
    expect(0 in r).toBe(true);
    expect(1 in r).toBe(true);
    expect(2 in r).toBe(true);
    expect(3 in r).toBe(false);
    expect(4 in r).toBe(false);

    expect(2.2 in r).toBe(false);
    expect(2.01 in r).toBe(false);
  });

  test("handles 'in' keyword for double-arg", () => {
    const r = range(-2, 3);
    expect(-4 in r).toBe(false);
    expect(-3 in r).toBe(false);
    expect(-2 in r).toBe(true);
    expect(-1 in r).toBe(true);
    expect(0 in r).toBe(true);
    expect(1 in r).toBe(true);
    expect(2 in r).toBe(true);
    expect(3 in r).toBe(false);
    expect(4 in r).toBe(false);
  });

  test("handles 'in' keyword for triple-arg", () => {
    const r = range(-3, 9, 4);

    expect(-7 in r).toBe(false);
    expect(-4 in r).toBe(false);
    expect(-3 in r).toBe(true);
    expect(1 in r).toBe(true);
    expect(5 in r).toBe(true);
    expect(6 in r).toBe(false);
    expect(9 in r).toBe(false);
  });

  test("handles 'in' keyword for float triple-arg", () => {
    const r = range(2.2, Infinity, 1.5);

    expect(2.2 in r).toBe(true);
    expect(3 in r).toBe(false);
    expect(3.7 in r).toBe(true);
    expect(494.2 in r).toBe(true);
  });

  test("handles positive-value lookup for single-arg", () => {
    expect(range(5)[1]).toEqual(1);
    expect(range(5)[2]).toEqual(2);
    expect(range(5)[5]).toBeUndefined();
    expect(range(5)[7]).toBeUndefined();
  });

  test("handles negative-value lookup for single-arg", () => {
    expect(range(5)[-1]).toEqual(4);
    expect(range(5)[-2]).toEqual(3);
    expect(range(5)[-6]).toBeUndefined();

    expect(range(Infinity)[-1]).toBeUndefined();
    expect(range(Infinity)[-2]).toBeUndefined();
  });

  test("handles positive-value lookup for double-arg", () => {
    expect(range(3, 8)[2]).toEqual(5);
    expect(range(-6, 4)[7]).toEqual(1);
  });

  test("handles negative-value lookup for double-arg", () => {
    expect(range(3, 8)[-1]).toEqual(7);
    expect(range(3, 8)[-3]).toEqual(5);
    expect(range(-6, 4)[-7]).toEqual(-3);

    expect(range(4, Infinity)[-1]).toBeUndefined();
  });

  test("handles positive-value lookup for triple-arg", () => {
    expect(range(1, 9, 2)[2]).toEqual(5);
    expect(range(1, 9, 2)[3]).toEqual(7);
    expect(range(1, 9, 2)[4]).toBeUndefined();

    expect(range(-20, -4, 3)[0]).toEqual(-20);
    expect(range(-20, -4, 3)[5]).toEqual(-5);
    expect(range(-20, -4, 3)[6]).toBeUndefined();
  });

  test("handles negative-value lookup for triple-arg", () => {
    expect(range(1, 9, 2)[-1]).toEqual(7);
    expect(range(1, 9, 2)[-3]).toEqual(3);
    expect(range(1, 9, 2)[-4]).toEqual(1);
    expect(range(1, 9, 2)[-5]).toBeUndefined();

    expect(range(1, Infinity, 5)[-1]).toBeUndefined();
  });

  test("disables setters", () => {
    expect(() => {
      const r = range(5);
      r.start = 3;
    }).toThrow();
  });

  test(".forEach is called n times", () => {
    const f = vi.fn();
    range(5).forEach(f);

    expect(f).toHaveBeenCalledTimes(5);
    expect(f).toHaveBeenCalledWith(0, 0);
    expect(f).toHaveBeenCalledWith(4, 4);
    expect(f).not.toHaveBeenCalledWith(5);
  });

  test(".forEach is called with current range value, and iteration step", () => {
    const f = vi.fn();
    range(2, 20, 2).forEach(f);

    expect(f).toHaveBeenCalledTimes(9);
    expect(f).toHaveBeenCalledWith(2, 0);
    expect(f).toHaveBeenCalledWith(4, 1);
    expect(f).toHaveBeenCalledWith(18, 8);

    const g = vi.fn();
    range(30, 0, -3).forEach(g);

    expect(g).toHaveBeenCalledWith(30, 0);
    expect(g).toHaveBeenCalledWith(27, 1);
    expect(g).toHaveBeenCalledWith(3, 9);
  });

  test(".forEach throws on infinite start/end", () => {
    expect(() => {
      range(Infinity).forEach(() => null);
    }).toThrow();

    expect(() => {
      range(0, Infinity).forEach(() => null);
    }).toThrow();

    expect(() => {
      range(0, Infinity, 3).forEach(() => null);
    }).toThrow();

    expect(() => {
      range(-Infinity, 0, -3).forEach(() => null);
    }).toThrow();
  });
});
