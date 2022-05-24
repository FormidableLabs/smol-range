# JS Range

This repo contains code for a `range` utility function that aims to replicate Python's `range` function. This `range` function has a few interesting properties:

- Uses iterators (_not_ arrays) for iteration, so no unnecessary memory usage.
- Uses `Proxy` to add some custom behavior, such as handling the `in` keyword (to test if a number is "in" the range) and adding functionality to look up range values by step (e.g., `range(2, 5)[1] === 3`).
- Supports negative steps, and non-integer start/end/step values, but suffers from floating-point errors 🙃

## Sample Usage

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

### Custom `in` operation to check if number in range.

Using `Proxy` API, this library adds custom behavior to the `in` operation for `range` outputs which allows you to test if a value is in a range. Simple example:

```ts
const myRange = range(2, 5); // -> 2, 3, 4

2 in myRange; // -> true
4 in myRange; // -> true
5 in myRange; // -> false
```

Any value that _should_ be able to be iterated over by the `range` output should test `true` via the `in` operation.

### Index lookups

Using `Proxy` API, this code adds custom behavior for property lookups on the `range` output, so that you can get a specific range value without having to iterate over the range. For example:

```ts
const myRange = range(4, Infinity, 3);

myRange[0]; // -> 4
myRange[1]; // -> 7
myRange[272]; // -> 820
myRange[1369]; // -> 4111
```
