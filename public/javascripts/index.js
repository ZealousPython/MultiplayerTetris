let currentPiece = null

let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')
const pieceOrigin = {x:72,y:0}
const boardImg = new Image()
boardImg.src = './images/Board.png'

let map = {}; // Reads inputs
let held = {}
let holdTime = {}
let DASTime = 5
let DASTimer = 10
  addEventListener("keydown", function(event){
    map[event.key] = true && !event.repeat;
    held[event.key] = true && !event.repeat;
    holdTime[event.key] = event.repeat ? 0:holdTime[event.key] 
    DASTimer = 10
    
  });
  addEventListener("keyup", function(event){
    delete map[event.key] 
    delete held[event.key];
    delete holdTime[event.key]
  });

function drawScreen(){
    ctx.clearRect(0,0,canvas.height,canvas.width)
    ctx.fillRect(0,0,320,336)
    ctx.drawImage(boardImg,0,0)
    drawBoard()
}

function drawBoard(){
    let pieceImg = new Image()
      pieceImg.src = './images/Blocks.png'
    for(let i = 0; i <board.length;i++){
        
        let x = pieceOrigin.x + (board[i][0] * 16)
        let y = pieceOrigin.y + ((19 - board[i][1]) * 16)
        ctx.drawImage(pieceImg, board[i][2][0]*16, board[i][2][1]*16, 16, 16, x, y, 16, 16)
    }
    if(currentPiece != null)
    currentPiece.draw(ctx,pieceOrigin)
}
function input(){
    for(let k in holdTime){
        holdTime[k] += 1
        console.log(k,holdTime[k])
    }
    if (map['ArrowLeft']){
        delete map['ArrowLeft'] 
        currentPiece.move(true)
    }
    else if (map['ArrowRight']){
        delete map['ArrowRight'] 
        currentPiece.move(false)
    }
    if(held['ArrowLeft'] && holdTime['ArrowLeft'] > DASTime){
        DASTimer -= 1
        if(DASTimer <= 0) {currentPiece.move(true); DASTimer = 10}
    }
    else if(held['ArrowRight'] && holdTime['ArrowRight'] > DASTime){
        DASTimer -= 1
        if(DASTimer <= 0) {currentPiece.move(false); DASTimer = 10}
    }
    if (map['z']){
        delete map['z'] 
        currentPiece.setRotation(false)
    }
    else if (map['x']){
        delete map['x'] 
        currentPiece.setRotation(true)
    }
    if (map[' ']){
        delete map[' '] 
        currentPiece.hardDrop()
    }
    
}
function mainloop(){
    if(currentPiece == null){
        
        currentPiece = new Piece(Math.floor(Math.random()*7))
    }
    if(currentPiece != null) input();
    currentPiece.update()      
    if(currentPiece.locked) currentPiece = null
    drawScreen()
    
    
    requestAnimationFrame(mainloop)
}
requestAnimationFrame(mainloop)