/**
 * SMART CAMPUS MANAGEMENT SYSTEM - FACULTY MANAGEMENT MODULE
 * Faculty Directory, Subject Assignments, Add/Edit Modals, Department Filtering
 */

const CampusFaculty = (function () {
  let editFacultyId = null;

  function init() {
    bindEvents();
    render();
  }

  function bindEvents() {
    const addBtn = document.getElementById('open-add-faculty-modal-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        openFacultyModal();
      });
    }

    const form = document.getElementById('faculty-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveFaculty();
      });
    }

    const searchInput = document.getElementById('faculty-search-input');
    const deptFilter = document.getElementById('faculty-dept-filter');
    const resetBtn = document.getElementById('reset-faculty-filters-btn');

    if (searchInput) searchInput.addEventListener('input', render);
    if (deptFilter) deptFilter.addEventListener('change', render);

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (deptFilter) deptFilter.value = '';
        render();
      });
    }
  }

  function openFacultyModal(faculty = null) {
    const title = document.getElementById('faculty-modal-title');
    const idInput = document.getElementById('ff-id');
    const nameInput = document.getElementById('ff-name');
    const emailInput = document.getElementById('ff-email');
    const deptSelect = document.getElementById('ff-dept');
    const desigInput = document.getElementById('ff-designation');
    const subjInput = document.getElementById('ff-subjects');
    const hiddenId = document.getElementById('faculty-form-id');

    if (faculty) {
      editFacultyId = faculty.id;
      if (title) title.innerHTML = '<i class="fa-solid fa-user-pen" style="color: var(--secondary);"></i><span>Edit Faculty Member</span>';
      if (hiddenId) hiddenId.value = faculty.id;
      if (idInput) idInput.value = faculty.facultyId;
      if (nameInput) nameInput.value = faculty.name;
      if (emailInput) emailInput.value = faculty.email;
      if (deptSelect) deptSelect.value = faculty.department;
      if (desigInput) desigInput.value = faculty.designation || 'Professor';
      if (subjInput) subjInput.value = Array.isArray(faculty.subjects) ? faculty.subjects.join(', ') : faculty.subjects;
    } else {
      editFacultyId = null;
      if (title) title.innerHTML = '<i class="fa-solid fa-user-plus" style="color: var(--secondary);"></i><span>Add Faculty Member</span>';
      if (hiddenId) hiddenId.value = '';
      if (idInput) {
        const data = CampusStore.get();
        idInput.value = `FAC-10${(data.faculty.length + 1).toString().padStart(2, '0')}`;
      }
      if (nameInput) nameInput.value = '';
      if (emailInput) emailInput.value = '';
      if (deptSelect) deptSelect.value = 'Computer Science';
      if (desigInput) desigInput.value = 'Associate Professor';
      if (subjInput) subjInput.value = '';
    }

    CampusApp.openModal('faculty-modal');
  }

  function saveFaculty() {
    const facultyId = document.getElementById('ff-id').value.trim();
    const name = document.getElementById('ff-name').value.trim();
    const email = document.getElementById('ff-email').value.trim();
    const department = document.getElementById('ff-dept').value;
    const designation = document.getElementById('ff-designation').value.trim();
    const subjectsStr = document.getElementById('ff-subjects').value.trim();

    if (!facultyId || !name || !email) {
      CampusApp.showToast('Validation Error', 'Faculty ID, Name, and Email are required.', 'danger');
      return;
    }

    const subjects = subjectsStr.split(',').map(s => s.trim()).filter(Boolean);

    const data = CampusStore.get();

    if (editFacultyId) {
      const idx = data.faculty.findIndex(f => f.id === editFacultyId);
      if (idx !== -1) {
        data.faculty[idx] = {
          ...data.faculty[idx],
          facultyId,
          name,
          email,
          department,
          designation,
          subjects
        };
        CampusApp.showToast('Faculty Updated', `${name}'s profile has been updated.`, 'success');
      }
    } else {
      const newFaculty = {
        id: Date.now(),
        facultyId,
        name,
        email,
        department,
        designation,
        subjects,
        phone: '+1 (555) 012-34' + Math.floor(10 + Math.random() * 89)
      };
      data.faculty.push(newFaculty);
      CampusApp.showToast('Faculty Added', `${name} joined ${department}.`, 'success');
    }

    CampusStore.save(data);
    CampusApp.closeModal('faculty-modal');
    CampusApp.updateSidebarCounts();
    render();
  }

  function deleteFaculty(id, name) {
    CampusApp.confirmDialog(
      'Remove Faculty Member',
      `Are you sure you want to remove ${name} from the active faculty register? Assigned courses must be reassigned.`,
      () => {
        const data = CampusStore.get();
        data.faculty = data.faculty.filter(f => f.id !== id);
        CampusStore.save(data);
        CampusApp.updateSidebarCounts();
        CampusApp.showToast('Faculty Removed', `${name} has been removed.`, 'warning');
        render();
      },
      'Remove Faculty',
      true
    );
  }

  function render() {
    const tbody = document.getElementById('faculty-table-body');
    if (!tbody) return;

    const data = CampusStore.get();
    let faculty = data.faculty || [];

    const q = (document.getElementById('faculty-search-input')?.value || '').toLowerCase().trim();
    const dept = document.getElementById('faculty-dept-filter')?.value || '';

    if (q) {
      faculty = faculty.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.facultyId.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q)
      );
    }

    if (dept) {
      faculty = faculty.filter(f => f.department === dept);
    }

    if (faculty.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
            <i class="fa-solid fa-chalkboard-user" style="font-size: 2rem; margin-bottom: 10px; color: var(--text-light); display: block;"></i>
            No faculty records found.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = faculty.map(f => `
      <tr>
        <td>
          <span style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--secondary);">
            ${f.facultyId}
          </span>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--primary);">${f.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${f.phone || ''}</div>
        </td>
        <td>${f.email}</td>
        <td>
          <span style="font-weight: 600;">${f.department}</span>
        </td>
        <td>
          <span class="status-pill info">${f.designation || 'Professor'}</span>
        </td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${(f.subjects || []).map(s => `
              <span style="background: var(--bg-app); border: 1px solid var(--border-color); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; color: var(--text-main);">
                ${s}
              </span>
            `).join('')}
          </div>
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 6px;">
            <button class="btn btn-secondary btn-icon-only" onclick="CampusFaculty.edit(${f.id})" title="Edit Faculty">
              <i class="fa-solid fa-pen-to-square" style="color: var(--secondary);"></i>
            </button>
            <button class="btn btn-secondary btn-icon-only" onclick="CampusFaculty.remove(${f.id}, '${f.name.replace(/'/g, "\\'")}')" title="Delete Faculty">
              <i class="fa-regular fa-trash-can" style="color: var(--danger);"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function edit(id) {
    const data = CampusStore.get();
    const f = data.faculty.find(item => item.id === id);
    if (f) openFacultyModal(f);
  }

  function remove(id, name) {
    deleteFaculty(id, name);
  }

  return {
    init,
    render,
    edit,
    remove
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  CampusFaculty.init();
});

