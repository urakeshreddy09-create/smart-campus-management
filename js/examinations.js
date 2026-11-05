/**
 * SMART CAMPUS MANAGEMENT SYSTEM - EXAMINATION MANAGEMENT MODULE
 * Exam Schedules, Marks Entry, Automatic Grade Calculation (A+, A, B, C, F), GPA, Results
 */

const CampusExaminations = (function () {

  function init() {
    bindActions();
    render();
  }

  function bindActions() {
    const addExamBtn = document.getElementById('open-add-exam-modal-btn');
    if (addExamBtn) {
      addExamBtn.addEventListener('click', () => {
        CampusApp.openModal('exam-modal');
      });
    }

    const examForm = document.getElementById('exam-form');
    if (examForm) {
      examForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveExamSchedule();
      });
    }

    const marksBtn = document.getElementById('open-enter-marks-modal-btn');
    if (marksBtn) {
      marksBtn.addEventListener('click', () => {
        openMarksModal();
      });
    }

    const marksForm = document.getElementById('marks-form');
    if (marksForm) {
      marksForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveStudentMarks();
      });
    }

    // Dynamic grade preview in marks modal
    const marksInput = document.getElementById('mf-marks');
    if (marksInput) {
      marksInput.addEventListener('input', function () {
        const val = parseInt(this.value, 10);
        const preview = document.getElementById('mf-grade-preview');
        if (preview && !isNaN(val)) {
          const calc = calculateGrade(val, 100);
          preview.textContent = `Projected Grade: ${calc.grade} (${calc.percentage}%) - ${calc.status}`;
        }
      });
    }

    const searchResults = document.getElementById('exam-results-search');
    if (searchResults) {
      searchResults.addEventListener('input', renderResultsTable);
    }
  }

  // Pure Grade Calculation Engine
  function calculateGrade(marks, max = 100) {
    const pct = Math.round((marks / max) * 100);
    let grade = 'F';
    let status = 'Fail';
    let gpa = 0.0;

    if (pct >= 90) {
      grade = 'A+';
      status = 'Pass (Distinction)';
      gpa = 4.0;
    } else if (pct >= 80) {
      grade = 'A';
      status = 'Pass (First Class)';
      gpa = 3.7;
    } else if (pct >= 70) {
      grade = 'B';
      status = 'Pass (Second Class)';
      gpa = 3.0;
    } else if (pct >= 60) {
      grade = 'C';
      status = 'Pass';
      gpa = 2.5;
    } else if (pct >= 50) {
      grade = 'D';
      status = 'Pass';
      gpa = 2.0;
    } else {
      grade = 'F';
      status = 'Needs Retake';
      gpa = 0.0;
    }

    return { grade, percentage: pct, status, gpa };
  }

  function saveExamSchedule() {
    const subject = document.getElementById('ex-subject').value.trim();
    const code = document.getElementById('ex-code').value.trim();
    const examDate = document.getElementById('ex-date').value;
    const examTime = document.getElementById('ex-time').value.trim();
    const room = document.getElementById('ex-room').value.trim();
    const maxMarks = parseInt(document.getElementById('ex-max').value, 10) || 100;

    if (!subject || !code || !examDate || !examTime || !room) {
      CampusApp.showToast('Validation Error', 'All examination schedule fields are required.', 'danger');
      return;
    }

    const data = CampusStore.get();
    const newExam = {
      id: Date.now(),
      code,
      subject,
      examDate,
      examTime,
      room,
      maxMarks,
      status: 'Upcoming'
    };

    data.examinations.push(newExam);
    CampusStore.save(data);

    CampusApp.closeModal('exam-modal');
    CampusApp.showToast('Exam Scheduled', `${subject} (${code}) added to university timetable.`, 'success');
    document.getElementById('exam-form').reset();
    renderScheduleTable();
  }

  function openMarksModal() {
    const data = CampusStore.get();
    const studentSelect = document.getElementById('mf-student');
    const subjectSelect = document.getElementById('mf-subject');

    if (studentSelect) {
      studentSelect.innerHTML = (data.students || []).map(s => `
        <option value="${s.regNo}">${s.name} (${s.regNo}) - ${s.department}</option>
      `).join('');
    }

    if (subjectSelect) {
      subjectSelect.innerHTML = (data.courses || []).map(c => `
        <option value="${c.name}">${c.name} (${c.code})</option>
      `).join('');
    }

    const marksInput = document.getElementById('mf-marks');
    if (marksInput) marksInput.value = '';

    const preview = document.getElementById('mf-grade-preview');
    if (preview) preview.textContent = '';

    CampusApp.openModal('marks-modal');
  }

  function saveStudentMarks() {
    const regNo = document.getElementById('mf-student').value;
    const subject = document.getElementById('mf-subject').value;
    const marksObtained = parseInt(document.getElementById('mf-marks').value, 10);
    const maxMarks = 100;

    if (isNaN(marksObtained) || marksObtained < 0 || marksObtained > 100) {
      CampusApp.showToast('Validation Error', 'Marks must be between 0 and 100.', 'danger');
      return;
    }

    const data = CampusStore.get();
    const student = data.students.find(s => s.regNo === regNo);
    const studentName = student ? student.name : 'Student';

    const evalResult = calculateGrade(marksObtained, maxMarks);

    // Check if result already exists for student & subject
    const existingIdx = data.examResults.findIndex(r => r.studentRegNo === regNo && r.subject === subject);

    const record = {
      id: Date.now(),
      studentRegNo: regNo,
      studentName,
      subject,
      marksObtained,
      maxMarks,
      grade: evalResult.grade,
      percentage: evalResult.percentage,
      status: evalResult.status
    };

    if (existingIdx !== -1) {
      data.examResults[existingIdx] = record;
    } else {
      data.examResults.unshift(record);
    }

    CampusStore.save(data);
    CampusApp.closeModal('marks-modal');
    CampusApp.showToast('Marks Recorded', `${studentName} awarded Grade ${evalResult.grade} in ${subject}`, 'success');
    renderResultsTable();
  }

  function deleteSchedule(id) {
    CampusApp.confirmDialog(
      'Cancel Examination',
      'Are you sure you want to remove this examination session from the schedule?',
      () => {
        const data = CampusStore.get();
        data.examinations = data.examinations.filter(e => e.id !== id);
        CampusStore.save(data);
        CampusApp.showToast('Exam Cancelled', 'Examination removed from schedule.', 'warning');
        renderScheduleTable();
      },
      'Cancel Exam',
      true
    );
  }

  function renderScheduleTable() {
    const tbody = document.getElementById('exam-schedules-body');
    if (!tbody) return;

    const data = CampusStore.get();
    const schedules = data.examinations || [];

    if (schedules.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No upcoming examinations configured.</td></tr>';
      return;
    }

    tbody.innerHTML = schedules.map(ex => `
      <tr>
        <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--secondary);">${ex.code}</td>
        <td style="font-weight: 700; color: var(--primary);">${ex.subject}</td>
        <td><i class="fa-regular fa-calendar" style="color: var(--text-light); margin-right: 6px;"></i>${ex.examDate}</td>
        <td><i class="fa-regular fa-clock" style="color: var(--text-light); margin-right: 6px;"></i>${ex.examTime}</td>
        <td><span style="font-weight: 600;">${ex.room}</span></td>
        <td>${ex.maxMarks} Marks</td>
        <td>
          <span class="status-pill info">${ex.status || 'Upcoming'}</span>
        </td>
      </tr>
    `).join('');
  }

  function renderResultsTable() {
    const tbody = document.getElementById('exam-results-body');
    if (!tbody) return;

    const data = CampusStore.get();
    const user = CampusApp.getCurrentUser() || { role: 'admin' };
    let results = data.examResults || [];

    // If student logged in, filter to their results
    if (user.role === 'student' && user.regNo) {
      results = results.filter(r => r.studentRegNo === user.regNo);
    }

    const q = (document.getElementById('exam-results-search')?.value || '').toLowerCase().trim();
    if (q) {
      results = results.filter(r =>
        r.studentName.toLowerCase().includes(q) ||
        r.studentRegNo.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.grade.toLowerCase().includes(q)
      );
    }

    if (results.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">No examination score entries found.</td></tr>';
      return;
    }

    tbody.innerHTML = results.map(r => `
      <tr>
        <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--secondary);">${r.studentRegNo}</td>
        <td style="font-weight: 700; color: var(--primary);">${r.studentName}</td>
        <td>${r.subject}</td>
        <td style="font-weight: 700;">${r.marksObtained}</td>
        <td>${r.maxMarks}</td>
        <td>${r.percentage}%</td>
        <td>
          <span class="status-pill ${r.grade === 'A+' || r.grade === 'A' ? 'success' : r.grade === 'B' ? 'info' : r.grade === 'F' ? 'danger' : 'warning'}" style="font-size: 0.82rem; font-weight: 800;">
            ${r.grade}
          </span>
        </td>
        <td>
          <span style="font-weight: 600; color: ${r.status.includes('Pass') ? 'var(--success)' : 'var(--danger)'};">
            ${r.status}
          </span>
        </td>
      </tr>
    `).join('');
  }

  function render() {
    renderScheduleTable();
    renderResultsTable();
  }

  return {
    init,
    render,
    calculateGrade,
    deleteSchedule
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  CampusExaminations.init();
});

