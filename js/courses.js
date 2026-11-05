/**
 * SMART CAMPUS MANAGEMENT SYSTEM - COURSE MANAGEMENT MODULE
 * Course Directory, Syllabus Info, Faculty Assignment, Credits, Department & Semester Filtering
 */

const CampusCourses = (function () {
  let editCourseId = null;

  function init() {
    bindEvents();
    render();
  }

  function bindEvents() {
    const addBtn = document.getElementById('open-add-course-modal-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        openCourseModal();
      });
    }

    const form = document.getElementById('course-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveCourse();
      });
    }

    const searchInput = document.getElementById('course-search-input');
    const deptFilter = document.getElementById('course-dept-filter');
    const semFilter = document.getElementById('course-sem-filter');

    if (searchInput) searchInput.addEventListener('input', render);
    if (deptFilter) deptFilter.addEventListener('change', render);
    if (semFilter) semFilter.addEventListener('change', render);
  }

  function populateFacultyDropdown(selectedName = '') {
    const facultySelect = document.getElementById('cf-faculty');
    if (!facultySelect) return;

    const data = CampusStore.get();
    const facultyList = data.faculty || [];

    facultySelect.innerHTML = facultyList.map(f => `
      <option value="${f.name}" ${f.name === selectedName ? 'selected' : ''}>${f.name} (${f.department})</option>
    `).join('');
  }

  function openCourseModal(course = null) {
    const title = document.getElementById('course-modal-title');
    const codeInput = document.getElementById('cf-code');
    const nameInput = document.getElementById('cf-name');
    const deptSelect = document.getElementById('cf-dept');
    const semSelect = document.getElementById('cf-semester');
    const creditsInput = document.getElementById('cf-credits');
    const hiddenId = document.getElementById('course-form-id');

    if (course) {
      editCourseId = course.id;
      if (title) title.innerHTML = '<i class="fa-solid fa-pen-to-square" style="color: var(--secondary);"></i><span>Edit Course Details</span>';
      if (hiddenId) hiddenId.value = course.id;
      if (codeInput) codeInput.value = course.code;
      if (nameInput) nameInput.value = course.name;
      if (deptSelect) deptSelect.value = course.department;
      if (semSelect) semSelect.value = course.semester;
      if (creditsInput) creditsInput.value = course.credits || 4;
      populateFacultyDropdown(course.facultyName);
    } else {
      editCourseId = null;
      if (title) title.innerHTML = '<i class="fa-solid fa-book-open" style="color: var(--secondary);"></i><span>Add New Course</span>';
      if (hiddenId) hiddenId.value = '';
      if (codeInput) codeInput.value = 'CS' + Math.floor(100 + Math.random() * 899);
      if (nameInput) nameInput.value = '';
      if (deptSelect) deptSelect.value = 'Computer Science';
      if (semSelect) semSelect.value = 'Semester 3';
      if (creditsInput) creditsInput.value = 4;
      populateFacultyDropdown();
    }

    CampusApp.openModal('course-modal');
  }

  function saveCourse() {
    const code = document.getElementById('cf-code').value.trim();
    const name = document.getElementById('cf-name').value.trim();
    const department = document.getElementById('cf-dept').value;
    const semester = document.getElementById('cf-semester').value;
    const facultyName = document.getElementById('cf-faculty').value;
    const credits = parseInt(document.getElementById('cf-credits').value, 10) || 4;

    if (!code || !name) {
      CampusApp.showToast('Validation Error', 'Course Code and Course Name are required.', 'danger');
      return;
    }

    const data = CampusStore.get();

    if (editCourseId) {
      const idx = data.courses.findIndex(c => c.id === editCourseId);
      if (idx !== -1) {
        data.courses[idx] = {
          ...data.courses[idx],
          code,
          name,
          department,
          semester,
          facultyName,
          credits
        };
        CampusApp.showToast('Course Updated', `${name} details saved.`, 'success');
      }
    } else {
      const newCourse = {
        id: Date.now(),
        code,
        name,
        department,
        semester,
        facultyName,
        credits,
        enrolledCount: Math.floor(60 + Math.random() * 60)
      };
      data.courses.push(newCourse);
      CampusApp.showToast('Course Added', `${name} created under ${department}.`, 'success');
    }

    CampusStore.save(data);
    CampusApp.closeModal('course-modal');
    CampusApp.updateSidebarCounts();
    render();
  }

  function deleteCourse(id, name) {
    CampusApp.confirmDialog(
      'Delete Course',
      `Are you sure you want to delete course "${name}"? Enrolled student registrations will be decoupled.`,
      () => {
        const data = CampusStore.get();
        data.courses = data.courses.filter(c => c.id !== id);
        CampusStore.save(data);
        CampusApp.updateSidebarCounts();
        CampusApp.showToast('Course Deleted', `${name} removed.`, 'warning');
        render();
      },
      'Delete Course',
      true
    );
  }

  function render() {
    const tbody = document.getElementById('courses-table-body');
    if (!tbody) return;

    const data = CampusStore.get();
    let courses = data.courses || [];

    const q = (document.getElementById('course-search-input')?.value || '').toLowerCase().trim();
    const dept = document.getElementById('course-dept-filter')?.value || '';
    const sem = document.getElementById('course-sem-filter')?.value || '';

    if (q) {
      courses = courses.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.facultyName.toLowerCase().includes(q)
      );
    }

    if (dept) {
      courses = courses.filter(c => c.department === dept);
    }

    if (sem) {
      courses = courses.filter(c => c.semester === sem);
    }

    if (courses.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
            <i class="fa-solid fa-book-bookmark" style="font-size: 2rem; margin-bottom: 10px; color: var(--text-light); display: block;"></i>
            No courses found matching selected filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = courses.map(c => `
      <tr>
        <td>
          <span style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--secondary);">
            ${c.code}
          </span>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--primary);">${c.name}</div>
        </td>
        <td>
          <span style="font-weight: 600;">${c.department}</span>
        </td>
        <td>
          <span class="status-pill info">${c.semester}</span>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-chalkboard-user" style="color: var(--text-light);"></i>
            <span>${c.facultyName}</span>
          </div>
        </td>
        <td>
          <span style="font-weight: 700; color: var(--primary);">${c.credits} Credits</span>
        </td>
        <td>
          <span style="color: var(--text-muted);"><i class="fa-solid fa-users"></i> ${c.enrolledCount || 85}</span>
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 6px;">
            <button class="btn btn-secondary btn-icon-only" onclick="CampusCourses.edit(${c.id})" title="Edit Course">
              <i class="fa-solid fa-pen-to-square" style="color: var(--secondary);"></i>
            </button>
            <button class="btn btn-secondary btn-icon-only" onclick="CampusCourses.remove(${c.id}, '${c.name.replace(/'/g, "\\'")}')" title="Delete Course">
              <i class="fa-regular fa-trash-can" style="color: var(--danger);"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function edit(id) {
    const data = CampusStore.get();
    const course = data.courses.find(c => c.id === id);
    if (course) openCourseModal(course);
  }

  function remove(id, name) {
    deleteCourse(id, name);
  }

  return {
    init,
    render,
    edit,
    remove
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  CampusCourses.init();
});

