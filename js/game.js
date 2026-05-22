const GameState = {
  board: [],
  boardSize: { rows: 3, cols: 3 },
  currentPlayer: 'P1',
  turn: 1,
  phase: 'PLAY',
  scores: { P1: 0, P2: 0 },
  hands: { P1: [], P2: [] },
  deck: [],
  discardPile: [],
  activeEffects: [],
  winCondition: 'NORMAL',
  forbiddenSquares: { P1: [], P2: [] },
  fortifiedSquares: [],
  voidSquares: [],
  log: [],
  history: [],
  settings: {
    color: '#00FF41',
    font: 'Share Tech Mono',
    soundEnabled: true,
    scanlines: true
  },
  doubleTurn: { P1: false, P2: false },
  blindPlayers: { P1: false, P2: false },
  misereTurnsLeft: 0
};

function createInitialState() {
  return JSON.parse(JSON.stringify(GameState));
}

function initBoard(rows = 3, cols = 3) {
  const board = [];
  for (let i = 0; i < rows * cols; i++) {
    board.push(null);
  }
  return board;
}

function getIndex(row, col, cols) {
  return row * cols + col;
}

function getRow(index, cols) {
  return Math.floor(index / cols);
}

function getCol(index, cols) {
  return index % cols;
}

function findWinningLine(board, rows, cols, winCondition) {
  const lines = [];
  
  for (let r = 0; r < rows; r++) {
    const line = [];
    for (let c = 0; c < cols; c++) {
      line.push(getIndex(r, c, cols));
    }
    lines.push(line);
  }
  
  for (let c = 0; c < cols; c++) {
    const line = [];
    for (let r = 0; r < rows; r++) {
      line.push(getIndex(r, c, cols));
    }
    lines.push(line);
  }
  
  for (let startRow = 0; startRow <= rows - 3; startRow++) {
    for (let startCol = 0; startCol <= cols - 3; startCol++) {
      const diag1 = [];
      const diag2 = [];
      for (let i = 0; i < 3; i++) {
        diag1.push(getIndex(startRow + i, startCol + i, cols));
        diag2.push(getIndex(startRow + i, startCol + 2 - i, cols));
      }
      lines.push(diag1);
      lines.push(diag2);
    }
  }
  
  return lines;
}

function checkWin(state, player) {
  const { board, boardSize, winCondition, fortifiedSquares, voidSquares } = state;
  const { rows, cols } = boardSize;
  
  if (winCondition === 'CORNERS') {
    const corners = [0, cols - 1, (rows - 1) * cols, rows * cols - 1];
    const cornerOwners = corners.map(i => board[i]);
    if (cornerOwners.every(o => o === player)) {
      return { winner: player, line: corners, type: 'CORNERS' };
    }
  }
  
  const lines = findWinningLine(board, rows, cols, winCondition);
  
  if (winCondition === 'DIAGONAL_ONLY') {
    const diagLines = lines.filter((line, idx) => idx >= rows * 2);
    for (const line of diagLines) {
      const values = line.map(i => board[i]);
      if (values[0] && values.every(v => v === values[0])) {
        if (!fortifiedSquares.includes(line[0]) && !fortifiedSquares.includes(line[1]) && !fortifiedSquares.includes(line[2])) {
          const actualWinner = winCondition === 'MISERE' ? (player === 'P1' ? 'P2' : 'P1') : player;
          return { winner: actualWinner, line, type: 'DIAGONAL' };
        }
      }
    }
    return null;
  }
  
  for (const line of lines) {
    const values = line.map(i => board[i]);
    if (values[0] && values.every(v => v === values[0])) {
      const isAnyFortified = line.some(i => fortifiedSquares.includes(i));
      if (isAnyFortified) continue;
      
      const isAnyVoid = line.some(i => voidSquares.includes(i));
      if (isAnyVoid) continue;
      
      const actualWinner = winCondition === 'MISERE' ? (player === 'P1' ? 'P2' : 'P1') : player;
      return { winner: actualWinner, line, type: 'STANDARD' };
    }
  }
  
  return null;
}

function checkDraw(state) {
  const { board, voidSquares } = state;
  const isFull = board.every((cell, i) => cell !== null || voidSquares.includes(i));
  return isFull;
}

function executeMove(state, player, cellIndex) {
  const newState = JSON.parse(JSON.stringify(state));
  newState.board[cellIndex] = player;
  newState.history.push({
    board: state.board.slice(),
    boardSize: { ...state.boardSize },
    voidSquares: [...state.voidSquares],
    fortifiedSquares: [...state.fortifiedSquares],
    forbiddenSquares: { P1: [...state.forbiddenSquares.P1], P2: [...state.forbiddenSquares.P2] },
    winCondition: state.winCondition,
    misereTurnsLeft: state.misereTurnsLeft
  });
  return newState;
}

function switchPlayer(state) {
  const newState = { ...state };
  newState.currentPlayer = state.currentPlayer === 'P1' ? 'P2' : 'P1';
  return newState;
}

function addToLog(state, message, playerType = null) {
  const newState = { ...state };
  newState.log = [...state.log, { message, playerType, timestamp: Date.now() }];
  if (newState.log.length > 50) {
    newState.log = newState.log.slice(-50);
  }
  return newState;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GameState,
    createInitialState,
    initBoard,
    getIndex,
    getRow,
    getCol,
    findWinningLine,
    checkWin,
    checkDraw,
    executeMove,
    switchPlayer,
    addToLog
  };
}