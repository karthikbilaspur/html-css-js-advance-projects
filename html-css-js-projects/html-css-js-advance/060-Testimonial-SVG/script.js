const testimonials = [
  {
    id: 1,
    name: "Priya S.",
    stars: 5,
    text: "This completely changed how we do marketing. Our conversion rate doubled in 30 days!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces"
  },
  {
    id: 2,
    name: "Marcus T.",
    stars: 5,
    text: "The best investment we've made. Support is incredible and the results speak for themselves.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces"
  },
  {
    id: 3,
    name: "Aisha K.",
    stars: 4,
    text: "Intuitive platform that saved us 20+ hours per week. My team actually enjoys using it.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces"
  },
  {
    id: 4,
    name: "James L.",
    stars: 5,
    text: "Game-changer for our startup. Went from idea to paying customers in under 2 weeks.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces"
  },
  {
    id: 5,
    name: "Sofia R.",
    stars: 5,
    text: "Finally, a tool that just works. Clean, powerful, and the analytics are spot on.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces"
  },
  {
    id: 6,
    name: "David C.",
    stars: 4,
    text: "ROI was immediate. We recovered our annual cost in the first month alone.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces"
  }
];

let gameState = {
  phase: 'start',
  startTime: null,
  endTime: null,
  matches: {},
  avatarsRevealed: false,
  selectedAvatar: null,
  selectedTestimonial: null,
  scores: JSON.parse(localStorage.getItem('testimonialScores') || '[]')
};

let timerInterval;

function init() {
  renderTestimonials();
  setupEventListeners();
  updateStats();
}

function renderTestimonials() {
  const grid = document.getElementById('testimonialGrid');
  grid.innerHTML = testimonials.map(t => `
    <div class="testimonial-card glass" data-id="${t.id}">
      <div class="card-header">
        <div class="avatar-container">
          <div class="avatar-placeholder">No Photo</div>
          <img class="avatar" src="${t.avatar}" alt="${t.name}" loading="lazy">
        </div>
        <div class="user-info">
          <div class="user-name">${t.name}</div>
          <div class="stars">${'★'.repeat(t.stars)}${'☆'.repeat(5-t.stars)}</div>
        </div>
      </div>
      <div class="testimonial-text">"${t.text}"</div>
    </div>
  `).join('');
}

function setupEventListeners() {
  document.getElementById('generateBtn').addEventListener('click', generateAvatars);
  document.getElementById('submitBtn').addEventListener('click', submitAnswers);
  document.getElementById('shareBtn').addEventListener('click', showShareCard);
  document.getElementById('playAgainBtn').addEventListener('click', playAgain);
  document.getElementById('downloadBtn').addEventListener('click', downloadCard);
}

function generateAvatars() {
  if (gameState.avatarsRevealed) return;
  
  gameState.avatarsRevealed = true;
  const avatars = document.querySelectorAll('.avatar');
  const placeholders = document.querySelectorAll('.avatar-placeholder');
  const containers = document.querySelectorAll('.avatar-container');
  
  avatars.forEach((avatar, i) => {
    setTimeout(() => {
      avatar.classList.add('revealed');
      placeholders[i].style.display = 'none';
      
      const shimmer = document.createElement('div');
      shimmer.className = 'shimmer';
      containers[i].appendChild(shimmer);
      setTimeout(() => shimmer.remove(), 1500);
    }, i * 150);
  });
  
  setTimeout(() => {
    showToast('Avatars generated! Starting quiz in 3 seconds...');
    setTimeout(startQuiz, 3000);
  }, 1500);
}

function startQuiz() {
  gameState.phase = 'quiz';
  gameState.startTime = Date.now();
  gameState.matches = {};
  
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('quizScreen').style.display = 'grid';
  updateStats();
  startTimer();
  
  const shuffledTestimonials = [...testimonials].sort(() => Math.random() - 0.5);
  const shuffledAvatars = [...testimonials].sort(() => Math.random() - 0.5);
  
  // Render testimonials column with drop zones
  const testimonialColumn = document.getElementById('testimonialColumn');
  testimonialColumn.innerHTML = shuffledTestimonials.map(t => `
    <div class="drop-zone glass" data-testimonial-id="${t.id}">
      <div class="testimonial-drop" data-id="${t.id}">
        <div class="user-name">${t.name}</div>
        <div class="testimonial-text">"${t.text}"</div>
      </div>
    </div>
  `).join('');
  
  // Render avatar pool
  const avatarPool = document.getElementById('avatarPool');
  avatarPool.innerHTML = shuffledAvatars.map(t => `
    <img class="avatar-draggable" 
         src="${t.avatar}" 
         alt="${t.name}"
         draggable="true"
         data-avatar-id="${t.id}">
  `).join('');
  
  setupDragDrop();
}

function setupDragDrop() {
  const draggables = document.querySelectorAll('.avatar-draggable');
  const dropZones = document.querySelectorAll('.drop-zone');
  
  // Desktop drag and drop
  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', handleDragStart);
  });
  
  dropZones.forEach(zone => {
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('drop', handleDrop);
    zone.addEventListener('dragleave', handleDragLeave);
    zone.addEventListener('click', handleTapSelect);
  });
  
  // Mobile tap to match
  draggables.forEach(draggable => {
    draggable.addEventListener('click', handleAvatarTap);
  });
}

function handleDragStart(e) {
  e.dataTransfer.setData('avatarId', e.target.dataset.avatarId);
  e.target.style.opacity = '0.5';
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const avatarId = parseInt(e.dataTransfer.getData('avatarId'));
  const testimonialId = parseInt(e.currentTarget.dataset.testimonialId);
  matchAvatar(avatarId, testimonialId, e.currentTarget);
  document.querySelector(`[data-avatar-id="${avatarId}"]`).style.opacity = '1';
}

function handleAvatarTap(e) {
  const avatarId = parseInt(e.target.dataset.avatarId);
  
  // Deselect previous
  document.querySelectorAll('.avatar-draggable').forEach(a => a.classList.remove('selected'));
  
  if (gameState.selectedAvatar === avatarId) {
    gameState.selectedAvatar = null;
  } else {
    gameState.selectedAvatar = avatarId;
    e.target.classList.add('selected');
    showToast('Now tap a testimonial to match');
  }
}

function handleTapSelect(e) {
  const zone = e.currentTarget;
  const testimonialId = parseInt(zone.dataset.testimonialId);
  
  if (gameState.selectedAvatar) {
    matchAvatar(gameState.selectedAvatar, testimonialId, zone);
    gameState.selectedAvatar = null;
    document.querySelectorAll('.avatar-draggable').forEach(a => a.classList.remove('selected'));
  }
}

function matchAvatar(avatarId, testimonialId, zone) {
  // Remove previous match for this avatar
  Object.keys(gameState.matches).forEach(key => {
    if (gameState.matches[key] === avatarId) delete gameState.matches[key];
  });
  
  gameState.matches[testimonialId] = avatarId;
  
  // Clear zone and add avatar
  const existingAvatar = zone.querySelector('.avatar-draggable');
  if (existingAvatar) {
    document.getElementById('avatarPool').appendChild(existingAvatar);
  }
  
  const avatarEl = document.querySelector(`[data-avatar-id="${avatarId}"]`).cloneNode(true);
  avatarEl.draggable = false;
  avatarEl.style.cursor = 'default';
  zone.insertBefore(avatarEl, zone.firstChild);
  zone.classList.add('matched');
  
  // Hide original from pool
  const originalAvatar = document.querySelector(`#avatarPool [data-avatar-id="${avatarId}"]`);
  if (originalAvatar) originalAvatar.style.display = 'none';
  
  showToast('Matched!');
}

function submitAnswers() {
  if (Object.keys(gameState.matches).length !== testimonials.length) {
    showToast('Please match all avatars before submitting!');
    return;
  }
  
  clearInterval(timerInterval);
  gameState.endTime = Date.now();
  gameState.phase = 'results';
  
  let correct = 0;
  testimonials.forEach(t => {
    if (gameState.matches[t.id] === t.id) correct++;
  });
  
  const score = Math.round((correct / testimonials.length) * 100);
  const timeSeconds = Math.round((gameState.endTime - gameState.startTime) / 1000);
  
  // Save score
  const scoreEntry = {
    score,
    correct,
    total: testimonials.length,
    time: timeSeconds,
    date: new Date().toLocaleDateString()
  };
  gameState.scores.unshift(scoreEntry);
  gameState.scores = gameState.scores.slice(0, 5);
  localStorage.setItem('testimonialScores', JSON.stringify(gameState.scores));
  
  showResults(score, correct, timeSeconds);
}

function showResults(score, correct, time) {
  document.getElementById('quizScreen').style.display = 'none';
  document.getElementById('resultsScreen').style.display = 'block';
  
  document.getElementById('scorePercent').textContent = score + '%';
  document.getElementById('matchedValue').textContent = `${correct}/${testimonials.length}`;
  document.getElementById('finalTimeValue').textContent = time + 's';
  document.getElementById('accuracyValue').textContent = score + '%';
  
  renderLeaderboard();
  updateStats();
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboardList');
  list.innerHTML = gameState.scores.map((s, i) => `
    <div class="leaderboard-item ${i === 0 ? 'current' : ''}">
      <span>#${i + 1} - ${s.date}</span>
      <span>${s.score}% (${s.time}s)</span>
    </div>
  `).join('');
}

function showShareCard() {
  const card = document.getElementById('shareCard');
  card.style.display = 'block';
  generateShareCard();
  card.scrollIntoView({ behavior: 'smooth' });
}

function generateShareCard() {
  const canvas = document.getElementById('shareCanvas');
  const ctx = canvas.getContext('2d');
  
  // Background
  const gradient = ctx.createLinearGradient(0, 0, 600, 400);
  gradient.addColorStop(0, '#1e1b4b');
  gradient.addColorStop(1, '#0c4a6e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 400);
  
  // Title
  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 32px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Testimonial Memory Game', 300, 60);
  
  // Score
  const latestScore = gameState.scores[0];
  ctx.font = 'bold 72px Inter, sans-serif';
  ctx.fillStyle = '#34d399';
  ctx.fillText(latestScore.score + '%', 300, 180);
  
  ctx.font = '20px Inter, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(`${latestScore.correct}/${latestScore.total} Matched in ${latestScore.time}s`, 300, 220);
  
  // Footer
  ctx.font = '16px Inter, sans-serif';
  ctx.fillText('Can you beat my score?', 300, 340);
  ctx.font = '14px Inter, sans-serif';
  ctx.fillStyle = '#7c3aed';
  ctx.fillText('testimonial-memory.game', 300, 370);
}

function downloadCard() {
  const canvas = document.getElementById('shareCanvas');
  const link = document.createElement('a');
  link.download = 'testimonial-memory-score.png';
  link.href = canvas.toDataURL();
  link.click();
  showToast('Score card downloaded!');
}

function playAgain() {
  gameState.phase = 'start';
  gameState.matches = {};
  gameState.avatarsRevealed = false;
  gameState.selectedAvatar = null;
  
  document.getElementById('resultsScreen').style.display = 'none';
  document.getElementById('shareCard').style.display = 'none';
  document.getElementById('startScreen').style.display = 'block';
  
  renderTestimonials();
  updateStats();
  showToast('Game reset! Generate avatars to play again');
}

function startTimer() {
  timerInterval = setInterval(() => {
    const elapsed = Math.round((Date.now() - gameState.startTime) / 1000);
    document.getElementById('timeValue').textContent = elapsed + 's';
  }, 1000);
}

function updateStats() {
  const phaseMap = { start: 'Gallery', quiz: 'Quiz', results: 'Results' };
  document.getElementById('phaseValue').textContent = phaseMap[gameState.phase];
  
  if (gameState.phase === 'start') {
    document.getElementById('timeValue').textContent = '0s';
    document.getElementById('scoreValue').textContent = '--';
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Parallax effect for background
document.addEventListener('mousemove', (e) => {
  const shapes = document.querySelectorAll('.floating-shape');
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  
  shapes.forEach((shape, i) => {
    const factor = (i + 1) * 0.5;
    shape.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
});

// Init game
init();