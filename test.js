'use strict';

const assert = require('assert');
const {
  rotate,
  collide,
  sweep,
  scoreForClears,
  createBoard,
  COLS,
  ROWS,
} = require('./tetris.js');

function testRotatePreservesBlockCount() {
  const m = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ];
  const r = rotate(m);
  const before = m.flat().filter(Boolean).length;
  const after = r.flat().filter(Boolean).length;
  assert.strictEqual(after, before);
  assert.deepStrictEqual(r, [
    [0, 1, 0],
    [0, 1, 1],
    [0, 1, 0],
  ]);
}

function testCollideWallsAndFloor() {
  const board = createBoard();
  const block = [[1]];
  assert.strictEqual(collide(board, block, 0, -1), true);
  assert.strictEqual(collide(board, block, 0, COLS), true);
  assert.strictEqual(collide(board, block, ROWS, 0), true);
  assert.strictEqual(collide(board, block, 0, 0), false);
}

function testSweepClearsFullRows() {
  const board = createBoard();
  board[ROWS - 1] = Array(COLS).fill(1);
  board[ROWS - 2][0] = 2;
  const cleared = sweep(board);
  assert.strictEqual(cleared, 1);
  assert.strictEqual(board[ROWS - 1][0], 2);
  assert.ok(board[0].every((v) => v === 0));
}

function testScoreTable() {
  assert.strictEqual(scoreForClears(1, 1), 100);
  assert.strictEqual(scoreForClears(4, 2), 1600);
  assert.strictEqual(scoreForClears(0, 1), 0);
}

function run() {
  testRotatePreservesBlockCount();
  testCollideWallsAndFloor();
  testSweepClearsFullRows();
  testScoreTable();
  console.log('All tests passed.');
}

run();
