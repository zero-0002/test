const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nctx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const restartBtn = document.getElementById('restart');

const COLS = 10; const ROWS = 20; const S = 20;
canvas.width = COLS * S; canvas.height = ROWS * S;

const COLORS = ['cyan','blue','orange','yellow','green','purple','red'];

const SHAPES = [
  [[1,1,1,1]], // I
  [[2,0,0],[2,2,2]], // J
  [[0,0,3],[3,3,3]], // L
  [[4,4],[4,4]], // O
  [[0,5,5],[5,5,0]], // S
  [[0,6,0],[6,6,6]], // T
  [[7,7,0],[0,7,7]]  // Z
];

function rotate(matrix){
  const N = matrix.length; const res = Array.from({length:N},()=>Array(N).fill(0));
  for(let r=0;r<N;r++) for(let c=0;c<N;c++) res[c][N-1-r]=matrix[r][c];
  return res;
}

function makePiece(id){
  const shape = SHAPES[id-1];
  // normalize to square matrix
  const size = Math.max(shape.length, shape[0].length);
  const m = Array.from({length:size},()=>Array(size).fill(0));
  for(let r=0;r<shape.length;r++) for(let c=0;c<shape[r].length;c++) m[r][c]=shape[r][c];
  return {id, matrix:m, r:0, c:Math.floor(COLS/2)-Math.ceil(m.length/2)};
}

let board, cur, next, score=0, lines=0, gameOver=false, dropInterval=800, dropTimer=null;

function reset(){
  board = Array.from({length:ROWS},()=>Array(COLS).fill(0));
  score=0;lines=0;gameOver=false;next = makePiece(rand(1,7)); newPiece(); updateHUD();
  if(dropTimer) clearInterval(dropTimer);
  dropTimer = setInterval(tick, dropInterval);
}

function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}

function newPiece(){
  cur = next || makePiece(rand(1,7));
  next = makePiece(rand(1,7));
  if(collide(cur.matrix,cur.r,cur.c)) {gameOver=true; clearInterval(dropTimer);}
  draw(); drawNext();
}

function collide(mat, r, c){
  for(let i=0;i<mat.length;i++) for(let j=0;j<mat[i].length;j++){
    if(mat[i][j]){
      const x = c+j, y = r+i;
      if(x<0||x>=COLS||y>=ROWS) return true;
      if(y>=0 && board[y][x]) return true;
    }
  }
  return false;
}

function merge(){
  const m = cur.matrix; for(let i=0;i<m.length;i++) for(let j=0;j<m[i].length;j++){
    if(m[i][j]){ const y=cur.r+i, x=cur.c+j; if(y>=0) board[y][x]=m[i][j]; }
  }
}

function sweep(){
  let cleared=0;
  for(let y=ROWS-1;y>=0;y--){
    if(board[y].every(v=>v!==0)){
      board.splice(y,1); board.unshift(Array(COLS).fill(0)); cleared++; y++;
    }
  }
  if(cleared){ lines += cleared; score += cleared*100; updateHUD(); }
}

function updateHUD(){ scoreEl.textContent = 'Score: '+score; linesEl.textContent = 'Lines: '+lines; }

function tick(){ if(gameOver) return; move(1,0); }

function move(drow, dcol){
  const nr = cur.r + drow; const nc = cur.c + dcol;
  if(!collide(cur.matrix, nr, nc)) { cur.r = nr; cur.c = nc; draw(); return true; }
  if(drow===1){ // landed
    merge(); sweep(); newPiece(); draw();
  }
  return false;
}

function rotateCur(){
  const nm = rotate(cur.matrix);
  if(!collide(nm, cur.r, cur.c)) { cur.matrix = nm; draw(); }
}

function hardDrop(){ while(move(1,0)); }

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // draw board
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
    if(board[y][x]) drawCell(x,y, COLORS[board[y][x]-1]);
  }
  // draw current
  const m = cur.matrix;
  for(let i=0;i<m.length;i++) for(let j=0;j<m[i].length;j++){
    if(m[i][j]) drawCell(cur.c+j, cur.r+i, COLORS[m[i][j]-1]);
  }
  if(gameOver){ ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,canvas.height/2-30,canvas.width,60); ctx.fillStyle='#fff'; ctx.font='20px Arial'; ctx.textAlign='center'; ctx.fillText('GAME OVER',canvas.width/2,canvas.height/2+7); }
}

function drawCell(x,y,color){ ctx.fillStyle = color; ctx.fillRect(x*S, y*S, S-1, S-1); }

function drawNext(){ nctx.clearRect(0,0,nextCanvas.width,nextCanvas.height); const m = next.matrix; const size = m.length; const pad = (nextCanvas.width - size*S)/2;
  for(let i=0;i<size;i++) for(let j=0;j<size;j++) if(m[i][j]){ nctx.fillStyle = COLORS[m[i][j]-1]; nctx.fillRect(pad + j*S, pad + i*S, S-2, S-2); }
}

document.addEventListener('keydown', e=>{
  if(gameOver) return;
  if(e.key === 'ArrowLeft'){ move(0,-1); }
  else if(e.key === 'ArrowRight'){ move(0,1); }
  else if(e.key === 'ArrowDown'){ move(1,0); }
  else if(e.key === 'ArrowUp'){ rotateCur(); }
  else if(e.code === 'Space'){ hardDrop(); }
});

restartBtn.addEventListener('click', ()=>{ reset(); });

reset();
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nctx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const restartBtn = document.getElementById('restart');

const COLS = 10; const ROWS = 20; const S = 20;
canvas.width = COLS * S; canvas.height = ROWS * S;

const COLORS = ['cyan','blue','orange','yellow','green','purple','red'];

const SHAPES = [
  [[1,1,1,1]], // I
  [[2,0,0],[2,2,2]], // J
  [[0,0,3],[3,3,3]], // L
  [[4,4],[4,4]], // O
  [[0,5,5],[5,5,0]], // S
  [[0,6,0],[6,6,6]], // T
  [[7,7,0],[0,7,7]]  // Z
];

function rotate(matrix){
  const N = matrix.length; const res = Array.from({length:N},()=>Array(N).fill(0));
  for(let r=0;r<N;r++) for(let c=0;c<N;c++) res[c][N-1-r]=matrix[r][c];
  return res;
}

function makePiece(id){
  const shape = SHAPES[id-1];
  const size = Math.max(shape.length, shape[0].length);
  const m = Array.from({length:size},()=>Array(size).fill(0));
  for(let r=0;r<shape.length;r++) for(let c=0;c<shape[r].length;c++) m[r][c]=shape[r][c];
  return {id, matrix:m, r:0, c:Math.floor(COLS/2)-Math.ceil(m.length/2)};
}

let board, cur, next, score=0, lines=0, gameOver=false, dropInterval=800, dropTimer=null;

function reset(){
  board = Array.from({length:ROWS},()=>Array(COLS).fill(0));
  score=0;lines=0;gameOver=false;next = makePiece(rand(1,7)); newPiece(); updateHUD();
  if(dropTimer) clearInterval(dropTimer);
  dropTimer = setInterval(tick, dropInterval);
}

function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}

function newPiece(){
  cur = next || makePiece(rand(1,7));
  next = makePiece(rand(1,7));
  if(collide(cur.matrix,cur.r,cur.c)) {gameOver=true; clearInterval(dropTimer);}
  draw(); drawNext();
}

function collide(mat, r, c){
  for(let i=0;i<mat.length;i++) for(let j=0;j<mat[i].length;j++){
    if(mat[i][j]){
      const x = c+j, y = r+i;
      if(x<0||x>=COLS||y>=ROWS) return true;
      if(y>=0 && board[y][x]) return true;
    }
  }
  return false;
}

function merge(){
  const m = cur.matrix; for(let i=0;i<m.length;i++) for(let j=0;j<m[i].length;j++){
    if(m[i][j]){ const y=cur.r+i, x=cur.c+j; if(y>=0) board[y][x]=m[i][j]; }
  }
}

function sweep(){
  let cleared=0;
  for(let y=ROWS-1;y>=0;y--){
    if(board[y].every(v=>v!==0)){
      board.splice(y,1); board.unshift(Array(COLS).fill(0)); cleared++; y++;
    }
  }
  if(cleared){ lines += cleared; score += cleared*100; updateHUD(); }
}

function updateHUD(){ scoreEl.textContent = 'Score: '+score; linesEl.textContent = 'Lines: '+lines; }

function tick(){ if(gameOver) return; move(1,0); }

function move(drow, dcol){
  const nr = cur.r + drow; const nc = cur.c + dcol;
  if(!collide(cur.matrix, nr, nc)) { cur.r = nr; cur.c = nc; draw(); return true; }
  if(drow===1){
    merge(); sweep(); newPiece(); draw();
  }
  return false;
}

function rotateCur(){
  const nm = rotate(cur.matrix);
  if(!collide(nm, cur.r, cur.c)) { cur.matrix = nm; draw(); }
}

function hardDrop(){ while(move(1,0)); }

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
    if(board[y][x]) drawCell(x,y, COLORS[board[y][x]-1]);
  }
  const m = cur.matrix;
  for(let i=0;i<m.length;i++) for(let j=0;j<m[i].length;j++){
    if(m[i][j]) drawCell(cur.c+j, cur.r+i, COLORS[m[i][j]-1]);
  }
  if(gameOver){ ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,canvas.height/2-30,canvas.width,60); ctx.fillStyle='#fff'; ctx.font='20px Arial'; ctx.textAlign='center'; ctx.fillText('GAME OVER',canvas.width/2,canvas.height/2+7); }
}

function drawCell(x,y,color){ ctx.fillStyle = color; ctx.fillRect(x*S, y*S, S-1, S-1); }

function drawNext(){ nctx.clearRect(0,0,nextCanvas.width,nextCanvas.height); const m = next.matrix; const size = m.length; const pad = (nextCanvas.width - size*S)/2;
  for(let i=0;i<size;i++) for(let j=0;j<size;j++) if(m[i][j]){ nctx.fillStyle = COLORS[m[i][j]-1]; nctx.fillRect(pad + j*S, pad + i*S, S-2, S-2); }
}

document.addEventListener('keydown', e=>{
  if(gameOver) return;
  if(e.key === 'ArrowLeft'){ move(0,-1); }
  else if(e.key === 'ArrowRight'){ move(0,1); }
  else if(e.key === 'ArrowDown'){ move(1,0); }
  else if(e.key === 'ArrowUp'){ rotateCur(); }
  else if(e.code === 'Space'){ hardDrop(); }
});

restartBtn.addEventListener('click', ()=>{ reset(); });

reset();
