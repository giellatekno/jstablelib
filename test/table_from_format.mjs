import t from "tap";
import { AUTOEND } from "./utils.mjs";

import { Table } from "../src/index.mjs";

const from_format_cases = [
    {
        title: "no row headers, one row of column headers",
        format: `
            a | b | c
        `,
        expected: {
            row_headers: [],
            column_headers: [
                [ { text: "a", span: 1 }, { text: "b", span: 1 }, { text: "c", span: 1 } ],
            ],
            table_height: 1,
            table_width: 3,
        }
    },
    {
        title: "only row headers",
        format: `
            A |
            B |
           CC |
          DDD |
            E |
        `,
        expected: {
            row_headers: ["A", "B", "CC", "DDD", "E"],
            column_headers: [],
            table_height: 5,
            table_width: 1,
        }
    },
    {
        title: "no row headers, two rows of column headers",
        format: `
              A  |B|C|D
            a1|a2|b|c|d
        `,
        expected: {
            row_headers: [],
            column_headers: [
                [
                    { text: "A", span: 2 },
                    { text: "B", span: 1 },
                    { text: "C", span: 1 },
                    { text: "D", span: 1 },
                ],
                [
                    { text: "a1", span: 1 },
                    { text: "a2", span: 1 },
                    { text: "b", span: 1 },
                    { text: "c", span: 1 },
                    { text: "d", span: 1 },
                ],
            ],
            table_height: 1,
            table_width: 5,
        }
    },
    {
        title: "1 row header, two rows of column headers",
        format: `
            |   A  |B|C|D
            | a1|a2|b|c|d
          1 |
        `,
        expected: {
            column_headers: [
                [
                    { text: "A", span: 2 },
                    { text: "B", span: 1 },
                    { text: "C", span: 1 },
                    { text: "D", span: 1 },
                ],
                [
                    { text: "a1", span: 1 },
                    { text: "a2", span: 1 },
                    { text: "b", span: 1 },
                    { text: "c", span: 1 },
                    { text: "d", span: 1 },
                ],
            ],
            row_headers: ["1"],
            table_height: 1,
            table_width: 5,
        },
    },
    {
        title: "3 span",
        format: `
                | A | B |     C
                | a | b | c1 | c2 | c3
        alpha   |
        bravo   |
        charlie |
        `,
        expected: {
            column_headers: [
                [
                    { text: "A", span: 1 },
                    { text: "B", span: 1 },
                    { text: "C", span: 3 },
                ],
                [
                    { text: "a", span: 1 },
                    { text: "b", span: 1 },
                    { text: "c1", span: 1 },
                    { text: "c2", span: 1 },
                    { text: "c3", span: 1 },
                ],
            ],
            row_headers: ["alpha", "bravo", "charlie"],
            table_height: 3,
            table_width: 5,
        }
    },
];

t.test("Table.from_format()", AUTOEND, t => {
    for (const { title, format, expected } of from_format_cases) {
        t.test(title, AUTOEND, t => {
            const table = Table.from_format(format);
            t.strictSame(expected.row_headers, table.row_headers, "row headers looks ok");
            t.strictSame(expected.column_headers, table.column_headers, "column headers looks ok");
            t.strictSame(expected.table_height, table.data.height, "height ok");
            t.strictSame(expected.table_width, table.data.width, "width ok");
        });
    }
});

/*
t.test("Table.without_empty_rows_and_columns", AUTOEND, t => {
    t.strictSame(1, 1, "1 === 1");
});
*/

