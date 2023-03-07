import t from "tap";
import { AUTOEND } from "./utils.mjs";

import { Matrix, OutOfBoundsError } from "../src/matrix.mjs";

t.test("`m = new Matrix()` creates a 0 by 0 matrix", AUTOEND, t => {
    const m = new Matrix;
    t.strictSame(m.str(), "Matrix<0, 0>", "stringification: m.str() === \"Matrix<0, 0>\"");
    t.strictSame(m.as_array(), [], "data appears as array of length 0: m.as_array() === []");
    t.throws(() => m.set(0, 0, 42), OutOfBoundsError, "can't set value: m.set(0, 0, 42) throws OutOfBoundsError");
});

t.test("m = new Matrix(2, 3)", AUTOEND, t => {
    const m = new Matrix(2, 3);
    t.strictSame(2, m.height, "m.height === 2");
    t.strictSame(3, m.width, "m.width === 3");
    t.strictSame(m.str(), "Matrix<2, 3>", "stringifaction: m.str() === \"Matrix<2, 3>\"");

    t.test("as_array()", AUTOEND, t => {
        const expected = [
            [ undefined, undefined, undefined ],
            [ undefined, undefined, undefined ],
        ];

        t.strictSame(m.as_array(), expected);
    });
});

t.test("transpose()", AUTOEND, t => {
    const m = new Matrix(2, 3);
    const transposed = m.transpose();
    const expected = [
        [ undefined, undefined ],
        [ undefined, undefined ],
        [ undefined, undefined ],
    ];
    t.strictSame(transposed.str(), "Matrix<3, 2>", "Transposed 2x3 matrix stringifies as \"Matrix<3, 2>\"");

    t.strictSame(expected, transposed.as_array(), "Matrix<2, 3> transposed() is Matrix<3, 2>");
});

t.test("without_empty_rows_and_columns()", AUTOEND, t => {
    const m = new Matrix(4, 4);
    m.set(0, 0, "A");
    m.set(2, 2, "B");

    const updated = m.without_empty_rows_and_columns();
    const m_without = updated.new_matrix;
    t.strictSame(m_without.str(), "Matrix<2, 2>", "without.str() === \"Matrix<2, 2>\"");

    const expected = [
        [ "A", undefined ],
        [ undefined, "B" ],
    ];
    t.strictSame(m_without.as_array(), expected, "stripped new matrix looks right");
});
