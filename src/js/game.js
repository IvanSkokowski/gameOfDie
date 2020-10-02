"use strict";
window.onload = function() {
    function make2Darray(rowCount, colCount) {
        let arr = new Array(rowCount).fill(0).map(() => new Array(colCount).fill(0));
        return arr;
    }

    function randomInteger(min, max) {
        return Math.round(min - 0.5 + Math.random() * (max - min + 1));
    }
    const Settings = {
        w: 30,
        gap: 2,
        rows: 10,
        cols: 10,
        bobms: 20,
        top: 15,
        left: 15,
    };
    let GameInfo = {
        time: 0,
        bestTime: 0,
        opened: 0,
        status: 'play'
    }

    const CellState = {
        empty: 0,
        bomb: 1,
    }

    let canvas = document.getElementById("myCanvas"),
        context = canvas.getContext("2d");
    let imgSprites = "img/Bitmap410.bmp";
    let img = new Image();
    img.src = imgSprites;
    img.onload = function() {
        context.drawImage(img,
            0, // sx
            0, // sy
            16, // swidth
            16, // sheight
            260, // x
            260, // y
            30, // width
            30); // height
    }

    const images = {
        hidden: {
            sx: 0,
            sy: 0,
            swidth: 16,
            sheight: 16,
        },
        flag: {
            sx: 0,
            sy: 16,
            swidth: 16,
            sheight: 16,
        },
        maybe: {
            sx: 0,
            sy: 32,
            swidth: 16,
            sheight: 16,
        },
        bombExploded: {
            sx: 0,
            sy: 48,
            swidth: 16,
            sheight: 16,
        },
        bombPredict: {
            sx: 0,
            sy: 64,
            swidth: 16,
            sheight: 16,
        },
        bombFall: {
            sx: 0,
            sy: 80,
            swidth: 16,
            sheight: 16,
        },

        maybeOpened: {
            sx: 0,
            sy: 96,
            swidth: 16,
            sheight: 16,
        },
        b8: {
            sx: 0,
            sy: 112,
            swidth: 16,
            sheight: 16,
        },
        b7: {
            sx: 0,
            sy: 128,
            swidth: 16,
            sheight: 16,
        },
        b6: {
            sx: 0,
            sy: 144,
            swidth: 16,
            sheight: 16,
        },
        b5: {
            sx: 0,
            sy: 160,
            swidth: 16,
            sheight: 16,
        },
        b4: {
            sx: 0,
            sy: 176,
            swidth: 16,
            sheight: 16,
        },
        b3: {
            sx: 0,
            sy: 192,
            swidth: 16,
            sheight: 16,
        },
        b2: {
            sx: 0,
            sy: 208,
            swidth: 16,
            sheight: 16,
        },
        b1: {
            sx: 0,
            sy: 224,
            swidth: 16,
            sheight: 16,
        },
        opened: {
            sx: 0,
            sy: 240,
            swidth: 16,
            sheight: 16,
        },
    };
    class Cell {
        constructor(state, x, y, w) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.state = state;
            this.hidden = true;
            this.flaged = false;
            this.neighbours = 0;
        }
        drawImage(image) {
            let { sx, sy, swidth, sheight } = image;
            context.drawImage(img, sx, sy, swidth, sheight, this.x, this.y, this.w, this.w)
        }
        drawFlag() {
            if (this.flaged) {
                this.drawImage(images.flag);
            }
        }
        drawBomb() {
            if (this.state === CellState.bomb) {
                this.drawImage(images.bombExploded);
            }
        }
        show() {
            // if (this.hidden) {
            //     this.drawImage(images.hidden);
            //     this.drawFlag();
            //     //todo: delete this.drawBomb();
            //     this.drawBomb();
            // } else {
            //     this.drawImage(images.opened);
            //     this.drawBomb();
            // }
            this.drawImage(images.opened);
            this.drawImage(images.opened);
        }
    }

    function getClickPos(e) {
        return { x: e.pageX - canvas.offsetLeft, y: e.pageY - canvas.offsetTop }
    }

    function clickPosToCellId(pos) {
        let col = parseInt(Math.ceil((pos.x - Settings.left) / (Settings.w + Settings.gap)) + '');
        let row = parseInt(Math.ceil((pos.y - Settings.top) / (Settings.w + Settings.gap)) + '');
        return {
            col: pos.x > Settings.left ? col : -1,
            row: pos.y > Settings.top ? row : -1,
        }
    }

    class Game {
        constructor(dificulty) {
            this.cellBoard = [];
        }
        setCells(settings) {
            let { rows, cols, w, gap, left, top } = settings;
            this.cellBoard = make2Darray(rows, cols);
            this.cellBoard.map((row, y) => row.map((_cell, x) => this.cellBoard[y][x] = new Cell(
                CellState.empty,
                x * (w + gap) + left,
                y * (w + gap) + top,
                w)));
            console.log('Maked ' + Settings.rows + 'x' + Settings.cols + ' board (' + Settings.rows * Settings.cols + ' cells):');
            console.log(this.cellBoard);
        }

        plantBombs(countBombs) {
            let planted = 0;
            let x, y;
            while (planted < countBombs) {
                x = randomInteger(0, Settings.cols - 1);
                y = randomInteger(0, Settings.rows - 1);
                if (this.cellBoard[y][x].state === CellState.empty) {
                    this.cellBoard[y][x].state = CellState.bomb;
                    planted++;
                }
            }
            console.log('Planted ' + planted + ' bombs:');
            console.log(this.cellBoard.map((row) => row.map((cell) => cell.state)));
        }
        init() {
            this.setCells(Settings);
            this.plantBombs(Settings.bobms);
            this.neighbours();
            canvas.addEventListener('click', (e) => this.click(e));
        }
        show() {
            this.cellBoard.map(function(row) {
                row.map((cell) => (cell.show()))
            })
        }
        start() {

        }

        click(e) {
            let pos = getClickPos(e);
            let { x, y } = pos;
            if ((x > Settings.left && x <= Settings.left + Settings.cols * (Settings.w + Settings.gap)) &&
                (y > Settings.top && y <= Settings.top + Settings.rows * (Settings.w + Settings.gap))) {
                let id = clickPosToCellId(pos);
                id.row -= 1;
                id.col -= 1;
                console.log(pos);
                console.log(id);
                let cell = this.cellBoard[id.row][id.col];
                if (cell.state === CellState.bomb) {
                    this.lost(id, cell);
                } else {
                    this.open(id, cell);
                }
            }


        }
        neighbours(id) {
            if (true) {

            }
        }
        lost(id) {
            console.log('game lost');
            let cell = this.cellBoard[id.row][id.col];
            cell.hidden = false;
            cell.show();

        }
        open(id) {
            console.log('open');
            let cell = this.cellBoard[id.row][id.col];
            cell.hidden = false;
            cell.show();
            if (cell.neighbours === 0) {
                this.search(id);
            }

        }
        search(id) {

        }
        play(id) {

        }
    }
    let game = new Game();
    game.init();
    game.show();

    // todo: seems click to cell should me another class
}