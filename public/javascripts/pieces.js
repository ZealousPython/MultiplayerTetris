let difficulty = 2;
let pieceImg = new Image();
pieceImg.src = "./images/Blocks.png";
let L_Piece = [
  [0, 0],
  [0, 1],
  [1, 1],
  [2, 1],
];
let J_Piece = [
  [0, 1],
  [1, 1],
  [2, 1],
  [2, 0],
];
let S_Piece = [
  [0, 1],
  [1, 1],
  [1, 0],
  [2, 0],
];
let Z_Piece = [
  [0, 0],
  [1, 0],
  [1, 1],
  [2, 1],
];
let T_Piece = [
  [0, 1],
  [1, 0],
  [1, 1],
  [2, 1],
];
let O_Piece = [
  [1, 0],
  [1, 1],
  [2, 0],
  [2, 1],
];
let I_Piece = [
  [0, 1],
  [1, 1],
  [2, 1],
  [3, 1],
];
let Pieces = [L_Piece, J_Piece, Z_Piece, S_Piece, T_Piece, O_Piece, I_Piece];
let wallkickClock = [
  [
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  [
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  [
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  [
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
];
let wallkickCounter = [
  [
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  [
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  [
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  [
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
];
let wallkickClockI = [
  [
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  [
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
  [
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  [
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
];
let wallkickCounterI = [
  [
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  [
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  [
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  [
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
];
let board = [];
let blocks = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [0, 1],
  [1, 1],
  [2, 1],
  [3, 1],
];
class Piece {
  constructor(piece, pieceData = null) {
    this.piece = piece;
    this.pieceData = Pieces[piece];
    this.mapPosition = [4, 20];
    this.rotation = 0;
    this.lockoutTime = 9999999;
    this.softDrop = false;
    this.baseStepTime = 60 - difficulty * 4;
    this.stepTime = this.baseStepTime;
    this.hardDropPosition = [0, 0];
    this.locked = false;
    this.lockTime = 60 - difficulty * 1.9;
    this.lastMove = 0;
    this.tspin = false;
    this.timers = {
      lockout: 9999999,
      lock: this.lockTime,
      step: this.stepTime,
    };

    this.onGround = false;
    this.origin = piece == 6 ? [1.5, 1.5] : piece == 5 ? [1, 0.5] : [1, 1];
    if (pieceData != null){
      Object.assign(this, pieceData)
    }
  }
  con
  rotate(clockwise = false) {
    let rotatedPiece = [];
    rotatedPiece = this.pieceData.map((point) => {
      let new_point = [0, 0];
      new_point[0] = Math.round(
        (clockwise ? -(point[1] - this.origin[1]) : point[1] - this.origin[1]) +
          this.origin[0]
      );
      new_point[1] = Math.round(
        (clockwise ? point[0] - this.origin[0] : -(point[0] - this.origin[0])) +
          this.origin[1]
      );
      return new_point;
    });
    return rotatedPiece;
  }
  isValidPlacement(piece) {
    for (let i = 0; i < piece.length; i++) {
      if (board.includes(piece[i])) return false;
      for (let e = 0; e < board.length; e++) {
        let same = board[e][0] == piece[i][0] && board[e][1] == piece[i][1];
        if (same) return false;
      }

      if (piece[i][0] < 0 || piece[i][0] >= 10) return false;
      if (piece[i][1] < 0) return false;
    }
    return true;
  }
  getLowest() {
    this.hardDropPosition = this.mapPosition;
    for (let i = 0; i < 20; i++) {
      if (this.mapPosition[1] - i >= 0) {
        let newPosition = [this.mapPosition[0], this.mapPosition[1] - i];

        if (
          this.isValidPlacement(this.shiftPiece(this.pieceData, newPosition))
        ) {
          this.hardDropPosition = newPosition;
        } else break;
      }
    }
  }
  isTspin(mapPos) {
    let mapPositionCenter = [
      mapPos[0] + this.origin[0],
      mapPos[1] - this.origin[1],
    ];
    let corners = 0;
    for (let i = 0; i < board.length;i++){
      if (board[i][0] == mapPositionCenter[0] + 1 && board[i][1] ==  mapPositionCenter[1] + 1) {
        corners += 1;
      }
      if (board[i][0] == mapPositionCenter[0] - 1 && board[i][1] ==  mapPositionCenter[1] + 1) {
        corners += 1;
      }
      if (board[i][0] == mapPositionCenter[0] + 1 && board[i][1] ==  mapPositionCenter[1] - 1) {
        corners += 1;
      }
      if (board[i][0] == mapPositionCenter[0] - 1 && board[i][1] ==  mapPositionCenter[1] - 1) {
        corners += 1;
      }
    }

    
    return corners >= 3 && this.piece == 4;
  }
  setRotation(clockwise = false) {
    if (!this.locked) {
      let rotatedPiece = this.rotate(clockwise);
      let nextRotation = clockwise ? this.rotation + 1 : this.rotation - 1;
      if (nextRotation > 3) nextRotation = 0;
      if (nextRotation < 0) nextRotation = 3;
      let mapPiece = this.shiftPiece(rotatedPiece, this.mapPosition);

      if (this.isValidPlacement(mapPiece)) {
        this.rotation = nextRotation;
        this.pieceData = rotatedPiece;
        this.timers.lock = this.lockTime;
        this.lastMove = 1;
        this.tspin = this.isTspin(this.mapPosition);
      } else {
        let wallkickSet = clockwise ? wallkickClock : wallkickCounter;
        if (this.piece == 6)
          wallkickSet = clockwise ? wallkickClockI : wallkickCounterI;
        for (let i = 0; i < wallkickSet.length; i++) {
          let newPosition = [
            this.mapPosition[0] + wallkickSet[this.rotation][i][0],
            this.mapPosition[1] + wallkickSet[this.rotation][i][1],
          ];
          if (
            this.isValidPlacement(this.shiftPiece(rotatedPiece, newPosition))
          ) {
            this.tspin = this.isTspin(newPosition);
            this.rotation = nextRotation;
            this.mapPosition = newPosition;
            this.timers.lock = this.lockTime;
            this.pieceData = rotatedPiece;
            this.lastMove = 1;

            break;
          }
        }
      }
    }
  }
  startSoftDrop() {
    this.softDrop = true;
    this.stepTime = 3;
  }
  stopSoftDrop() {
    this.softDrop = false;
    this.stepTime = this.baseStepTime;
  }
  hardDrop() {
    if (!this.locked) {
      this.getLowest();
      this.mapPosition = this.hardDropPosition;
      this.place();
      this.locked = true;
    }
  }
  move(left) {
    let offset = left ? -1 : 1;
    if (
      this.isValidPlacement(
        this.shiftPiece(this.pieceData, [
          this.mapPosition[0] + offset,
          this.mapPosition[1],
        ])
      ) &&
      !this.locked
    ) {
      this.lastMove = 2;
      this.mapPosition[0] += offset;
    }
  }
  step() {
    if (!this.onGround) {
      this.mapPosition[1] -= 1;
      this.lastMove = 0;
    }
  }
  isOnGround() {
    this.onGround = false;
    let droppedPiece = this.shiftPiece(this.pieceData, [
      this.mapPosition[0],
      this.mapPosition[1] - 1,
    ]);
    if (!this.isValidPlacement(droppedPiece)) {
      this.onGround = true;
    }
  }
  place() {
    this.shiftPiece(this.pieceData, this.mapPosition).map((point) => {
      board.push([...point, blocks[this.piece]]);
    });
  }
  update() {
    if (!this.locked) {
      this.isOnGround();
      if (this.onGround) {
        this.timers.lockout -= 1;
        this.timers.lock -= 1;
        this.timers.step = this.stepTime;
      } else {
        this.timers.step -= 1;
      }
      if ((this.timers.lockout < 0 || this.timers.lock < 0) && this.onGround) {
        if (!this.locked) {
          this.locked = true;
          this.place();
        }
      }

      if (this.timers.step < 0 && !this.locked) {
        this.timers.step = this.stepTime;
        this.step();
      }
    }
  }
  shiftPiece(piece, position) {
    return piece.map((point) => [
      point[0] + position[0],
      position[1] - point[1],
    ]);
  }
  draw(ctx, boardOffset) {
    if (!this.locked) {
      this.getLowest();
      let pieceImgX = this.piece <= 3 ? 16 * this.piece : 16 * (this.piece - 4);
      let pieceImgY = this.piece <= 3 ? 0 : 16;
      for (let i = 0; i < this.pieceData.length; i++) {
        let point = this.pieceData[i];

        let x = boardOffset.x + point[0] * 16 + this.mapPosition[0] * 16;
        let y = boardOffset.y + point[1] * 16 + (19 - this.mapPosition[1]) * 16;
        ctx.drawImage(pieceImg, pieceImgX, pieceImgY, 16, 16, x, y, 16, 16);
        ctx.globalAlpha = 0.4;
        x = boardOffset.x + point[0] * 16 + this.hardDropPosition[0] * 16;
        y =
          boardOffset.y + point[1] * 16 + (19 - this.hardDropPosition[1]) * 16;
        ctx.drawImage(pieceImg, pieceImgX, pieceImgY, 16, 16, x, y, 16, 16);
        ctx.globalAlpha = 1;
      }
    }
  }
}
