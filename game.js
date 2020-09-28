"use strict";
window.onload = function() {
    const CellStatus = {
        empty: {
            status: 0,
            color: "#c9d2c9"
        },
        mined: {
            status: 1,
            color: "#ee650a"
        },
        cracked: {
            status: 2,
            color: "#21de21"
        },
        exploded: {
            status: 3,
            color: "#ff0000"
        },
        // TODO: hide flagEmpty and flagMined as one status
        flagEmpty: {
            status: 4,
            color: "crimson"
        },
        flagMined: {
            status: 5,
            color: "crimson"
        },
    }
    const GameStatus = {
        defeat: 0,
        won: 1,
        play: 2,
    }
    const GameInfo = {
        status: GameStatus.play,
        mineCount: 16,
        time: 0,
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
    let minesCount = Math.round(minedAmount * (colCountVisible * rowCountVisible));
    let cellSize = { x: w / colCountVisible, y: h / rowCountVisible };

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
            if (mineBoard[rndY][rndX] === CellStatus.mined.status) {
                continue;
            } else {
                mineBoard[rndY][rndX] = CellStatus.mined.status;
                plantedMines++;
            }
        }
    }

    function getNeighboursCount(arr, x, y) {
        let result = 0;
        let x1 = 0;
        let y1 = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                x1 = x + j;
                y1 = y + i;
                result += arr[y1][x1] === CellStatus.mined.status ? 1 : 0;
            }
        }
        result -= arr[y][x] === CellStatus.mined.status ? 1 : 0;
        return result;
    }

    function checkNeighbours(mineBoard, neighbours) {
        for (let i = wallThickness; i < mineBoard.length - wallThickness; i++) {
            for (let j = wallThickness; j < mineBoard[i].length - wallThickness; j++) {
                neighbours[i][j] = getNeighboursCount(mineBoard, j, i);
            }
        }
        return neighbours;
    }
    console.log('Game Size=', colCountVisible * colCountVisible + ' (' + colCountVisible + 'x' + colCountVisible + ')');
    console.log('empty=', colCountVisible * colCountVisible - minesCount);
    console.log('mined=', minesCount);

    context.font = "9px Arial";
    let mineBoard = initBoard(rowCount, colCount);
    let neighboursCount = initBoard(rowCount, colCount);

    plantMines(mineBoard, minesCount);
    neighboursCount = checkNeighbours(mineBoard, neighboursCount);

    console.log(mineBoard);
    console.log(neighboursCount);
    DrawCells();

    function getMouseClick(e) {
        //console.log('e.pageX=' + e.pageX);
        //console.log('e.pageY=' + e.pageY);
        //console.log('canvas.offsetLeft=' + canvas.offsetLeft);
        //console.log('canvas.offsetTop=' + canvas.offsetTop);
        return { left: e.pageX - canvas.offsetLeft, top: e.pageY - canvas.offsetTop }
    }

    function clickPosToIndex(mouse) {
        return { x: Math.ceil(mouse.left / cellSize.x), y: Math.ceil(mouse.top / cellSize.y) };
    }

    function clickProcessor(e) {
        if (GameInfo.status == GameStatus.play) {
            switch (e.button) {
                case 0:
                    // TODO: if clicked on bomb -> show timer (mini game) to get to defuse bomb
                    console.log('Left click!')
                    break;
                case 2:
                    console.log('Right click!')
                    break;

            }
            // let mouse = getMouseClick(e);
            // let { x, y } = clickPosToIndex(mouse);
            // let neighbours = getNeighboursCount(mineBoard, x, y);

            // console.log(mouse, ' => ', x, y);
            // console.log('Neighbours=' + neighbours);
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

    function DrawCells() {
        for (let i = wallThickness, y = 0; i < rowCountVisible + wallThickness; i++, y++) {
            for (let j = wallThickness, x = 0; j < colCountVisible + wallThickness; j++, x++) {
                let x1 = x * (cellSize.x);
                let y1 = y * (cellSize.y);
                switch (mineBoard[i][j]) {
                    case CellStatus.empty.status:
                        context.fillStyle = CellStatus.empty.color;
                        break;
                    case CellStatus.mined.status:
                        context.fillStyle = CellStatus.mined.color;
                        break;;
                    case CellStatus.exploded.status:
                        context.fillStyle = CellStatus.exploded.color;
                        break;
                    case CellStatus.cracked.status:
                        context.fillStyle = CellStatus.cracked.color;
                        break;
                    case CellStatus.flagEmpty.status:
                        context.fillStyle = CellStatus.flagEmpty.color;
                        break;
                    case CellStatus.flagMined.status:
                        context.fillStyle = CellStatus.flagMined.color;
                        break;
                    default:
                        break
                }
                context.fillRect(x1, y1, cellSize.x, cellSize.y);
            }
        }
    }

    function info() {
        for (let i = wallThickness, y = 0; i < rowCountVisible + wallThickness; i++, y++) {
            for (let j = wallThickness, x = 0; j < colCountVisible + wallThickness; j++, x++) {
                let x1 = x * (cellSize.x);
                let y1 = y * (cellSize.y);
                let pos = clickPosToIndex(x1, y1);
                let neighbours = getNeighboursCount(mineBoard, pos.x + 1, pos.y + 1);
                let tmp = context.fillStyle;
                context.fillStyle = 'green';
                context.fillText(Math.round(x1).toString() + '-' + Math.round(y1).toString(), x1, y1 + cellSize.y / 3);
                context.fillText(j.toString() + ' ' + i.toString(), x1, y1 + cellSize.y / 3 + 10);
                context.fillText(neighbours, x1, y1 + cellSize.y / 3 + 20);
                context.fillStyle = tmp;
            }
        }
    }
};