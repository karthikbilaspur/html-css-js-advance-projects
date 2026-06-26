// JavaScript for Code 67
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const gameOverModal = document.getElementById('game-over');
const gameOverTitle = document.getElementById('game-over-title');
const gameOverText = document.getElementById('game-over-text');
const restartBtn = document.getElementById('restart-btn');

// Game state
let gameRunning = false;
let gamePaused = false;
let score = 0;
let lives = 3;
let level = 1;
let animationId = null;

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 8,
    dx: 0,
    dy: 0,
    speed: 5,
    launched: false
};

// Paddle
const paddle = {
    width: 100,
    height: 12,
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    speed: 8,
    dx: 0
};

// Bricks
const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 35;

let bricks = [];

// Colors for brick rows
const brickColors = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff'];

function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = {
                x: 0,
                y: 0,
                status: 1,
                points: (brickRowCount - r) * 10
            };
        }
    }
}

// Controls
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && gameRunning &&!ball.launched &&!gamePaused) {
        launchBall();
    }
    if (e.key === 'p' || e.key === 'P') {
        togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Touch/mouse controls
canvas.addEventListener('mousemove', (e) => {
    if (!gameRunning || gamePaused) return;
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    paddle.x = relativeX - paddle.width / 2;

    // Keep paddle in bounds
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
});

canvas.addEventListener('click', () => {
    if (gameRunning &&!ball.launched &&!gamePaused) {
        launchBall();
    }
});

function launchBall() {
    ball.launched = true;
    ball.dx = (Math.random() > 0.5? 1 : -1) * ball.speed;
    ball.dy = -ball.speed;
}

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);

function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    gamePaused = false;
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    initBricks();
    resetBall();
    gameLoop();
}

function togglePause() {
    if (!gameRunning) return;
    gamePaused =!gamePaused;
    pauseBtn.textContent = gamePaused? 'Resume' : 'Pause';
    if (!gamePaused) gameLoop();
}

function restartGame() {
    score = 0;
    lives = 3;
    level = 1;
    updateUI();
    gameOverModal.classList.remove('show');
    gameRunning = false;
    gamePaused = false;
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    initBricks();
    resetBall();
}

function resetBall() {
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius - 2;
    ball.dx = 0;
    ball.dy = 0;
    ball.launched = false;
}

function updateUI() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    levelEl.textContent = level;
}

// Game Loop
function gameLoop() {
    if (!gameRunning || gamePaused) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw elements
    drawBricks();
    drawBall();
    drawPaddle();

    // Update
    updatePaddle();
    updateBall();
    checkWinCondition();

    animationId = requestAnimationFrame(gameLoop);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();

    // Glow effect
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#667eea';
    ctx.fill();
    ctx.closePath();

    // Highlight
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = brickColors[r];
                ctx.fill();
                ctx.closePath();

                // Highlight
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, 4);
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fill();
            }
        }
    }
}

function updatePaddle() {
    // Keyboard controls
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        paddle.x -= paddle.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        paddle.x += paddle.speed;
    }

    // Bounds
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }

    // Move ball with paddle if not launched
    if (!ball.launched) {
        ball.x = paddle.x + paddle.width / 2;
    }
}

function updateBall() {
    if (!ball.launched) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Paddle collision
    if (ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width) {

        // Calculate bounce angle based on where ball hits paddle
        const hitPos = (ball.x - paddle.x) / paddle.width;
        const angle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degree angle

        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = Math.sin(angle) * speed;
        ball.dy = -Math.cos(angle) * speed;
        ball.y = paddle.y - ball.radius;
    }

    // Bottom wall - lose life
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        updateUI();

        if (lives <= 0) {
            gameOver(false);
        } else {
            resetBall();
        }
    }

    // Brick collision
    brickCollision();
}

function brickCollision() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (ball.x > b.x &&
                    ball.x < b.x + brickWidth &&
                    ball.y > b.y &&
                    ball.y < b.y + brickHeight) {

                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += b.points;
                    updateUI();
                }
            }
        }
    }
}

function checkWinCondition() {
    const remainingBricks = bricks.flat().filter(b => b.status === 1).length;

    if (remainingBricks === 0) {
        level++;
        ball.speed += 0.5; // Increase difficulty
        paddle.width = Math.max(60, paddle.width - 5); // Shrink paddle
        updateUI();
        initBricks();
        resetBall();

        if (level > 5) {
            gameOver(true);
        }
    }
}

function gameOver(won) {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');

    gameOverTitle.textContent = won? 'You Win!' : 'Game Over';
    gameOverText.textContent = `Final Score: ${score} • Level: ${level}`;
    gameOverModal.classList.add('show');
}

// Initial render
initBricks();
drawBricks();
drawBall();
drawPaddle();