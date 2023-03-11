import t from "tap";
import { AUTOEND } from "./_utils.mjs";

import { ValueError } from "./../src/utils.mjs";
import { Matrix } from "../src/matrix.mjs";

t.test("rejects invalid-looking data", AUTOEND, t => {
    t.throws(
        () => Matrix.from_data(null),
        TypeError,
        "Matrix.from_data(null) throws TypeError"
    );

    t.throws(
        () => Matrix.from_data([[1], [2, 3] ]),
        ValueError,
        "Matrix.from_data([ [1], [2, 3] ]) throws ValueError (all rows must be same length)"
    );
});

t.test("accepts [], and treats it as 0-by-0 matrix", AUTOEND, t => {
    const m = Matrix.from_data([]);
});

t.test("simple 2-by-2", AUTOEND, t => {
    const m = Matrix.from_data([ ["a", "b"], ["c", "d"] ]);
    t.strictSame(2, m.height, "height is 2");
    t.strictSame(2, m.width, "width is 2");
});

t.test("simple 2x3", AUTOEND, t => {
    const m = Matrix.from_data([ ["a", "b", "c"], ["d", "e", "f"] ]);
    t.strictSame(2, m.height, "height is 2");
    t.strictSame(3, m.width, "width is 3");
});
