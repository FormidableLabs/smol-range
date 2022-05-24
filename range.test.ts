import { describe, expect, test } from "vitest";
import { range } from "./range";

describe("range", () => {
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

  test("handles negative integers for start/end", () => {
    expect([...range(-5, -2)]).toEqual([-5, -4, -3]);
    expect([...range(-2, -5)]).toEqual([]);
  });
});
