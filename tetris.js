'use strict';

const COLS = 10;
const ROWS = 20;
const CELL = 20;

const COLORS = ['#22d3ee', '#3b82f6', '#f97316', '#eab308', '#22c55e', '#a855f7', '#ef4444'];

const SHAPES = [
  [[1, 1, 1, 1]],
  [[2, 0, 0], [2, 2, 2]],
  [[0, 0, 3], [3, 3, 3]],
  [[4, 4], [4, 4]],
  [[0, 5, 5], [5, 5, 0]],
  [[0, 6, 0], [6, 6, 6]],
  [[7, 7, 0], [0, 7, 7]],
];

const SCORE_TABLE = [0, 100, 300, 500, 800];

function rotate(matrix) {
  const N = matrix.length;
  const res = Array.from({ length: N }, () => Array(N).fill(0));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) res[c][N - 1 - r] = matrix[r][c];
  }
  return res;
}

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function makePiece(id) {
  const shape = SHAPES[id - 1];
  const size = Math.max(shape.length, shape[0].length);
  const m = Array.from({ length: size }, () => Array(size).fill(0));
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) m[r][c] = shape[r][c];
  }
  return {
    id,
    matrix: m,
    r: 0,
    c: Math.floor(COLS / 2) - Math.ceil(m.length / 2),
  };
}

function rand(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function collide(board, mat, r, c) {
  for (let i = 0; i < mat.length; i++) {
    for (let j = 0; j < mat[i].length; j++) {
      if (!mat[i][j]) continue;
      const x = c + j;
      const y = r + i;
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      if (y >= 0 && board[y][x]) return true;
    }
  }
  return false;
}

function merge(board, piece) {
  const m = piece.matrix;
  for (let i = 0; i < m.length; i++) {
    for (let j = 0; j < m[i].length; j++) {
      if (!m[i][j]) continue;
      const y = piece.r + i;
      const x = piece.c + j;
      if (y >= 0) board[y][x] = m[i][j];
    }
  }
}

function sweep(board) {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every((v) => v !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      cleared++;
      y++;
    }
  }
  return cleared;
}

function scoreForClears(cleared, level) {
  return (SCORE_TABLE[cleared] || 0) * level;
}

function dropSpeedMs(level) {
  return Math.max(120, 800 - (level - 1) * 70);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    rotate,
    collide,
    sweep,
    scoreForClears,
    createBoard,
    COLS,
    ROWS,
  };
}

if (typeof document === 'undefined') {
  // Node / test environment — skip browser bootstrap.
} else {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const nextCanvas = document.getElementById('next');
  const nctx = nextCanvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const linesEl = document.getElementById('lines');
  const restartBtn = document.getElementById('restart');

  canvas.width = COLS * CELL;
  canvas.height = ROWS * CELL;

  let board;
  let cur;
  let next;
  let score = 0;
  let lines = 0;
  let level = 1;
  let gameOver = false;
  let dropTimer = null;

  function updateHUD() {
    scoreEl.textContent = String(score);
    linesEl.textContent = String(lines);
  }

  function setDropTimer() {
    if (dropTimer) clearInterval(dropTimer);
    dropTimer = setInterval(tick, dropSpeedMs(level));
  }

  function reset() {
    board = createBoard();
    score = 0;
    lines = 0;
    level = 1;
    gameOver = false;
    next = makePiece(rand(1, 7));
    newPiece();
    updateHUD();
    setDropTimer();
    draw();
  }

  function newPiece() {
    cur = next || makePiece(rand(1, 7));
    next = makePiece(rand(1, 7));
    if (collide(board, cur.matrix, cur.r, cur.c)) {
      gameOver = true;
      if (dropTimer) clearInterval(dropTimer);
    }
    draw();
    drawNext();
  }

  function tick() {
    if (gameOver) return;
    move(1, 0);
  }

  function move(drow, dcol, soft = false) {
    if (gameOver || !cur) return false;
    const nr = cur.r + drow;
    const nc = cur.c + dcol;
    if (!collide(board, cur.matrix, nr, nc)) {
      cur.r = nr;
      cur.c = nc;
      if (soft && drow === 1) score += 1;
      draw();
      updateHUD();
      return true;
    }
    if (drow === 1) {
      merge(board, cur);
      const cleared = sweep(board);
      if (cleared) {
        lines += cleared;
        level = Math.floor(lines / 10) + 1;
        score += scoreForClears(cleared, level);
        updateHUD();
        setDropTimer();
      }
      newPiece();
      draw();
    }
    return false;
  }

  function tryRotate() {
    if (gameOver || !cur) return;
    const nm = rotate(cur.matrix);
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!collide(board, nm, cur.r, cur.c + kick)) {
        cur.matrix = nm;
        cur.c += kick;
        draw();
        return;
      }
    }
  }

  function hardDrop() {
    if (gameOver) return;
    let dropped = 0;
    while (move(1, 0)) dropped++;
    score += dropped * 2;
    updateHUD();
  }

  function drawCell(x, y, color, target = ctx) {
    target.fillStyle = color;
    target.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (board[y][x]) drawCell(x, y, COLORS[board[y][x] - 1]);
      }
    }
    if (cur) {
      const m = cur.matrix;
      for (let i = 0; i < m.length; i++) {
        for (let j = 0; j < m[i].length; j++) {
          if (m[i][j]) drawCell(cur.c + j, cur.r + i, COLORS[m[i][j] - 1]);
        }
      }
    }
    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
      ctx.fillStyle = '#fff';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 + 7);
    }
  }

  function drawNext() {
    nctx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    const m = next.matrix;
    const size = m.length;
    const pad = (nextCanvas.width - size * CELL) / 2;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!m[i][j]) continue;
        nctx.fillStyle = COLORS[m[i][j] - 1];
        nctx.fillRect(pad + j * CELL, pad + i * CELL, CELL - 2, CELL - 2);
      }
    }
  }

  document.addEventListener('keydown', (e) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '];
    if (keys.includes(e.key) || e.code === 'Space') e.preventDefault();
    if (gameOver) {
      if (e.key === 'Enter' || e.code === 'Space') reset();
      return;
    }
    if (e.key === 'ArrowLeft') move(0, -1);
    else if (e.key === 'ArrowRight') move(0, 1);
    else if (e.key === 'ArrowDown') move(1, 0, true);
    else if (e.key === 'ArrowUp') tryRotate();
    else if (e.code === 'Space') hardDrop();
  });

  restartBtn.addEventListener('click', () => reset());
  reset();
}
