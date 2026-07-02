const App = {
  data: {
    blocks: [],
    sessions: [],
    shutdowns: [],
    blocked: ['instagram.com', 'youtube.com'],
    settings: { goal: 4 } // hours deep work
  },
  state: { activeBlock: null, timer: null, seconds: 0, distractions: [] },

  // ===== CORE =====
  init() {
    this.load();
    this.bind();
    this.render();
    this.checkBlocked();
    setInterval(() => this.tick(), 1000);
  },

  save() { localStorage.setItem('focus099', JSON.stringify(this.data)); },
  load() {
    const s = localStorage.getItem('focus099');
    if (s) this.data = {...this.data,...JSON.parse(s) };
  },

  // ===== BLOCKS =====
  addBlock(task, type, mins) {
    this.data.blocks.push({
      id: Date.now(),
      date: this.today(),
      task, type,
      duration: parseInt(mins),
      done: false
    });
    this.save(); this.render();
  },
  delBlock(id) {
    this.data.blocks = this.data.blocks.filter(b => b.id!== id);
    this.save(); this.render();
  },

  // ===== TIMER =====
  startTimer() {
    const block = this.data.blocks.find(b =>!b.done && b.date === this.today());
    if (!block) return alert('Add a timeblock first');

    this.state.activeBlock = block;
    this.state.seconds = block.duration * 60;
    this.state.distractions = [];
    document.getElementById('start-btn').disabled = true;
    document.getElementById('pause-btn').disabled = false;
    document.getElementById('current-task').textContent = block.task;
  },
  pauseTimer() {
    if (this.state.timer) {
      clearInterval(this.state.timer);
      this.state.timer = null;
      document.getElementById('start-btn').disabled = false;
      document.getElementById('pause-btn').disabled = true;
    } else {
      this.state.timer = true; // flag
      document.getElementById('start-btn').disabled = true;
      document.getElementById('pause-btn').disabled = false;
    }
  },
  tick() {
    if (!this.state.timer ||!this.state.activeBlock) return;
    this.state.seconds--;
    if (this.state.seconds <= 0) this.completeBlock();
    this.updateTimer();
  },
  completeBlock() {
    this.data.sessions.push({
      id: Date.now(),
      blockId: this.state.activeBlock.id,
      duration: this.state.activeBlock.duration,
      distractions: this.state.distractions
    });
    this.state.activeBlock.done = true;
    this.state.activeBlock = null;
    this.state.timer = null;
    this.save();
    this.resetTimer();
    this.render();
    new Notification('Block Complete!', { body: 'Time for a break' });
  },
  resetTimer() {
    document.getElementById('start-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
    document.getElementById('current-task').textContent = 'No active block';
    document.getElementById('timer').textContent = '25:00';
  },
  logDistraction() {
    if (!this.state.activeBlock) return;
    const note = prompt('What distracted you?') || 'Unknown';
    this.state.distractions.push({ ts: Date.now(), note });
    this.renderDistractions();
  },
  updateTimer() {
    const m = Math.floor(this.state.seconds / 60);
    const s = this.state.seconds % 60;
    document.getElementById('timer').textContent = `${m}:${String(s).padStart(2,'0')}`;
  },

  // ===== SHUTDOWN =====
  shutdown(rating, tomorrow, dump) {
    this.data.shutdowns.push({
      date: this.today(),
      rating: parseInt(rating),
      tomorrow, dump
    });
    this.save(); this.render();
    alert('Shutdown complete. See you tomorrow!');
  },

  // ===== ANALYTICS =====
  getScore() {
    const today = this.today();
    const deepMins = this.data.sessions
    .filter(s => {
        const b = this.data.blocks.find(bl => bl.id === s.blockId);
        return b && b.date === today && b.type === 'Deep';
      })
    .reduce((a,s) => a + s.duration, 0);

    const distracts = this.data.sessions
    .filter(s => this.data.blocks.find(b => b.id === s.blockId && b.date === today))
    .reduce((a,s) => a + s.distractions.length, 0);

    const shutdown = this.data.shutdowns.find(s => s.date === today)? 20 : 0;
    const score = Math.max(0, Math.round(deepMins / 60 * 25 - distracts * 10 + shutdown));
    return score;
  },

  getWeekData() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const date = d.toISOString().split('T')[0];
      const deepHrs = this.data.sessions
      .filter(s => {
          const b = this.data.blocks.find(bl => bl.id === s.blockId);
          return b && b.date === date && b.type === 'Deep';
        })
      .reduce((a,s) => a + s.duration, 0) / 60;
      days.push({ date, hours: deepHrs, label: d.toLocaleDateString('en', {weekday:'short'}) });
    }
    return days;
  },

  // ===== BLOCKED SITES =====
  addSite(site) {
    if (site &&!this.data.blocked.includes(site)) {
      this.data.blocked.push(site);
      this.save(); this.render();
    }
  },
  delSite(site) {
    this.data.blocked = this.data.blocked.filter(s => s!== site);
    this.save(); this.render();
  },
  checkBlocked() {
    const ref = document.referrer;
    if (this.data.blocked.some(s => ref.includes(s))) {
      document.body.innerHTML = '<div style="padding:40px;text-align:center"><h1>Blocked</h1><p>Back to work on 099</p></div>';
    }
  },

  // ===== UTILS =====
  today() { return new Date().toISOString().split('T')[0]; },

  // ===== RENDER =====
  render() {
    this.renderPlan();
    this.renderFocus();
    this.renderReview();
    document.getElementById('score').textContent = this.getScore();
  },

  renderPlan() {
    const blocks = this.data.blocks.filter(b => b.date === this.today());
    document.getElementById('timeline').innerHTML = blocks.length? blocks.map(b => `
      <div class="timeblock ${b.type}">
        <div><strong>${b.task}</strong> • ${b.duration}m ${b.done? '✓' : ''}</div>
        <button onclick="App.delBlock(${b.id})" style="width:auto;padding:4px 8px;background:none;color:var(--danger)">×</button>
      </div>
    `).join('') : '<div class="empty">No blocks yet</div>';

    document.getElementById('blocked-list').innerHTML = this.data.blocked.map(s => `
      <div class="site-tag">${s}<button onclick="App.delSite('${s}')">×</button></div>
    `).join('');
  },

  renderFocus() {
    this.renderDistractions();
  },

  renderDistractions() {
    document.getElementById('distractions').innerHTML = this.state.distractions.length
    ? `Distractions: ${this.state.distractions.length} • ${this.state.distractions.map(d => d.note).join(', ')}`
      : '';
  },

  renderReview() {
    const week = this.getWeekData();
    document.getElementById('week-heatmap').innerHTML = week.map(d => {
      const level = d.hours === 0? 0 : d.hours < 1? 1 : d.hours < 2? 2 : d.hours < 4? 3 : 4;
      return `<div class="heat-day" data-level="${level}" title="${d.label}: ${d.hours.toFixed(1)}h">${d.label[0]}</div>`;
    }).join('');

    const totalHrs = week.reduce((a,d) => a + d.hours, 0);
    const avg = totalHrs / 7;
    document.getElementById('week-stats').innerHTML = `
      <div style="display:flex;justify-content:space-between;font-size:14px">
        <span>Total: ${totalHrs.toFixed(1)}h</span>
        <span>Avg: ${avg.toFixed(1)}h/day</span>
        <span>Goal: ${this.data.settings.goal}h/day</span>
      </div>
    `;
  },

  // ===== BIND =====
  bind() {
    // Nav
    document.querySelectorAll('nav button').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('nav button,.view').forEach(e => e.classList.remove('active'));
        b.classList.add('active');
        document.getElementById(b.dataset.view).classList.add('active');
      };
    });

    // Forms
    document.getElementById('block-form').onsubmit = e => {
      e.preventDefault();
      this.addBlock(task.value, type.value, mins.value);
      e.target.reset();
      mins.value = 50;
    };
    document.getElementById('block-site-form').onsubmit = e => {
      e.preventDefault();
      this.addSite(site.value); e.target.reset();
    };
    document.getElementById('shutdown-form').onsubmit = e => {
      e.preventDefault();
      this.shutdown(rating.value, tomorrow.value, dump.value);
      e.target.reset();
    };

    // Timer
    document.getElementById('start-btn').onclick = () => this.startTimer();
    document.getElementById('pause-btn').onclick = () => this.pauseTimer();
    document.getElementById('distract-btn').onclick = () => this.logDistraction();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
};

App.init();