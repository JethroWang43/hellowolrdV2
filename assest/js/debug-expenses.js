// Debug utility for inspecting localStorage expenses data
(function(){
  const expenses = JSON.parse(localStorage.getItem('expensesData') || '[]');
  console.log('Expenses Data:', expenses);
  expenses.forEach((exp, i) => {
    console.log(`Expense #${i}:`, exp, 'Parsed Date:', new Date(exp.date));
  });
})();
