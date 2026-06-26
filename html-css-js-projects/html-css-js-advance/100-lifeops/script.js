const OS = {
  d: { habits: [], blocks: [], sessions: [], expenses: [], budgets: [], cats: ['Food','Transport','Bills','Shopping','Health','Other'] },
  s: { active: null, t: 0, interval: null },

  // ===== INIT =====
  i() {
    this.load();
    this.bind();
    this.r();
    setInterval(() => this.tick(), 1000);
  },

  save() { localStorage.setItem('lifeos100', JSON.stringify(this.d)); },
  load() {
    const s = localStorage.getItem('lifeos100');
    if (s) this.d = {...this.d,...JSON.parse(s) };
  },

  // ===== UTILS =====
  td() { return new Date().toISOString().split('T')[0]; },
  fmt(n) { return Math.round(n).toLocaleString('en-IN'); },
  uid() { return Date.now() + Math.random(); },

  // ===== HABITS =====
  addHabit(n, type, goal) {
    this.d.habits.push({ id: this.uid(), n, type, goal: +goal || 1, log: {}, created: this.td() });
    this.save(); this.r();
  },
  toggleHabit(id, date = this.td()) {
    const h = this.d.habits.find(x => x.id === id);
    if (!h) return;
    h.log[date] = h.log[date]? 0 : h.goal;
    this.save(); this.r();
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
    this.save(); this.r();
  },
  startFocus(id) {
    const b = this.d.blocks.find(x => x.id === id);
    if (!b || b.done) return;
    this.s.active = b;
    this.s.t = b.mins * 60;
    this.s.interval = true;
    document.getElementById('focus-start').disabled = true;
    document.getElementById('focus-stop').disabled = false;
    document.getElementById('focus-task').textContent = b.task;
  },
  stopFocus() {
    if (!this.s.active) return;
    this.d.sessions.push({
      id: this.uid(),
      blockId: this.s.active.id,
      duration: this.s.active.mins - Math.floor(this.s.t / 60),
      date: this.td()
    });
    this.s.active.done = true;
    this.s.active = null;
    this.s.interval = null;
    this.save();
    this.resetFocus();
    this.r();
  },
  resetFocus() {
    document.getElementById('focus-start').disabled = false;
    document.getElementById('focus-stop').disabled = true;
    document.getElementById('focus-task').textContent = 'Select a block to start';
    document.getElementById('timer').textContent = '00:00';
  },
  distract() {
    if (this.s.active) {
      const n = prompt('What distracted you?') || 'Unknown';
      const sess = this.d.sessions.find(s => s.blockId === this.s.active.id);
      if (sess) (sess.distractions = sess.distractions || []).push(n);
      this.save();
    }
  },
  tick() {
    if (!this.s.interval ||!this.s.active) return;
    this.s.t--;
    if (this.s.t <= 0) this.stopFocus();
    const m = Math.floor(this.s.t / 60), s = this.s.t % 60;
    document.getElementById('timer').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  },

  // ===== MONEY =====
  addExpense(amt, cat, note) {
    this.d.expenses.push({ id: this.uid(), amt: +amt, cat, note, date: new Date().toISOString() });
    this.save(); this.r();
  },
  addBudget(cat, limit) {
    const e = this.d.budgets.find(b => b.cat === cat && b.month === this.td().slice(0,7));
    if (e) e.limit = +limit;
    else this.d.budgets.push({ cat, limit: +limit, month: this.td().slice(0,7) });
    this.save(); this.r();
  },

  // ===== STATS =====
  getScore() {
    const today = this.td();
    const deep = this.d.sessions.filter(s => {
      const b = this.d.blocks.find(x => x.id === s.blockId);
      return b && b.date === today && b.type === 'Deep';
    }).reduce((a,s) => a + s.duration, 0);
    const streak = Math.max(...this.d.habits.map(h => this.getStreak(h)), 0);
    return Math.round(deep / 60 * 25 + streak * 2);
  },
  getNet() {
    const spent = this.d.expenses.filter(e => e.date.startsWith(this.td().slice(0,7)))
   .reduce((a,e) => a + e.amt, 0);
    const budget = this.d.budgets.filter(b => b.month === this.td().slice(0,7))
   .reduce((a,b) => a + b.limit, 0);
    return budget - spent;
  },
  getDeepHrs() {
    const today = this.td();
    return this.d.sessions.filter(s => {
      const b = this.d.blocks.find(x => x.id === s.blockId);
      return b && b.date === today && b.type === 'Deep';
    }).reduce((a,s) => a + s.duration, 0) / 60;
  },

  // ===== RENDER =====
  r() {
    document.getElementById('date').textContent = new Date().toLocaleDateString('en-IN', {weekday:'short',day:'numeric',month:'short'});
    document.getElementById('streak').textContent = Math.max(...this.d.habits.map(h => this.getStreak(h)), 0);
    document.getElementById('score').textContent = this.getScore();
    document.getElementById('net').textContent = '₹' + this.fmt(this.getNet());

    this.rHome();
    this.rHabits();
    this.rFocus();
    this.rMoney();
    this.rCats();
  },

  rHome() {
    const blocks = this.d.blocks.filter(b => b.date === this.td() &&!b.done);
    document.getElementById('today-blocks').innerHTML = blocks.length? blocks.map(b =>
      `<div class="item"><div class="item-info"><div class="item-title">${b.task}</div><div class="item-meta">${b.type} • ${b.mins}m</div></div></div>`
    ).join('') : '<div class="empty">No blocks planned</div>';

    const deepHrs = this.getDeepHrs();
    const deepP = Math.min(100, deepHrs / 4 * 100);
    document.getElementById('deep-ring').style.setProperty('--p', deepP + '%');
    document.getElementById('deep-ring').querySelector('span').textContent = deepHrs.toFixed(1) + 'h';

    const net = this.getNet();
    const budget = this.d.budgets.filter(b => b.month === this.td().slice(0,7)).reduce((a,b) => a + b.limit, 0);
    const budgetP = budget? Math.max(0, 100 - net / budget * 100) : 0;
    document.getElementById('budget-ring').style.setProperty('--p', budgetP + '%');
    document.getElementById('budget-ring').querySelector('span').textContent = Math.round(budgetP) + '%';
  },

  rHabits() {
    document.getElementById('habit-list').innerHTML = this.d.habits.map(h => `
      <div class="item">
        <div class="item-info">
          <div class="item-title">${h.n}</div>
          <div class="item-meta">${this.getStreak(h)} day streak • ${h.type}</div>
        </div>
        <div class="item-actions">
          <div class="check ${h.log[this.td()]? 'done' : ''}" onclick="OS.toggleHabit(${h.id})"></div>
        </div>
      </div>
    `).join('') || '<div class="empty">No habits yet</div>';
  },

  rFocus() {
    document.getElementById('block-list').innerHTML = this.d.blocks.filter(b => b.date === this.td()).map(b => `
      <div class="block ${b.type}" onclick="OS.startFocus(${b.id})" style="cursor:pointer;${b.done?'opacity:0.5':''}">
        ${b.task} • ${b.mins}m ${b.done?'✓':''}
      </div>
    `).join('') || '<div class="empty">No blocks</div>';
  },

  rMoney() {
    const quicks = [{l:'Chai ₹20',a:20,c:'Food'},{l:'Lunch ₹100',a:100,c:'Food'},{l:'Auto ₹50',a:50,c:'Transport'}];
    document.getElementById('quick-expense').innerHTML = quicks.map(q =>
      `<button onclick="OS.addExpense(${q.a},'${q.c}','${q.l}')">${q.l}</button>`
    ).join('');

    const month = this.td().slice(0,7);
    const spent = {};
    this.d.expenses.filter(e => e.date.startsWith(month)).forEach(e => spent[e.cat] = (spent[e.cat] || 0) + e.amt);

    document.getElementById('budget-list').innerHTML = this.d.budgets.filter(b => b.month === month).map(b => {
      const s = spent[b.cat] || 0;
      const p = Math.min(100, s / b.limit * 100);
      const c = p > 100? 'var(--bad)' : p > 80? 'var(--warn)' : 'var(--ok)';
      return `
        <div class="item">
          <div class="item-info">
            <div class="item-title">${b.cat}</div>
            <div class="item-meta">₹${this.fmt(s)} / ₹${this.fmt(b.limit)}</div>
          </div>
          <div style="width:60px;height:6px;background:var(--c2);border-radius:3px;overflow:hidden">
            <div style="width:${p}%;height:100%;background:${c}"></div>
          </div>
        </div>
      `;
    }).join('') || '<div class="empty">No budgets set</div>';
  },

  rCats() {
    const opts = this.d.cats.map(c => `<option>${c}</option>`).join('');
    document.getElementById('e-cat').innerHTML = opts;
    document.getElementById('b-cat').innerHTML = opts;
  },

  // ===== QUICK =====
  quick(type) {
    const m = document.getElementById('modal');
    const t = document.getElementById('modal-title');
    const b = document.getElementById('modal-body');

    if (type === 'habit') {
      t.textContent = 'Quick Add Habit';
      b.innerHTML = '<input id="q-n" placeholder="Habit name" required><select id="q-t"><option>Daily</option><option>Weekly</option></select>';
      document.getElementById('modal-form').onsubmit = e => {
        e.preventDefault();
        this.addHabit(q - n.value, q - t.value, 1);
        m.close();
      };
    } else if (type === 'expense') {
      t.textContent = 'Quick Add Expense';
      b.innerHTML = `<input id="q-a" type="number" placeholder="Amount" required><select id="q-c">${this.d.cats.map(c => `<option>${c}</option>`)}</select>`;
      document.getElementById('modal-form').onsubmit = e => {
        e.preventDefault();
        this.addExpense(q - a.value, q - c.value, '');
        m.close();
      };
    } else if (type === 'focus') {
      t.textContent = 'Quick Focus Block';
      b.innerHTML = '<input id="q-task" placeholder="Task" required><select id="q-type"><option>Deep</option><option>Shallow</option></select>';
      document.getElementById('modal-form').onsubmit = e => {
        e.preventDefault();
        this.addBlock(q - task.value, q - type.value, 50);
        m.close();
      };
    }
    m.showModal();
  },

  // ===== BIND =====
  bind() {
    document.querySelectorAll('nav button').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('nav button,.v').forEach(e => e.classList.remove('active'));
        b.classList.add('active');
        document.getElementById(b.dataset.v).classList.add('active');
      };
    });

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
    document.getElementById('expense-add').onsubmit = e => {
      e.preventDefault();
      this.addExpense(e - amt.value, e - cat.value, e - note.value);
      e.target.reset();
    };
    document.getElementById('budget-add').onsubmit = e => {
      e.preventDefault();
      this.addBudget(b - cat.value, b - limit.value);
      e.target.reset();
    };

    document.getElementById('focus-start').onclick = () => {
      const b = this.d.blocks.find(x =>!x.done && x.date === this.td());
      if (b) this.startFocus(b.id);
    };
    document.getElementById('focus-stop').onclick = () => this.stopFocus();
    document.getElementById('focus-distract').onclick = () => this.distract();
  }
};

OS.i();