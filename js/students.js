/**
 * SMART CAMPUS MANAGEMENT SYSTEM - STUDENT MANAGEMENT MODULE
 * Student CRUD, Multi-Filters (Dept, Year, Sec), Search, Modal Handlers
 */

const CampusStudents = (function () {
  let editStudentId = null;

  function init() {
    bindEvents();
    render();
  }

  function bindEvents() {
    // Add Student Modal Trigger
    const addBtn = document.getElementById('open-add-student-modal-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        openStudentModal();
      });
    }

    // Form Submission (Add or Edit)
    const form = document.getElementById('student-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveStudent();
      });
    }

    // Filters and Search
    const searchInput = document.getElementById('student-search-input');
    const deptFilter = document.getElementById('student-dept-filter');
    const yearFilter = document.getElementById('student-year-filter');
    const secFilter = document.getElementById('student-section-filter');
    const resetBtn = document.getElementById('reset-student-filters-btn');

    if (searchInput) searchInput.addEventListener('input', render);
    if (deptFilter) deptFilter.addEventListener('change', render);
    if (yearFilter) yearFilter.addEventListener('change', render);
    if (secFilter) secFilter.addEventListener('change', render);

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (deptFilter) deptFilter.value = '';
        if (yearFilter) yearFilter.value = '';
        if (secFilter) secFilter.value = '';
        render();
      });
    }

    // Export CSV
    const exportBtn = document.getElementById('export-students-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportCSV);
    }
  }

  function openStudentModal(student = null) {
    const modalTitle = document.getElementById('student-modal-title');
    const regInput = document.getElementById('sf-reg');
    const nameInput = document.getElementById('sf-name');
    const emailInput = document.getElementById('sf-email');
    const phoneInput = document.getElementById('sf-phone');
    const deptSelect = document.getElementById('sf-dept');
    const yearSelect = document.getElementById('sf-year');
    const secSelect = document.getElementById('sf-section');
    const idInput = document.getElementById('student-form-id');

    if (student) {
      editStudentId = student.id;
      if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-user-pen" style="color: var(--secondary);"></i><span>Edit Student Record</span>';
      if (idInput) idInput.value = student.id;
      if (regInput) regInput.value = student.regNo;
      if (nameInput) nameInput.value = student.name;
      if (emailInput) emailInput.value = student.email;
      if (phoneInput) phoneInput.value = student.phone;
      if (deptSelect) deptSelect.value = student.department;
      if (yearSelect) yearSelect.value = student.year;
      if (secSelect) secSelect.value = student.section;
    } else {
      editStudentId = null;
      if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-user-plus" style="color: var(--secondary);"></i><span>Add New Student</span>';
      if (idInput) idInput.value = '';
      if (regInput) {
        // Auto-generate realistic Next Reg No
        const data = CampusStore.get();
        const nextNum = (data.students.length + 1).toString().padStart(3, '0');
        regInput.value = `REG2024CS${nextNum}`;
      }
      if (nameInput) nameInput.value = '';
      if (emailInput) emailInput.value = '';
      if (phoneInput) phoneInput.value = '';
      if (deptSelect) deptSelect.value = 'Computer Science';
      if (yearSelect) yearSelect.value = '1st Year';
      if (secSelect) secSelect.value = 'A';
    }

    CampusApp.openModal('student-modal');
  }

  function saveStudent() {
    const regNo = document.getElementById('sf-reg').value.trim();
    const name = document.getElementById('sf-name').value.trim();
    const email = document.getElementById('sf-email').value.trim();
    const phone = document.getElementById('sf-phone').value.trim();
    const department = document.getElementById('sf-dept').value;
    const year = document.getElementById('sf-year').value;
    const section = document.getElementById('sf-section').value;

    if (!regNo || !name || !email) {
      CampusApp.showToast('Validation Error', 'Register Number, Full Name and Email are required.', 'danger');
      return;
    }

    const data = CampusStore.get();

    if (editStudentId) {
      // Update
      const index = data.students.findIndex(s => s.id === editStudentId);
      if (index !== -1) {
        data.students[index] = {
          ...data.students[index],
          regNo,
          name,
          email,
          phone,
          department,
          year,
          section
        };
        CampusApp.showToast('Student Updated', `${name}'s profile has been updated.`, 'success');
      }
    } else {
      // Create new
      const newStudent = {
        id: Date.now(),
        regNo,
        name,
        email,
        phone,
        department,
        year,
        section,
        status: 'Active',
        gpa: 3.5,
        attendanceRate: 90
      };
      data.students.unshift(newStudent);
      CampusApp.showToast('Student Added', `${name} successfully enrolled in ${department}.`, 'success');
    }

    CampusStore.save(data);
    CampusApp.closeModal('student-modal');
    CampusApp.updateSidebarCounts();
    render();
  }

  function deleteStudent(id, name) {
    CampusApp.confirmDialog(
      'Delete Student Record',
      `Are you sure you want to permanently remove student "${name}" from the campus directory? All associated attendance and academic records will be archived.`,
      () => {
        const data = CampusStore.get();
        data.students = data.students.filter(s => s.id !== id);
        CampusStore.save(data);
        CampusApp.updateSidebarCounts();
        CampusApp.showToast('Student Deleted', `${name} has been removed.`, 'warning');
        render();
      },
      'Delete Student',
      true
    );
  }

  function render() {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    const data = CampusStore.get();
    let students = data.students || [];

    // Filter controls
    const q = (document.getElementById('student-search-input')?.value || '').toLowerCase().trim();
    const dept = document.getElementById('student-dept-filter')?.value || '';
    const year = document.getElementById('student-year-filter')?.value || '';
    const sec = document.getElementById('student-section-filter')?.value || '';

    if (q) {
      students = students.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.regNo.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }
    if (dept) {
      students = students.filter(s => s.department === dept);
    }
    if (year) {
      students = students.filter(s => s.year === year);
    }
    if (sec) {
      students = students.filter(s => s.section === sec);
    }

    if (students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
            <i class="fa-solid fa-user-slash" style="font-size: 2rem; margin-bottom: 10px; color: var(--text-light); display: block;"></i>
            No student records matching current filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = students.map(student => `
      <tr>
        <td>
          <span style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--secondary); font-size: 0.85rem;">
            ${student.regNo}
          </span>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--primary);">${student.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">GPA: ${student.gpa ? student.gpa.toFixed(2) : '3.50'}</div>
        </td>
        <td>${student.email}</td>
        <td>
          <span style="font-weight: 600;">${student.department}</span>
        </td>
        <td>
          <span class="status-pill info">${student.year} - Sec ${student.section}</span>
        </td>
        <td style="font-family: 'JetBrains Mono', monospace; font-size: 0.82rem;">${student.phone}</td>
        <td>
          <span class="status-pill success">${student.status || 'Active'}</span>
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 6px;">
            <button class="btn btn-secondary btn-icon-only" onclick="CampusStudents.edit(${student.id})" title="Edit Student">
              <i class="fa-solid fa-pen-to-square" style="color: var(--secondary);"></i>
            </button>
            <button class="btn btn-secondary btn-icon-only" onclick="CampusStudents.remove(${student.id}, '${student.name.replace(/'/g, "\\'")}')" title="Delete Student">
              <i class="fa-regular fa-trash-can" style="color: var(--danger);"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function edit(id) {
    const data = CampusStore.get();
    const student = data.students.find(s => s.id === id);
    if (student) {
      openStudentModal(student);
    }
  }

  function remove(id, name) {
    deleteStudent(id, name);
  }

  function exportCSV() {
    const data = CampusStore.get();
    const students = data.students || [];

    if (students.length === 0) {
      CampusApp.showToast('Export Notice', 'No student records to export.', 'warning');
      return;
    }

    const headers = ['Register Number', 'Full Name', 'Email', 'Department', 'Year', 'Section', 'Phone', 'GPA', 'Attendance'];
    const rows = students.map(s => [
      `"${s.regNo}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.department}"`,
      `"${s.year}"`,
      `"${s.section}"`,
      `"${s.phone}"`,
      s.gpa || 3.5,
      `${s.attendanceRate || 90}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Students_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    CampusApp.showToast('Export Completed', 'Student directory downloaded as CSV.', 'success');
  }

  return {
    init,
    render,
    edit,
    remove
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  CampusStudents.init();
});

