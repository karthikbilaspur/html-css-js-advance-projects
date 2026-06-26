const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = true;
let gamePaused = false;
let gameSpeed = 100;

highScoreElement.textContent = highScore;

function drawGame() {
  if (!gameRunning || gamePaused) return;

  moveSnake();

  if (checkCollision()) {
    endGame();
    return;
  }

  if (snake[0].x === food.x && snake[0].y === food.y) {
    score += 10;
    scoreElement.textContent = score;
    generateFood();
    if (gameSpeed > 50) gameSpeed -= 2;
  } else {
    snake.pop();
  }

  clearCanvas();
  drawFood();
  drawSnake();

  setTimeout(drawGame, gameSpeed);
}

function clearCanvas() {
  ctx.fillStyle = '#0f3460';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#16213e';
  ctx.lineWidth = 1;
  for (let i = 0; i < tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0? '#00d9ff' : '#00b8d4';
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);

    if (index === 0) {
      ctx.fillStyle = '#1a1a2e';
      const eyeSize = 3;
      const eyeOffset = 5;
      ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
      ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
    }
  });
}

function drawFood() {
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);
}

function generateFood() {
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };

  for (let segment of snake) {
    if (segment.x === food.x && segment.y === food.y) {
      generateFood();
      return;
    }
  }
}

function checkCollision() {
  const head = snake[0];

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    return true;
  }

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }

  return false;
}

function endGame() {
  gameRunning = false;
  finalScoreElement.textContent = score;
  gameOverScreen.style.display = 'block';

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    highScoreElement.textContent = highScore;
  }
}

function restartGame() {
  snake = [{ x: 10, y: 10 }];
  dx = 0;
  dy = 0;
  score = 0;
  gameSpeed = 100;
  scoreElement.textContent = score;
  gameOverScreen.style.display = 'none';
  gameRunning = true;
  gamePaused = false;
  generateFood();
  drawGame();
}

document.addEventListener('keydown', (e) => {
  if (dx === 0 && dy === 0 && gameRunning) {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      dy = -1;
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      dy = 1;
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      dx = -1;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      dx = 1;
    }
    if (dx!== 0 || dy!== 0) drawGame();
    return;
  }

  if (e.key === ' ') {
    e.preventDefault();
    if (gameRunning) {
      gamePaused =!gamePaused;
      if (!gamePaused) drawGame();
    } else {
      restartGame();
    }
    return;
  }

  if (!gameRunning || gamePaused) return;

  if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && dy!== 1) {
    dx = 0; dy = -1;
  } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && dy!== -1) {
    dx = 0; dy = 1;
  } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && dx!== 1) {
    dx = -1; dy = 0;
  } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && dx!== -1) {
    dx = 1; dy = 0;
  }
});

restartBtn.addEventListener('click', restartGame);

// Initial render
clearCanvas();
drawSnake();
drawFood();