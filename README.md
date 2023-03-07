# tablelib

A small library for managing tables, so it can be integrated
into whichever js component library as necessary.

## Installation

```bash
$ npm i @giellatekno/tablelib
```

## Usage

A typical usecase is to make a table with some column and row headers, fill
the underlying `Matrix` (`.data`) with some values, then use
`.without_empty_rows_and_columns()`, and use the underlying structures to
show markup, or just get a string with `.as_console_str()`.

### Example

```javascript
import { Table } from "@giellatekno/tablelib";

// A 2-by-3 table, with multiple rows of column headers
const table = Table.from_format(`
    |   A     | B
    | a1 | a2 | b1
  1 |
  2 |
`);

table.data.set(0, 0, "1-a1");
table.data.set(1, 0, "2-a1");
table.data.set(0, 2, "1-b1");

const without = table.without_empty_rows_and_columns();

console.log(without.as_console_str());
```

Tables can have headers. Row headers and column headers.
Column headers can be spread over multiple rows. And a Table can be
made from an ascii format, like this:

```
   |    A    |  B  |  C  |  D
   | a1 | a2 |  b  |  c  |  d
 1 |
 2 |
 3 |
 4 |
 ```

which will be a table of 4 rows and 5 columns, with the first column header A
spanned over the columns "a1" and "a2" below it.
