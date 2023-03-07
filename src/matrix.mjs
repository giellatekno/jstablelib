import {
    ValueError,
    Empty,
    str,
    len,
    max,
    max_or,
    pad_center,
    numerically,
    range,
    _typeof,
} from "./utils.mjs";

export class OutOfBoundsError extends Error {
    constructor(msg, ...args) {
        super(msg, ...args);
        this.name = "OutOfBoundsError";
    }
}

Array.prototype.max = function() { return max(this); }
Array.prototype.max_or = function (value) { return max_or(this, value); }

export class Entry {
    #value;
    constructor(value) { this.#value = arguments.length === 0 ? Empty : value; }
    is_empty() { return this.#value === Empty; }
    is_not_empty() { return !this.is_empty(); }
    get value() { return this.#value; }
    set value(value) { this.#value = value; }
    clear() { this.#value = Empty; }

    // these two are sort of "Rust-ic", I have yet to make up my mind on them
    or_insert(value) { if (this.is_empty()) this.#value = value; return this; }
    and_modify(fn) { if (this.is_not_empty()) this.#value = fn(this.#value); return this; }

    [Symbol.toPrimitive]() { return this.is_empty() ? "Entry<(empty)>" : this.#value; }
    toString() { return this.is_empty() ? "Entry<(empty)>" : String(this.#value); }
    toJSON() { return this.is_empty() ? "null" : JSON.stringify(this.#value); }
}

export class Matrix {
    #data;
    #width;
    #height;

    // opts = {
    //   fill: static value to fill with, or function that takes (x, y) and returns a value
    //   data: pre-filled array of arrays of data, all rows must have the same amount of columns
    // }
    constructor(height, width, opts = {}) {
        if ("data" in opts) {
            this.set_raw_data(opts.data);
            return;
        }

        if (height === undefined) {
            this.set_raw_data([]);
            return;
        }

        this.#width = width;
        this.#height = height;
        if (!("fill" in opts)) {
            this.#data = Array(height).fill(null)
                .map(_ => Array(width).fill(null).map(_ => new Entry));
        } else {
            const fill = opts.fill;
            this.#data = Array(height);
            for (let y = 0; y < height; y++) {
                this.#data[y] = Array(width);

                for (let x = 0; x < width; x++) {
                    this.set(y, x, fill(x, y));
                }
            }
        }
    }

    static from_data(data) {
        if (!Array.isArray(data)) {
            throw new TypeError("Matrix.from_data(data): data must be an array");
        }

        try {
            return new Matrix(null, null, { data });
        } catch (e) {
            if (e instanceof ValueError) {
                throw new ValueError("Matrix.from_data(data): malformed format of given 'data'", { cause: e });
            } else {
                throw e;
            }
        }
    }

    [Symbol.toPrimitive]() { return `Matrix<${this.#height}, ${this.#width}>`; }
    str() { return this[Symbol.toPrimitive](); }

    set(y, x, value) { this.#boundcheck(y, x, "set"); this.#data[y][x] = new Entry(value); }
    get(y, x) { this.#boundcheck(y, x, "get"); return this.#data[y][x]; }

    // retrieve the underlying array, with all field values extracted
    as_array({ empty_treated_as = undefined } = {}) {
        return this.#data.map(columns =>
            columns.map(entry => entry.value)
                .map(value => value === Empty ? empty_treated_as : value)
        );
    }

    get raw_data() { return this.#data; }
    get width() { return this.#width; }
    get height() { return this.#height; }

    set_raw_data(data) {
        if (!Array.isArray(data)) throw new TypeError("Table.set_raw_data(data): data must be an array");

        if (data.length === 0) {
            this.#data = [];
            this.#width = 0;
            this.#height = 0;
            return;
        }

        const width = data[0].length;
        console.log("set_raw_data():", width);

        for (let y = 0; y < data.length; y++) {
            const subarray = data[y];
            if (!Array.isArray(subarray))
                throw new TypeError(`Table.set_raw_data(data): expected element ${y} of data to be array, not ${_typeof(subarray)}`);
            if (subarray.length !== width) {
                throw new ValueError(`Table.set_raw_data(data): row ${y} has incorrect width of ${subarray.length}.`
                    + ` It was expected to be of length ${width}, since the first row was of length ${width},`
                    + ` and all rows of a Matrix must be the same length.`);
            }
        }

        // wrap every data entry in Entry
        data = data.map(lines => lines.map(entry => new Entry(entry)));

        this.#data = data;
        this.#height = this.#data.length;
        this.#width = this.#data[0].length;
    }

    transpose() {
        const n = new Matrix(this.#width, this.#height);
        for (let y = 0; y < this.#height; y++) {
            for (let x = 0; x < this.#width; x++) {
                n.set(x, y, this.get(y, x).value);
            }
        }
        return n;
    }

    as_console_str({ empty_indicator = "-" } = {}) {
        const lines = [];
        const replace_empty = typeof empty_indicator === "string";

        for (let y = 0; y < this.#height; y++) {
            const cols = [];

            for (let x = 0; x < this.#width; x++) {
                let value = this.get(y, x);

                if (replace_empty && value.is_empty() ) {
                    value = empty_indicator;
                }

                cols.push(value);
            }

            lines.push(cols);
        }

        const stringified_lines = lines.map(entries => entries.map(str));
        const widest_entry = stringified_lines.map(entries => entries.map(len).max_or(0)).max_or(0);
        const pad = pad_center(widest_entry);
        return stringified_lines.map(entries => entries.map(pad).join(" | ")).join("\n");
    }

    // Iterator over pairs of coordinates and values of this matrix
    *entries() {
        for (const y of range(this.#height)) {
            for (const x of range(this.#width)) {
                const entry = this.get(y, x);
                if (entry.is_not_empty()) {
                    yield [[y, x], entry.value];
                }
            }
        }
    }

    without_empty_rows_and_columns() {
        const entries = [...this.entries()].map(([[y, x], _value]) => [y, x]);
        const rows = [...new Set(entries.map(([y, x]) => y))].sort(numerically);
        const columns = [...new Set(entries.map(([y, x]) => x))].sort(numerically);
        const new_matrix = new Matrix(len(rows), len(columns));

        // so far so good

        // read the valeus from the old matrix, and write them into the right
        // place in the new one
        // also create mapping of old -> new for both rows and columns
        const new_columns = {}
        const new_rows = {};
        let next_y = 0;
        for (let y of rows) {
            let next_x = 0;
            for (let x of columns) {
                new_matrix.set(next_y, next_x, this.get(y, x).value);
                new_columns[x] = next_x;
                new_rows[y] = next_y;
                next_x++;
            }
            next_y++;
        }

        return { new_matrix, new_columns, new_rows };
    }

    #boundcheck(y, x, funcname) {
        if (this.#width === 0 || this.#height === 0)
            throw new OutOfBoundsError(`Matrix.${funcname}(x (=${x}), y (=${y})): ` +
                `can't access data, matrix is 0-dimensioned`);

        const errors = [];
        if (x < 0) errors.push("x must be non-negative")
        if (x >= this.#width) errors.push(`x must be < ${this.#width}`);
        if (y < 0) errors.push("y must be non-negative")
        if (y >= this.#height) errors.push(`y must be < ${this.#height}`);
        if (errors.length > 0) {
            throw new OutOfBoundsError(`Matrix.${funcname}(x=${x}, y=${y}): ${errors.join(", ")}`);
        }
    }
}


// the error message when setting a value on a 0x0 matrix is a bit strange,
// so I thought about this, but I dunno..
// I guess it serves as a nice interface, though
export const EmptyMatrix = new (class _EmptyMatrix {
    [Symbol.toPrimitive]() { return `Matrix<0, 0>`; }
    str() { return this[Symbol.toPrimitive](); }

    set(y, x, value) { throw new OutOfBoundsError("Can't set value on the Empty Matrix, as is has no dimensions"); }
    get(y, x) { throw new OutOfBoundsError("Can't get value from the Empty Matrix, as is has no dimensions"); }

    //static from_data(data) { throw new ValueError("can't create EmptyMatrix that has data"); }
    get raw_data() { return []; }
    get width() { return 0; }
    get height() { return 0; }

    set_raw_data(data) { throw new Error("can't set data on the Empty matrix, as it has no dimensions"); }
    without_empty_rows_and_columns() { /* well that would just look the same */ return this; }
    transpose() { /* is its own transpose, in a way */ return this; }
    as_console_str() { return ""; }
});

