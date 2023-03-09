import {
    len,
    _iter,
    dedent,
    ValueError,
    find_all_indexes,
    align_columns,
    group_by,
    strip,
    range,
    strip_whitespace,
    enumerate,
    pad_center,
    zip,
} from "./utils.mjs";

import { Matrix } from "./matrix.mjs";

export class Table {
    constructor(caption, data, row_headers, column_headers) {
        this.caption = caption;
        this.data = data;
        this.row_headers = row_headers;
        this.column_headers = column_headers;
    }

    [Symbol.toPrimitive]() {
        const caption = this.caption ? `(${this.caption})` : "";
        return `Table<${this.data.height}, ${this.data.width}>${caption}`;
    }
    toString() { return this[Symbol.toPrimitive](); }

    static from_format(format, { caption = null } = {}) {
        if (typeof format !== "string") {
            throw new TypeError("Table.from_format(format): format must be a string");
        }

        const { row_headers, column_headers } = parse_tableformat_string(format);

        const width = column_headers.map(len).max_or(1);
        const height = len(row_headers) || 1; // if 0, height must at least be 1
        const data = new Matrix(height, width);

        return new Table(caption, data, row_headers, column_headers);
    }

    is_empty() { return this.data.is_empty(); }
    is_not_empty() { return this.data.is_not_empty(); }

    /**
     * Return a new table with only the specified rows and columns
     * @param {number[]} rows
     * @param {number[]} columns
     */
    slice(rows, columns) {
        const new_matrix = this.data.slice(rows, columns);
        const new_row_headers = this.row_headers
            .filter((header, i) => rows.includes(i));

        const new_column_headers = [];
        const despanned = despan(this.column_headers);
        for (const ch_row of despanned) {
            const arr = [];
            for (const [ch_idx, ch] of enumerate(ch_row)) {
                if (columns.includes(ch_idx)) {
                    console.log("pushing", ch);
                    arr.push(ch);
                }
            }
            new_column_headers.push(arr);
        }

        return new Table(
            this.caption,
            new_matrix,
            new_row_headers,
            respan(new_column_headers),
        );
    }

    as_grid_html({ screen_width }) {
        console.log("as_grid_html().", `screen_width (${typeof screen_width})=${screen_width}`);

        const additional_columns_due_to_having_row_headers = len(this.row_headers) > 0 ? 1 : 0;

        let num_grid_columns = 0;
        if (screen_width < 800) {
            num_grid_columns = 2;
        } else {
            num_grid_columns = this.data.width + additional_columns_due_to_having_row_headers;
        }
        console.log("num_grid_columns =", num_grid_columns);

        const height = this.data.height + len(this.column_headers);

        const ch = this.column_headers
            .map((ch_row, y) =>
                ch_row.map(({ text, span }, x) => {
                    const style = `grid-row-start: ${y + 1}; grid-row-end: span 1; grid-column-start: ${x + 1}; grid-column-end: span ${span};`;
                    return `<div style="${style}">${text === "(-)" ? "" : text}</div>`;
                }).join(""))
            .join("");

        // for now just the column headers
        const contents = ch;
        const container_styles = `
            display: grid;
            grid-template-columns: repeat(${num_grid_columns}, 1fr);
            grid-template-rows: repeat(${height}, 1fr);
        `;

        return `
            <div style="${container_styles}">
                ${contents}
            </div>
        `;
    }

    as_console_str({
        show_caption = true,
        caption_format = "{caption}",
        caption_placement = "top",
        empty_indicator = "-",
    } = {}) {
        const data_lines = this.data.as_console_str({ empty_indicator }).split("\n");

        // find the widest entry out of all the fields
        const widest_data_field = data_lines[0].split("|").map(len).max();
        const widest_row_header = this.row_headers.map(len).max_or(0);
        console.debug("Table::as_console_str(): this.column_headers =", this.column_headers);
        const widest_column_header =
            this.column_headers
                .map(arr =>
                    arr.map(obj => obj.text).map(len).max()
                )
                .max_or(1);


        const num_columns = this.column_headers.map(len).max_or(1);
        const entry_width = 2 + [widest_column_header, widest_row_header, widest_data_field].max();

        const pad = pad_center(entry_width);

        // pad out the data to the new width
        const padded_data_lines = data_lines.map(line =>
            line.split("|")
                 .map(strip_whitespace)
                 .map(pad)
                 .join("|"));

        const lines = [];

        // add the lines of matrix data, with the row header included
        if (this.row_headers.length > 0) {
            for (const [row_header, data_line] of zip(this.row_headers, padded_data_lines)) {
                lines.push(`${row_header} | ${data_line}`);
            }
        } else {
            // no row headers
            for (const data_line of padded_data_lines) {
                lines.push(data_line);
            }
        }

        // add the column headers
        const column_header_rows = [];
        for (let i = 0; i < this.column_headers.length; i++) {
            let line = [];
            if (this.row_headers.length > 0) {
                line.push(" ".repeat(widest_row_header - 1) + "- ");
            }

            for (let j = 0; j < this.column_headers[i].length; j++) {
                const { text, span } = this.column_headers[i][j];
                // TODO the width is incorrect either here or above, figure it out for perfect alignment
                const width = entry_width + ((span - 1) * (entry_width + 1));
                const pad = pad_center(width);
                line.push(pad(text));
            }

            column_header_rows.push(line.join("|"));
        }

        // add a dotted line between the column headers and the rest
        column_header_rows.push("-".repeat(entry_width * num_columns + widest_row_header + 1));

        // finally actually append them, using unshift() because the order is reversed
        for (let i = column_header_rows.length - 1; i >= 0; i--) {
            lines.unshift(column_header_rows[i]);
        }

        if (show_caption) {
            const max_line_length = lines.map(len).max();
            let caption = caption_format.replaceAll("{caption}", this.caption);
            caption = pad_center(max_line_length - caption.length)(caption);

            if (caption_placement === "top") {
                lines.unshift("");
                lines.unshift(caption);
            } else if (caption_placement === "bottom") {
                lines.push("");
                lines.push(caption);
            }
        }

        return lines.join("\n");
    }

    without_empty_rows_and_columns() {
        const {
            new_matrix,
            new_columns,
            new_rows,
        } = this.data.without_empty_rows_and_columns();

        const new_row_headers = [];
        if (this.row_headers.length > 0) {
            for (let row of Object.keys(new_rows).sort()) {
                new_row_headers.push(this.row_headers[row]);
            }
        }

        const new_column_headers = Array(len(this.column_headers))
            .fill(null).map(_ => []);
        const span_adjustments = Array(len(this.column_headers)).fill(0);

        const despanned_column_headers = despan(this.column_headers);

        for (let [_old, _new] of Object.entries(new_columns)) {
            for (const [i, nch] of enumerate(new_column_headers)) {
                const idx = _old - span_adjustments[i];
                //console.log(`_old = ${_old}, i = ${i}, idx = ${idx}`);
                const despanned_row = despanned_column_headers[i];
                console.assert(Array.isArray(despanned_row));
                const text = despanned_column_headers[i][idx];
                console.assert(typeof text === "string");
                //const { text, span } = this.column_headers[i][idx];

                // TODO how do I know what the new span really should be?
                nch.push({ text, span: 1 });

                // adjust spans
                //if (span > 1) {
                //    span_adjustments[i] += (span - 1);
                //}
            }
        }

        /*
        console.log("without_empty_rows_and_columns()");
        console.log("new_row_headers:", new_row_headers);
        console.log("new_column_headers:", new_column_headers);
        console.log("new_matrix:", new_matrix.str());
        console.log(new_matrix.raw_data);
        console.log(new_matrix.as_console_str());
        */

        return new Table(
            this.caption,
            new_matrix,
            new_row_headers,
            new_column_headers
        );

    }
}



const strip_pipe_from_end = strip({ characters: " |", from_beginning: false });
const out_empty_lines = line => len(strip_whitespace(line)) > 0;
const lengths_1_and_others = array => +!!(len(array) - 1);

function parse_tableformat_string(fmt) {
    fmt = dedent(fmt).split("\n").filter(out_empty_lines);

    let {
        0: _row_headers_indexes,
        1: column_pipe_indexes
    } = group_by(lengths_1_and_others)(fmt.map(find_all_indexes("|")));

    // seems there are only row headers
    if (column_pipe_indexes === undefined) column_pipe_indexes = [];

    column_pipe_indexes = align_columns(column_pipe_indexes);

    const row_headers = fmt.slice(len(column_pipe_indexes))
        .map(strip_pipe_from_end).map(strip_whitespace);

    const column_headers = fmt.slice(0, len(column_pipe_indexes))
        .map(line =>
            line.split("|").map(column => column.trim())
                .filter(s => (s !== "-") && (s !== ""))
                .map(s => ({ text: s, span: 1 })));

    // adjust spans, based on the aligned indexes
    for (let [pipe_indexes, ch_row] of zip(column_pipe_indexes, column_headers)) {
        const null_indexes = find_all_indexes(null)(pipe_indexes);

        for (const [num_nulls_before, null_idx] of enumerate(null_indexes)) {
            const adjusted_index = null_idx === 0 ? 0 : null_idx - num_nulls_before - 1;
            ch_row[adjusted_index].span++;
        }
    }

    return { row_headers, column_headers };
}


// from [ [ { text: "a", span: 3 }, ...], ... ]
// to [ ["a", "a", "a"], ... ]
function despan(column_headers) {
    const out = [];
    for (const ch_row of column_headers) {
        const row = [];
        for (const { text, span } of ch_row) {
            for (const x of range(span)) {
                row.push(text);
            }
        }
        out.push(row);
    }
    return out;
}

// opposite of despan
function respan(column_headers) {
    const out = [];

    // [
    //   [ "a", "a", "a" ],
    //   [ "A", "B", "C" ],
    // ]
    // -->
    // [
    //   [ { text: "a": span: 3 } ],
    //   ...
    // ]
    for (const row of column_headers) {
        const new_row = [];
        let span = 1;
        const it = _iter(row);
        let { done, value } = it.next();
        if (done) continue;
        let current_value = value;

        while (true) {
            let { done, value } = it.next();
            if (done) {
                new_row.push({ text: current_value, span });
                break;
            }
            if (value === current_value) {
                span++;
            } else {
                new_row.push({ text: current_value, span });
                current_value = value;
                span = 1;
            }
        }
        out.push(new_row);
    }
    
    return out;
}
