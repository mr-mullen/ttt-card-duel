const CARD_EFFECTS = {
  expand: (state, card, target) => {
    const newState = { ...state };
    if (newState.boardSize.rows >= 5) return state;
    
    newState.boardSize.rows += 1;
    const newRow = Array(newState.boardSize.cols).fill(null);
    newState.board = [...newState.board, ...newRow];
    
    newState.log = [...newState.log, { 
      message: `${card.name}: Board expanded to ${newState.boardSize.rows}×${newState.boardSize.cols}`, 
      playerType: 'SYSTEM',
      timestamp: Date.now() 
    }];
    
    return newState;
  },

  mirror: (state, card, target) => {
    const newState = { ...state };
    const { rows, cols } = newState.boardSize;
    
    const newBoard = [];
    for (let r = 0; r < rows; r++) {
      for (let c = cols - 1; c >= 0; c--) {
        newBoard.push(newState.board[r * cols + c]);
      }
    }
    
    newState.board = newBoard;
    newState.log = [...newState.log, { 
      message: `${card.name}: Board mirrored horizontally!`, 
      playerType: 'SYSTEM',
      timestamp: Date.now() 
    }];
    
    return newState;
  },

  void: (state, card, target) => {
    if (target === null) return { ...state, _pendingTarget: card.id };
    
    const newState = { ...state };
    const index = parseInt(target);
    
    if (index < 0 || index >= newState.board.length) return state;
    
    newState.board[index] = null;
    newState.voidSquares = [...newState.voidSquares, index];
    
    newState.log = [...newState.log, { 
      message: `${card.name}: Cell ${index} collapsed into the void!`, 
      playerType: 'SYSTEM',
      timestamp: Date.now() 
    }];
    
    return newState;
  },

  landslide: (state, card, target) => {
    const newState = { ...state };
    const { rows, cols } = newState.boardSize;
    
    const pieces = [];
    for (let i = 0; i < newState.board.length; i++) {
      if (newState.board[i] && !newState.voidSquares.includes(i)) {
        pieces.push({ piece: newState.board[i], col: i % cols });
      }
    }
    
    for (let c = 0; c < cols; c++) {
      const colPieces = [];
      for (let r = 0; r < rows; r++) {
        const idx = r * cols + c;
        if (newState.board[idx] && !newState.voidSquares.includes(idx)) {
          colPieces.push(newState.board[idx]);
        }
      }
      
      for (let r = rows - 1; r >= 0; r--) {
        const idx = r * cols + c;
        if (newState.voidSquares.includes(idx)) {
          continue;
        }
        newState.board[idx] = null;
      }
      
      for (let i = 0; i < colPieces.length; i++) {
        const targetRow = rows - 1 - i;
        const targetIdx = targetRow * cols + c;
        if (!newState.voidSquares.includes(targetIdx)) {
          newState.board[targetIdx] = colPieces[i];
        }
      }
    }
    
    newState.log = [...newState.log, { 
      message: `${card.name}: Pieces fall downward!`, 
      playerType: 'SYSTEM',
      timestamp: Date.now() 
    }];
    
    return newState;
  },

  earthquake: (state, card, target) => {
    const newState = { ...state };
    const { rows, cols } = newState.boardSize;
    
    const pieces = newState.board.slice();
    const newBoard = Array(rows * cols).fill(null);
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const oldIdx = r * cols + c;
        const newIdx = c * rows + (rows - 1 - r);
        if (newIdx < rows * cols) {
          newBoard[newIdx] = pieces[oldIdx];
        }
      }
    }
    
    newState.board = newBoard;
    newState.boardSize = { rows: cols, cols: rows };
    
    newState.log = [...newState.log, { 
      message: `${card.name}: Board rotated 90° clockwise!`, 
      playerType: 'SYSTEM',
      timestamp: Date.now() 
    }];
    
    return newState;
  },

  wildGrid: (state, card, target) => {
    const newState = { ...state };
    const { rows, cols } = newState.boardSize;
    
    const emptyIndices = [];
    const pieceIndices = { P1: [], P2: [] };
    
    for (let i = 0; i < newState.board.length; i++) {
      if (newState.voidSquares.includes(i)) continue;
      if (newState.board[i] === 'P1') {
        pieceIndices.P1.push(i);
      } else if (newState.board[i] === 'P2') {
        pieceIndices.P2.push(i);
      } else {
        emptyIndices.push(i);
      }
    }
    
    const shuffle = arr => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    
    const allPieces = [...pieceIndices.P1, ...pieceIndices.P2];
    const shuffledPieces = shuffle(allPieces);
    const shuffledEmpty = shuffle(emptyIndices);
    
    newState.board = Array(rows * cols).fill(null);
    newState.voidSquares.forEach(i => newState.board[i] = null);
    
    for (let i = 0; i < shuffledPieces.length; i++) {
      newState.board[shuffledPieces[i]] = shuffledPieces[i] < pieceIndices.P1.length ? 'P1' : 'P2';
    }
    
    newState.log = [...newState.log, { 
      message: `${card.name}: Board in chaos! Pieces shuffled!`, 
      playerType: 'SYSTEM',
      timestamp: Date.now() 
    }];
    
    return newState;
  },

  architect: (state, card, target) => {
    if (!target) return { ...state, _pendingTarget: card.id, _architectMode: true };
    
    const newState = { ...state };
    const [newRows, newCols] = target.split(',').map(Number);
    
    newState.boardSize = { rows: newRows, cols: newCols };
    newState.board = Array(newRows * newCols).fill(null);
    newState.voidSquares = [];
    newState.fortifiedSquares = [];
    newState.forbiddenSquares = { P1: [], P2: [] };
    
    newState.log = [...newState.log, { 
      message: `${card.name}: Board redesigned to ${newRows}×${newCols}!`, 
      playerType: 'SYSTEM',
      timestamp: Date.now() 
    }];
    
    return newState;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CARD_EFFECTS;
}