const Apex = {
  d: { habits: [], blocks: [], sessions: [], expenses: [], budgets: [], notes: [], cats: ['Food','Transport','Bills','Shopping','Health','Other'] },
  s: { activeBlock: null, timer: null, seconds: 0 },

  init() {
    this.load();
    this.bind();
    this.render();
    setInterval(() => this.tick(), 1000);
    this.greet();
  },

  // ===== STORAGE =====
  save() { localStorage.setItem('apex100', JSON.stringify(this.d)); },
  load() {
    const s = localStorage.getItem('apex100');
    if (s) Object.assign(this.d, JSON.parse(s));
  },

  // ===== UTILS =====
  td() { return new Date().toISOString().split('T')[0]; },
  uid() { return Date.now() + Math.random(); },
  fmt(n) { return Math.round(n).toLocaleString('en-IN'); },
  greet() {
    const h = new Date().getHours();
    const g = h < 12? 'Good morning' : h < 18? 'Good afternoon' : 'Good evening';
    document.getElementById('greeting').textContent = g + ', Karthik';
  },

  // ===== NAVIGATION =====
  bind() {
    document.querySelectorAll('.nav-item').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('.nav-item,.view').forEach(e => e.classList.remove('active'));
        b.classList.add('active');
        document.getElementById(b.dataset.view).classList.add('active');
      };
    });
    document.getElementById('theme-toggle').onclick = () => {
      const t = document.documentElement.dataset.theme === 'dark'? 'light' : 'dark';
      document.documentElement.dataset.theme = t;
      localStorage.setItem('theme', t);
    };
    document.getElementById('export-data').onclick = () => this.export();
    document.getElementById('habit-add').onsubmit = e => {
      e.preventDefault();
      this.addHabit(h - name.value, h - type.value, h - goal.value);
      e.target.reset();
    };
    document.getElementById('block-add').onsubmit = e => {
      e.preventDefault();
      this.addBlock(b - task.value, b - type.value, b - mins.value);
      e.target.reset(); b - mins.value = 50;
    };
    document.getElementById('expense-form').onsubmit = e => {
      e.preventDefault();
      this.addExpense(+ex - amt.value, ex - cat.value, ex - note.value);
      e.target.reset();
    };
    document.getElementById('budget-add').onsubmit = e => {
      e.preventDefault();
      this.addBudget(b - cat.value, +b - limit.value);
      e.target.reset();
    };
    document.getElementById('t-start').onclick = () => this.startFocus();
    document.getElementById('t-pause').onclick = () => this.pauseFocus();
    document.getElementById('t-stop').onclick = () => this.stopFocus();

    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.dataset.theme = theme;
    this.populateCats();
  },

  // ===== HABITS =====
  addHabit(n, type, goal) {
    this.d.habits.push({ id: this.uid(), n, type, goal: +goal, log: {}, created: this.td() });
    this.save(); this.render();
  },
  toggleHabit(id) {
    const h = this.d.habits.find(x => x.id === id);
    if (!h) return;
    const t = this.td();
    h.log[t] = h.log[t]? 0 : h.goal;
    this.save(); this.render();
  },
  getStreak(h) {
    let s = 0, d = new Date();
    while (true) {
      const k = d.toISOString().split('T')[0];
      if ((h.log[k] || 0) >= h.goal) s++;
      else break;
      d.setDate(d.getDate() - 1);
    }
    return s;
  },

  // ===== FOCUS =====
  addBlock(task, type, mins) {
    this.d.blocks.push({ id: this.uid(), date: this.td(), task, type, mins: +mins, done: false });
    this.save(); this.render();
  },
  startFocus(id) {
    const b = id? this.d.blocks.find(x => x.id === id) : this.d.blocks.find(x =>!x.done && x.date === this.td());
    if (!b) return;
    this.s.activeBlock = b;
    this.s.seconds = b.mins * 60;
    this.s.timer = true;
    document.getElementById('t-start').disabled = true;
    document.getElementById('t-pause').disabled = false;
    document.getElementById('t-stop').disabled = false;
    document.getElementById('focus-current').textContent = b.task;
  },
  pauseFocus() {
    this.s.timer =!this.s.timer;
    document.getElementById('t-pause').textContent = this.s.timer? 'Pause' : 'Resume';
  },
  stopFocus() {
    if (!this.s.activeBlock) return;
    this.d.sessions.push({
      id: this.uid(),
      blockId: this.s.activeBlock.id,
      duration: this.s.activeBlock.mins - Math.floor(this.s.seconds / 60),
      date: this.td()
    });
    this.s.activeBlock.done = true;
    this.s.activeBlock = null;
    this.s.timer = null;
    this.save();
    this.resetTimer();
    this.render();
  },
  resetTimer() {
    document.getElementById('t-start').disabled = false;
    document.getElementById('t-pause').disabled = true;
    document.getElementById('t-stop').disabled = true;
    document.getElementById('focus-current').textContent = 'No active session';
    document.getElementById('timer').textContent = '00:00';
  },
  tick() {
    if (!this.s.timer ||!this.s.activeBlock) return;
    this.s.seconds--;
    if (this.s.seconds <= 0) return this.stopFocus();
    const m = Math.floor(this.s.seconds / 60), s = this.s.seconds % 60;
    document.getElementById('timer').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  },

  // ===== MONEY =====
  addExpense(amt, cat, note) {
    this.d.expenses.push({ id: this.uid(), amt, cat, note, date: new Date().toISOString() });
    this.save(); this.render();
  },
  addBudget(cat, limit) {
    const m = this.td().slice(0,7);
    const e = this.d.budgets.find(b => b.cat === cat && b.month === m);
    if (e) e.limit = limit;
    else this.d.budgets.push({ cat, limit, month: m });
    this.save(); this.render();
  },
  getSpent(month = this.td().slice(0,7)) {
    return this.d.expenses.filter(e => e.date.startsWith(month)).reduce((a,e) => a + e.amt, 0);
  },
  getBudget() {
    const m = this.td().slice(0,7);
    return this.d.budgets.filter(b => b.month === m).reduce((a,b) => a + b.limit, 0);
  },

  // ===== NOTES =====
  addNote() {
    const n = prompt('Note title:');
    if (n) {
      this.d.notes.push({ id: this.uid(), title: n, content: '', date: this.td() });
      this.save(); this.render();
    }
  },
  updateNote(id, content) {
    const n = this.d.notes.find(x => x.id === id);
    if (n) { n.content = content; this.save(); }
  },
  delNote(id) {
    this.d.notes = this.d.notes.filter(x => x.id!== id);
    this.save(); this.render();
  },

  // ===== STATS =====
  getScore() {
    const deep = this.d.sessions.filter(s => {
      const b = this.d.blocks.find(x => x.id === s.blockId);
      return b && b.date === this.td() && b.type === 'Deep';
    }).reduce((a,s) => a + s.duration, 0);
    const streak = Math.max(0,...this.d.habits.map(h => this.getStreak(h)));
    return Math.round(deep / 60 * 25 + streak * 2);
  },
  getDeepHrs() {
    return this.d.sessions.filter(s => {
      const b = this.d.blocks.find(x => x.id === s.blockId);
      return b && b.date === this.td() && b.type === 'Deep';
    }).reduce((a,s) => a + s.duration, 0) / 60;
  },

  // ===== RENDER =====
  render() {
    document.getElementById('h-streak').textContent = Math.max(0,...this.d.habits.map(h => this.getStreak(h)));
    document.getElementById('h-score').textContent = this.getScore();
    document.getElementById('h-balance').textContent = '₹' + this.fmt(this.getBudget() - this.getSpent());

    this.rDash();
    this.rHabits();
    this.rFocus();
    this.rMoney();
    this.rNotes();
  },

  rDash() {
    const blocks = this.d.blocks.filter(b => b.date === this.td() &&!b.done).slice(0,3);
    document.getElementById('today-agenda').innerHTML = blocks.length? blocks.map(b =>
      `<div class="item-row"><div class="item-main"><div class="item-title">${b.task}</div><div class="item-sub">${b.type} • ${b.mins}m</div></div></div>`
    ).join('') : '<div class="empty">No blocks planned</div>';

    const deepHrs = this.getDeepHrs();
    const deepPct = Math.min(100, deepHrs / 4 * 100);
    document.getElementById('deep-ring').style.setProperty('--pct', deepPct + '%');
    document.getElementById('deep-ring').querySelector('span').textContent = deepHrs.toFixed(1) + 'h';

    const habits = this.d.habits.slice(0,3);
    document.getElementById('dash-habits').innerHTML = habits.map(h =>
      `<div class="item-row"><div class="item-main"><div class="item-title">${h.n}</div><div class="item-sub">${this.getStreak(h)} day streak</div></div>
       <div class="checkbox ${h.log[this.td()]?'done':''}" onclick="Apex.toggleHabit(${h.id})"></div></div>`
    ).join('') || '<div class="empty">No habits</div>';

    this.drawChart('week-chart', this.getWeekData());
  },

  rHabits() {
    document.getElementById('habit-list').innerHTML = this.d.habits.map(h => `
      <div class="item-row">
        <div class="item-main">
          <div class="item-title">${h.n}</div>
          <div class="item-sub">${this.getStreak(h)} days • ${h.type}</div>
        </div>
        <div class="checkbox ${h.log[this.td()]?'done':''}" onclick="Apex.toggleHabit(${h.id})"></div>
      </div>
    `).join('') || '<div class="empty">Add your first habit</div>';
  },

  rFocus() {
    document.getElementById('blocks').innerHTML = this.d.blocks.filter(b => b.date === this.td()).map(b => `
      <div class="block-item ${b.type} ${b.done?'done':''}" onclick="Apex.startFocus(${b.id})">
        ${b.task} • ${b.mins}m ${b.done?'✓':''}
      </div>
    `).join('') || '<div class="empty">No blocks today</div>';

    const sessions = this.d.sessions.filter(s => {
      const b = this.d.blocks.find(x => x.id === s.blockId);
      return b && b.date === this.td();
    });
    document.getElementById('focus-log').innerHTML = sessions.map(s => {
      const b = this.d.blocks.find(x => x.id === s.blockId);
      return `<div class="item-row"><div class="item-main"><div class="item-title">${b.task}</div><div class="item-sub">${s.duration}m • ${b.type}</div></div></div>`;
    }).join('') || '<div class="empty">No sessions yet</div>';
  },

  rMoney() {
    const quicks = [{l:'Chai ₹20',a:20,c:'Food'},{l:'Lunch ₹100',a:100,c:'Food'},{l:'Auto ₹50',a:50,c:'Transport'}];
    document.getElementById('expense-quick').innerHTML = quicks.map(q =>
      `<button onclick="Apex.addExpense(${q.a},'${q.c}','${q.l}')">${q.l}</button>`
    ).join('');

    const m = this.td().slice(0,7);
    const spent = {};
    this.d.expenses.filter(e => e.date.startsWith(m)).forEach(e => spent[e.cat] = (spent[e.cat] || 0) + e.amt);

    document.getElementById('budget-list').innerHTML = this.d.budgets.filter(b => b.month === m).map(b => {
      const s = spent[b.cat] || 0, p = Math.min(100, s / b.limit * 100);
      const c = p > 100? 'var(--bad)' : p > 80? 'var(--warn)' : 'var(--ok)';
      return `<div class="item-row"><div class="item-main"><div class="item-title">${b.cat}</div>
        <div class="item-sub">₹${this.fmt(s)} / ₹${this.fmt(b.limit)}</div></div>
        <div style="width:60px;height:6px;background:var(--bg2);border-radius:3px;overflow:hidden">
        <div style="width:${p}%;height:100%;background:${c}"></div></div></div>`;
    }).join('') || '<div class="empty">No budgets set</div>';

    this.drawChart('money-chart', this.getMoneyData());
  },

  rNotes() {
    const q = document.getElementById('note-search').value.toLowerCase();
    const notes = this.d.notes.filter(n =>!q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    document.getElementById('note-list').innerHTML = notes.map(n => `
      <div class="item-row">
        <div class="item-main">
          <div class="item-title">${n.title}</div>
          <div class="item-sub">${n.date}</div>
        </div>
        <div class="item-actions">
          <button onclick="Apex.delNote(${n.id})" class="danger">Del</button>
        </div>
      </div>
    `).join('') || '<div class="empty">No notes yet</div>';
  },

  rCats() {
    const opts = this.d.cats.map(c => `<option>${c}</option>`).join('');
    document.getElementById('ex-cat').innerHTML = opts;
    document.getElementById('b-cat').innerHTML = opts;
  },

  // ===== CHARTS =====
  getWeekData() {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const date = d.toISOString().split('T')[0];
      const deep = this.d.sessions.filter(s => {
        const b = this.d.blocks.find(x => x.id === s.blockId);
        return b && b.date === date && b.type === 'Deep';
      }).reduce((a,s) => a + s.duration, 0) / 60;
      data.push(deep);
    }
    return data;
  },

  getMoneyData() {
    const m = this.td().slice(0,7);
    const days = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const data = Array(days).fill(0);
    this.d.expenses.filter(e => e.date.startsWith(m)).forEach(e => {
      data[new Date(e.date).getDate() - 1] += e.amt;
    });
    return data;
  },

  drawChart(id, data) {
    const c = document.getElementById(id);
    const ctx = c.getContext('2d');
    const w = c.width = c.offsetWidth;
    const h = c.height;
    ctx.clearRect(0, 0, w, h);

    const max = Math.max(...data, 1);
    const bw = w / data.length;

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--acc');
    data.forEach((v, i) => {
      const bh = (v / max) * (h - 20);
      ctx.fillRect(i * bw + bw * 0.1, h - bh, bw * 0.8, bh);
    });
  },

  // ===== MODALS =====
  modal(type) {
    const m = document.getElementById('modal');
    let html = '';

    if (type === 'habit') {
      html = `<h3>New Habit</h3>
        <input id="m-n" placeholder="Habit name" required>
        <select id="m-t"><option>Daily</option><option>Weekly</option></select>
        <input id="m-g" type="number" value="1" min="1" placeholder="Goal">`;
      document.getElementById('modal-form').onsubmit = e => {
        e.preventDefault();
        this.addHabit(document.getElementById('m-n').value, document.getElementById('m-t').value, document.getElementById('m-g').value);
        m.close();
      };
    } else if (type === 'block') {
      html = `<h3>New Timeblock</h3>
        <input id="m-task" placeholder="Task" required>
        <select id="m-type"><option>Deep</option><option>Shallow</option><option>Admin</option></select>
        <input id="m-mins" type="number" value="50" min="15" step="5">`;
      document.getElementById('modal-form').onsubmit = e => {
        e.preventDefault();
        this.addBlock(document.getElementById('m-task').value, document.getElementById('m-type').value, document.getElementById('m-mins').value);
        m.close();
      };
    } else if (type === 'budget') {
      html = `<h3>Set Budget</h3>
        <select id="m-cat">${this.d.cats.map(c => `<option>${c}</option>`)}</select>
        <input id="m-limit" type="number" placeholder="Limit" required>`;
      document.getElementById('modal-form').onsubmit = e => {
        e.preventDefault();
        this.addBudget(document.getElementById('m-cat').value, +document.getElementById('m-limit').value);
        m.close();
      };
    }

    m.innerHTML = html + `<div class="actions"><button type="button" onclick="this.closest('dialog').close()">Cancel</button><button type="submit">Save</button></div>`;
    m.showModal();
  },

  // ===== EXPORT =====
  export() {
    const blob = new Blob([JSON.stringify(this.d, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apex-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }
};