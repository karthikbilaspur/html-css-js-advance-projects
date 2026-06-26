const App = {
  data: {
    habits: [],
    expenses: [],
    budgets: [],
    categories: ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Other'],
    quickAdd: [
      { label: 'Chai ₹20', amount: 20, cat: 'Food' },
      { label: 'Lunch ₹100', amount: 100, cat: 'Food' },
      { label: 'Auto ₹50', amount: 50, cat: 'Transport' },
      { label: 'Coffee ₹40', amount: 40, cat: 'Food' },
      { label: 'Snacks ₹30', amount: 30, cat: 'Food' },
      { label: 'Metro ₹30', amount: 30, cat: 'Transport' }
    ],
    settings: { currency: '₹' }
  },
  state: { currentPeriod: 'week', editId: null, editType: null },

  // ===== UTILS =====
  today() { return new Date().toISOString().split('T')[0]; },
  month(date = new Date()) { return new Date(date).toISOString().slice(0,7); },
  weekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  },
  formatNum(n) { return Math.round(n).toLocaleString('en-IN'); },
  uid() { return Date.now() + Math.random(); },

  // ===== STORAGE =====
  save() {
    localStorage.setItem('tracker098v2', JSON.stringify(this.data));
  },
  load() {
    const saved = localStorage.getItem('tracker098v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.data = {...this.data,...parsed };
    }
  },

  // ===== HABITS =====
  addHabit(name, freq, goal) {
    this.data.habits.push({
      id: this.uid(),
      name,
      freq,
      goal: parseInt(goal) || 1,
      history: {},
      created: this.today()
    });
    this.save(); this.render();
  },
  toggleHabit(id, date = this.today()) {
    const habit = this.data.habits.find(h => h.id === id);
    if (!habit) return;
    habit.history[date] = (habit.history[date] || 0) >= habit.goal? 0 : habit.goal;
    this.save(); this.render();
  },
  getStreak(habit) {
    let streak = 0, best = 0, current = 0;
    let d = new Date();
    const start = new Date(habit.created);

    if (habit.freq === 'daily') {
      while (d >= start) {
        const key = d.toISOString().split('T')[0];
        if ((habit.history[key] || 0) >= habit.goal) {
          current++;
          if (d.toISOString().split('T')[0] === this.today() || streak > 0) streak = current;
        } else {
          if (streak > 0) break;
          current = 0;
        }
        best = Math.max(best, current);
        d.setDate(d.getDate() - 1);
      }
    } else {
      // Weekly: check last 7 days window
      const last7 = [];
      for (let i = 0; i < 7; i++) {
        const key = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        last7.push(habit.history[key] || 0);
      }
      streak = last7.reduce((a,b) => a+b, 0);
    }
    return { current: streak, best: Math.max(best, streak) };
  },
  deleteHabit(id) {
    if (!confirm('Delete this habit?')) return;
    this.data.habits = this.data.habits.filter(h => h.id!== id);
    this.save(); this.render();
  },
  editHabit(id, name, goal) {
    const h = this.data.habits.find(h => h.id === id);
    if (h) { h.name = name; h.goal = parseInt(goal); }
    this.save(); this.render();
  },

  // ===== EXPENSES =====
  addExpense(amount, category, note = '', date = null) {
    this.data.expenses.push({
      id: this.uid(),
      amount: parseFloat(amount),
      category,
      note,
      date: date || new Date().toISOString()
    });
    this.save(); this.render();
  },
  editExpense(id, amount, category, note, date) {
    const e = this.data.expenses.find(e => e.id === id);
    if (e) {
      e.amount = parseFloat(amount);
      e.category = category;
      e.note = note;
      e.date = new Date(date).toISOString();
    }
    this.save(); this.render();
  },
  deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    this.data.expenses = this.data.expenses.filter(e => e.id!== id);
    this.save(); this.render();
  },
  getExpenses(filter = {}) {
    let exps = [...this.data.expenses];
    if (filter.month) exps = exps.filter(e => e.date.startsWith(filter.month));
    if (filter.week) {
      const start = new Date(filter.week);
      const end = new Date(start.getTime() + 7 * 86400000);
      exps = exps.filter(e => {
        const d = new Date(e.date);
        return d >= start && d < end;
      });
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      exps = exps.filter(e =>
        e.note.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        String(e.amount).includes(q)
      );
    }
    return exps.sort((a,b) => new Date(b.date) - new Date(a.date));
  },
  getTotalByCategory(expenses) {
    const totals = {};
    expenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return totals;
  },

  // ===== BUDGETS =====
  setBudget(category, limit, rollover, month) {
    const key = `${month}-${category}`;
    const existing = this.data.budgets.find(b => b.key === key);
    if (existing) {
      existing.limit = parseFloat(limit);
      existing.rollover = rollover;
    } else {
      this.data.budgets.push({
        key,
        category,
        limit: parseFloat(limit),
        rollover,
        month
      });
    }
    this.save(); this.render();
  },
  getBudget(category, month) {
    return this.data.budgets.find(b => b.key === `${month}-${category}`);
  },
  getBudgetSpent(category, month) {
    return this.getExpenses({ month })
     .filter(e => e.category === category)
     .reduce((sum, e) => sum + e.amount, 0);
  },
  deleteBudget(category, month) {
    this.data.budgets = this.data.budgets.filter(b => b.key!== `${month}-${category}`);
    this.save(); this.render();
  },

  // ===== RENDER =====
  render() {
    document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
    this.renderToday();
    this.renderHabits();
    this.renderMoney();
    this.renderStats();
    this.populateCategories();
  },

  renderToday() {
    // Habits
    const container = document.getElementById('today-habits');
    if (this.data.habits.length === 0) {
      container.innerHTML = '<div class="empty">No habits yet. Add one in Habits tab.</div>';
    } else {
      container.innerHTML = this.data.habits.map(h => {
        const streak = this.getStreak(h);
        const done = (h.history[this.today()] || 0) >= h.goal;
        return `
          <div class="habit-row">
            <div class="habit-info">
              <div class="habit-name">${h.name}</div>
              <div class="habit-streak">${streak.current} day streak • ${h.freq === 'daily'? 'Daily' : h.goal + '/week'}</div>
            </div>
            <div class="habit-check ${done? 'done' : ''}" onclick="App.toggleHabit(${h.id})"></div>
          </div>
        `;
      }).join('');
    }

    // Stats
    const todayExpenses = this.getExpenses({ month: this.month() }).filter(e => e.date.startsWith(this.today()));
    const spentToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    document.getElementById('spent-today').textContent = this.formatNum(spentToday);

    const monthExpenses = this.getExpenses({ month: this.month() });
    const spentMonth = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    document.getElementById('spent-month').textContent = this.formatNum(spentMonth);

    const dayOfMonth = new Date().getDate();
    const avgDaily = spentMonth / dayOfMonth;
    document.getElementById('today-vs-avg').textContent =
      spentToday > avgDaily? `${Math.round(spentToday/avgDaily*100)}% of avg` : '';

    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const projected = avgDaily * daysInMonth;
    document.getElementById('month-pace').textContent = `Pacing ₹${this.formatNum(projected)}`;

    const totalBudget = this.data.budgets
     .filter(b => b.month === this.month())
     .reduce((sum, b) => sum + b.limit, 0);
    const budgetLeft = totalBudget - spentMonth;
    document.getElementById('budget-left').textContent = this.formatNum(budgetLeft);

    const daysLeft = daysInMonth - dayOfMonth + 1;
    const dailyBudget = daysLeft > 0? budgetLeft / daysLeft : 0;
    document.getElementById('daily-budget').textContent =
      totalBudget > 0? `₹${this.formatNum(dailyBudget)}/day left` : 'No budget set';

    // Quick add
    document.getElementById('quick-add-container').innerHTML = this.data.quickAdd.map(q =>
      `<button onclick="App.addExpense(${q.amount}, '${q.cat}', '${q.label}')">${q.label}</button>`
    ).join('');

    // Recent expenses
    const recent = this.getExpenses().slice(0, 5);
    document.getElementById('recent-expenses').innerHTML = recent.length? recent.map(e => `
      <div class="expense-row">
        <div class="expense-info">
          <div class="expense-amt">₹${this.formatNum(e.amount)}</div>
          <div class="expense-meta">${e.category} • ${new Date(e.date).toLocaleDateString('en-IN', {day:'numeric', month:'short'})} ${e.note? '• ' + e.note : ''}</div>
        </div>
      </div>
    `).join('') : '<div class="empty">No expenses yet</div>';
  },

  renderHabits() {
    const container = document.getElementById('habits-list');
    container.innerHTML = this.data.habits.map(h => {
      const streak = this.getStreak(h);
      let heatmap = '<div class="heatmap">';
      for (let i = 90; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = d.toISOString().split('T')[0];
        const val = h.history[key] || 0;
        const level = val >= h.goal? 3 : val > 0? 1 : 0;
        heatmap += `<div class="heatmap-day" data-level="${level}" title="${key}: ${val}/${h.goal}" onclick="App.toggleHabit(${h.id}, '${key}')"></div>`;
      }
      heatmap += '</div>';

      return `
        <div class="card">
          <div class="habit-row">
            <div class="habit-info">
              <div class="habit-name">
                ${h.name}
                <button class="small ghost" onclick="App.openEditModal('habit', ${h.id})">Edit</button>
              </div>
              <div class="habit-streak">Current: ${streak.current} • Best: ${streak.best} • Goal: ${h.goal}/${h.freq === 'daily'? 'day' : 'week'}</div>
            </div>
            <button class="small danger" onclick="App.deleteHabit(${h.id})">Delete</button>
          </div>
          ${heatmap}
        </div>
      `;
    }).join('') || '<div class="empty">No habits yet</div>';
  },

  renderMoney() {
    const month = document.getElementById('budget-month-picker').value || this.month();

    // Budgets
    const budgetContainer = document.getElementById('budgets-list');
    const monthBudgets = this.data.budgets.filter(b => b.month === month);
    if (monthBudgets.length === 0) {
      budgetContainer.innerHTML = '<div class="empty">No budgets set for this month</div>';
    } else {
      budgetContainer.innerHTML = monthBudgets.map(b => {
        const spent = this.getBudgetSpent(b.category, month);
        const percent = Math.min(100, spent / b.limit * 100);
        const over = spent > b.limit;
        const warning = percent > 80 &&!over;
        return `
          <div class="budget-bar">
            <div class="budget-bar-top">
              <span>${b.category} ${b.rollover? '↻' : ''}</span>
              <span>₹${this.formatNum(spent)} / ₹${this.formatNum(b.limit)}</span>
            </div>
            <div class="bar-bg">
              <div class="bar-fill ${over? 'over' : warning? 'warning' : ''}" style="width:${percent}%"></div>
            </div>
            <div style="text-align:right;margin-top:4px;">
              <button class="small ghost" onclick="App.deleteBudget('${b.category}', '${month}')">Remove</button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Expenses with search
    const search = document.getElementById('expense-search').value;
    const expenses = this.getExpenses({ search, month });
    document.getElementById('expenses-list').innerHTML = expenses.length? expenses.slice(0, 50).map(e => `
      <div class="expense-row">
        <div class="expense-info">
          <div class="expense-amt">₹${this.formatNum(e.amount)}</div>
          <div class="expense-meta">${e.category} • ${new Date(e.date).toLocaleDateString('en-IN')} ${e.note? '• ' + e.note : ''}</div>
        </div>
        <div class="expense-actions">
          <button class="small ghost" onclick="App.openEditModal('expense', ${e.id})">Edit</button>
          <button class="small danger" onclick="App.deleteExpense(${e.id})">×</button>
        </div>
      </div>
    `).join('') : '<div class="empty">No expenses found</div>';
  },

  renderStats() {
    const period = this.state.currentPeriod;
    const expenses = period === 'week'
     ? this.getExpenses({ week: this.weekStart() })
      : this.getExpenses({ month: this.month() });

    // Chart
    this.drawChart(expenses, period);

    // Category totals
    const totals = this.getTotalByCategory(expenses);
    const totalContainer = document.getElementById('category-totals');
    const total = Object.values(totals).reduce((a,b) => a+b, 0);
    totalContainer.innerHTML = Object.entries(totals)
     .sort((a,b) => b[1] - a[1])
     .map(([cat, amt]) => `
        <div class="category-row">
          <span>${cat}</span>
          <span>₹${this.formatNum(amt)} <span style="color:var(--text-dim)">(${Math.round(amt/total*100)}%)</span></span>
        </div>
      `).join('') || '<div class="empty">No data</div>';

    // Habit stats
    const habitStats = document.getElementById('habit-stats');
    habitStats.innerHTML = this.data.habits.map(h => {
      const streak = this.getStreak(h);
      const total = Object.values(h.history).reduce((a,b) => a+b, 0);
      return `
        <div class="category-row">
          <span>${h.name}</span>
          <span>${streak.current} day streak • ${total} total</span>
        </div>
      `;
    }).join('') || '<div class="empty">No habits</div>';
  },

  drawChart(expenses, period) {
    const canvas = document.getElementById('chart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 300, 140);

    let data, labels;
    if (period === 'week') {
      data = Array(7).fill(0);
      labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      expenses.forEach(e => {
        const day = new Date(e.date).getDay();
        const idx = day === 0? 6 : day - 1;
        data[idx] += e.amount;
      });
    } else {
      const days = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      data = Array(days).fill(0);
      expenses.forEach(e => {
        data[new Date(e.date).getDate() - 1] += e.amount;
      });
    }

    const max = Math.max(...data, 100);
    const barWidth = 290 / data.length;

    // Bars
    data.forEach((val, i) => {
      const x = i * barWidth + 5;
      const h = (val / max) * 120;
      const y = 130 - h;
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(x, y, barWidth - 2, h);
    });

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px system-ui';
    if (period === 'week') {
      labels.forEach((label, i) => {
        ctx.fillText(label, i * barWidth + 5, 138);
      });
    }
  },

  populateCategories() {
    const cats = this.data.categories;
    ['expense-category', 'budget-category'].forEach(id => {
      const sel = document.getElementById(id);
      if (sel && sel.options.length === 0) {
        sel.innerHTML = cats.map(c => `<option>${c}</option>`).join('');
      }
    });
    document.getElementById('budget-month-picker').value = this.month();
    document.getElementById('expense-date').value = this.today();
  },

  // ===== MODAL =====
  openEditModal(type, id) {
    this.state.editType = type;
    this.state.editId = id;
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    if (type === 'habit') {
      const h = this.data.habits.find(h => h.id === id);
      title.textContent = 'Edit Habit';
      body.innerHTML = `
        <input type="text" id="edit-name" value="${h.name}" placeholder="Name">
        <input type="number" id="edit-goal" value="${h.goal}" placeholder="Goal">
      `;
    } else if (type === 'expense') {
      const e = this.data.expenses.find(e => e.id === id);
      const dateStr = new Date(e.date).toISOString().split('T')[0];
      body.innerHTML = `
        <input type="number" id="edit-amount" value="${e.amount}" step="0.01">
        <select id="edit-category">${this.data.categories.map(c => `<option ${c === e.category? 'selected' : ''}>${c}</option>`).join('')}</select>
        <input type="text" id="edit-note" value="${e.note}" placeholder="Note">
        <input type="date" id="edit-date" value="${dateStr}">
      `;
      title.textContent = 'Edit Expense';
    }
    