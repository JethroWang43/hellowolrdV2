    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const scheduleData = {
      Mon: [
        { subject: 'Advanced Mathematics', course: 'MATH301', time: '08:00 - 09:30', room: 'AB Building - Room 301', teacher: 'Dr. Rodriguez' },
        { subject: 'Physics', course: 'PHYS201', time: '10:00 - 11:30', room: 'Science Hall - Room 201', teacher: 'Prof. Santos' }
      ],
      Tue: [
        { subject: 'Chemistry', course: 'CHEM105', time: '09:00 - 10:30', room: 'Lab Building - Room 105', teacher: 'Dr. Lee' },
        { subject: 'English Literature', course: 'ENGL210', time: '11:00 - 12:30', room: 'Main Hall - Room 210', teacher: 'Ms. Carter' }
      ],
      Wed: [
        { subject: 'History', course: 'HIST102', time: '08:30 - 10:00', room: 'History Block - Room 102', teacher: 'Mr. Brown' },
        { subject: 'Computer Science', course: 'COSC401', time: '10:30 - 12:00', room: 'Tech Center - Room 401', teacher: 'Ms. Patel' }
      ],
      Thu: [
        { subject: 'Biology', course: 'BIOL202', time: '09:00 - 10:30', room: 'Bio Lab - Room 202', teacher: 'Dr. Kim' },
        { subject: 'Physical Education', course: 'PHED100', time: '11:00 - 12:00', room: 'Gym', teacher: 'Coach Miller' }
      ],
      Fri: [
        { subject: 'Art', course: 'ARTS303', time: '08:00 - 09:30', room: 'Art Studio - Room 303', teacher: 'Ms. Gomez' },
        { subject: 'Economics', course: 'ECON101', time: '10:00 - 11:30', room: 'Business Block - Room 101', teacher: 'Mr. Smith' }
      ],
      Sat: [
        { subject: 'Engineering Ethics', course: 'ENGR204', time: '09:00 - 10:30', room: 'Eng Building - Room 204', teacher: 'Engr. Villanueva' },
        { subject: 'Seminar on Innovation', course: 'SEMIN300', time: '23:00 - 12:30', room: 'Auditorium', teacher: 'Dr. Rivera' },
        { subject: 'Engineering Ethics', course: 'ENGR204', time: '09:00 - 10:30', room: 'Eng Building - Room 204', teacher: 'Engr. Villanueva' }
      ]
    };

    const notesKey = 'classOrbitNotes';
    let currentDay = 'Mon';
    
    // DOM elements - will be initialized after DOM loads
    let daysContainer, scheduleContainer, classCountEl, attendanceEl, noteCountEl, noteInput, noteList, dateTimeDisplay, upcomingList;

    function initializeDOMElements() {
      daysContainer = document.getElementById('days');
      scheduleContainer = document.getElementById('schedule');
      classCountEl = document.getElementById('classCount');
      attendanceEl = document.getElementById('attendance');
      noteCountEl = document.getElementById('noteCount');
      noteInput = document.getElementById('noteInput');
      noteList = document.getElementById('noteList');
      dateTimeDisplay = document.getElementById('dateTimeDisplay');
      upcomingList = document.getElementById('upcomingClasses');
      
      console.log('DOM elements found:', {
        days: !!daysContainer,
        schedule: !!scheduleContainer,
        classCount: !!classCountEl,
        attendance: !!attendanceEl
      });
    }

    function getTodayKey() {
      const today = new Date().toISOString().split('T')[0];
      return `attendance-${today}`;
    }

    function resetOldAttendance() {
      const todayKey = getTodayKey();
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('attendance-') && key !== todayKey) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    function getCurrentDayString() {
      const jsDay = new Date().getDay();
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][jsDay];
    }

    function isToday(day) {
      return getCurrentDayString() === day;
    }

    function renderDays() {
      console.log('renderDays called, daysContainer:', daysContainer);
      
      if (!daysContainer) {
        console.error('Days container not found!');
        return;
      }
      
      daysContainer.innerHTML = ''; // Clear existing content
      
      days.forEach(day => {
        const btn = document.createElement('button');
        btn.textContent = day;
        btn.className = 'day-btn';
        if (day === getCurrentDayString()) btn.classList.add('day-active');
        btn.onclick = () => selectDay(day, btn);
        daysContainer.appendChild(btn);
        console.log('Added day button:', day);
      });
    }

    function selectDay(day, btn) {
      currentDay = day;
      document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('day-active'));
      btn.classList.add('day-active');
      renderSchedule(day);
    }

function renderSchedule(day) {
  if (!scheduleContainer) {
    console.error('Schedule container not found!');
    return;
  }
  
  scheduleContainer.innerHTML = '';
  const classes = scheduleData[day] || [];
  
  if (classCountEl) {
    classCountEl.textContent = `${classes.length} Class${classes.length !== 1 ? 'es' : ''}`;
  }

  const todayKey = getTodayKey();
  let todayAttendance = JSON.parse(localStorage.getItem(todayKey) || '{}');

  classes.forEach((cls, index) => {
    const checkinId = `${day}-${index}`;
    const isCheckedIn = todayAttendance[checkinId] || false;
    const isDayToday = isToday(day);

    const card = document.createElement('div');
    card.className = 'class-card';
    if (isCheckedIn) {
      card.classList.add('checked-in');
    }

    card.innerHTML = `
      <div class="class-header">
        <h3 class="class-subject">${cls.subject}</h3>
        <span class="class-code">${cls.course}</span>
      </div>
      <div class="class-details">
        <div class="class-info">
          <span class="class-time">🕐 ${cls.time}</span>
          <span class="class-room">📍 ${cls.room}</span>
          <span class="class-teacher">👨‍🏫 ${cls.teacher}</span>
        </div>
        <div class="class-actions">
          <button class="checkin-btn ${isCheckedIn ? 'checked-in' : ''}" 
                  id="${checkinId}" 
                  ${!isDayToday || isCheckedIn ? 'disabled' : ''}>
            ${isCheckedIn ? '✅ Checked In' : '✅ Check In'}
          </button>
        </div>
      </div>
    `;

    const checkInButton = card.querySelector('.checkin-btn');
    checkInButton.onclick = () => {
      if (!isDayToday || isCheckedIn) return;
      todayAttendance[checkinId] = true;
      localStorage.setItem(todayKey, JSON.stringify(todayAttendance));
      renderSchedule(currentDay);
      loadAttendance();
    };

    scheduleContainer.appendChild(card);
  });
}


    function loadAttendance() {
      const todayKey = getTodayKey();
      const todayAttendance = JSON.parse(localStorage.getItem(todayKey) || '{}');
      const attended = Object.values(todayAttendance).filter(Boolean).length;
      const totalToday = (scheduleData[currentDay] || []).length;
      const percent = totalToday > 0 ? Math.floor((attended / totalToday) * 100) : 0;
      
      if (attendanceEl) {
        attendanceEl.textContent = `${percent}%`;
      }
    }

    function saveNote() {
      const note = noteInput.value.trim();
      if (!note) return;
      const notes = JSON.parse(localStorage.getItem(notesKey) || '[]');
      notes.push(note);
      localStorage.setItem(notesKey, JSON.stringify(notes));
      noteInput.value = '';
      renderNotes();
    }

    function renderNotes() {
      const notes = JSON.parse(localStorage.getItem(notesKey) || '[]');
      
      if (noteCountEl) {
        noteCountEl.textContent = notes.length;
      }
      
      if (!noteList) {
        console.warn('Note list element not found');
        return;
      }
      
      noteList.innerHTML = '';
      notes.forEach((note, idx) => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = note;
      span.style.cursor = 'pointer';

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.onclick = () => {
        noteInput.value = note;
        const saveEdit = () => {
        notes[idx] = noteInput.value.trim();
        localStorage.setItem(notesKey, JSON.stringify(notes));
        noteInput.value = '';
        renderNotes();
        document.getElementById('saveNote').onclick = saveNote;
        };
        document.getElementById('saveNote').onclick = saveEdit;
      };

      // Delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.onclick = () => {
        notes.splice(idx, 1);
        localStorage.setItem(notesKey, JSON.stringify(notes));
        renderNotes();
      };

      li.appendChild(span);
      li.appendChild(editBtn);
      li.appendChild(delBtn);
      noteList.appendChild(li);
      });
    }
    // Ensure saveNote button handler is always correct
    function saveNoteBtnHandler() {
      saveNote();
      document.getElementById('saveNote').onclick = saveNote;
    }

    function updateDateTimeAndUpcoming() {
      const now = new Date();
      const dayName = now.toLocaleDateString(undefined, { weekday: 'long' });
      // Show live clock with seconds
      const timeString = now.toLocaleTimeString();
      
      if (dateTimeDisplay) {
        dateTimeDisplay.textContent = `${now.toLocaleDateString()} ${timeString} (${dayName})`;
      }

      const today = getCurrentDayString();
      const todaySchedule = scheduleData[today] || [];
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      const upcoming = todaySchedule.filter(cls => {
      const [start] = cls.time.split(' - ');
      const [h, m] = start.split(':').map(Number);
      const classStartMinutes = h * 60 + m;
      return classStartMinutes >= currentTime;
      });

      if (!upcomingList) {
        return;
      }
      
      upcomingList.innerHTML = '';
      upcoming.forEach(cls => {
      const [start] = cls.time.split(' - ');
      const [h, m] = start.split(':').map(Number);
      const classTimeMinutes = h * 60 + m;
      let minutesLeft = classTimeMinutes - currentTime;
      let secondsLeft = 0 - currentSeconds;
      if (secondsLeft < 0) {
        minutesLeft -= 1;
        secondsLeft += 60;
      }
      const hours = Math.floor(minutesLeft / 60);
      const mins = minutesLeft % 60;
      const warn = classTimeMinutes - currentTime >= 300 ? '⏰ 5hr Warning! ' : '';
      const formattedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

      const li = document.createElement('li');
      li.textContent = `${warn}${cls.subject} at ${formattedTime} (${hours}hr:${mins}min:${secondsLeft}s left)`;
      upcomingList.appendChild(li);
      });
    }

    // Update every second for live clock
    setInterval(updateDateTimeAndUpcoming, 1000);

    // Initialize app when DOM is ready
    function initializeApp() {
      console.log('Initializing app...');
      initializeDOMElements();
      
      if (document.getElementById('saveNote')) {
        document.getElementById('saveNote').onclick = saveNote;
      }
      
      resetOldAttendance();
      renderDays();
      currentDay = getCurrentDayString();
      renderSchedule(currentDay);
      loadAttendance();
      renderNotes();
      updateDateTimeAndUpcoming();
      setInterval(updateDateTimeAndUpcoming, 60000);
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
      // DOM is already loaded
      initializeApp();
    }