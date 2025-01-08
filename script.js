class ChessGame {
  constructor() {
    this.board = document.getElementById("board");
    this.statusDisplay = document.getElementById("status");
    this.moveHistoryElement = document.getElementById("moveHistory");

    this.selectedPiece = null;
    this.currentPlayer = "white";
    this.possibleMoves = [];
    this.moveHistory = [];
    this.gameOver = false;

    this.initializeBoard();
    this.setupEventListeners();
  }

  initializeBoard() {
    this.boardState = [
      ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
      ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
      ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"],
    ];
    this.createBoard();
  }

  createBoard() {
    this.board.innerHTML = "";
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = `square ${
          (row + col) % 2 === 0 ? "white" : "black"
        }`;
        square.dataset.row = row;
        square.dataset.col = col;

        const piece = this.boardState[row][col];
        if (piece) {
          this.placePiece(square, piece);
        }

        this.board.appendChild(square);
      }
    }
  }

  placePiece(square, piece) {
    const [color, type] = [piece[0] === "w" ? "white" : "black", piece[1]];
    square.dataset.piece = piece;
    const img = document.createElement("img");
    switch (type) {
      case "P":
        img.src = `./images/${color}-pawn.png`;
        break;
      case "R":
        img.src = `./images/${color}-rook.png`;
        break;
      case "N":
        img.src = `./images/${color}-knight.png`;
        break;
      case "B":
        img.src = `./images/${color}-bishop.png`;
        break;
      case "Q":
        img.src = `./images/${color}-queen.png`;
        break;
      case "K":
        img.src = `./images/${color}-king.png`;
        break;
    }
    img.alt = `${color} ${type}`;
    img.className = "piece-img";
    square.appendChild(img);
  }

  setupEventListeners() {
    this.board.addEventListener("click", (e) => {
      const square = e.target.closest(".square");
      if (!square || this.gameOver) return;

      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      const piece = this.boardState[row][col];

      // If no piece is selected and clicked on own piece
      if (
        !this.selectedPiece &&
        piece &&
        piece[0] === (this.currentPlayer === "white" ? "w" : "b")
      ) {
        this.selectedPiece = square;
        this.showPossibleMoves(row, col);
        square.classList.add("highlight");
      }
      // If piece is selected
      else if (this.selectedPiece) {
        const selectedRow = parseInt(this.selectedPiece.dataset.row);
        const selectedCol = parseInt(this.selectedPiece.dataset.col);

        // Check if the move is valid
        if (this.isValidMove(selectedRow, selectedCol, row, col)) {
          this.moveChessPiece(selectedRow, selectedCol, row, col);
          this.switchTurn();
        }

        // Clear selection and highlights
        this.clearSelection();
      }
    });
  }

  isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.boardState[fromRow][fromCol];
    const targetPiece = this.boardState[toRow][toCol];

    // Can't capture own pieces
    if (targetPiece && targetPiece[0] === piece[0]) return false;

    // Basic moves for each piece type
    switch (piece[1]) {
      case "P": // Pawn
        const direction = piece[0] === "w" ? -1 : 1;
        const startRow = piece[0] === "w" ? 6 : 1;

        // Forward move
        if (fromCol === toCol && !targetPiece) {
          if (toRow === fromRow + direction) return true;
          if (
            fromRow === startRow &&
            toRow === fromRow + 2 * direction &&
            !this.boardState[fromRow + direction][fromCol]
          )
            return true;
        }
        // Capture
        if (
          Math.abs(fromCol - toCol) === 1 &&
          toRow === fromRow + direction &&
          targetPiece
        )
          return true;
        return false;

      case "R": // Rook
        return this.isStraightMove(fromRow, fromCol, toRow, toCol);

      case "N": // Knight
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return (
          (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)
        );

      case "B": // Bishop
        return this.isDiagonalMove(fromRow, fromCol, toRow, toCol);

      case "Q": // Queen
        return (
          this.isStraightMove(fromRow, fromCol, toRow, toCol) ||
          this.isDiagonalMove(fromRow, fromCol, toRow, toCol)
        );

      case "K": // King
        return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
    }
    return false;
  }

  isStraightMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false;
    const rowDir =
      fromRow === toRow ? 0 : (toRow - fromRow) / Math.abs(toRow - fromRow);
    const colDir =
      fromCol === toCol ? 0 : (toCol - fromCol) / Math.abs(toCol - fromCol);

    let currentRow = fromRow + rowDir;
    let currentCol = fromCol + colDir;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (this.boardState[currentRow][currentCol]) return false;
      currentRow += rowDir;
      currentCol += colDir;
    }
    return true;
  }

  isDiagonalMove(fromRow, fromCol, toRow, toCol) {
    if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;
    const rowDir = (toRow - fromRow) / Math.abs(toRow - fromRow);
    const colDir = (toCol - fromCol) / Math.abs(toCol - fromCol);

    let currentRow = fromRow + rowDir;
    let currentCol = fromCol + colDir;

    while (currentRow !== toRow) {
      if (this.boardState[currentRow][currentCol]) return false;
      currentRow += rowDir;
      currentCol += colDir;
    }
    return true;
  }

  showPossibleMoves(row, col) {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.isValidMove(row, col, i, j)) {
          const square = this.getSquare(i, j);
          if (this.boardState[i][j]) {
            square.innerHTML += '<div class="capture-dot"></div>';
          } else {
            square.innerHTML += '<div class="move-dot"></div>';
          }
          this.possibleMoves.push(square);
        }
      }
    }
  }

  getSquare(row, col) {
    return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }

  moveChessPiece(fromRow, fromCol, toRow, toCol) {
    const fromSquare = this.getSquare(fromRow, fromCol);
    const toSquare = this.getSquare(toRow, toCol);

    // Update board state
    this.boardState[toRow][toCol] = this.boardState[fromRow][fromCol];
    this.boardState[fromRow][fromCol] = "";

    // Update DOM
    toSquare.innerHTML = "";
    toSquare.dataset.piece = fromSquare.dataset.piece;
    this.placePiece(toSquare, this.boardState[toRow][toCol]);

    // Clear source square
    fromSquare.innerHTML = "";
    delete fromSquare.dataset.piece;

    // Add to move history
    this.addMoveToHistory(fromRow, fromCol, toRow, toCol);
  }

  clearSelection() {
    if (this.selectedPiece) {
      this.selectedPiece.classList.remove("highlight");
    }
    this.selectedPiece = null;
    this.possibleMoves.forEach((square) => {
      square.querySelector(".move-dot")?.remove();
      square.querySelector(".capture-dot")?.remove();
    });
    this.possibleMoves = [];
  }

  switchTurn() {
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
    this.statusDisplay.textContent = `${this.currentPlayer}'s turn`;
  }

  addMoveToHistory(fromRow, fromCol, toRow, toCol) {
    const piece = this.boardState[toRow][toCol];
    const moveText = `${piece} ${String.fromCharCode(97 + fromCol)}${
      8 - fromRow
    } → ${String.fromCharCode(97 + toCol)}${8 - toRow}`;
    this.moveHistory.push(moveText);

    const moveElement = document.createElement("div");
    moveElement.textContent = moveText;
    this.moveHistoryElement.appendChild(moveElement);
  }
}

// Initialize the game
const game = new ChessGame();
