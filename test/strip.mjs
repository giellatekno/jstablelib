import t from "tap";
import { AUTOEND } from "./utils.mjs";

import { strip } from "../src/utils.mjs";

t.test("strip()", AUTOEND, t => {
    t.test("strip_whitespace()", AUTOEND, t => {
        const strip_whitespace = strip({ characters: "\n\t ", from_beginning: true, from_end: true });
        t.strictSame("a", strip_whitespace("a  "), "a" === 'strip_whitespace("a  ")');
        t.strictSame("a", strip_whitespace("  a"), "a" === 'strip_whitespace("  a")');
        t.strictSame("a", strip_whitespace("  a  "), "a" === 'strip_whitespace("  a  ")');
        t.strictSame("a", strip_whitespace("\n\t\ta  "), "a" === 'strip_whitespace("\n\t\ta  ")');
    });

    t.test("only from end (strip_end = strip({ ..., from_end: true }))", AUTOEND, t => {
        const strip_end = strip({ characters: ",.-", from_beginning: false });

        t.strictSame("--A", strip_end("--A--"), '"--A" === strip_end("--A--")');
    });
});
