// JavaScript for Code 45
const balanceEl = document.getElementById('balance');
const moneyPlusEl = document.getElementById('money-plus');
const moneyMinusEl = document.getElementById('money-minus');
const listEl = document.getElementById('list');
const formEl = document.getElementById('form');
const textEl = document.getElementById('text');
const amountEl = document.getElementById('amount');
const categoryEl = document.getElementById('category');
const clearAllBtn = document.getElementById('clear-all');
const categoryStatsEl = document.getElementById('category-stats');

const STORAGE_KEY = 'expense_tracker_45';

// Array of transactions - this is our main data structure
let transactions = [];

// Load from localStorage
function loadTransactions() {
    const saved = localStorage.getItem(STORAGE_KEY);
    transactions = saved ? JSON.parse(saved) : [];
}

// Save to localStorage
function saveTransactions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// Add transaction
function addTransaction(e) {
    e.preventDefault();

    const transaction = {
        id: Date.now(),
        text: textEl.value.trim(),
        amount: +amountEl.value,
        category: categoryEl.value,
        date: new Date().toISOString()
    };

    transactions.push(transaction);
    saveTransactions();
    updateUI();
    
    formEl.reset();
    textEl.focus();
}

// Delete transaction by ID
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    updateUI();
}

// Clear all transactions
function clearAll() {
    if (transactions.length === 0) return;
    if (confirm('Delete all transactions? This cannot be undone.')) {
        transactions = [];
        saveTransactions();
        updateUI();
    }
}

// Update all UI using reduce()
function updateUI() {
    // 1. Calculate total balance using reduce()
    const total = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    
    // 2. Calculate income using reduce() - filter positive amounts
    const income = transactions
        .filter(t => t.amount > 0)
        .reduce((acc, transaction) => acc + transaction.amount, 0);
    
    // 3. Calculate expense using reduce() - filter negative amounts
    const expense = transactions
        .filter(t => t.amount < 0)
        .reduce((acc, transaction) => acc + transaction.amount, 0);

    // Update DOM
    balanceEl.textContent = formatMoney(total);
    moneyPlusEl.textContent = `+${formatMoney(income)}`;
    moneyMinusEl.textContent = `-${formatMoney(Math.abs(expense))}`;

    // 4. Render transaction list
    listEl.innerHTML = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // newest first
        .map(transaction => `
            <li class="${transaction.amount > 0 ? 'plus' : 'minus'}">
                <div class="transaction-info">
                    <div class="transaction-desc">${transaction.text}</div>
                    <div class="transaction-meta">${transaction.category} • ${formatDate(transaction.date)}</div>
                </div>
                <div style="display: flex; align-items: center;">
                    <span class="transaction-amount">${transaction.amount > 0 ? '+' : ''}${formatMoney(transaction.amount)}</span>
                    <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">×</button>
                </div>
            </li>
        `).join('');

    // 5. Category breakdown using reduce()
    updateCategoryBreakdown();
}

// Category breakdown with reduce()
function updateCategoryBreakdown() {
    // Group expenses by category using reduce()
    const expensesByCategory = transactions
        .filter(t => t.amount < 0) // only expenses
        .reduce((acc, transaction) => {
            const cat = transaction.category;
            acc[cat] = (acc[cat] || 0) + Math.abs(transaction.amount);
            return acc;
        }, {});

    // Sort by amount descending
    const sortedCategories = Object.entries(expensesByCategory)
        .sort((a, b) => b[1] - a[1]);

    if (sortedCategories.length === 0) {
        categoryStatsEl.innerHTML = '<p style="color: #a1a1a6; font-size: 0.85rem;">No expenses yet</p>';
        return;
    }

    categoryStatsEl.innerHTML = sortedCategories
        .map(([category, amount]) => `
            <div class="category-stat">
                <span class="category-stat-name">${category}</span>
                <span class="category-stat-amount">₹${amount.toFixed(2)}</span>
            </div>
        `).join('');
}

// Helper: format money
function formatMoney(amount) {
    return `₹${Math.abs(amount).toFixed(2)}`;
}

// Helper: format date
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Event listeners
formEl.addEventListener('submit', addTransaction);
clearAllBtn.addEventListener('click', clearAll);

// Init
loadTransactions();
updateUI();

// Make deleteTransaction global for onclick
window.deleteTransaction = deleteTransaction;