// JavaScript for Code 68
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const finalScoreEl = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const newBestEl = document.getElementById('new-best');

const GRAVITY = 0.5;
const FLAP_POWER = -9;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;
const BIRD_SIZE = 20;

let bird = {};
let pipes = [];
let score = 0;
let best = parseInt(localStorage.getItem('flappy68_best')) || 0;
let gameRunning = false;
let frameCount = 0;
let animationId = null;

bestEl.textContent = best;

// Bird object
function resetBird() {
    bird = {
        x: 80,
        y: canvas.height / 2,
        velocity: 0,
        rotation: 0
    };
}

// Pipe management
function createPipe() {
    const minHeight = 80;
    const maxHeight = canvas.height - PIPE_GAP - minHeight - 100;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);

    return {
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + PIPE_GAP,
        bottomHeight: canvas.height - (topHeight + PIPE_GAP) - 100,
        passed: false
    };
}

function initGame() {
    resetBird();
    pipes = [createPipe()];
    score = 0;
    frameCount = 0;
    scoreEl.textContent = score;
    gameRunning = true;
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    update();
    draw();

    animationId = requestAnimationFrame(gameLoop);
}

function update() {
    frameCount++;

    // Bird physics
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Bird rotation based on velocity
    bird.rotation = Math.min(Math.PI / 4, bird.velocity * 0.05);

    // Spawn pipes
    if (frameCount % 90 === 0) {
        pipes.push(createPipe());
    }

    // Update pipes
    pipes.forEach(pipe => {
        pipe.x -= PIPE_SPEED;

        // Score
        if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
            pipe.passed = true;
            score++;
            scoreEl.textContent = score;
        }
    });

    // Remove off-screen pipes
    pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);

    // Collision detection
    checkCollisions();
}

function checkCollisions() {
    // Ground collision
    if (bird.y + BIRD_SIZE / 2 > canvas.height - 100) {
        gameOver();
    }

    // Ceiling collision
    if (bird.y - BIRD_SIZE / 2 < 0) {
        bird.y = BIRD_SIZE / 2;
        bird.velocity = 0;
    }

    // Pipe collision
    for (let pipe of pipes) {
        if (bird.x + BIRD_SIZE / 2 > pipe.x &&
            bird.x - BIRD_SIZE / 2 < pipe.x + PIPE_WIDTH) {

            // Top pipe
            if (bird.y - BIRD_SIZE / 2 < pipe.topHeight) {
                gameOver();
            }
            // Bottom pipe
            if (bird.y + BIRD_SIZE / 2 > pipe.bottomY) {
                gameOver();
            }
        }
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    drawClouds();

    // Draw pipes
    pipes.forEach(pipe => drawPipe(pipe));

    // Draw ground
    ctx.fillStyle = '#5c4033';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // Draw ground texture
    ctx.fillStyle = '#4a3228';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, canvas.height - 100, 10, 100);
    }

    // Draw bird
    drawBird();
}

function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const offset = (frameCount * 0.5) % 100;

    // Simple parallax clouds
    drawCloud(50 - offset, 80, 40);
    drawCloud(200 - offset, 120, 50);
    drawCloud(320 - offset, 60, 35);
}

function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
    ctx.arc(x + size * 0.5, y, size * 0.7, 0, Math.PI * 2);
    ctx.arc(x + size, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawPipe(pipe) {
    // Top pipe
    ctx.fillStyle = '#5cb85c';
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

    // Pipe cap
    ctx.fillStyle = '#4cae4c';
    ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, PIPE_WIDTH + 10, 30);

    // Bottom pipe
    ctx.fillStyle = '#5cb85c';
    ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, pipe.bottomHeight);

    // Bottom pipe cap
    ctx.fillStyle = '#4cae4c';
    ctx.fillRect(pipe.x - 5, pipe.bottomY, PIPE_WIDTH + 10, 30);

    // Pipe highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(pipe.x + 5, 0, 8, pipe.topHeight);
    ctx.fillRect(pipe.x + 5, pipe.bottomY, 8, pipe.bottomHeight);
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);

    // Bird body
    ctx.fillStyle = '#ffcd00';
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Bird belly
    ctx.fillStyle = '#ffed4e';
    ctx.beginPath();
    ctx.arc(0, 5, BIRD_SIZE * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = '#ffcd00';
    ctx.beginPath();
    ctx.ellipse(-5, 0, 8, 12, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(8, -5, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(10, -5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#ff9500';
    ctx.beginPath();
    ctx.moveTo(BIRD_SIZE, 0);
    ctx.lineTo(BIRD_SIZE + 8, -3);
    ctx.lineTo(BIRD_SIZE + 8, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function flap() {
    if (!gameRunning) return;
    bird.velocity = FLAP_POWER;
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);

    if (score > best) {
        best = score;
        localStorage.setItem('flappy68_best', best);
        bestEl.textContent = best;
        newBestEl.classList.remove('hidden');
    } else {
        newBestEl.classList.add('hidden');
    }

    finalScoreEl.textContent = score;
    gameOverScreen.classList.add('show');
}

// Controls
startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    initGame();
    gameLoop();
});

restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.remove('show');
    initGame();
    gameLoop();
});

// Input handlers
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameRunning && startScreen.classList.contains('hidden')) {
            initGame();
            gameLoop();
        } else {
            flap();
        }
    }
});

canvas.addEventListener('click', () => {
    if (!gameRunning && startScreen.classList.contains('hidden')) {
        initGame();
        gameLoop();
    } else {
        flap();
    }
});

// Touch for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameRunning && startScreen.classList.contains('hidden')) {
        initGame();
        gameLoop();
    } else {
        flap();
    }
});

// Initial draw
resetBird();
draw();