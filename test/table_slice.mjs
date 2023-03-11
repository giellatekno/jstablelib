import t from "tap";
import { AUTOEND } from "./_utils.mjs";

import { Table } from "../src/table.mjs";

t.test("Basic", AUTOEND, t => {
    const table = Table.from_format(`
                | A | B |     C
                | a | b | c1 | c2 | c3
        alpha   |
        bravo   |
        charlie |
    `);
    table.data.set(0, 0, "alpha-A-a");
    table.data.set(0, 1, "alpha-B-b");
    table.data.set(0, 3, "alpha-C-c2");

    const sliced = table.slice([0], [0, 1, 3]);
    const expected_row_headers = ["alpha"];
    const expected_column_headers = [
        [
            { text: "A", span: 1 },
            { text: "B", span: 1 },
            { text: "C", span: 1 },
        ],
        [
            { text: "a", span: 1 },
            { text: "b", span: 1 },
            { text: "c2", span: 1 },
        ]
    ];

    t.strictSame(expected_row_headers, sliced.row_headers);
    t.strictSame(expected_column_headers, sliced.column_headers);
});
