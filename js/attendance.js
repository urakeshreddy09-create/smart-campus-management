/**
 * SMART CAMPUS MANAGEMENT SYSTEM - ATTENDANCE MANAGEMENT MODULE
 * Session Selector, Interactive P/A/L Marking, Auto Calculations, LocalStorage Logs, CSV Export
 */

const CampusAttendance = (function () {
  let activeAttendanceState = {}; // map of regNo -> 'present' | 'absent' | 'late'

  function init() {
    bindSelectors();
    bindActions();
    populateSubjects();
    loadSession();
  }

  function bindSelectors() {
    const deptSelect = document.getElementById('att-select-dept');
    const yearSelect = document.getElementById('att-select-year');
    const secSelect = document.getElementById('att-select-section');
    const subjSelect = document.getElementById('att-select-subject');
    const dateInput = document.getElementById('att-select-date');

    // Default to today's date
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    if (deptSelect) {
      deptSelect.addEventListener('change', () => {
        populateSubjects();
        loadSession();
      });
    }
    if (yearSelect) yearSelect.addEventListener('change', loadSession);
    if (secSelect) secSelect.addEventListener('change', loadSession);
    if (subjSelect) subjSelect.addEventListener('change', loadSession);
    if (dateInput) dateInput.addEventListener('change', loadSession);
  }

  function bindActions() {
    const markAllBtn = document.getElementById('btn-mark-all-present');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        markAllPresent();
      });
    }

    const saveBtn = document.getElementById('btn-save-attendance');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        saveSession();
      });
    }

    const exportBtn = document.getElementById('btn-export-attendance');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        exportAttendanceCSV();
      });
    }
  }

  function populateSubjects() {
    const dept = document.getElementById('att-select-dept')?.value || 'Computer Science';
    const subjSelect = document.getElementById('att-select-subject');
    if (!subjSelect) return;

    const data = CampusStore.get();
    const courses = (data.courses || []).filter(c => c.department === dept);

    if (courses.length === 0) {
      subjSelect.innerHTML = '<option value="General Engineering">General Engineering</option>';
      return;
    }

    subjSelect.innerHTML = courses.map(c => `
      <option value="${c.name}">${c.code}: ${c.name}</option>
    `).join('');
  }

  function loadSession() {
    const dept = document.getElementById('att-select-dept')?.value || 'Computer Science';
    const year = document.getElementById('att-select-year')?.value || '3rd Year';
    const sec = document.getElementById('att-select-section')?.value || 'A';
    const date = document.getElementById('att-select-date')?.value || new Date().toISOString().split('T')[0];
    const subj = document.getElementById('att-select-subject')?.value || 'Data Structures & Algorithms';

    const data = CampusStore.get();

    // Check if there is an existing session in storage for this exact combo
    const sessions = data.attendanceSessions || [];
    const found = sessions.find(s =>
      s.department === dept &&
      s.year === year &&
      s.section === sec &&
      s.date === date &&
      s.subject === subj
    );

    // Filter students belonging to this department, year, and section
    let classStudents = data.students.filter(s =>
      s.department === dept &&
      s.year === year &&
      s.section === sec
    );

    // If no students match exact year/section, show department students so UI is always interactive!
    if (classStudents.length === 0) {
      classStudents = data.students.filter(s => s.department === dept);
    }
    if (classStudents.length === 0) {
      classStudents = data.students.slice(0, 6);
    }

    activeAttendanceState = {};

    classStudents.forEach(st => {
      if (found && found.records && found.records[st.regNo]) {
        activeAttendanceState[st.regNo] = found.records[st.regNo];
      } else {
        // Default to present
        activeAttendanceState[st.regNo] = 'present';
      }
    });

    renderClassList(classStudents);
    updateMetrics(classStudents);
  }

  function renderClassList(students) {
    const tbody = document.getElementById('attendance-sheet-body');
    if (!tbody) return;

    if (students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted);">
            No students registered in this batch.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = students.map(st => {
      const currentStatus = activeAttendanceState[st.regNo] || 'present';
      return `
        <tr>
          <td>
            <span style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--secondary);">
              ${st.regNo}
            </span>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--primary);">${st.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${st.email}</div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="flex: 1; max-width: 80px; height: 6px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
                <div style="width: ${st.attendanceRate || 92}%; height: 100%; background: ${(st.attendanceRate || 92) >= 75 ? 'var(--success)' : 'var(--danger)'};"></div>
              </div>
              <span style="font-size: 0.8rem; font-weight: 700; color: ${(st.attendanceRate || 92) >= 75 ? 'var(--success)' : 'var(--danger)'};">
                ${st.attendanceRate || 92}%
              </span>
            </div>
          </td>
          <td>
            <div class="att-radio-group">
              <button type="button" class="att-radio-btn p ${currentStatus === 'present' ? 'active' : ''}" onclick="CampusAttendance.setStatus('${st.regNo}', 'present')">P</button>
              <button type="button" class="att-radio-btn a ${currentStatus === 'absent' ? 'active' : ''}" onclick="CampusAttendance.setStatus('${st.regNo}', 'absent')">A</button>
              <button type="button" class="att-radio-btn l ${currentStatus === 'late' ? 'active' : ''}" onclick="CampusAttendance.setStatus('${st.regNo}', 'late')">L</button>
            </div>
          </td>
          <td>
            <input type="text" class="form-control" placeholder="Optional remark (e.g. medical slip)" style="padding: 6px 10px; font-size: 0.82rem; max-width: 260px;" id="remark-${st.regNo}">
          </td>
        </tr>
      `;
    }).join('');
  }

  function setStatus(regNo, status) {
    activeAttendanceState[regNo] = status;
    const data = CampusStore.get();
    const students = data.students.filter(s => activeAttendanceState.hasOwnProperty(s.regNo));
    renderClassList(students);
    updateMetrics(students);
  }

  function markAllPresent() {
    Object.keys(activeAttendanceState).forEach(k => {
      activeAttendanceState[k] = 'present';
    });
    const data = CampusStore.get();
    const students = data.students.filter(s => activeAttendanceState.hasOwnProperty(s.regNo));
    renderClassList(students);
    updateMetrics(students);
    CampusApp.showToast('Roll Call Updated', 'All students marked as Present.', 'info');
  }

  function updateMetrics(students) {
    const total = students.length;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    Object.values(activeAttendanceState).forEach(st => {
      if (st === 'present') presentCount++;
      else if (st === 'absent') absentCount++;
      else if (st === 'late') lateCount++;
    });

    const pct = total > 0 ? Math.round(((presentCount + lateCount * 0.5) / total) * 100) : 0;

    const elTotal = document.getElementById('att-metric-total');
    const elP = document.getElementById('att-metric-present');
    const elA = document.getElementById('att-metric-absent');
    const elL = document.getElementById('att-metric-late');
    const elPct = document.getElementById('att-metric-pct');

    if (elTotal) elTotal.textContent = total;
    if (elP) elP.textContent = presentCount;
    if (elA) elA.textContent = absentCount;
    if (elL) elL.textContent = lateCount;
    if (elPct) elPct.textContent = `${pct}%`;
  }

  function saveSession() {
    const dept = document.getElementById('att-select-dept')?.value || 'Computer Science';
    const year = document.getElementById('att-select-year')?.value || '3rd Year';
    const sec = document.getElementById('att-select-section')?.value || 'A';
    const date = document.getElementById('att-select-date')?.value || new Date().toISOString().split('T')[0];
    const subj = document.getElementById('att-select-subject')?.value || 'General';

    const data = CampusStore.get();
    if (!data.attendanceSessions) data.attendanceSessions = [];

    // Find and update or create
    const existingIdx = data.attendanceSessions.findIndex(s =>
      s.department === dept &&
      s.year === year &&
      s.section === sec &&
      s.date === date &&
      s.subject === subj
    );

    const sessionObj = {
      id: Date.now(),
      date,
      department: dept,
      year,
      section: sec,
      subject: subj,
      records: { ...activeAttendanceState },
      savedAt: new Date().toLocaleTimeString()
    };

    if (existingIdx !== -1) {
      data.attendanceSessions[existingIdx] = sessionObj;
    } else {
      data.attendanceSessions.push(sessionObj);
    }

    // Log recent activity
    if (!data.activities) data.activities = [];
    const user = CampusApp.getCurrentUser() || { name: 'Faculty' };
    data.activities.unshift({
      id: Date.now(),
      user: user.name,
      action: `Saved Attendance for ${subj} (${dept})`,
      time: 'Just now',
      icon: 'fa-clipboard-user'
    });

    CampusStore.save(data);
    CampusApp.showToast('Attendance Recorded', `Class session for ${subj} saved to campus database.`, 'success');
  }

  function exportAttendanceCSV() {
    const dept = document.getElementById('att-select-dept')?.value || 'Computer Science';
    const date = document.getElementById('att-select-date')?.value || new Date().toISOString().split('T')[0];
    const subj = document.getElementById('att-select-subject')?.value || 'Subject';

    const data = CampusStore.get();
    const students = data.students.filter(s => activeAttendanceState.hasOwnProperty(s.regNo));

    if (students.length === 0) {
      CampusApp.showToast('Export Notice', 'No attendance records available for download.', 'warning');
      return;
    }

    const headers = ['Register Number', 'Student Name', 'Department', 'Date', 'Subject', 'Status'];
    const rows = students.map(s => [
      `"${s.regNo}"`,
      `"${s.name}"`,
      `"${s.department}"`,
      `"${date}"`,
      `"${subj}"`,
      `"${(activeAttendanceState[s.regNo] || 'present').toUpperCase()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${subj.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    CampusApp.showToast('Report Exported', 'Session attendance report downloaded as CSV.', 'success');
  }

  function render() {
    loadSession();
  }

  return {
    init,
    render,
    setStatus
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  CampusAttendance.init();
});

