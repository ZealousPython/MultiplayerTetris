let currentPiece = null;

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let canvas2 = document.getElementById('canvas2')
let ctx2 =canvas2.getContext("2d");
const pieceOrigin = { x: 72, y: 0 };
const boardImg = new Image();
boardImg.src = "./images/Board.png";

let queue = [];
let positionInQueue = 0;
const seed = "1"
const generator = new Math.seedrandom(seed);
const garbageGen = new Math.seedrandom(seed + "garbage1s")
let score = 0

let smallPieceImg = new Image();
smallPieceImg.src = "./images/smallBlocks.png";

let holdBoxPosition = { x: 33, y: 7 };
let boxPositionI = { x: 1, y: 5 };
let boxPosition = { x: 5, y: 9 };

let nextPosition = { x: 237, y: 7 };
let firstBoxPosition = { x: 237, y: 80 };

let heldPiece = null;
let heldLock = false;

let totalLines = 0;

let backToBack = 0
let totalGarbage = 0
let lastCleared = false

let lastGarbage = 0

let map = {}; // Reads inputs
let held = {};
let holdTime = {};
let DASTime = 8;
let dasdelay = 2;
let DASTimer = dasdelay;




addEventListener("keydown", function (event) {
  map[event.key] = true && !event.repeat;
  held[event.key] = true && !event.repeat;
  holdTime[event.key] = !event.repeat ? 0 : holdTime[event.key];
});
addEventListener("keyup", function (event) {
  delete map[event.key];
  delete held[event.key];
  delete holdTime[event.key];
});

function nextSeven() {
  blocksLeft = [0, 1, 2, 3, 4, 5, 6];
  for (let i = 6; i >= 0; i--) {
    let index = Math.floor(generator() * i);
    queue.push(blocksLeft[index]);
    blocksLeft.splice(index, 1);
  }
}
function sendGarbage(sentGarbage) {
  
}
function upShift() {
  for (let i = 0; i < board.length; i++) {
    board[i][1] += 1
  }
}
function addGarbage(amount) {
  for (let g = 0; g < amount; g++) {
    upShift()
    let position = lastGarbage
    if (Math.floor(garbageGen() * 10 + 1) <= 3) {
      position = Math.floor(garbageGen() * 10)
    }
    for (let i = 0; i < 9; i++) {
      board.push([i == position ? 9 : i, 0, [3, 1]])
    }
    lastGarbage = position
  }
}
function clearLines() {
  let linesCleared = 0;
  let clearedRows = [];
  let rowCounts = {};
  for (let i = 0; i < board.length; i++) {
    let point = board[i];
    let y = point[1];
    if (rowCounts[y] === undefined) {
      rowCounts[y] = 0;
    }
    rowCounts[y]++;
  }
  for (let y in rowCounts) {
    if (rowCounts[y] >= 10) {
      clearedRows.push(parseInt(y));
    }
  }
  linesCleared = clearedRows.length;
  linesToRemove = [];
  linesToShift = [];
  for (let i = 0; i < board.length; i++) {
    let point = board[i];
    let y = point[1];

    if (clearedRows.includes(y)) {
      linesToRemove.push(board[i]);
    } else {
      for (let e = 0; e < clearedRows.length; e++) {
        if (clearedRows[e] < y) {
          linesToShift.push(board[i]);
          break;
        }
      }
    }
  }
  linesToRemove.map((element) => board.splice(board.indexOf(element), 1));
  linesToShift.map((element) => {
    y = board[board.indexOf(element)][1];
    numToShift = 0;
    for (let i = 0; i < clearedRows.length; i++) {
      if (clearedRows[i] < y) {
        numToShift++;
      }
    }
    board[board.indexOf(element)][1] -= numToShift;
  });

  let garbage = 0
  if (board.length == 0) {
    score += 10000
    garbage = 10
  }
  else if (!wasTspin) {
    score += linesCleared * 100
    garbage = linesCleared
  }
  else {
    score += linesCleared * 2 * 100
    garbage = linesCleared * 2
  }
  garbage += backToBack
  totalLines += linesCleared;
  if (linesCleared > 0) {
    lastCleared = true
    backToBack += 1
  }
  else {
    lastCleared = false
    backToBack = 0
    sendGarbage(totalGarbage)
    totalGarbage = 0

  }
  if (linesCleared > 0) {
    totalGarbage += garbage
  }

  document.getElementById('score').innerHTML = "Score: " + score
}
ctx.scale(1, 1);
function drawScreen() {
  ctx.clearRect(0, 0, canvas.height, canvas.width);
  ctx.fillRect(0, 0, 320, 336);
  ctx.drawImage(boardImg, 0, 0);
  drawBoard(board,ctx,currentPiece);
  if (heldPiece != null) drawHeld(heldPiece,ctx);
  if (queue.length > 6) {
    drawQueue(queue,ctx,positionInQueue);
  }
  if (theirBoardState.board != null){
    ctx2.clearRect(0, 0, canvas2.height, canvas2.width);
    ctx2.fillRect(0, 0, 320, 336);
    ctx2.drawImage(boardImg, 0, 0);
    drawBoard(theirBoardState.board,ctx2,theirBoardState.piece);
    if (heldPiece != null) drawHeld(theirBoardState.held,ctx2);
    if (queue.length > 6) {
      drawQueue(theirBoardState.queue,ctx2,theirBoardState.queuePos);
    }
  }
}
function drawHeld(heldPiece,ctx) {
  let x = holdBoxPosition.x + (heldPiece == 6 ? boxPositionI.x : boxPosition.x - (heldPiece == 5 ? 4:0));
  let y = holdBoxPosition.y + (heldPiece == 6 ? boxPositionI.y : boxPosition.y);
  drawPiece(false, x, y, heldPiece,ctx);
}
function drawQueue(queue,ctx,positionInQueue) {
  let x =
    nextPosition.x +
    (queue[positionInQueue + 1] == 6 ? boxPositionI.x * 2 : boxPosition.x * 2);
  let y =
    nextPosition.y +
    (queue[positionInQueue + 1] == 6 ? boxPositionI.y * 2 : boxPosition.y * 2);
  drawPiece(true, x, y, queue[positionInQueue + 1],ctx);
  for (let i = 0; i < 4; i++) {
    x =
      firstBoxPosition.x +
      (queue[positionInQueue + 2 + i] == 6 ? boxPositionI.x : boxPosition.x);
    y =
      firstBoxPosition.y +
      (queue[positionInQueue + 2 + i] == 6 ? boxPositionI.y : boxPosition.y);
    drawPiece(false, x, y + 39 * i, queue[positionInQueue + 2 + i],ctx);
  }
}
function drawBoard(board,ctx,activePiece) {
  for (let i = 0; i < board.length; i++) {
    let x = pieceOrigin.x + board[i][0] * 16;
    let y = pieceOrigin.y + (19 - board[i][1]) * 16;
    ctx.drawImage(
      pieceImg,
      board[i][2][0] * 16,
      board[i][2][1] * 16,
      16,
      16,
      x,
      y,
      16,
      16
    );
  }
  if (activePiece != null) activePiece.draw(ctx, pieceOrigin);
}
function drawPiece(big, x, y, piece,ctx) {
  if (big) {
    Pieces[piece].map((point) => {
      ctx.drawImage(
        pieceImg,
        blocks[piece][0] * 16,
        blocks[piece][1] * 16,
        16,
        16,
        x + point[0] * 16,
        y + point[1] * 16,
        16,
        16
      );
    });
  } else {
    Pieces[piece].map((point) => {
      ctx.drawImage(
        smallPieceImg,
        blocks[piece][0] * 8,
        blocks[piece][1] * 8,
        8,
        8,
        x + point[0] * 8,
        y + point[1] * 8,
        8,
        8
      );
    });
  }
}

function input() {
  for (let k in holdTime) {
    holdTime[k] += 1;
    //console.log(k, holdTime[k]);
  }
  if (map["ArrowLeft"]) {
    delete map["ArrowLeft"];
    currentPiece.move(true);
  } else if (map["ArrowRight"]) {
    delete map["ArrowRight"];
    currentPiece.move(false);
  }
  if (holdTime["ArrowLeft"] > DASTime) {
    DASTimer -= 1;
    if (DASTimer <= 0) {
      currentPiece.move(true);
      DASTimer = dasdelay;
    }
  } else if (holdTime["ArrowRight"] > DASTime) {
    DASTimer -= 1;
    if (DASTimer <= 0) {
      currentPiece.move(false);
      DASTimer = dasdelay;
    }
  }
  if (holdTime["ArrowRight"] < DASTime && holdTime["ArrowLeft"] < DASTime) {
    DASTimer = dasdelay;
  }
  if (map["z"]) {
    delete map["z"];
    currentPiece.setRotation(false);
  } else if (map["x"] || map["ArrowUp"]) {
    delete map["x"];
    delete map["ArrowUp"];
    currentPiece.setRotation(true);
  }
  if (map[" "]) {
    delete map[" "];
    currentPiece.hardDrop();
  }
  if (map["c"] && !currentPiece.locked && !heldLock) {
    delete map["c"];
    if (heldPiece == null) {
      heldPiece = currentPiece.piece;
      currentPiece = null;
    } else {
      let prevHeld = heldPiece;
      heldPiece = currentPiece.piece;
      currentPiece = new Piece(prevHeld);
    }
    heldLock = true;
    return true;
  }
  if (holdTime["ArrowDown"] > 0) {
    currentPiece.startSoftDrop();
  } else {
    currentPiece.stopSoftDrop();
  }
}
let wasTspin = false
function mainloop() {
  
  if (queue.length - positionInQueue < 100) {
    generateAlot();
  }
  if (currentPiece != null) input();
  if (currentPiece == null) {
    clearLines();
    positionInQueue++;
    wasTspin = false
    currentPiece = new Piece(queue[positionInQueue]);
    difficulty = Math.floor(totalLines / 15) + 2;
  }

  currentPiece.update();
  if (currentPiece.locked) {
    if (heldLock) heldLock = false;
    wasTspin = currentPiece.tspin
    currentPiece = null;
  }
  myBoardState = {
    board:board,
    piece:currentPiece,
    held:heldPiece,
    queue:queue,
    queuePos:positionInQueue
  }
  if(conn != null){
    conn.send({boardState:myBoardState})
  }
  drawScreen();

  requestAnimationFrame(mainloop);
}
async function generateAlot() {
  for (let i = 0; i < 100; i++) {
    nextSeven();
  }
}
for (let i = 0; i < 5; i++) {
  addGarbage()
}

nextSeven();
generateAlot();
requestAnimationFrame(mainloop);

