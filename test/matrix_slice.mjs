import t from "tap";
import { AUTOEND } from "./_utils.mjs";

import { Matrix, OutOfBoundsError } from "../src/matrix.mjs";

t.test("slice([], []) creates 0-by-0 matrix", AUTOEND, t => {
    const m = Matrix.from_data([ ["a", "b"], ["c", "d"] ]);

    const sliced = m.slice([], []);
    t.strictSame(0, sliced.width);
    t.strictSame(0, sliced.height);
});

t.test("slice just 1 column, all rows", AUTOEND, t => {
    const m = Matrix.from_data([ ["a", "b"], ["c", "d"] ]);
    const sliced = m.slice([0, 1], [0]);

    t.strictSame(2, sliced.height, "height is 2");
    t.strictSame(1, sliced.width, "width is 1");
    const expected = [ ["a"], ["c"] ];
    t.strictSame(expected, sliced.as_array());
});

t.test("slice just 1 row, all columns", AUTOEND, t => {
    const m = Matrix.from_data([ ["a", "b"], ["c", "d"] ]);
    const sliced = m.slice([0], [0, 1]);

    t.strictSame(1, sliced.height, "height is 1");
    t.strictSame(2, sliced.width, "width is 2");
    const expected = [ ["a", "b"] ];
    t.strictSame(expected, sliced.as_array());
});
