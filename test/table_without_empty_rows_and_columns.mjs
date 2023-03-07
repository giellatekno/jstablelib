import t from "tap";
import { AUTOEND } from "./utils.mjs";

import { Table } from "../src/table.mjs";

t.test("Basic", AUTOEND, t => {
    const table = Table.from_format(`
                | A | B |     C
                | a | b | c1 | c2 | c3
        alpha   |
        bravo   |
        charlie |
    `);
    table.data.set(0, 0, "x");
    table.data.set(1, 1, "y");
    table.data.set(2, 3, "z");

    t.strictSame(["alpha", "bravo", "charlie"], table.row_headers, "row headers looks ok");

    const without = table.without_empty_rows_and_columns();

    t.strictSame(["alpha", "bravo", "charlie"], without.row_headers, "new row headers looks ok");
    const expected_column_headers = [
        [ { text: "A", span: 1 }, { text: "B", span: 1 }, { text: "C", span: 1 } ],
        [ { text: "a", span: 1 }, { text: "b", span: 1 }, { text: "c2", span: 1 } ],
    ];
    t.strictSame(expected_column_headers, without.column_headers, "new column headers looks ok");
    t.strictSame(3, without.data.height, "new height is ok");
    t.strictSame(3, without.data.width, "new width is ok");
});

t.test("1x3 column headers, 1 row, 1 empty field", AUTOEND, t => {
    t.test("first column header", AUTOEND, t => {
        const table = Table.from_format(`
            | A | B | C
          1 |
        `);
        table.data.set(0, 1, "y");
        table.data.set(0, 2, "z");
        const without = table.without_empty_rows_and_columns();
        const expected_column_headers = [
            [ { text: "B", span: 1 }, { text: "C", span: 1 } ]
        ];
        t.strictSame(expected_column_headers, without.column_headers, "new column headers looks ok");
        t.strictSame(1, without.data.height, "new height is ok");
        t.strictSame(2, without.data.width, "new width is ok");
    });

    t.test("second column empty", AUTOEND, t => {
        const table = Table.from_format(`
            A | B | C
        `);
        table.data.set(0, 0, "x");
        table.data.set(0, 2, "z");

        const without = table.without_empty_rows_and_columns();

        const expected_column_headers = [
            [ { text: "A", span: 1 }, { text: "C", span: 1 } ]
        ];
        t.strictSame(expected_column_headers, without.column_headers, "new column headers looks ok");
        t.strictSame(1, without.data.height, "new height is ok");
        t.strictSame(2, without.data.width, "new width is ok");
    });

    t.test("third column empty", AUTOEND, t => {
        const table = Table.from_format(`
            A | B | C
        `);
        table.data.set(0, 0, "x");
        table.data.set(0, 1, "y");

        const without = table.without_empty_rows_and_columns();

        const expected_column_headers = [
            [ { text: "A", span: 1 }, { text: "B", span: 1 } ]
        ];
        t.strictSame(expected_column_headers, without.column_headers, "new column headers looks ok");
        t.strictSame(1, without.data.height, "new height is ok");
        t.strictSame(2, without.data.width, "new width is ok");
    });

    t.test("no columns empty", AUTOEND, t => {
        const table = Table.from_format(`
            A | B | C
        `);
        table.data.set(0, 0, "x");
        table.data.set(0, 1, "y");
        table.data.set(0, 2, "z");

        const without = table.without_empty_rows_and_columns();

        const expected_column_headers = [
            [ { text: "A", span: 1 }, { text: "B", span: 1 }, { text: "C", span: 1 } ]
        ];
        t.strictSame(expected_column_headers, without.column_headers, "new column headers looks ok");
        t.strictSame(1, without.data.height, "new height is ok");
        t.strictSame(3, without.data.width, "new width is ok");
    });
});
