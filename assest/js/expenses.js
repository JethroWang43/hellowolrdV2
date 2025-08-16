// Expenses Tracker JS

let expenses = JSON.parse(localStorage.getItem('expensesData') || '[]');

const monthNames = [
  '01_January', '02_February', '03_March', '04_April', '05_May', '06_June',
  '07_July', '08_August', '09_September', '10_October', '11_November', '12_December'
];

function getMonthFromDate(dateStr) {
  const d = new Date(dateStr);
  return d.getMonth();
}

function renderMonthOptions() {
  const select = document.getElementById('monthSelect');
  select.innerHTML = '';
  monthNames.forEach((name, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = name.replace(/\d+_/, '');
    select.appendChild(opt);
  });
  select.value = new Date().getMonth();
}

function getExpensesForMonth(monthIdx) {
  return expenses.filter(exp => getMonthFromDate(exp.date) === Number(monthIdx));
}

function renderExpenses(monthIdx) {
  const list = document.getElementById('expensesList');
  list.innerHTML = '';
  const monthExpenses = getExpensesForMonth(monthIdx);
  monthExpenses.forEach((exp, idx) => {
    const item = document.createElement('div');
    item.className = 'expense-item';
    item.innerHTML = `
      <span class="expense-desc">${exp.desc}</span>
      <span class="expense-category">${exp.category}</span>
      <span class="expense-date">${exp.date}</span>
      <span class="expense-amount">₱${parseFloat(exp.amount).toFixed(2)}</span>
      <button class="delete-btn" onclick="deleteExpense(${idx}, ${monthIdx})">🗑</button>
    `;
    list.appendChild(item);
  });
}

function renderSummary(monthIdx) {
  const summary = document.getElementById('summary');
  const monthExpenses = getExpensesForMonth(monthIdx);
  const total = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  summary.innerHTML = `<b>Total Expenses:</b> ₱${total.toFixed(2)}`;

  // Savings goal and money saved
  const savingsGoalInput = document.getElementById('savingsGoalInput');
  const moneySavedDiv = document.getElementById('moneySaved');
  let goal = parseFloat(savingsGoalInput.value) || 0;
  let saved = goal - total;
  moneySavedDiv.textContent = `Money Saved: ₱${saved.toFixed(2)}${goal ? ` (Goal: ₱${goal.toFixed(2)})` : ''}`;

  // Weekly average
  const weeklySummary = document.getElementById('weeklySummary');
  let weeks = {};
  monthExpenses.forEach(exp => {
    const d = new Date(exp.date);
    const week = Math.ceil(d.getDate() / 7);
    if (!weeks[week]) weeks[week] = 0;
    weeks[week] += parseFloat(exp.amount);
  });
  let weekHtml = '<b>Weekly Averages:</b><ul style="margin:8px 0 0 0;padding:0;list-style:none;">';
  Object.keys(weeks).forEach(w => {
    weekHtml += `<li>Week ${w}: ₱${weeks[w].toFixed(2)}</li>`;
  });
  weekHtml += '</ul>';
  weeklySummary.innerHTML = weekHtml;
}

function addExpense(e) {
  e.preventDefault();
  const desc = document.getElementById('descInput').value.trim();
  const amount = document.getElementById('amountInput').value;
  const category = document.getElementById('categoryInput').value;
  const date = document.getElementById('dateInput').value;
  if (!desc || !amount || !category || !date) return;
  expenses.push({ desc, amount, category, date });
  localStorage.setItem('expensesData', JSON.stringify(expenses));
  renderExpenses(document.getElementById('monthSelect').value);
  renderSummary(document.getElementById('monthSelect').value);
  document.getElementById('expenseForm').reset();
}

function deleteExpense(idx, monthIdx) {
  // Find the correct index in the global expenses array
  const monthExpenses = getExpensesForMonth(monthIdx);
  const expToDelete = monthExpenses[idx];
  const globalIdx = expenses.findIndex(exp => exp.desc === expToDelete.desc && exp.amount === expToDelete.amount && exp.category === expToDelete.category && exp.date === expToDelete.date);
  if (globalIdx > -1) {
    expenses.splice(globalIdx, 1);
    localStorage.setItem('expensesData', JSON.stringify(expenses));
    renderExpenses(monthIdx);
    renderSummary(monthIdx);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Daily savings logic
  let dailySavings = JSON.parse(localStorage.getItem('dailySavingsData') || '[]');
  function addDailySavings() {
    const amount = parseFloat(document.getElementById('dailySavingsInput').value);
    const date = document.getElementById('dailySavingsDate').value;
    if (!amount || !date) return;
    dailySavings.push({ amount, date });
    localStorage.setItem('dailySavingsData', JSON.stringify(dailySavings));
    document.getElementById('dailySavingsInput').value = '';
    document.getElementById('dailySavingsDate').value = '';
    renderDailySavings();
  }
  function renderDailySavings() {
    // Total balance
    const total = dailySavings.reduce((sum, entry) => sum + entry.amount, 0);
    document.getElementById('dailySavingsSummary').textContent = `Total Savings Balance: ₱${total.toFixed(2)}`;
    // History
    let historyHtml = '<b>Daily Savings History:</b><ul style="margin:8px 0 0 0;padding:0;list-style:none;">';
    dailySavings.slice().reverse().forEach(entry => {
      historyHtml += `<li>${entry.date}: ₱${entry.amount.toFixed(2)}</li>`;
    });
    historyHtml += '</ul>';
    document.getElementById('dailySavingsHistory').innerHTML = historyHtml;
    // Summaries
    let now = new Date();
    let weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    let monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let daily = 0, weekly = 0, monthly = 0;
    dailySavings.forEach(entry => {
      let d = new Date(entry.date);
      if (d.toDateString() === now.toDateString()) daily += entry.amount;
      if (d >= weekStart) weekly += entry.amount;
      if (d >= monthStart) monthly += entry.amount;
    });
    document.getElementById('dailySavingsSummary').textContent += ` | Today: ₱${daily.toFixed(2)} | This Week: ₱${weekly.toFixed(2)} | This Month: ₱${monthly.toFixed(2)}`;
  }
  document.getElementById('addDailySavingsBtn').addEventListener('click', addDailySavings);
  renderDailySavings();
  // Tab switching logic
  const expensesTab = document.getElementById('expensesTab');
  const savingsTab = document.getElementById('savingsTab');
  const expensesPage = document.getElementById('expensesPage');
  const savingsPage = document.getElementById('savingsPage');
  function setActiveTab(tab) {
    if (tab === 'expenses') {
      expensesTab.classList.add('active');
      savingsTab.classList.remove('active');
      expensesPage.style.display = '';
      savingsPage.style.display = 'none';
    } else {
      expensesTab.classList.remove('active');
      savingsTab.classList.add('active');
      expensesPage.style.display = 'none';
      savingsPage.style.display = '';
      renderSavingsSummary();
    }
  }
  expensesTab.addEventListener('click', function() { setActiveTab('expenses'); });
  savingsTab.addEventListener('click', function() { setActiveTab('savings'); });

  // Savings page summary logic
  function renderSavingsSummary() {
  const monthIdx = document.getElementById('monthSelect').value;
  const monthExpenses = getExpensesForMonth(monthIdx);
  const total = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const savingsGoalInput2 = document.getElementById('savingsGoalInput2');
  const moneySavedDiv2 = document.getElementById('moneySaved2');
  let goal2 = parseFloat(savingsGoalInput2.value) || 0;
  let saved2 = goal2 - total;
  const actualSavedInput = document.getElementById('actualSavedInput');
  actualSavedInput.value = saved2.toFixed(2);
  let actualText = ` | Actual Saved: ₱${saved2.toFixed(2)}`;
  moneySavedDiv2.textContent = `Money Saved: ₱${saved2.toFixed(2)}${goal2 ? ` (Goal: ₱${goal2.toFixed(2)})` : ''}${actualText}`;
  document.getElementById('savingsSummary').innerHTML = `<b>Total Expenses:</b> ₱${total.toFixed(2)}`;
  // Show saved transactions count
  document.getElementById('savedCountSavings').textContent = `Saved Transactions: ${monthExpenses.length}`;
  }
  document.getElementById('savingsGoalInput2').addEventListener('input', renderSavingsSummary);
  document.getElementById('actualSavedInput').addEventListener('input', renderSavingsSummary);
  renderMonthOptions();
  const monthSelect = document.getElementById('monthSelect');
  monthSelect.addEventListener('change', function() {
    renderExpenses(monthSelect.value);
    renderSummary(monthSelect.value);
  });
  document.getElementById('expenseForm').addEventListener('submit', addExpense);
  document.getElementById('savingsGoalInput').addEventListener('input', function() {
    renderSummary(monthSelect.value);
  });
  renderExpenses(monthSelect.value);
  renderSummary(monthSelect.value);
});
