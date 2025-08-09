// Notes Application JavaScript

class NotesApp {
  constructor() {
    this.notes = JSON.parse(localStorage.getItem('classOrbitNotes') || '[]');
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderNotes();
    this.updateStats();
  }

  bindEvents() {
    // Save note button
    document.getElementById('saveNote').addEventListener('click', () => this.saveNote());
    
    // Enter key in textarea
    document.getElementById('noteInput').addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.saveNote();
      }
    });

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });

    // Auto-resize textarea
    const textarea = document.getElementById('noteInput');
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  }

  saveNote() {
    const noteInput = document.getElementById('noteInput');
    const categorySelect = document.getElementById('categorySelect');
    const importantCheck = document.getElementById('importantCheck');
    
    const content = noteInput.value.trim();
    
    if (!content) {
      this.showNotification('Please write something first!', 'error');
      return;
    }

    const note = {
      id: Date.now(),
      content: content,
      category: categorySelect.value || 'general',
      important: importantCheck.checked,
      timestamp: new Date().toISOString(),
      dateCreated: new Date().toLocaleDateString(),
      timeCreated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.notes.unshift(note); // Add to beginning of array
    this.saveToStorage();
    this.renderNotes();
    this.updateStats();
    
    // Clear form
    noteInput.value = '';
    categorySelect.value = '';
    importantCheck.checked = false;
    noteInput.style.height = 'auto';
    
    this.showNotification('Note saved successfully!', 'success');
  }

  deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
      this.notes = this.notes.filter(note => note.id !== id);
      this.saveToStorage();
      this.renderNotes();
      this.updateStats();
      this.showNotification('Note deleted', 'info');
    }
  }

  editNote(id) {
    const note = this.notes.find(note => note.id === id);
    if (!note) return;

    // Fill the form with the note data
    document.getElementById('noteInput').value = note.content;
    document.getElementById('categorySelect').value = note.category;
    document.getElementById('importantCheck').checked = note.important;

    // Auto-resize textarea
    const textarea = document.getElementById('noteInput');
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';

    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Delete the original note
    this.notes = this.notes.filter(n => n.id !== id);
    this.saveToStorage();
    this.renderNotes();
    this.updateStats();

    // Focus on the textarea
    setTimeout(() => {
      textarea.focus();
    }, 500);

    this.showNotification('Note loaded for editing', 'info');
  }

  toggleImportant(id) {
    const note = this.notes.find(note => note.id === id);
    if (note) {
      note.important = !note.important;
      this.saveToStorage();
      this.renderNotes();
      this.updateStats();
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    this.renderNotes();
  }

  getFilteredNotes() {
    if (this.currentFilter === 'all') {
      return this.notes;
    } else if (this.currentFilter === 'important') {
      return this.notes.filter(note => note.important);
    } else {
      return this.notes.filter(note => note.category === this.currentFilter);
    }
  }

  renderNotes() {
    const noteList = document.getElementById('noteList');
    const emptyState = document.getElementById('emptyState');
    const filteredNotes = this.getFilteredNotes();

    if (filteredNotes.length === 0) {
      noteList.style.display = 'none';
      emptyState.style.display = 'block';
      
      if (this.currentFilter === 'all') {
        emptyState.innerHTML = `
          <div class="empty-icon">📝</div>
          <h3>No notes yet</h3>
          <p>Start writing your first note above!</p>
        `;
      } else {
        emptyState.innerHTML = `
          <div class="empty-icon">🔍</div>
          <h3>No ${this.currentFilter} notes</h3>
          <p>Try a different filter or create a new note.</p>
        `;
      }
      return;
    }

    noteList.style.display = 'grid';
    emptyState.style.display = 'none';

    noteList.innerHTML = filteredNotes.map(note => this.createNoteCard(note)).join('');
  }

  createNoteCard(note) {
    const categoryEmojis = {
      lecture: '📚',
      assignment: '📝',
      exam: '📊',
      personal: '👤',
      reminder: '⏰',
      general: '📄'
    };

    const categoryName = note.category.charAt(0).toUpperCase() + note.category.slice(1);
    
    return `
      <div class="note-card ${note.important ? 'important' : ''}" data-id="${note.id}">
        <div class="note-header">
          <span class="note-category">
            ${categoryEmojis[note.category] || '📄'} ${categoryName}
          </span>
          ${note.important ? '<span class="note-important">⭐</span>' : ''}
        </div>
        
        <div class="note-content">
          ${this.formatNoteContent(note.content)}
        </div>
        
        <div class="note-footer">
          <span class="note-date">
            ${note.dateCreated} at ${note.timeCreated}
          </span>
          <div class="note-actions">
            <button class="note-action" onclick="notesApp.editNote(${note.id})" title="Edit Note">
              ✏️
            </button>
            <button class="note-action" onclick="notesApp.toggleImportant(${note.id})" title="Toggle Important">
              ${note.important ? '⭐' : '☆'}
            </button>
            <button class="note-action delete-btn" onclick="notesApp.deleteNote(${note.id})" title="Delete Note">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  }

  formatNoteContent(content) {
    // Convert line breaks to HTML
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic text
  }

  updateStats() {
    const today = new Date().toLocaleDateString();
    const todayNotes = this.notes.filter(note => note.dateCreated === today).length;
    const importantNotes = this.notes.filter(note => note.important).length;

    document.getElementById('totalNotes').textContent = this.notes.length;
    document.getElementById('todayNotes').textContent = todayNotes;
    document.getElementById('importantNotes').textContent = importantNotes;
  }

  saveToStorage() {
    localStorage.setItem('classOrbitNotes', JSON.stringify(this.notes));
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      borderRadius: '10px',
      color: 'white',
      fontWeight: '600',
      zIndex: '10000',
      transform: 'translateX(100%)',
      transition: 'all 0.3s ease'
    });

    // Set background color based on type
    switch (type) {
      case 'success':
        notification.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        break;
      case 'error':
        notification.style.background = 'linear-gradient(135deg, #f44336, #da190b)';
        break;
      default:
        notification.style.background = 'linear-gradient(135deg, #3A86FF, #2c5aa0)';
    }

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Export notes as text file
  exportNotes() {
    if (this.notes.length === 0) {
      this.showNotification('No notes to export!', 'error');
      return;
    }

    const exportText = this.notes.map(note => {
      const importantTag = note.important ? ' [IMPORTANT]' : '';
      return `${note.dateCreated} - ${note.category.toUpperCase()}${importantTag}\n${note.content}\n\n---\n\n`;
    }).join('');

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClassOrbit_Notes_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showNotification('Notes exported successfully!', 'success');
  }

  // Search functionality (can be added later)
  searchNotes(query) {
    const filteredNotes = this.notes.filter(note => 
      note.content.toLowerCase().includes(query.toLowerCase()) ||
      note.category.toLowerCase().includes(query.toLowerCase())
    );
    return filteredNotes;
  }
}

// Initialize the notes app when the page loads
let notesApp;
document.addEventListener('DOMContentLoaded', () => {
  notesApp = new NotesApp();
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save note
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      notesApp.saveNote();
    }
    
    // Ctrl/Cmd + E to export notes
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      notesApp.exportNotes();
    }
  });
});
