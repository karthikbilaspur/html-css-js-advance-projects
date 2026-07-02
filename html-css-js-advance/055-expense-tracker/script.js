// DOM Elements
const form = document.getElementById('transactionForm');
const typeBtns = document.querySelectorAll('.type-btn');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');
const monthFilter = document.getElementById('monthFilter');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const transactionsList = document.getElementById('transactionsList');
const emptyState = document.getElementById('emptyState');
const filterChips = document.querySelectorAll('.filter-chip');

// State
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentType = 'expense';
let currentFilter = 'all';
let pieChart, barChart;

// Category icons
const categoryIcons = {
    food: '🍔', transport: '🚗', shopping: '🛍️', bills: '📄',
    entertainment: '🎬', health: '🏥', salary: '💼', freelance: '💻', other: '📦'
};

// Init
dateInput.valueAsDate = new Date();
initMonthFilter();
renderAll();

function initMonthFilter() {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });
    }
    monthFilter.innerHTML = months.map(m => `<option value="${m.value}">${m.label}</option>`).join('');
    monthFilter.value = months[0].value;
}

// Type toggle
typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.dataset.type;
    });
});

// Form submit
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const transaction = {
        id: Date.now(),
        type: currentType,
        amount: parseFloat(amountInput.value),
        category: categorySelect.value,
        description: descriptionInput.value.trim() || categorySelect.options[categorySelect.selectedIndex].text,
        date: dateInput.value,
        timestamp: new Date(dateInput.value).getTime()
    };

    transactions.unshift(transaction);
    saveTransactions();
    renderAll();
    form.reset();
    dateInput.valueAsDate = new Date();
});

// Filter chips
filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.dataset.filter;
        renderTransactions();
    });
});

// Month filter
monthFilter.addEventListener('change', renderCharts);

// Export CSV
exportBtn.addEventListener('click', () => {
    if (transactions.length === 0) {
        alert('No transactions to export');
        return;
    }

    let csv = 'Date,Type,Category,Description,Amount\n';
    transactions.forEach(t => {
        csv += `${t.date},${t.type},${t.category},"${t.description}",${t.amount}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
});

// Clear all
clearBtn.addEventListener('click', () => {
    if (confirm('Delete all transactions? This cannot be undone.')) {
        transactions = [];
        saveTransactions();
        renderAll();
    }
});

// Delete transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id!== id);
    saveTransactions();
    renderAll();
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function renderAll() {
    renderSummary();
    renderCharts();
    renderTransactions();
}

function renderSummary() {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;

    document.getElementById('totalBalance').textContent = formatCurrency(balance);
    document.getElementById('totalIncome').textContent = formatCurrency(income);
    document.getElementById('totalExpense').textContent = formatCurrency(expense);
}

function renderCharts() {
    const selectedMonth = monthFilter.value;
    const [year, month] = selectedMonth.split('-').map(Number);

    const monthTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    // Pie Chart - Expenses by Category
    const expensesByCat = {};
    monthTransactions.filter(t => t.type === 'expense').forEach(t => {
        expensesByCat[t.category] = (expensesByCat[t.category] || 0) + t.amount;
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    if (pieChart) pieChart.destroy();

    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(expensesByCat).map(c => `${categoryIcons[c]} ${c}`),
            datasets: [{
                data: Object.values(expensesByCat),
                backgroundColor: [
                    '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
                    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', padding: 15 }
                }
            }
        }
    });

    // Bar Chart - Income vs Expenses
    const incomeTotal = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenseTotal = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const barCtx = document.getElementById('barChart').getContext('2d');
    if (barChart) barChart.destroy();

    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [incomeTotal, expenseTotal],
                backgroundColor: ['#10b981', '#ef4444'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { display: false }
                }
            }
        }
    });
}

function renderTransactions() {
    let filtered = transactions;

    if (currentFilter!== 'all') {
        filtered = transactions.filter(t => t.type === currentFilter);
    }

    if (filtered.length === 0) {
        transactionsList.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');
    transactionsList.innerHTML = filtered.slice(0, 50).map(t => `
        <div class="transaction-item">
            <div class="transaction-icon ${t.type}">
                ${categoryIcons[t.category]}
            </div>
            <div class="transaction-info">
                <div class="transaction-title">${escapeHtml(t.description)}</div>
                <div class="transaction-meta">${t.category} • ${formatDate(t.date)}</div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income'? '+' : '-'}${formatCurrency(t.amount)}
            </div>
            <button class="transaction-delete" onclick="deleteTransaction(${t.id})">×</button>
        </div>
    `).join('');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make deleteTransaction global
window.deleteTransaction = deleteTransaction;