/** @module entry */

import { Empty } from "./utils.mjs";

/**
 * A generic wrapper of a single contained `value`. Useful because it
 * uses a symbol (`Empty`) to determine when the `Entry` is empty, instead
 * of using `undefined` or `null` for that purpose. This means that `undefined`
 * or `null` are perfectly possible to use as "contained values".
 */
export class Entry {
    /**
     * The wrapped value.
     * @private
     */
    #value;

    /**
     * Construct a new Entry.
     * @param [value] {Any} - If given, the `Entry` will contain this `value`. If
     * not given, the `Entry` will be empty.
     */
    constructor(value) { this.#value = arguments.length === 0 ? Empty : value; }

    /**
     * Is the entry empty?
     * @returns {Boolean}
     */
    is_empty() { return this.#value === Empty; }

    /**
     * Does the entry have a value?
     * @returns {Boolean}
     */
    is_not_empty() { return !this.is_empty(); }

    /**
     * get or set the contained inner value. Use
     * [clear()]{@link module:matrix.Entry#clear} to set it to Empty
     */
    get value() { return this.#value; }
    set value(value) { this.#value = value; }

    /**
     * Clear out the stored value. The Entry is now empty.
     */
    clear() { this.#value = Empty; }

    /**
     * If the Entry is empty, make it store `value`, otherwise, do nothing.
     * @param value {Any}
     * @returns {this}
     */
    or_insert(value) { if (this.is_empty()) this.#value = value; return this; }

    /**
     * If the Entry contains a value, modify it by calling `fn` with the
     * contained value as it's argument, and save the return value as the
     * inner value of the Entry. If the Entry is empty, do nothing.
     * @param fn {function(Any): Any}
     * @returns {this}
     * @example
     *   const e = new Entry(1);
     *   e.and_modify(value => value + 1);
     *   console.assert(e.value === 2);
     */
    and_modify(fn) { if (this.is_not_empty()) this.#value = fn(this.#value); return this; }

    [Symbol.toPrimitive]() { return this.is_empty() ? "Entry<(empty)>" : this.#value; }
    toString() { return this.is_empty() ? "Entry<(empty)>" : String(this.#value); }
    toJSON() { return this.is_empty() ? "null" : JSON.stringify(this.#value); }
}
