# smol-range

`smol-range` contains a `range` utility function that aims to replicate Python's `range` function. This `range` function has a few interesting properties:

- Uses iterators (_not_ arrays) for iteration, so no unnecessary memory usage.
- Uses `Proxy` to add some custom behavior, such as handling the `in` keyword (to test if a number is "in" the range) and adding functionality to look up range values by step (e.g., `range(2, 5)[1] === 3`).
- Supports negative steps and non-integer start/end/step values.
- Added `.forEach` method like `Array.prototype.forEach` for easier iteration.

## Installation and Basic Example

Install `smol-range` via yarn or NPM:

```shell
npm install smol-range # NPM
yarn add smol-range # Or Yarn
```

Then, import the `range` function and go to town!

```ts
import { range } from 'smol-range';

// Iterate over a range...
for (const x of range(12)) {
  // Do something with x
}

// Or using .forEach
range(12).forEach(x => { /* ... */ });

// Or maybe even generate an array from a range...
const arr = Array.from(range(10, 20, 2)); // [10, 12, 14, 16, 18]
[...range(10, 20, 2)]; // [10, 12, 14, 16, 18]
```

**NOTE**: if used in a TypeScript project, this package requires "down-level iteration" to be enabled by setting `"downlevelIteration": true` in your `tsconfig.json`.

## API

`range` is the sole function exported from `smol-range`, but contains a few different signatures:

```ts
export function range(end: number): Range;
export function range(start: number, end: number): Range;
export function range(start: number, end: number, step: number): Range;
```

The following sections discuss each signature.

### Signature `range(end: number): Range`

The simplest usage of `range` is to provide a single argument, which acts as an ending value for a range that starts at 0. E.g., `range(3)` starts at 0, ends _before_ 3, and increments in steps of 1.

```ts
range(3); // -> 0, 1, 2
```

This is useful if you want to have a loop with a certain number of iterations:

```ts
// Execute block 3 times
for (const x of range(3)) {
  // Do something... 
}
```

### Signature `range(start: number, end: number): Range`

If you don't want your range to start at 0, you can provide both a starting and ending value. E.g., `range(3, 7)` starts at 3 and ends before 7 and still increments by 1:

```ts
range(3, 7); // -> 3, 4, 5, 6
```

When providing a start and end value, it's intended for `end > start` since we're incrementing by a positive amount. However, negative values are fair game!

```ts
range(-2, 4); // -> -2, -1, 0, 1, 2, 3
```

### Signature `range(start: number, end: number, step: number): Range`

If you don't want your range to increment/step by 1, you can provide a third argument to indicate a step value! E.g., `range(3, 9, 2)` starts at 3, ends before 9, and increments by 2.

```ts
range(3, 9, 2); // -> 3, 5, 7
```

It's worth noting that the step value can be negative if you want to increment "backwards", but in this case you'll need `start > end` because the iterator always moves from `start` to `end`. Here's an example:

```ts
range(5, 0, -1); // -> 5, 4, 3, 2, 1
range(-3, -12, -2); // -> -3, -5, -7, -9, -11
```

### Custom `in` Operator

Using `Proxy` API, this library adds custom behavior to the `in` operation for `range` outputs which allows you to test if a value is in a range. Simple example:

```ts
const myRange = range(2, 5); // -> 2, 3, 4

2 in myRange; // -> true
4 in myRange; // -> true
5 in myRange; // -> false
```

Any value that _should_ be able to be iterated over by the `range` output should test `true` via the `in` operation.

It's worth noting that this library uses **math** to test this, and does not actually attempt to iterate over the range to find the value – ensuring `O(1)` efficiency.

### Custom lookups

Using `Proxy` API, this library adds custom behavior for property lookups on the `range` output, so that you can get a specific range value without having to iterate over the range. For example:

```ts
const myRange = range(4, Infinity, 3);

myRange[0]; // -> 4
myRange[1]; // -> 7
myRange[272]; // -> 820
myRange[1369]; // -> 4111
```

The lookup also supports negative values (when there's a finite end to the range):

```ts
const myRange = range(1, 9, 2); // -> 1, 3, 5, 7

myRange[-1]; // -> 7
myRange[-4]; // -> 1
myRange[-5]; // -> undefined
```

Again, the library uses **math** to determine these values, once again ensuring `O(1)` efficiency. 

## Non-integer values

Non-integer values are fair game for start, end, and step values! E.g., there's nothing stopping you from doing something like `range(1.2, 7.4, 1.7)`. However, the `range` function generates values $y$ via this basic formula:

$$y = \text{start} + \text{step} \cdot n$$

where $n$ varies from a starting value of $0$ to an ending value $N$ where:

$$\text{start} + \text{step} \cdot N \lt \text{end}$$

Now, if you've been working with JavaScript for long enough, you might smell a little bit of **floating-point shenanigans** lurking! This library does not try to mitigate floating-point errors, and therefore you might end up in some weird situations like the following:

```ts
3.3 in range(0, 11, 1.1); // -> false, because 3 * 1.1 === 3.3000000000000003 in JS
```

This is a hard problem to solve in this context, and to keep this library bloat-free, we do not try to solve this problem here.

## Examples

### Single-argument range generates from 0 to `arg-1`

```ts
for (const x of range(3)) {
  console.log(x); // log: 0, 1, 2
}
```

Use `Array.from` or Array spread (`[...]`) to generate an array, if need be.

```ts
Array.from(range(3)); // -> [0, 1, 2]
[...range(3)]; // -> [0, 1, 2]
```

### Double-argument range to provide start and end value

Will have a default step-value of 1.

```ts
[...range(2, 6)]; // -> [2, 3, 4, 5];
[...range(-4, -1)]; // -> [-4, -3, -2];
```

### Triple-argument range to provide start, end, and step values.

```ts
[...range(1, 9, 2)]; // -> [1, 3, 5, 7];
[...range(2, 5, 1.2)]; // -> [2, 3.2, 4.4];
```

### Use a negative step-value to traverse backwards:

```ts
[...range(10, 6, -1)]; // -> [10, 9, 8, 7];
[...range(24, 18, -2)]; // -> [24, 22, 20];
```

### Can also use Infinity as an upper bound, but watch out for infinite loop!

```ts
for (const x of range(Infinity)) {
  console.log(x); // log: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 
  if (x >= 10) break;
}
```
