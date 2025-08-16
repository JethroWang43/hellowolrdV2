let expenses = JSON.parse(localStorage.getItem('expensesData') || '[]');
let dailySavings = JSON.parse(localStorage.getItem('dailySavingsData') || '[]');

const monthNames = [
  '01_January','02_February','03_March','04_April','05_May','06_June',
  '07_July','08_August','09_September','10_October','11_November','12_December'
];

function getMonthFromDate(dateStr) {
  if (!dateStr) return -1;
  let d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const parts = String(dateStr).split('-');
    if (parts.length === 3) d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  return isNaN(d.getTime()) ? -1 : d.getMonth();
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

function renderSavingsMonthOptions() {
  const select = document.getElementById('savingsMonthSelect');
  if (!select) return;
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

function getSavingsForMonth(monthIdx) {
  return dailySavings.filter(s => getMonthFromDate(s.date) === Number(monthIdx));
}

function renderExpenses(monthIdx) {
  const list = document.getElementById('expensesList');
  list.innerHTML = '';
  const monthExpenses = getExpensesForMonth(monthIdx);
  const totalExpenses = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const totalDisplay = document.getElementById('totalExpensesDisplay');
  if (totalDisplay) totalDisplay.textContent = `Total Expenses: ₱${totalExpenses.toFixed(2)}`;
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
  if (summary) summary.innerHTML = `<b>Total Expenses:</b> ₱${total.toFixed(2)}`;

  const savingsGoalInput = document.getElementById('savingsGoalInput');
  const moneySavedDiv = document.getElementById('moneySaved');
  const goal = parseFloat(savingsGoalInput && savingsGoalInput.value) || 0;
  const saved = goal - total;
  if (moneySavedDiv) moneySavedDiv.textContent = `Money Saved: ₱${saved.toFixed(2)}${goal ? ` (Goal: ₱${goal.toFixed(2)})` : ''}`;

  const weeklySummary = document.getElementById('weeklySummary');
  let weeks = {};
  monthExpenses.forEach(exp => {
    const d = new Date(exp.date);
    const w = Math.ceil(d.getDate() / 7);
    if (!weeks[w]) weeks[w] = 0;
    weeks[w] += parseFloat(exp.amount);
  });
  if (weeklySummary) {
    let weekHtml = '<b>Weekly Averages:</b><ul style="margin:8px 0 0;padding:0;list-style:none;">';
    Object.keys(weeks).forEach(w => { weekHtml += `<li>Week ${w}: ₱${weeks[w].toFixed(2)}</li>`; });
    weekHtml += '</ul>';
    weeklySummary.innerHTML = weekHtml;
  }
}

function addExpense(e) {
  e.preventDefault();
  const desc = document.getElementById('descInput').value.trim();
  const amount = document.getElementById('amountInput').value;
  const category = document.getElementById('categoryInput').value;
  const date = document.getElementById('dateInput').value;
  if (!desc || !amount || !category || !date) return;
  const formattedDate = date ? new Date(date).toISOString().slice(0, 10) : '';
  expenses.push({ desc, amount: parseFloat(amount), category, date: formattedDate });
  localStorage.setItem('expensesData', JSON.stringify(expenses));
  const m = document.getElementById('monthSelect').value;
  renderExpenses(m);
  renderSummary(m);
  renderSavingsOverview(m);
  renderDashboard(m);
  document.getElementById('expenseForm').reset();
}

function deleteExpense(idx, monthIdx) {
  const monthExpenses = getExpensesForMonth(monthIdx);
  const expToDelete = monthExpenses[idx];
  const globalIdx = expenses.findIndex(exp =>
    exp.desc === expToDelete.desc &&
    exp.amount === expToDelete.amount &&
    exp.category === expToDelete.category &&
    exp.date === expToDelete.date
  );
  if (globalIdx > -1) {
    expenses.splice(globalIdx, 1);
    localStorage.setItem('expensesData', JSON.stringify(expenses));
    renderExpenses(monthIdx);
    renderSummary(monthIdx);
    renderSavingsOverview(monthIdx);
    renderDashboard(monthIdx);
  }
}

function addDailySavings() {
  const amount = parseFloat(document.getElementById('dailySavingsInput').value);
  const date = document.getElementById('dailySavingsDate').value;
  if (!amount || !date) return;
  dailySavings.push({ amount, date });
  localStorage.setItem('dailySavingsData', JSON.stringify(dailySavings));
  document.getElementById('dailySavingsInput').value = '';
  document.getElementById('dailySavingsDate').value = '';
  renderDailySavings();
  const m = document.getElementById('monthSelect').value;
  renderSavingsOverview(m);
  renderDashboard(m);
}

function renderDailySavings() {
  let monthIdx = null;
  if (document.getElementById('savingsMonthSelect')) {
    monthIdx = document.getElementById('savingsMonthSelect').value;
  } else {
    monthIdx = document.getElementById('monthSelect').value;
  }
  const monthSavings = getSavingsForMonth(monthIdx);
  const total = monthSavings.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
  const sumEl = document.getElementById('dailySavingsSummary');
  if (sumEl) sumEl.textContent = `Total Savings Balance: ₱${total.toFixed(2)}`;
  let historyHtml = '<b>Daily Savings History:</b><ul style="margin:8px 0 0;padding:0;list-style:none;">';
  monthSavings.slice().reverse().forEach((entry, idx) => {
    historyHtml += `<li><input type='date' value='${entry.date}' data-idx='${idx}' class='edit-savings-date' style='margin-right:8px;'>` +
      `<input type='number' value='${parseFloat(entry.amount).toFixed(2)}' data-idx='${idx}' class='edit-savings-amount' style='width:80px;margin-right:8px;'>` +
      `<button class='save-savings-edit' data-idx='${idx}'>Save</button></li>`;
  });
  historyHtml += '</ul>';
  const histEl = document.getElementById('dailySavingsHistory');
  if (histEl) histEl.innerHTML = historyHtml;
  // Add event listeners for edit
  setTimeout(() => {
    document.querySelectorAll('.save-savings-edit').forEach(btn => {
      btn.onclick = function() {
        const idx = Number(btn.getAttribute('data-idx'));
        const dateInput = document.querySelector(`.edit-savings-date[data-idx='${idx}']`);
        const amountInput = document.querySelector(`.edit-savings-amount[data-idx='${idx}']`);
        if (dateInput && amountInput) {
          // Find correct entry in dailySavings
          const filtered = getSavingsForMonth(monthIdx);
          const entry = filtered[filtered.length - 1 - idx]; // reverse order
          const globalIdx = dailySavings.findIndex(s => s.date === entry.date && s.amount == entry.amount);
          if (globalIdx > -1) {
            dailySavings[globalIdx].date = dateInput.value;
            dailySavings[globalIdx].amount = parseFloat(amountInput.value);
            localStorage.setItem('dailySavingsData', JSON.stringify(dailySavings));
            renderDailySavings();
          }
        }
      };
    });
  }, 100);
}

function renderSavingsOverview(monthIdx) {
  const monthSavings = getSavingsForMonth(monthIdx);
  const totalSavedMonth = monthSavings.reduce((s, e) => s + parseFloat(e.amount), 0);
  const monthExpenses = getExpensesForMonth(monthIdx);
  const totalExpensesMonth = monthExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const net = totalSavedMonth - totalExpensesMonth;

  const monthlySavedSpan = document.getElementById('monthlyTotalSaved');
  if (monthlySavedSpan) monthlySavedSpan.textContent = `₱${totalSavedMonth.toFixed(2)}`;

  const moneySaved2 = document.getElementById('moneySaved2');
  if (moneySaved2) moneySaved2.textContent = `Net Balance (Savings − Expenses): ₱${net.toFixed(2)}`;

  const actualSavedInput = document.getElementById('actualSavedInput');
  if (actualSavedInput) actualSavedInput.value = totalSavedMonth.toFixed(2);

  const savingsSummary = document.getElementById('savingsSummary');
  if (savingsSummary) savingsSummary.innerHTML =
    `<b>This Month</b>: Savings ₱${totalSavedMonth.toFixed(2)} | Expenses ₱${totalExpensesMonth.toFixed(2)}`;

  const savedCountSavings = document.getElementById('savedCountSavings');
  if (savedCountSavings) savedCountSavings.textContent = `Savings Entries: ${monthSavings.length}`;
}

function ensureDashboard() {
  if (document.getElementById('dashboard')) return;
  const container = document.createElement('div');
  container.id = 'dashboard';
  container.style.margin = '20px 0';
  container.style.padding = '15px';
  container.style.border = '1px solid #3a3a4f';
  container.style.borderRadius = '10px';
  container.style.background = '#2a2b40';
  container.style.color = '#ffe066';
  container.innerHTML = `
    <h3 style="margin:0 0 10px">📊 Monthly Dashboard</h3>
    <p id="dashExpenses"></p>
    <p id="dashSavings"></p>
    <p id="dashNet" style="font-weight:bold;"></p>
    <div style="margin:10px 0;">
      <label style="display:block;margin-bottom:6px;">Goal Progress:</label>
      <progress id="goalProgress" value="0" max="100" style="width:100%;height:16px;"></progress>
    </div>
    <button id="exportCsvBtn" style="margin-top:10px;padding:8px 12px;border-radius:8px;border:none;cursor:pointer;background:#ffe066;color:#23243a;font-weight:bold;">
      ⬇ Export CSV
    </button>
  `;
  // Insert after header
  const header = document.querySelector('.header') || document.body.firstElementChild;
  (header && header.parentNode) ? header.parentNode.insertBefore(container, header.nextSibling) : document.body.appendChild(container);

  const btn = container.querySelector('#exportCsvBtn');
  btn.addEventListener('click', exportCSV);
}

function renderDashboard(monthIdx) {
  ensureDashboard();
  const monthExpenses = getExpensesForMonth(monthIdx);
  const totalExpenses = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  const monthSavings = getSavingsForMonth(monthIdx);
  const totalSavings = monthSavings.reduce((sum, s) => sum + parseFloat(s.amount), 0);

  const net = totalSavings - totalExpenses;

  const de = document.getElementById('dashExpenses');
  const ds = document.getElementById('dashSavings');
  const dn = document.getElementById('dashNet');
  if (de) de.textContent = `Expenses: ₱${totalExpenses.toFixed(2)}`;
  if (ds) ds.textContent = `Savings: ₱${totalSavings.toFixed(2)}`;
  if (dn) dn.textContent = `Net Balance: ₱${net.toFixed(2)}`;

  const goal = parseFloat(document.getElementById('savingsGoalInput')?.value) || 0;
  const progress = document.getElementById('goalProgress');
  if (progress) {
    if (goal > 0) {
      const pct = Math.min((totalSavings / goal) * 100, 100);
      progress.value = pct;
      progress.max = 100;
    } else {
      progress.value = 0;
      progress.max = 100;
    }
  }
}

function exportCSV() {
  const monthIdx = (document.getElementById('savingsMonthSelect')?.value) ?? document.getElementById('monthSelect').value;
  const monthName = monthNames[monthIdx].replace(/\d+_/, '');
  const monthExpenses = getExpensesForMonth(monthIdx);
  const monthSavings = getSavingsForMonth(monthIdx);

  let csv = `Type,Category,Description,Amount,Date\n`;
  monthExpenses.forEach(exp => {
    csv += `Expense,${exp.category},${(exp.desc || '').replace(/,/g,' ')},${exp.amount},${exp.date}\n`;
  });
  monthSavings.forEach(sav => {
    csv += `Saving,,,${sav.amount},${sav.date}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Finance_Report_${monthName}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
  renderMonthOptions();
  renderSavingsMonthOptions();

  const monthSelect = document.getElementById('monthSelect');
  const savingsMonthSelect = document.getElementById('savingsMonthSelect');

  monthSelect.addEventListener('change', () => {
    renderExpenses(monthSelect.value);
    renderSummary(monthSelect.value);
    renderSavingsOverview(monthSelect.value);
    renderDashboard(monthSelect.value);
    renderDailySavings(); // keep the history/summary in sync
  });

  if (savingsMonthSelect) {
    savingsMonthSelect.addEventListener('change', () => {
      renderDailySavings();
      renderSavingsOverview(savingsMonthSelect.value);
      renderDashboard(savingsMonthSelect.value);
    });
  }

  const expForm = document.getElementById('expenseForm');
  if (expForm) expForm.addEventListener('submit', addExpense);

  const goalInput = document.getElementById('savingsGoalInput');
  if (goalInput) goalInput.addEventListener('input', () => {
    renderSummary(monthSelect.value);
    renderSavingsOverview(monthSelect.value);
    renderDashboard(monthSelect.value);
  });

  const addSavBtn = document.getElementById('addDailySavingsBtn');
  if (addSavBtn) addSavBtn.addEventListener('click', addDailySavings);

  renderExpenses(monthSelect.value);
  renderSummary(monthSelect.value);
  renderDailySavings();
  renderSavingsOverview(monthSelect.value);
  renderDashboard(monthSelect.value);

  const expensesTab = document.getElementById('expensesTab');
  const savingsTab = document.getElementById('savingsTab');
  const expensesPage = document.getElementById('expensesPage');
  const savingsPage = document.getElementById('savingsPage');

  function setActiveTab(tab) {
    if (tab === 'expenses') {
      expensesTab?.classList.add('active');
      savingsTab?.classList.remove('active');
      if (expensesPage) expensesPage.style.display = '';
      if (savingsPage) savingsPage.style.display = 'none';
    } else {
      expensesTab?.classList.remove('active');
      savingsTab?.classList.add('active');
      if (expensesPage) expensesPage.style.display = 'none';
      if (savingsPage) savingsPage.style.display = '';
      const idx = (document.getElementById('savingsMonthSelect')?.value) ?? monthSelect.value;
      renderSavingsOverview(idx);
      renderDashboard(idx);
    }
  }

  expensesTab?.addEventListener('click', () => setActiveTab('expenses'));
  savingsTab?.addEventListener('click', () => setActiveTab('savings'));
  setActiveTab('expenses');
});

// Expose delete to inline onclick
window.deleteExpense = deleteExpense;
