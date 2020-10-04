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
        w: 16,
        gap: 0,
        rows: 20,
        cols: 20,
        bobms: 40,
        top: 10,
        left: 10,
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
        b0: {
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
            let { swidth, sheight, sx, sy } = image;
            context.drawImage(img, sx, sy, swidth, sheight, this.x, this.y, this.w, this.w)
        }
        drawFlag() {
            if (this.flaged) {
                this.drawImage(images.flag);
            }
        }
        drawBomb(bombType) {

            if (this.state === CellState.bomb) {
                if (bombType === 'predicted') {
                    this.drawImage(images.bombPredict);
                } else if (bombType === 'exploded') {
                    this.drawImage(images.bombExploded);

                } else if (bombType === 'other') {
                    this.drawImage(images.bombFall);

                }
            }
        }
        show() {
            if (this.hidden) {
                if (this.flaged) {
                    this.drawImage(images.flag);
                } else {
                    this.drawImage(images.hidden);
                }
            } else {
                if (this.state === CellState.bomb) {
                    this.drawImage(images.bombExploded);
                } else {
                    this.drawImage(images['b' + this.neighbours]);
                }

            }
            if (this.flaged === true) {
                this.drawImage(images.flag);
            }
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
            this.calcNeighbours();
            canvas.addEventListener('click', (e) => this.click(e, 'left'));
            canvas.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                this.click(e, 'right');
                return false;
            }, false);
            img.onload = () => { this.show(); };
        }
        show() {
            this.cellBoard.map((row) => { row.map((cell) => (cell.show())) });
        }
        start() {

        }
        isClickInBoard(x, y) {
            return (x > Settings.left && x <= Settings.left + Settings.cols * (Settings.w + Settings.gap)) &&
                (y > Settings.top && y <= Settings.top + Settings.rows * (Settings.w + Settings.gap))
        }
        click(e, button) {
            let pos = getClickPos(e);
            let { x, y } = pos;
            let id = clickPosToCellId(pos);
            id.row -= 1;
            id.col -= 1;
            console.log(pos);
            console.log(id);
            if (GameInfo.status === 'play') {
                if (this.isClickInBoard(x, y)) {
                    let cell = this.cellBoard[id.row][id.col];
                    if (button === 'left') {
                        if (cell.state === CellState.bomb) {
                            this.lost(id, cell);
                        } else {
                            this.open(id, cell);
                        }
                    } else if (button === 'right') {
                        cell.flaged = !cell.flaged;
                        cell.show();
                    }

                }


            }

        }
        calcNeighbours() {
            this.cellBoard.map((row, i) => row.map((cell, j) => cell.neighbours = this.neighbours({ row: i, col: j })));
        }
        neighbours(id) {
            let nbCount = 0;
            let dx, dy;
            for (let i = -1; i < 2; i++) {
                dy = id.row + i;
                if (dy < 0 || dy > Settings.rows - 1) {
                    continue;
                }
                for (let j = -1; j < 2; j++) {
                    dx = id.col + j;
                    if (dx < 0 || dx > Settings.cols - 1) {
                        continue;
                    }
                    let cell = this.cellBoard[dy][dx];
                    let state = cell.state;
                    nbCount += state;
                    // nbCount += this.cellBoard[dy][dx].state;
                }
            }
            return nbCount -= this.cellBoard[id.row][id.col].state;

        }
        lost(id) {
            GameInfo.status = 'lost';
            console.log('game lost');

            this.cellBoard.map((row, y) => {
                row.map((cell, x) => {
                    if (y !== id.row && x !== id.col && cell.state === CellState.bomb) {
                        cell.hidden = false;
                        if (cell.flaged) {
                            cell.drawBomb('predicted');

                        } else {
                            cell.drawBomb('other');
                        }


                    }
                })
            })

            let cell = this.cellBoard[id.row][id.col];
            cell.hidden = false;
            cell.show();
        }
        open(id) {
            console.log('open');
            let cell = this.cellBoard[id.row][id.col];
            if (cell.neighbours === 0) {
                this.search(id);
            } else {
                if (!cell.flaged) {
                    cell.hidden = false;
                    cell.show();
                }
            }
        }
        search(id) {
            let toOpen = [],
                toClose = [],
                completed = [],
                nb0 = [];

            let board = this.cellBoard;
            toOpen.push(id)

            while (toOpen.length > 0) {
                checkDirections(toOpen.pop());
            }

            function openAround0(id) {
                let opened = 0;
                let dx, dy;
                for (let i = -1; i < 2; i++) {
                    dy = id.row + i;
                    if (dy < 0 || dy > Settings.rows - 1) {
                        continue;
                    }
                    for (let j = -1; j < 2; j++) {
                        dx = id.col + j;
                        if (dx < 0 || dx > Settings.cols - 1) {
                            continue;
                        }
                        if (board[dx][dy].state === CellState.empty) {
                            board[dx][dy].hidden = false;
                            board[dx][dy].show();
                        }
                    }
                }
                return opened -= 1;

            }
            while (nb0.length > 0) {
                let d0 = nb0.pop();
                openAround0(d0);

            }

            function checkDirections(id) {
                let dx, dy;
                if (inScope(dx = id.col - 1, dy = id.row) && !completed.includes('' + dx + ' ' + dy)) {
                    _searchRoute(dx, dy, 'top');
                }
                if (inScope(dx = id.col + 1, dy = id.row) && !completed.includes('' + dx + ' ' + dy)) {
                    _searchRoute(dx, dy, 'bottom');
                }
                if (inScope(dx = id.col, dy = id.row - 1) && !completed.includes('' + dx + ' ' + dy)) {
                    _searchRoute(dx, dy, 'left');
                }
                if (inScope(dx = id.col, dy = id.row + 1) && !completed.includes('' + dx + ' ' + dy)) {
                    _searchRoute(dx, dy, 'right');
                }
            }

            function inScope(dx, dy) {
                return (dx >= 0 && dx < Settings.cols) && (dy >= 0 && dy < Settings.rows)
            }

            function _searchRoute(dx, dy, whare) {
                let cell = board[dx][dy];
                if (cell.neighbours === 0 && cell.hidden === true) {
                    cell.hidden = false;
                    cell.show();
                    toOpen.push({ row: dy, col: dx })
                    nb0.push({
                        row: dy,
                        col: dx,
                        whare: whare == 'top' || whare == 'bottom' ? 'vertical' : whare == 'left' || whare == 'right' ? 'horisontal' : ''
                    })
                } else {
                    toClose.push({
                        row: dy,
                        col: dx,
                        whare: whare == 'top' || whare == 'bottom' ? 'vertical' : whare == 'left' || whare == 'right' ? 'horisontal' : ''
                    })
                }
                completed.push('' + dx + ' ' + dy)
            }

            // if (board[id.row][id.col].hidden) {
            //     board[id.row][id.col].hidden = false;
            //     board[id.row][id.col].show();
            // }
        }

        play(id) {

        }
    }
    let game = new Game();
    game.init();
    game.show();
}