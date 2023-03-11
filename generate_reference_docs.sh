#!/bin/bash

jsdoc2md -c jsdoc.conf --files ./src/utils.mjs > ./docs/docs/api/utils.md
jsdoc2md -c jsdoc.conf --files ./src/matrix.mjs > ./docs/docs/api/matrix.md
jsdoc2md -c jsdoc.conf --files ./src/table.mjs > ./docs/docs/api/table.md
