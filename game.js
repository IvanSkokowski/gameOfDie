"use strict";
function createArray2D(d1, d2){
    let arr = new Array(d1);
    for (let x = 0; x < d1; ++x){
        arr[x] = new Array(d2);
    }
    return arr;
}
function initArray2D(d1, d2){
    let arr = new Array(d1);
    for (let x = 0; x < d1; ++x){
        arr[x] = new Array(d2);
    }
    return arr;
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
const MineStatus = {
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
    }
}

function randomInteger(min, max) {
    // получить случайное число от (min-0.5) до (max+0.5)
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  }
// GAME HERE: !!!!!!!

window.onload = function () {
    let canvas = document.getElementById("myCanvas"),
    context = canvas.getContext("2d"),
    w = canvas.width,
    h = canvas.height;

    let mouse = { x:0, y:0};
    var draw = false;

    

    // gameboard settings

    let colCountVisible = 10,
    rowCountVisible = 10;
    let emptyCellsWallThickness = 1, // minimum 1
        colCount = colCountVisible + emptyCellsWallThickness+emptyCellsWallThickness,
        rowCount = rowCountVisible + emptyCellsWallThickness+emptyCellsWallThickness,
        minedAmount = 0.35; // 0.0...1.0
    let minesCount = Math.round(minedAmount*(colCountVisible*rowCountVisible));
    
    console.log('Game Size=', colCountVisible*colCountVisible+' ('+colCountVisible+'x'+colCountVisible+')');
    console.log('empty=', colCountVisible*colCountVisible-minesCount);
    console.log('mined=', minesCount);

    // init memmory
    let mineBoard = new Array(rowCount).fill(0).map(()=>new Array(colCount).fill(0));
    
    // clear
    for(let i = 0; i < rowCount; i++){
        for(let j = 0; j < colCount; j++){
            mineBoard[i][j] = 0;
        }
    }
    console.log(mineBoard);
    // planting explosive mines 
    let plantedMines = 0;
    while(plantedMines < minesCount){
        let rndX = randomInteger(emptyCellsWallThickness, colCount-emptyCellsWallThickness*2);
        let rndY = randomInteger(emptyCellsWallThickness, rowCount-emptyCellsWallThickness*2);
        // TODO:24.09.2020:Ivan: Add option -> ограничение количества мин, рядом с которыми больше N-мин
        if(mineBoard[rndY][rndX] === MineStatus.mined.status){
            continue;
        } else {
            mineBoard[rndY][rndX] = MineStatus.mined.status;
            plantedMines++;
        }
        // 
    }
    console.log(mineBoard);

    // TODO:24.09.2020:Ivan: Test Draw mines
    
    // gameboard cells settings
    let padding = 1; // padding - around cell
    let margin = 6; // margin - game board: top left right bottom
    // let maxCellSizeHorizontal = w / colCountVisible - padding * colCountVisible - margin*2; 
    // let maxCellSizeVertical = w / rowCountVisible - padding * rowCountVisible - margin*2; 
    // let maxCellSizeHorizontal = maxGameboardSize / colCountVisible - padding * colCountVisible; 
    // let maxCellSizeVertical = maxGameboardSize / rowCountVisible - padding * rowCountVisible; 
    
    // TODO: симетрия
    let cellPaddingX = 1;
    let cellPaddingY = 1;
    let boardLeftMargin = 10;
    let boardTopMargin = 0;
    let minCanvasSize = 350;
    
    let minCountVisible = colCountVisible < rowCountVisible ? colCountVisible : rowCountVisible;


    let cellSizeX = minCanvasSize / minCountVisible - boardLeftMargin / minCountVisible;
    let cellSizeY = minCanvasSize / minCountVisible - boardTopMargin / minCountVisible;

    let correctCellSizeX = cellSizeX - cellPaddingX * minCountVisible;
    let correctCellSizeY = cellSizeY - cellPaddingY * minCountVisible;
    function DrawCells(){
        context.beginPath();
        for(let i = 1, y = 0; i < mineBoard.length-1; i++, y++){
        for(let j = 1, x = 0; j < mineBoard[i].length-1; j++, x++){
            
            let x1 = x * (correctCellSizeX ) + (cellPaddingX ? cellPaddingX*x : 0) + boardLeftMargin;
            let y1 = y * (correctCellSizeY ) + (cellPaddingY ? cellPaddingY*y : 0) + boardTopMargin;
            
            switch(mineBoard[i][j]){
                case MineStatus.mined.status:
                    context.fillStyle = MineStatus.mined.color;
                    break;
                case MineStatus.empty.status:
                    context.fillStyle = MineStatus.empty.color;
                    continue;
                    break;
                case MineStatus.cracked.status:
                    context.fillStyle = MineStatus.cracked.color;
                    break;
                case MineStatus.exploded.status:
                    context.fillStyle = MineStatus.exploded.color;
                    break;
                default:
                    break
            }

            context.fillRect(
                x1,
                y1, 
                correctCellSizeX, 
                correctCellSizeY);
            }
        }  
        context.closePath();
    
    }
    DrawCells()


    canvas.addEventListener('click',function(e){

        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;

        context.beginPath();
        context.fillRect(mouse.x, mouse.y, 10, 10)
        context.closePath();
        //
        console.log( mouse.x,  mouse.y)
    });

// END GAME: !!!!!!!

    // class Game {
    //     constructor(width, height) {
    //         this.width = width;
    //         this.height = height;
    //         this.cellHeight = canvas.style.height / height;
    //         this.cellWidth = canvas.style.width / width;
    //         this.info();
    //     }
    //     info(){
    //         console.log('gameBoard size:', this.width, 'x', this.height, '(', this.width * this.height,'cells', ')',);
    //     }
    //     initGameBoard(){
    //         this.mine = createArray2D(this.width,this.height);
    //         for(let x = 0; x < this.width; x++){
    //             for(let y = 0; y < this.width; y++){
                    
    //             }
    //         }
    //     }
    //     draw() {

    //     }

    // }

    // let game = new Game(16,8)
};