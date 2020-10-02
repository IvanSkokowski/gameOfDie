"use strict";

function make2Darray(rowCount, colCount) {
    let arr = new Array(rowCount).fill(0).map(() => new Array(colCount).fill(0));
    return arr;
}

function Cell(type, x, y, w) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.type = type;
}
Cell.prototype.show = function() {
    canvas.fillRect(this.x, this.y, this.w, this.h);
}

function Game(rows, cols) {
    this.mineboard = make2Darray(rows, cols);
}