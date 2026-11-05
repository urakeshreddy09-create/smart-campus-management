/**
 * SMART CAMPUS MANAGEMENT SYSTEM - LIBRARY MANAGEMENT MODULE
 * Catalog Browser, ISBN Search, Issue Book to Student, Return Book, Stock Counter
 */

const CampusLibrary = (function () {

  function init() {
    bindActions();
    render();
  }

  function bindActions() {
    const addBookBtn = document.getElementById('open-add-book-modal-btn');
    if (addBookBtn) {
      addBookBtn.addEventListener('click', () => {
        CampusApp.openModal('book-modal');
      });
    }

    const issueBookBtn = document.getElementById('open-issue-book-modal-btn');
    if (issueBookBtn) {
      issueBookBtn.addEventListener('click', () => {
        openIssueBookModal();
      });
    }

    const bookForm = document.getElementById('book-form');
    if (bookForm) {
      bookForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveBook();
      });
    }

    const issueForm = document.getElementById('issue-book-form');
    if (issueForm) {
      issueForm.addEventListener('submit', function (e) {
        e.preventDefault();
        processIssueBook();
      });
    }

    const searchInput = document.getElementById('library-search-input');
    const catFilter = document.getElementById('library-category-filter');
    const availFilter = document.getElementById('library-avail-filter');

    if (searchInput) searchInput.addEventListener('input', render);
    if (catFilter) catFilter.addEventListener('change', render);
    if (availFilter) availFilter.addEventListener('change', render);
  }

  function saveBook() {
    const isbn = document.getElementById('bkf-isbn').value.trim();
    const title = document.getElementById('bkf-title').value.trim();
    const author = document.getElementById('bkf-author').value.trim();
    const category = document.getElementById('bkf-cat').value;
    const shelf = document.getElementById('bkf-shelf').value.trim();
    const copies = parseInt(document.getElementById('bkf-copies').value, 10) || 5;

    if (!isbn || !title || !author) {
      CampusApp.showToast('Validation Error', 'ISBN, Title, and Author are required.', 'danger');
      return;
    }

    const data = CampusStore.get();
    const newBook = {
      id: Date.now(),
      isbn,
      title,
      author,
      category,
      shelf,
      totalCopies: copies,
      availableCopies: copies,
      borrowers: []
    };

    data.books.push(newBook);
    CampusStore.save(data);

    CampusApp.closeModal('book-modal');
    CampusApp.showToast('Book Added', `"${title}" added to library catalog.`, 'success');
    document.getElementById('book-form').reset();
    render();
  }

  function openIssueBookModal() {
    const data = CampusStore.get();
    const bookSelect = document.getElementById('ib-book');
    const studentSelect = document.getElementById('ib-student');
    const dueInput = document.getElementById('ib-due');

    // Default due date: 14 days from today
    if (dueInput) {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      dueInput.value = d.toISOString().split('T')[0];
    }

    if (bookSelect) {
      const availableBooks = data.books.filter(b => b.availableCopies > 0);
      if (availableBooks.length === 0) {
        CampusApp.showToast('Inventory Alert', 'All library books are currently issued out.', 'warning');
        return;
      }
      bookSelect.innerHTML = availableBooks.map(b => `
        <option value="${b.id}">${b.title} (${b.availableCopies} available on shelf ${b.shelf})</option>
      `).join('');
    }

    if (studentSelect) {
      studentSelect.innerHTML = (data.students || []).map(s => `
        <option value="${s.regNo}">${s.name} (${s.regNo}) - ${s.department}</option>
      `).join('');
    }

    CampusApp.openModal('issue-book-modal');
  }

  function processIssueBook() {
    const bookId = parseInt(document.getElementById('ib-book').value, 10);
    const studentReg = document.getElementById('ib-student').value;
    const dueDate = document.getElementById('ib-due').value;

    const data = CampusStore.get();
    const book = data.books.find(b => b.id === bookId);
    const student = data.students.find(s => s.regNo === studentReg);

    if (!book || !student) {
      CampusApp.showToast('Error', 'Invalid book or student selected.', 'danger');
      return;
    }

    if (book.availableCopies <= 0) {
      CampusApp.showToast('Out of Stock', 'No available copies of this title remaining.', 'warning');
      return;
    }

    book.availableCopies -= 1;
    if (!book.borrowers) book.borrowers = [];
    book.borrowers.push(studentReg);

    // Activity log
    if (!data.activities) data.activities = [];
    data.activities.unshift({
      id: Date.now(),
      user: 'Central Library',
      action: `Issued "${book.title}" to ${student.name}`,
      time: 'Just now',
      icon: 'fa-book'
    });

    CampusStore.save(data);
    CampusApp.closeModal('issue-book-modal');
    CampusApp.showToast('Book Issued', `"${book.title}" issued to ${student.name}. Due on ${dueDate}.`, 'success');
    render();
  }

  function returnBook(bookId, regNo) {
    const data = CampusStore.get();
    const book = data.books.find(b => b.id === bookId);
    if (!book) return;

    if (book.borrowers && book.borrowers.includes(regNo)) {
      book.borrowers = book.borrowers.filter(r => r !== regNo);
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);

      CampusStore.save(data);
      CampusApp.showToast('Book Returned', `Copy of "${book.title}" checked in back to inventory.`, 'success');
      render();
    }
  }

  function deleteBook(id, title) {
    CampusApp.confirmDialog(
      'Remove Book',
      `Are you sure you want to delete "${title}" from the catalog?`,
      () => {
        const data = CampusStore.get();
        data.books = data.books.filter(b => b.id !== id);
        CampusStore.save(data);
        CampusApp.showToast('Book Removed', 'Book deleted from catalog.', 'warning');
        render();
      },
      'Delete Book',
      true
    );
  }

  function render() {
    const tbody = document.getElementById('library-table-body');
    if (!tbody) return;

    const data = CampusStore.get();
    const user = CampusApp.getCurrentUser() || { role: 'admin' };
    let list = data.books || [];

    const q = (document.getElementById('library-search-input')?.value || '').toLowerCase().trim();
    const cat = document.getElementById('library-category-filter')?.value || '';
    const avail = document.getElementById('library-avail-filter')?.value || '';

    if (q) {
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q)
      );
    }

    if (cat) {
      list = list.filter(b => b.category === cat);
    }

    if (avail === 'available') {
      list = list.filter(b => b.availableCopies > 0);
    } else if (avail === 'borrowed') {
      list = list.filter(b => b.availableCopies === 0);
    }

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
            <i class="fa-solid fa-book" style="font-size: 2rem; margin-bottom: 10px; color: var(--text-light); display: block;"></i>
            No books matching criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(b => {
      const isAvailable = b.availableCopies > 0;
      const borrowerList = (b.borrowers || []).join(', ');

      return `
        <tr>
          <td style="font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; color: var(--text-muted);">
            ${b.isbn}
          </td>
          <td>
            <div style="font-weight: 700; color: var(--primary); font-size: 0.92rem;">${b.title}</div>
            ${borrowerList ? `<div style="font-size: 0.72rem; color: var(--warning);"><i class="fa-solid fa-user-clock"></i> Currently held by: ${borrowerList}</div>` : ''}
          </td>
          <td>${b.author}</td>
          <td><span class="status-pill info">${b.category}</span></td>
          <td>
            <span style="font-family: 'JetBrains Mono', monospace; font-weight: 600; background: var(--bg-app); padding: 2px 8px; border-radius: 4px; font-size: 0.78rem;">
              ${b.shelf}
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="status-pill ${isAvailable ? 'success' : 'danger'}">
                ${b.availableCopies} of ${b.totalCopies} Available
              </span>
            </div>
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 6px;">
              ${b.borrowers && b.borrowers.length > 0 ? `
                <button class="btn btn-sm btn-secondary" onclick="CampusLibrary.returnFirst('${b.id}')" title="Return Book">
                  <i class="fa-solid fa-rotate-left"></i> Check In
                </button>
              ` : ''}
              ${user.role === 'admin' ? `
                <button class="btn btn-secondary btn-icon-only" onclick="CampusLibrary.remove(${b.id}, '${b.title.replace(/'/g, "\\'")}')" title="Delete Book">
                  <i class="fa-regular fa-trash-can" style="color: var(--danger);"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function returnFirst(bookId) {
    const data = CampusStore.get();
    const book = data.books.find(b => b.id === parseInt(bookId, 10));
    if (book && book.borrowers && book.borrowers.length > 0) {
      returnBook(book.id, book.borrowers[0]);
    }
  }

  function remove(id, title) {
    deleteBook(id, title);
  }

  return {
    init,
    render,
    returnFirst,
    remove
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  CampusLibrary.init();
});

