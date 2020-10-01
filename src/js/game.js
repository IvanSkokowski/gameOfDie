"use strict";
window.onload = function() {
    const CellColor = {
        empty: "#ffffff",
        mined: "00ffff",
        cracked: "#00ff00",
        exploded: "#ff0000",
        flagEmpty: "0000ff", // TODO: hide flagEmpty and flagMined as one status
        flagMined: "0000ff",
        flagMaybeMined: "0000ff",
        flagMaybeEmpty: "0000ff",
    }
    const CellType = {
        empty: 0,
        mined: 1,
        cracked: 2,
        exploded: 3,
        flagEmpty: 4,
        flagMined: 5,
        flagMaybeMined: 6,
        flagMaybeEmpty: 7,
    }
    const GameStatus = {
        defeat: 0,
        won: 1,
        play: 2,
    }
    const GameInfo = {
        status: GameStatus.play,
        minesCount: 16,
        opened: 0,
        cracked: 0,
        exploded: 0,
        time: 0,
        clickCount: 0,
    }
    const Button = {
        mouseLeft: 0,
        mouseRight: 2,
    }


    function randomInteger(min, max) {
        return Math.round(min - 0.5 + Math.random() * (max - min + 1));
    }

    let canvas = document.getElementById("myCanvas"),
        context = canvas.getContext("2d"),
        w = canvas.width,
        h = canvas.height;
    let colCountVisible = 10,
        rowCountVisible = 10;
    let wallThickness = 1, // minimum 1
        colCount = colCountVisible + wallThickness + wallThickness,
        rowCount = rowCountVisible + wallThickness + wallThickness,
        minedAmount = 0.16; // 0.0...1.0
    GameInfo.minesCount = Math.round(minedAmount * (colCountVisible * rowCountVisible));
    let Cell = {
        type: 0,
        neighbours: 0,
        pos: {
            rowID: 0,
            colID: 0,
            x: 0,
            y: 0,
        },
        size: {
            w: w / colCountVisible,
            h: h / rowCountVisible,
        }
    };

    function initBoard(rowCount, colCount) {
        let board = new Array(rowCount).fill(0).map(() => new Array(colCount).fill(0));
        return board;
    }

    function plantMines(mineBoard, minesCount) {
        let plantedMines = 0;
        while (plantedMines < minesCount) {
            let rndX = randomInteger(wallThickness, colCountVisible);
            let rndY = randomInteger(wallThickness, rowCountVisible);
            // TODO:24.09.2020:Ivan: Add option -> ограничение количества мин, рядом с которыми больше N-мин
            if (mineBoard[rndY][rndX] === CellType.mined) {
                continue;
            } else {
                mineBoard[rndY][rndX] = CellType.mined;
                plantedMines += 1;
            }
        }
    }

    function isMined(type) {
        return (type === CellType.mined) ||
            (type === CellType.flagMaybeMined) ||
            (type === CellType.flagMined) ||
            (type === CellType.exploded)
    }

    function getNeighboBoardsCount(pos) {
        let result = 0;
        let x = 0;
        let y = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                x = pos.colID + j;
                y = pos.rowID + i;
                result += isMined(mineBoard[y][x]);
            }
        }
        result -= isMined(mineBoard[pos.rowID][pos.colID]);
        return result;
    }

    function checkNeighbours(mineBoard, neighbours) {
        for (let i = wallThickness; i < mineBoard.length - wallThickness; i++) {
            for (let j = wallThickness; j < mineBoard[i].length - wallThickness; j++) {
                neighbours[i][j] = getNeighboBoardsCount({ rowID: i, colID: j });
            }
        }
        return neighbours;
    }


    context.font = "9px Arial";
    let mineBoard = initBoard(rowCount, colCount);
    let neighbours = initBoard(rowCount, colCount);

    plantMines(mineBoard, GameInfo.minesCount);
    neighbours = checkNeighbours(mineBoard, neighbours);

    function drawNeighboars(neighbours) {
        neighbours.map(function(row, idR) {
            return row.map(function(neighbour, idC) {
                return (context.fillText(neighbour, idC * Cell.size.w, idR + Cell.size.h / 3 + 20));
            });
        })
    }



    function getClickPos(e) {
        return { x: e.pageX - canvas.offsetLeft, y: e.pageY - canvas.offsetTop }
    }

    function clickPosToCellPos(pos) {
        return {
            colID: Math.ceil(pos.x / Cell.size.w),
            rowID: Math.ceil(pos.y / Cell.size.h)
        }
    }



    function toggleFlag() {
        if (Cell.type === CellType.mined) {
            mineBoard[Cell.pos.rowID][Cell.pos.colID] = (Cell.type = CellType.flagMaybeMined);
        } else if (Cell.type === CellType.flagMaybeMined) {
            mineBoard[Cell.pos.rowID][Cell.pos.colID] = (Cell.type = CellType.flagMined);
        } else if (Cell.type === CellType.flagMined) {
            mineBoard[Cell.pos.rowID][Cell.pos.colID] = (Cell.type = CellType.mined);
        }

        if (Cell.type === CellType.empty) {
            mineBoard[Cell.pos.rowID][Cell.pos.colID] = (Cell.type = CellType.flagMaybeEmpty);
        } else if (Cell.type === CellType.flagMaybeEmpty) {
            mineBoard[Cell.pos.rowID][Cell.pos.colID] = (Cell.type = CellType.flagEmpty);
        } else if (Cell.type === CellType.flagEmpty) {
            mineBoard[Cell.pos.rowID][Cell.pos.colID] = (Cell.type = CellType.empty);
        }
    }

    function openCell() {
        switch (mineBoard[Cell.pos.rowID][Cell.pos.colID]) {
            case CellType.empty:
                mineBoard[Cell.pos.rowID][Cell.pos.colID] = Cell.type.cracked;
                GameInfo.cracked += 1;
                break;
            case CellType.mined:
                mineBoard[Cell.pos.rowID][Cell.pos.colID] = Cell.type.exploded;
                GameInfo.exploded += 1;
                GameInfo.status = GameStatus.defeat;
                break;
            default:
                break;
        }
    }

    function cellPosToPos(pos) {
        return ({
            x: pos.colID * Cell.size.w,
            y: pos.rowID * Cell.size.h,
        })
    }

    function clickProcessor(e) {

        if (GameInfo.status == GameStatus.play) {
            GameInfo.clickCount += 1;
            console.log('GameInfo.clickCount=', GameInfo.clickCount)
            let clickPos = getClickPos(e);
            Cell.pos = clickPosToCellPos(clickPos);
            Cell.type = mineBoard[Cell.pos.rowID][Cell.pos.colID];
            Cell.neighbours = getNeighboBoardsCount(Cell.pos);
            switch (e.button) {
                case Button.mouseLeft:
                    // TODO: if clicked on bomb -> show timer (mini game) to get to defuse bomb
                    //console.log('Left click!')
                    openCell();
                    break;
                case Button.mouseRight:
                    //console.log('Right click!')
                    toggleFlag();
                    break;
            }
            drawCell(Cell);
            info();
        }
    }
    canvas.addEventListener('click', function(e) {
        clickProcessor(e);
    });
    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        clickProcessor(e);
        return false;
    }, false);

    function drawCells() {
        for (let i = wallThickness, y2 = 0; i < rowCountVisible + wallThickness; i++, y2++) {
            for (let j = wallThickness, x2 = 0; j < colCountVisible + wallThickness; j++, x2++) {
                Cell.type = mineBoard[i][j];
                Cell.pos = {
                    rowID: x2,
                    colID: y2,
                    x: x2 * (Cell.size.w),
                    y: y2 * (Cell.size.h),
                }
                drawCell(Cell);
                // drawCell({
                //     type: mineBoard[i][j],
                //     pos: {
                //         colID: x2,
                //         rowID: y2,
                //         x: x2 * (Cell.size.w),
                //         y: y2 * (Cell.size.h),
                //     }
                // });
            }
        }
    }

    function drawCell() {
        switch (Cell.type) {
            case CellType.flagEmpty:
            case CellType.flagMaybeEmpty:
            case CellType.flagMined:
            case CellType.flagMaybeMined:
            case CellType.mined:
            case CellType.empty:
                context.fillStyle = CellColor.empty;
                break;
            case CellType.exploded:
                context.fillStyle = CellColor.exploded;
                break;
            case CellType.cracked:
                context.fillStyle = CellColor.cracked;
                break;
            default:
                break
        }
        Object.assign(Cell.pos, cellPosToPos(Cell.pos));
        context.fillRect(Cell.pos.x, Cell.pos.y, Cell.size.w, Cell.size.h);
    }

    function info() {

        for (let i = wallThickness, y = 0; i < rowCountVisible + wallThickness; i++, y++) {
            for (let j = wallThickness, x = 0; j < colCountVisible + wallThickness; j++, x++) {

                let x1 = x * (Cell.size.w);
                let y1 = y * (Cell.size.h);

                let pos = clickPosToCellPos({ x: x1, y: y1 });
                //console.log(pos);
                pos.rowID += 1;
                pos.colID += 1;
                let neighbours = getNeighboBoardsCount(pos);
                let tmp = context.fillStyle;
                context.fillStyle = 'green';
                //context.fillText(Math.round(x1).toString() + '-' + Math.round(y1).toString(), x1, y1 + Cell.size.h / 3);
                //context.fillText(j.toString() + ' ' + i.toString(), x1, y1 + Cell.size.h / 3 + 10);
                context.fillText(neighbours, x1, y1 + Cell.size.h / 3 + 20);
                context.fillStyle = tmp;
                //debugger;
            }
        }
    }
    // console.log(mineBoard);
    // console.log(neighboursBoard);
    console.log('Game size =', colCountVisible * colCountVisible + ' (' + colCountVisible + 'x' + colCountVisible + ')');
    console.log( /*'Empty =', colCountVisible * colCountVisible - GameInfo.minesCount,*/ 'Mined =', GameInfo.minesCount);
    //info();

    drawCells();
    drawNeighboars(neighbours);
};