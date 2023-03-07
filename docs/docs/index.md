# Overview

A small javascript library for dealing with tables with multiple rows
of column headers, and removing empty rows and columns.

Is pure javascript, and as such can be used from a component library easily.

## Installation

```bash
$ npm install @giellatekno/tablelib
```

## Creating a table

Tables with specific headers can easily be created from a nicely formatted
ascii representation of how you want the table to look, for example:

```javascript
import { Table } from "@giellatekno/tablelib";

const table = Table.from_format(`
    | A |    B    | C
    | a | b1 | b2 | c
  1 |
  2 |
`);
```

Will create a table with 2 rows and 4 columns.

## Setting data

(continued from above)

```javascript
table.data.set(0, 0, "value1");
```

### API

#### Class: Table

```typescript
Table.from_format(format_string, opts)
```

```typescript
new Table(
    caption: string,
    data,
    row_headers: Array<string>,
    column_headers: Array<Array<{ text: string, span: number }>>
)
```

Creates a new Table. `caption` is just a descriptive caption.
`row_headers` are the row headers, and only a single dimension array, because
the table only supports one column of row headers. On the other hand,
`column_headers` stores them line by line.

#### Class: Matrix

#### Class: Entry

A wrapper type for storing values, with handy utility functions. The stub
of the class is as follows:

```typescript
export class Entry {
    constructor(value?: Any) {}
    is_empty() {}
    is_not_empty() {}
    get value() {}
    set value(value: Any) {}
    clear() {}

    or_insert(value: Any) {}
    and_modify(fn: (value: Any) => Any) {}

    [Symbol.toPrimitive]() {}
    toString() {}
    toJSON() {}
}
```

These are hopefully fairly straight-forward. Omitting the argument to the
constructor creates an empty `Entry`. Passing `undefined` (or `null`) makes
the `Entry` non-empty with regards to the `.is_empty()` and `.is_not_empty()`
checks. Use `.clear()` to empty out the `Entry`.

The wrapped inner value is stored in the `.value` property.

The rust-inspired `.or_insert()` and `.and_modify()` functions works as follows:

- `.or_insert(value)` will set the inner value to `value`, but *only* if the `Entry` is empty. If the `Entry` is non-empty, it will do nothing. Think of it as *or if it's empty, then insert...*.
- `.and_modify(fn)` will pass the inner value to the function `fn`, and store the return value. If the `Entry` is empty, it will do nothing. Think of it as *and if there's a value, modify it the following way...*.
