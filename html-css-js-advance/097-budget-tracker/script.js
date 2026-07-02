const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];

const categoryColors = {
  salary: '#27ae60',
  food: '#e74c3c',
  rent: '#3498db',
  transport: '#f39c12',
  entertainment: '#9b59b6',
  utilities: '#1abc9c',
  other: '#95a5a6'
};

let currentDate = new Date(2026, 5, 23); // June 2026
let transactions = JSON.parse(localStorage.getItem('budget097') || '[]');

const typeSelect = document.getElementById('typeSelect');
const amountInput = document.getElementById('amountInput');
const categorySelect = document.getElementById('categorySelect');
const descInput = document.getElementById('descInput');
const dateInput = document.getElementById('dateInput');
const addTransactionBtn = document.getElementById('addTransactionBtn');
const transactionsList = document.getElementById('transactionsList');

const currentMonthEl = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

const totalIncomeEl = document.getElementById('totalIncome');
const totalExpensesEl = document.getElementById('totalExpenses');
const balanceEl = document.getElementById('balance');
const savingsRateEl = document.getElementById('savingsRate');

const pieChart = document.getElementById('pieChart');
const pieCtx = pieChart.getContext('2d');
const lineChart = document.getElementById('lineChart');
const lineCtx = lineChart.getContext('2d');
const insightsEl = document.getElementById('insights');

// Set default date to today
dateInput.valueAsDate = new Date();

function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function getMonthTransactions(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getFullYear() === year && tDate.getMonth() === month;
  });
}

function updateDashboard() {
  const monthTrans = getMonthTransactions(currentDate);

  const income = monthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expenses;
  const savingsRate = income > 0? ((balance / income) * 100).toFixed(1) : 0;

  totalIncomeEl.textContent = formatCurrency(income);
  totalExpensesEl.textContent = formatCurrency(expenses);
  balanceEl.textContent = formatCurrency(balance);
  savingsRateEl.textContent = savingsRate + '%';

  balanceEl.style.color = balance >= 0? '#27ae60' : '#e74c3c';

  renderTransactions(monthTrans);
  drawPieChart(monthTrans);
  drawLineChart();
  generateInsights(monthTrans, income, expenses, balance);
}

function renderTransactions(monthTrans) {
  transactionsList.innerHTML = '';

  const sorted = [...monthTrans].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  if (sorted.length === 0) {
    transactionsList.innerHTML = '<p style="text-align:center;color:#7f8c8d;padding:20px;">No transactions this month</p>';
    return;
  }

  sorted.forEach(t => {
    const item = document.createElement('div');
    item.className = `transaction-item ${t.type}`;
    item.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-desc">${t.description}</div>
        <div class="transaction-meta">${t.category} • ${new Date(t.date).toLocaleDateString()}</div>
      </div>
      <div class="transaction-amount ${t.type}">
        ${t.type === 'income'? '+' : '-'}${formatCurrency(t.amount)}
      </div>
      <button class="delete-btn" onclick="deleteTransaction('${t.id}')">×</button>
    `;
    transactionsList.appendChild(item);
  });
}

function drawPieChart(monthTrans) {
  const expenses = monthTrans.filter(t => t.type === 'expense');
  const byCategory = {};

  expenses.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  const total = Object.values(byCategory).reduce((sum, val) => sum + val, 0);
  if (total === 0) {
    pieCtx.clearRect(0, 0, pieChart.width, pieChart.height);
    pieCtx.fillStyle = '#7f8c8d';
    pieCtx.font = '16px Arial';
    pieCtx.textAlign = 'center';
    pieCtx.fillText('No expenses yet', pieChart.width / 2, pieChart.height / 2);
    return;
  }

  pieChart.width = pieChart.offsetWidth;
  pieChart.height = 300;

  const centerX = pieChart.width / 2;
  const centerY = pieChart.height / 2;
  const radius = Math.min(centerX, centerY) - 40;

  let currentAngle = -Math.PI / 2;

  Object.entries(byCategory).forEach(([category, amount]) => {
    const sliceAngle = (amount / total) * Math.PI * 2;

    pieCtx.beginPath();
    pieCtx.moveTo(centerX, centerY);
    pieCtx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    pieCtx.closePath();

    pieCtx.fillStyle = categoryColors[category] || '#95a5a6';
    pieCtx.fill();

    // Label
    const labelAngle = currentAngle + sliceAngle / 2;
    const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
    const labelY = centerY + Math.sin(labelAngle) * (radius + 30);

    pieCtx.fillStyle = '#2c3e50';
    pieCtx.font = 'bold 12px Arial';
    pieCtx.textAlign = 'center';
    pieCtx.fillText(`${category}`, labelX, labelY);
    pieCtx.fillText(`${((amount / total) * 100).toFixed(0)}%`, labelX, labelY + 15);

    currentAngle += sliceAngle;
  });
}

function drawLineChart() {
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - i);
    const monthTrans = getMonthTransactions(d);
    const expenses = monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    last6Months.push({ month: monthNames[d.getMonth()].slice(0, 3), expenses });
  }

  lineChart.width = lineChart.offsetWidth;
  lineChart.height = 300;

  const padding = 40;
  const width = lineChart.width - padding * 2;
  const height = lineChart.height - padding * 2;
  const maxExpense = Math.max(...last6Months.map(m => m.expenses), 1);

  lineCtx.clearRect(0, 0, lineChart.width, lineChart.height);

  // Grid lines
  lineCtx.strokeStyle = '#dee2e6';
  lineCtx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding + (height / 5) * i;
    lineCtx.beginPath();
    lineCtx.moveTo(padding, y);
    lineCtx.lineTo(padding + width, y);
    lineCtx.stroke();
  }

  // Line
  lineCtx.strokeStyle = '#667eea';
  lineCtx.lineWidth = 3;
  lineCtx.beginPath();

  last6Months.forEach((m, i) => {
    const x = padding + (width / (last6Months.length - 1)) * i;
    const y = padding + height - (m.expenses / maxExpense) * height;

    if (i === 0) lineCtx.moveTo(x, y);
    else lineCtx.lineTo(x, y);

    // Points
    lineCtx.fillStyle = '#667eea';
    lineCtx.beginPath();
    lineCtx.arc(x, y, 5, 0, Math.PI * 2);
    lineCtx.fill();

    // Labels
    lineCtx.fillStyle = '#2c3e50';
    lineCtx.font = '12px Arial';
    lineCtx.textAlign = 'center';
    lineCtx.fillText(m.month, x, padding + height + 20);
  });

  lineCtx.stroke();
}

function generateInsights(monthTrans, income, expenses, balance) {
  const insights = [];

  if (expenses > income) {
    insights.push({ type: 'warning', text: `⚠️ You're overspending by ${formatCurrency(expenses - income)} this month` });
  } else if (balance > 0) {
    const savingsRate = ((balance / income) * 100).toFixed(1);
    if (savingsRate >= 20) {
      insights.push({ type: 'success', text: `🎉 Great job! You're saving ${savingsRate}% of income` });
    } else {
      insights.push({ type: 'warning', text: `💡 Try to save 20% of income. Currently at ${savingsRate}%` });
    }
  }

  const byCategory = {};
  monthTrans.filter(t => t.type === 'expense').forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  if (topCategory && topCategory[1] > expenses * 0.4) {
    insights.push({ type: 'warning', text: `📊 ${topCategory[0]} is ${((topCategory[1] / expenses) * 100).toFixed(0)}% of expenses. Consider reducing` });
  }

  if (monthTrans.length === 0) {
    insights.push({ type: 'info', text: '📝 Start tracking! Add your first transaction above' });
  }

  insightsEl.innerHTML = insights.map(i =>
    `<div class="insight-item ${i.type}">${i.text}</div>`
  ).join('');
}

function addTransaction() {
  const type = typeSelect.value;
  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;
  const desc = descInput.value.trim();
  const date = dateInput.value;

  if (!amount || amount <= 0 ||!desc ||!date) {
    alert('Please fill all fields');
    return;
  }

  const transaction = {
    id: Date.now().toString(),
    type,
    amount,
    category,
    description: desc,
    date
  };

  transactions.push(transaction);
  saveData();
  updateDashboard();

  amountInput.value = '';
  descInput.value = '';
  amountInput.focus();
}

window.deleteTransaction = (id) => {
  if (confirm('Delete this transaction?')) {
    transactions = transactions.filter(t => t.id!== id);
    saveData();
    updateDashboard();
  }
};

function saveData() {
  localStorage.setItem('budget097', JSON.stringify(transactions));
}

function updateMonthDisplay() {
  currentMonthEl.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  updateDashboard();
}

prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateMonthDisplay();
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateMonthDisplay();
});

addTransactionBtn.addEventListener('click', addTransaction);

// Init
updateMonthDisplay();