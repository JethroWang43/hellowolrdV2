// Attendance page logic
window.addEventListener('DOMContentLoaded', function() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const scheduleData = window.scheduleData || {};
  const attendanceTableBody = document.getElementById('attendanceTableBody');
  const weekAttendancePercent = document.getElementById('weekAttendancePercent');
  const weekAttendanceCount = document.getElementById('weekAttendanceCount');

  let totalClasses = 0;
  let attendedClasses = 0;
  let dailySummary = [];

  days.forEach(day => {
    const classes = scheduleData[day] || [];
    let dayTotal = 0;
    let dayPresent = 0;
    // Add a row for the day
    if (classes.length > 0) {
      const dayRow = document.createElement('tr');
      dayRow.innerHTML = `<td colspan="5" style="font-weight:bold;background:#f0f4ff;">${day}</td>`;
      attendanceTableBody.appendChild(dayRow);
    }
    classes.forEach((cls, idx) => {
      totalClasses++;
      dayTotal++;
      const checkinId = `${day}-${idx}`;
      const todayKey = `attendance-${getDateKeyForDay(day)}`;
      const attendance = JSON.parse(localStorage.getItem(todayKey) || '{}');
      const isCheckedIn = attendance[checkinId] || false;
      if (isCheckedIn) {
        attendedClasses++;
        dayPresent++;
      }
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td></td>
        <td>${cls.subject} <span style="color:#888;font-size:0.95em;">${cls.subjectName ? ' - ' + cls.subjectName : ''}</span></td>
        <td>${cls.time}</td>
        <td>${cls.room || ''}</td>
        <td class="${isCheckedIn ? 'status-present' : 'status-absent'}">${isCheckedIn ? 'Present' : 'Absent'}</td>
      `;
      attendanceTableBody.appendChild(tr);
    });
    if (dayTotal > 0) {
      // Add daily summary row
      const sumRow = document.createElement('tr');
      sumRow.innerHTML = `<td colspan="5" style="text-align:right;font-size:0.98em;background:#f9f9f9;">${dayPresent} / ${dayTotal} Present (${Math.round((dayPresent/dayTotal)*100)}%)</td>`;
      attendanceTableBody.appendChild(sumRow);
      dailySummary.push({day, dayPresent, dayTotal});
    }
  });

  // Weekly summary
  weekAttendanceCount.textContent = `Present: ${attendedClasses} / ${totalClasses}`;
  weekAttendancePercent.textContent = `Attendance: ${totalClasses > 0 ? Math.round((attendedClasses/totalClasses)*100) : 0}%`;

  // Helper: get date key for each day of this week
  function getDateKeyForDay(day) {
    const now = new Date();
    const todayIdx = now.getDay(); // 0=Sun, 1=Mon...
    const dayIdx = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(day);
    const diff = dayIdx - todayIdx;
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
    return date.toISOString().split('T')[0];
  }
});
