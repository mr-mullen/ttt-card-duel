// TTT Card Duel — Board Management
// Handles board rendering, win detection, board manipulation

const Board = {
  // ASCII Art for Large X and O pieces
  ascii: {
    X: '\\ /\\n  X\\n/ \\',
    O: ' ┌───┐\\n │   │\\n ╰───╯'
  },

  // Current board state
  board: null,

  // Current board size
  size: { rows: 3, cols: 3 },

  // Initialize board
  init() {
    this.createBoard();
    this.bindEvents();
  },

  // Create the board grid
  createBoard() {
    const boardEl = document.getElementById('game-board');
    boardEl.innerHTML = '';

    const totalCells = this.size.rows * this.size.cols;
    for (let i = 0; i < totalCells; i++) {
      const square = document.createElement('div');
      square.className = 'square empty';
      square.dataset.index = i;
      square.dataset.row = Math.floor(i / this.size.cols);
      square.dataset.col = i % this.size.cols;
      boardEl.appendChild(square);
    }

    this.renderBoard();
  },

  // Render current board state
  renderBoard() {
    const squares = document.querySelectorAll('.square');
    const boardState = this.board;

    squares.forEach(square => {
      const index = parseInt(square.dataset.index);
      const player = boardState[index] || null;

      // Clear classes
      square.className = 'square';

      // Reset text content
      square.textContent = '';

      if (!player) {
        // Empty square
        square.classList.add('empty');
      } else if (player === 'P1') {
        // Player 1 (X) - render ASCII art
        square.classList.add('occupied', 'data-player');
        square.setAttribute('data-player', 'P1');
        square.textContent = this.ascii.X;
      } else if (player === 'P2') {
        // Player 2 (O) - render ASCII art
        square.classList.add('occupied', 'data-player');
        square.setAttribute('data-player', 'P2');
        square.textContent = this.ascii.O;
      } else if (player === 'VOID') {
        // Void square
        square.classList.add('void');
      } else if (player === 'FORTIFIED') {
        // Fortified piece
        square.classList.add('has-shield');
        square.textContent = player === 'P1' ? this.ascii.X : this.ascii.O;
      } else {
        // Normal occupied
        square.classList.add('occupied');
        square.textContent = player === 'P1' ? 'X' : 'O';
      }
    });
  },

  // Get all valid squares for current player
  getValidSquares() {
    if (!this.board) return [];

    const valid = [];
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i] === null) {
        valid.push(i);
      }
    }
    return valid;
  },

  // Get valid squares excluding forbidden for current player
  getValidSquaresExcludingForbidden() {
    if (!this.board) return [];

    const currentPlayer = Game.state.currentPlayer;
    const valid = [];

    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i] === null && !this.state.forbiddenSquares[currentPlayer].includes(i)) {
        valid.push(i);
      }
    }
    return valid;
  },

  // Place piece on board
  placePiece(index) {
    if (!this.board || this.board[index]) return false;

    const currentPlayer = Game.state.currentPlayer;
    const state = Game.state;

    // Check forbidden
    if (state.forbiddenSquares[currentPlayer].includes(index)) {
      return false;
    }

    this.board[index] = currentPlayer;
    this.renderBoard();

    // Check win condition
    Game.checkWin();

    return true;
  },

  // Bind click events to squares
  bindEvents() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
      square.addEventListener('click', () => {
        const index = parseInt(square.dataset.index);
        if (Game.state.phase === 'PLAY' && Game.state.isPlayerTurn) {
          this.placePiece(index);
        }
      });
    });
  },

  // Check for win condition
  checkWin() {
    const state = Game.state;
    const winningLines = this.getWinningLines();
    const winningLine = winningLines.find(line => {
      if (line.every(cell => cell === state.board[0])) {
        return true;
      }
      return false;
    });

    if (winningLine) {
      // Mark winning squares
      winningLine.forEach(index => {
        const square = document.querySelector(`.square[data-index="${index}"]`);
        if (square) {
          square.classList.add('winning');
        }
      });

      Game.log('Win condition met!');

      // Check if game is over
      if (state.roundWins[state.currentPlayer] >= Game.state.matchLength) {
        this.showVictory(state.currentPlayer);
      }
    } else if (this.isBoardFull()) {
      Game.log('Game ended in a draw!');
      state.isDraw = true;
    }
  },

  // Get all possible winning lines
  getWinningLines() {
    const { rows, cols } = this.size;
    const lines = [];

    // Row lines
    for (let r = 0; r < rows; r++) {
      const line = [];
      for (let c = 0; c < cols; c++) {
        line.push(r * cols + c);
      }
      lines.push(line);
    }

    // Column lines
    for (let c = 0; c < cols; c++) {
      const line = [];
      for (let r = 0; r < rows; r++) {
        line.push(r * cols + c);
      }
      lines.push(line);
    }

    // Diagonal lines (only if both dimensions >= 3)
    if (rows >= 3 && cols >= 3) {
      // Main diagonal
      const diag1 = [];
      for (let i = 0; i < rows && i < cols; i++) {
        diag1.push(i * cols + i);
      }
      lines.push(diag1);

      // Anti-diagonal
      const diag2 = [];
      for (let i = 0; i < rows && i < cols; i++) {
        diag2.push(i * cols + (cols - 1 - i));
      }
      lines.push(diag2);
    }

    return lines;
  },

  // Check if board is full
  isBoardFull() {
    if (!this.board) return false;
    return this.board.every(cell => cell !== null);
  },

  // Show victory overlay
  showVictory(winner) {
    const overlay = document.createElement('div');
    overlay.className = 'victory-overlay';
    overlay.innerHTML = `
      <div class="victory-message">
        <h2>PLAYER ${winner} WINS!</h2>
        <p>Round Score: P1 ${Game.state.roundWins.P1} - P2 ${Game.state.roundWins.P2}</p>
        <p>Total Score: P1 ${Game.state.scores.P1} - P2 ${Game.state.scores.P2}</p>
        <button id="next-round-btn">New Round</button>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => {
      overlay.remove();
      Game.restartRound();
    });
  },

  // Resize board (for EXPANSION, COLLAPSE, etc.)
  resize(newRows, newCols) {
    this.size.rows = newRows;
    this.size.cols = newCols;

    // Adjust board container size
    const boardEl = document.getElementById('game-board');
    boardEl.classList.remove('board-3x3', 'board-4x3', 'board-3x4', 'board-4x4');

    if (newRows === 4 && newCols === 3) {
      boardEl.classList.add('board-4x3');
    } else if (newRows === 3 && newCols === 4) {
      boardEl.classList.add('board-3x4');
    } else if (newRows === 4 && newCols === 4) {
      boardEl.classList.add('board-4x4');
    } else if (newRows === 3 && newCols === 3) {
      boardEl.classList.add('board-3x3');
    }

    // Remove old squares and recreate
    boardEl.innerHTML = '';

    const totalCells = newRows * newCols;
    for (let i = 0; i < totalCells; i++) {
      const square = document.createElement('div');
      square.className = 'square empty';
      square.dataset.index = i;
      square.dataset.row = Math.floor(i / newCols);
      square.dataset.col = i % newCols;
      boardEl.appendChild(square);
    }

    this.renderBoard();
    this.bindEvents();
  },

  // Rotate board 90 degrees
  rotate() {
    const newBoard = new Array(this.board.length).fill(null);

    for (let r = 0; r < this.size.rows; r++) {
      for (let c = 0; c < this.size.cols; c++) {
        const newIndex = (this.size.rows - 1 - r) * this.size.cols + c;
        newBoard[newIndex] = this.board[r * this.size.cols + c];
      }
    }

    this.board = newBoard;
    this.renderBoard();
    this.bindEvents();
  },

  // Flip board horizontally
  flipHorizontal() {
    const newBoard = this.board.map(row => {
      return row.slice().reverse();
    });

    this.board = newBoard;
    this.renderBoard();
    this.bindEvents();
  },

  // Clear board
  clearBoard() {
    this.board = new Array(this.size.rows * this.size.cols).fill(null);
    this.renderBoard();
  },

  // Add forbidden square
  addForbiddenSquare(player, index) {
    if (!this.state.forbiddenSquares[player]) {
      this.state.forbiddenSquares[player] = [];
    }
    this.state.forbiddenSquares[player].push(index);
    this.renderBoard();
  },

  // Remove forbidden square
  removeForbiddenSquare(player, index) {
    if (this.state.forbiddenSquares[player]) {
      this.state.forbiddenSquares[player] = this.state.forbiddenSquares[player].filter(
        i => i !== index
      );
      this.renderBoard();
    }
  }
};
