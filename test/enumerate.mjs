import t from "tap";
import { AUTOEND } from "./_utils.mjs";

import { enumerate } from "./../src/utils.mjs";

t.test("...", AUTOEND, t => {
    const a = ["a", "b", "c", "d", "e", "f"];

    const expected = [
        [ 0, "a" ],
        [ 1, "b" ],
        [ 2, "c" ],
        [ 3, "d" ],
        [ 4, "e" ],
        [ 5, "f" ],
    ];
    const actual = [...enumerate(a)];
    t.strictSame(expected, actual);
});
