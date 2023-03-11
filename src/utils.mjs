/** @module utils */

/**
 * Symbol for indicating that something is empty.
 * It's nice to be specific. Things in javascript can end up as undefined,
 * (or sometimes maybe even null) unexpectedly, but when these utilties return
 * this symbol, you can be sure that they really are empty, and it's not a bug
 * elsewhere which caused the undefined or null to appear.
 * @type {Symbol}
 */
export const Empty = Symbol("Empty");

/**
 * Generic exception for when there's something wrong about a value
 * @class
 * @extends Error
 */
export class ValueError extends Error {
    constructor(msg, ...args) {
        super(msg, ...args);
        this.name = "ValueError";
    }
}

/**
 * comparision function to sort arrays numerically (js doesn't, by default)
 * @function numerically
 * @param {number} a
 * @param {number} b
 * @returns {number} a - b
 */
export const numerically = (a, b) => a - b;

/**
 * Is `obj` a "pojo"? (plain old javascript object).
 * Object literals are pojos. Exotic types such as Map are not.
 * @param {?} obj
 * @returns {Boolean}
 */
export function is_pojo(obj) { return !!obj && obj.constructor === Object; }

/**
 * the length (or size) of an object that has a length or size
 * @param {?} obj
 * @throws {TypeError} if the object has no concept of length or size
 * @returns {number} the length of the object
 * @example
 *   ["a", "bb", "ccc"].map(len) === [1, 2, 3]
 */
export function len(obj) {
    if (obj === undefined)
        throw new TypeError("len(): object of type undefined has no length");
    if (obj === null)
        throw new TypeError("len(): object of type null has no length");

    const length = obj.length;
    if (length !== undefined) return length;

    if (is_pojo(obj)) {
        return Object.keys(obj).length;
    }

    if (obj instanceof Set || obj instanceof Map) {
        return obj.size;
    }

    throw new TypeError(`len(): object of type '${_typeof(obj)}' has no length`);
}

/**
 * make a string of something. like `String`, just better
 * @param {?} obj
 * @throws {TypeError} if `obj` cannot be converted to a string
 * @returns {string}
 */
export function str(obj) {
    if (Array.isArray(obj)) {
        return `[${obj.map(str).join(", ")}]`;
    }
    if (is_pojo(obj)) {
        return JSON.stringify(obj);
    }
    try {
        return String(obj);
    } catch (e) {
        if (e instanceof TypeError) {
            if ("toString" in obj) {
                return obj.toString();
            } else {
                throw TypeError(
                    "str(): can't convert object to String, and obj has no .toString() method either",
                    { cause: e }
                );
            }
        } else {
            throw e;
        }
    }

}

/**
 * find the maximum element of an iterable
 * @param iterable
 * @returns {Any|Empty} the biggest element of `iterable`, or `Empty` if
 *   the iterable yielded no values
 */
export function max(iterable) {
    let winner = -Infinity;
    let empty = true;
    for (const item of iterable) {
        empty = false;
        if (item > winner) winner = item;
    }
    return empty ? Empty : winner;
}

/**
 * return the maximum element of an iterable, or `value` if the iterable was empty
 * @param {Object} iterable
 * @param {Object} value
 */
export function max_or(iterable, value) {
    const winner = max(iterable);
    return winner === Empty ? value : winner;
}

/**
 * min(iterable) - find the minimum item in a sequence
 * @param iterable
 */
export function min(iterable) {
    let winner = Infinity;
    let empty = true;
    for (const item of iterable) {
        empty = false;
        if (item < winner) winner = item;
    }
    return empty ? Empty : winner;
}

export function min_or(iterable, value) {
    const winner = min(iterable);
    return winner === Empty ? value : winner;
}

/** 
 * the type of the object, such that `(new type(obj)()` returns a new
 * (default) instance of the same type except for null, undefined, and
 * types that cannot be instantiated with `new`, such as `Symbol` or `BigInt`
 * @param {?} obj
 * @returns {null|undefined|Function} The constructor of `obj`, or `null` or `undefined`
 */
export function type(obj) {
    if (obj === undefined || obj === null) return obj;
    return Object.getPrototypeOf(obj).constructor;
}

/*
(function test_type() {
    const is_pojo = obj => !!obj && obj.constructor === Object;

    console.assert(type(null) === null);
    console.assert(type(undefined) === undefined);

    console.assert(type(true) === Boolean);
    console.assert((new type(true))() === false);

    console.assert(type(1) === Number);
    console.assert((new type(1))() === 0);

    console.assert(type("a string") === String);
    console.assert((new type("a string"))() === "");

    console.assert(type([1, 2, 3]) === Array);
    console.assert(Array.isArray( (new type([1, 2, 3]))() ));

    console.assert(type({}) === Object);
    console.assert(is_pojo( (new type({}))() ));

    console.assert(type(1n) === BigInt);

    console.assert(type(Symbol()) === Symbol);

    const m = new Map();
    console.assert(type(m) === Map);
    const same_type = new (type(m))();
    console.assert(Object.getPrototypeOf(same_type).constructor === Map);
    console.log("ok");
})();
//*/

/**
 * nicer "`typeof`"
 * @param {?} obj
 * @returns {string} a textual representation of what type `obj` is
 */
export function _typeof(obj) {
    if (obj === null) return "null";
    const t = typeof obj;
    switch (t) {
        case "undefined":
        case "boolean":
        case "number":
        case "string":
        case "symbol":
        case "function":
            return t;
    }
    return obj.constructor.name;
}

export function pad_center(size) {
    if (typeof size !== "number") {
        throw new TypeError(`pad_center(size): size must be a number, got ${_typeof(size)}`);
    }

    return function (str) {
        if (typeof str !== "string") throw new TypeError("curried pad_center(str): str must be a string");
        const to_pad = size - len(str);
        if (to_pad <= 0) return str;

        let left, right;
        left = right = to_pad / 2;

        if (to_pad % 2 === 1) right += 1;

        const result = " ".repeat(left) + str + " ".repeat(right);
        console.assert(result.length === size, `${result.length} !== ${size}`);
        return result;
    }
}

/**
 * remove common whitespace in front of every line
 * @param {string} str - the string to dedent
 * @returns {string} a dedented version of `str`
 */
export function dedent(str) {
    const lines = str.split("\n");

    let min_indent = Infinity;

    for (let line of lines) {
        // ignore empty lines for the sake of dedenting
        if (line.trim() === "") continue;
        let indented = 0;
        while (line[indented] === " ") indented++;
        if (indented < min_indent) min_indent = indented;
    }

    return lines.map(line => line.slice(min_indent, line.length)).join("\n");
}

/**
 * find all indexes of a given character
 * @param {string} character - a string of length 1
 * @returns {function(string): number[]} a function of `s`, which returns where `character` appears in `s`
 */
export function find_all_indexes(character) {
    return s => Array.from(s)
        .map((char, i) => [char === character, i])
        .filter(([keep, idx]) => keep)
        .map(([_keep, idx]) => idx);
}

/** 
 * Make all subarrays of `arrays` have equal length, such that
 * all "columns" consist of the same value. nulls are inserted where
 * the columns doesn't otherwise match up.
 * @param {number[][]} arrays
 * @example
 *   const arrays = [
 *       [ 0, 5, 9, 13 ],
 *       [ 1, 5, 9, 13 ],
 *   ];
 *   align_columns(arrays) == [
 *       [   0, null, 5, 9, 13],
 *       [null,    1  5, 9, 13],
 *   ];
*/
export function align_columns(arrays) {
    // find length (which is number of unique numbers)
    const s = new Set();
    for (let array of arrays) for (let element of array) s.add(element);
    const numbers = ([...s]).sort(numerically);
    const length = s.size;

    const out = Array(arrays.length).fill(0).map(_0 => []);

    for (const n of numbers) {
        const to_add = [];

        for (let arr of arrays) {
            to_add.push(arr.includes(n) ? n : null);
        }

        for (let i = 0; i < out.length; i++) {
            out[i].push(to_add[i]);
        }
    }

    return out;
}


/**
 *
 * return a function that accepts an iterable, and will call `func`
 * on every element of that iterable. The return value of that call is
 * used as the "group" that element belongs to, and added to an object
 * under that key.
 * @param {function(?): ?} grouping function
 * @example
 *   const is_divisible_by_2 = group_by(n => n % 2 === 0)
 *     is_divisible_by_2([0, 1, 2, 3, 4, 5])
 *     // { true: [0, 2, 4, 6], false: [1, 3, 5] }
 *
 *     group_by(len)(["A", "BB", "CC", "D", "EEE"])
 *     // { 1: ["A", "D"], 2: [ "BB", "CC"], 3: ["EEE"] }
 */
export function group_by(func) {
    return iterable => {
        const groups = new DefaultMap(Array);
        for (const element of iterable) groups.get(func(element)).push(element);
        return groups.to_pojo();
    };
}

/**
 * An extention of Map, where it is constructed with a factory function
 * instead of an optional iterable of entries.
 * It works like a regular Map, except a new instance of `factory` will
 * be created and retrieved if .get() is called on a key that doesn't exist.
 * It also has an additional `to_pojo()` method.
 * (inspired by python's defaultdict)
 * @class
 */
class DefaultMap extends Map {
    #factory;

    constructor(factory) {
        if (typeof factory !== "function") {
            throw new TypeError("DefaultMap.constructor(factory): factory must be a function");
        }
        super();
        this.#factory = factory;
    }

    get(key) {
        if (!this.has(key)) this.set(key, this.#factory());
        return super.get(key);
    }

    /**
     * return a pojo of the contents of the map
     * @returns {Object}
     */
    to_pojo() { return Object.fromEntries(this.entries()); }
}

/**
 * iterate over `iterable`, yielding pairs of [0, item1], [1, item2], ...
 * @param {?start} - what number to start iterating from. defaults to 0
 */
export function *enumerate(iterable, start = 0) {
    for (const res of zip(count(start), iterable)) yield res;
}

export function *zip(...iterables) {
    const iterators = iterables.map(_iter);
    outer: while (true) {
        const next_result = [];
        for (const it of iterators) {
            const next_it_result = it.next();
            if (next_it_result.done) break outer;
            next_result.push(next_it_result.value);
        }
        yield next_result;
    }
}

export function _iter(obj) {
    if (typeof obj === "undefined") {
        throw new TypeError("iter(): undefined is not iterable");
    }
    if (obj === null) {
        throw new TypeError("iter(): null is not iterable");
    }
    if (typeof obj === "boolean") {
        throw new TypeError("iter(): boolean is not iterable");
    }

    if (obj && typeof obj.next === "function") {
        // all we can do. if .next() doesn't behave properly, there was nothing
        // we could have done about it anyway
        return obj;
    }

    const it = obj[Symbol.iterator];
    if (typeof it === "function") {
        return it.call(obj);
    }

    if (is_pojo(obj)) {
        return object_iter(obj);
    }

    throw new TypeError("iter(): don't know how to make an iterator out of that");
}

function *object_iter(obj) {
    for (let key in obj) {
        if (Object.hasOwn(obj, key)) {
            yield [key, obj[key]];
        }
    }
}

/* strip({ characters, )
 *   argument strip_characters: iterable of characters (e.g. a str)
 *     (which characters to strip)
 * returns
 *   a function that takes a string,
 *   and it strips away the 'strip_characters' from the beginning and the end
 *
 * This function uses "currying".
 * Example use:
 *   [" abc ", "xx  ", "  yy" ].map(strip()); // ["abc", "xx", "yy"]
 *   or
 *   const strip_whitespace = strip(" \t\n");
 *   [" abc ", "xx  ", "  yy" ].map(strip_whitespace); // ["abc", "xx", "yy"]
 */
export function strip({ characters = " \t\n", from_beginning = true, from_end = true }) {
    try {
        characters = new Set(characters);
    } catch (e) {
        if (e instanceof TypeError) {
            throw new TypeError("strip(): 'characters' must be an iterable of strings of length 1", { cause: e });
        } else {
            throw e;
        }
    }

    for (const character of characters) {
        if (typeof character !== "string") {
            throw new TypeError("strip(): 'characters' must be an iterable of strings of length 1");
        }

        if (character.length !== 1) {
            throw new TypeError("strip(): 'characters' must be an iterable of strings of length 1");
        }
    }

    return function (str) {
        if (typeof str !== "string") {
            throw new TypeError("strip(): input must be a string");
        }

        let start = -1;
        let end = str.length;

        if (from_beginning) {
            while (characters.has(str[++start])) ;
        } else {
            start = 0;
        }

        while (from_end && characters.has(str[--end])) ;

        return str.slice(start, end + 1);
    }
}

export const strip_whitespace = strip({ characters: " \t\n" });


/*
 * range(stop)
 * range(start, stop, step = 1)
 *   iterator over numbers start..stop (stop not included), stepping by
 *   `step` between each number
 * @yields {number}
 */
export function *range(...args) {
    let start = 0, stop = null, step = 1;
    switch (args.length) {
        case 1: stop = args[0]; break;
        case 2: start = args[0]; stop = args[1]; break;
        case 3: start = args[0]; stop = args[1]; step = args[2]; break;
    }

    if (typeof stop !== "number") {
        throw new TypeError(`range(): argument 'stop' must be a number, not ${_typeof(stop)}`);
    }
    if (typeof start !== "number") {
        throw new TypeError(`range(): argument 'start' must be a number, not ${_typeof(start)}`);
    }
    if (typeof step !== "number") {
        throw new TypeError(`range(): argument 'step' must be a number, not ${_typeof(step)}`);
    }

    const going_up = step > 0;
    let i = start;
    if (going_up) {
        for (; i < stop; i += step) yield i;
    } else {
        for (; i > stop; i += step) yield i;
    }
}

/**
 * generator that counts. starts at 0 by default, and steps by 1
 * @param {?number} [start=0] - the first number to count from (inclusive)
 * @param {?number} [step=1] - add this many to each number we count
 * @yields {number}
 */
export function *count(start = 0, step = 1) { for (;; start += step) yield start; }
