/**
 * SMART CAMPUS MANAGEMENT SYSTEM - ASSIGNMENT MANAGEMENT MODULE
 * Assignment Creation, Student Submissions, Submission Status Tracking, Grading
 */

const CampusAssignments = (function () {
  let activeAssignmentId = null;

  function init() {
    bindActions();
    render();
  }

  function bindActions() {
    const createBtn = document.getElementById('open-create-assignment-modal-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        CampusApp.openModal('assignment-modal');
      });
    }

    const createForm = document.getElementById('assignment-form');
    if (createForm) {
      createForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveNewAssignment();
      });
    }

    const submitForm = document.getElementById('submit-assignment-form');
    if (submitForm) {
      submitForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveStudentSubmission();
      });
    }
  }

  function saveNewAssignment() {
    const title = document.getElementById('asg-title').value.trim();
    const subject = document.getElementById('asg-subject').value.trim();
    const dueDate = document.getElementById('asg-due').value;
    const desc = document.getElementById('asg-desc').value.trim();

    if (!title || !subject || !dueDate || !desc) {
      CampusApp.showToast('Validation Error', 'All fields are mandatory.', 'danger');
      return;
    }

    const data = CampusStore.get();
    const newAssignment = {
      id: Date.now(),
      title,
      subject,
      department: 'Computer Science',
      dueDate,
      description: desc,
      maxMarks: 100,
      submissions: []
    };

    data.assignments.unshift(newAssignment);
    CampusStore.save(data);

    CampusApp.closeModal('assignment-modal');
    CampusApp.showToast('Assignment Published', `"${title}" has been created for students.`, 'success');

    // Reset form
    document.getElementById('assignment-form').reset();
    render();
  }

  function openSubmitModal(asgId) {
    activeAssignmentId = asgId;
    const data = CampusStore.get();
    const asg = data.assignments.find(a => a.id === asgId);
    if (!asg) return;

    const modalTitle = document.getElementById('sub-modal-title');
    if (modalTitle) modalTitle.textContent = `Submit: ${asg.title}`;

    const textInput = document.getElementById('sub-text');
    if (textInput) textInput.value = '';

    CampusApp.openModal('submit-assignment-modal');
  }

  function saveStudentSubmission() {
    if (!activeAssignmentId) return;

    const notes = document.getElementById('sub-text').value.trim();
    if (!notes) {
      CampusApp.showToast('Missing Input', 'Please provide your solution notes or repo link.', 'danger');
      return;
    }

    const data = CampusStore.get();
    const asg = data.assignments.find(a => a.id === activeAssignmentId);
    if (!asg) return;

    const user = CampusApp.getCurrentUser() || { name: 'Alex Morgan', regNo: 'REG2024CS001' };

    // Check if student already submitted
    const existingIdx = asg.submissions.findIndex(s => s.regNo === (user.regNo || 'REG2024CS001'));

    const submissionEntry = {
      studentId: Date.now(),
      studentName: user.name,
      regNo: user.regNo || 'REG2024CS001',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      text: notes,
      status: 'Submitted',
      marks: null,
      feedback: 'Pending Faculty Review'
    };

    if (existingIdx !== -1) {
      asg.submissions[existingIdx] = submissionEntry;
    } else {
      asg.submissions.push(submissionEntry);
    }

    CampusStore.save(data);
    CampusApp.closeModal('submit-assignment-modal');
    CampusApp.showToast('Work Submitted!', `Your assignment submission for "${asg.title}" was logged.`, 'success');
    render();
  }

  function gradeSubmission(asgId, regNo) {
    const data = CampusStore.get();
    const asg = data.assignments.find(a => a.id === asgId);
    if (!asg) return;

    const sub = asg.submissions.find(s => s.regNo === regNo);
    if (!sub) return;

    const marks = prompt(`Enter marks for ${sub.studentName} (Out of ${asg.maxMarks}):`, sub.marks || 90);
    if (marks === null) return;

    const parsed = parseInt(marks, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > asg.maxMarks) {
      CampusApp.showToast('Invalid Marks', `Marks must be between 0 and ${asg.maxMarks}`, 'danger');
      return;
    }

    sub.marks = parsed;
    sub.status = 'Graded';
    sub.feedback = 'Graded by Course Instructor';

    CampusStore.save(data);
    CampusApp.showToast('Grade Saved', `${sub.studentName} scored ${parsed}/${asg.maxMarks}`, 'success');
    render();
  }

  function deleteAssignment(id, title) {
    CampusApp.confirmDialog(
      'Delete Assignment',
      `Are you sure you want to remove assignment "${title}"? All submitted files will be permanently erased.`,
      () => {
        const data = CampusStore.get();
        data.assignments = data.assignments.filter(a => a.id !== id);
        CampusStore.save(data);
        CampusApp.showToast('Assignment Deleted', 'Assignment removed.', 'warning');
        render();
      },
      'Delete Assignment',
      true
    );
  }

  function render() {
    const grid = document.getElementById('assignments-cards-grid');
    if (!grid) return;

    const data = CampusStore.get();
    const user = CampusApp.getCurrentUser() || { role: 'admin', regNo: 'REG2024CS001' };
    const list = data.assignments || [];

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <i class="fa-solid fa-file-circle-check" style="font-size: 2.2rem; color: var(--text-light); margin-bottom: 12px; display: block;"></i>
          No assignments active right now.
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(asg => {
      const studentSub = asg.submissions.find(s => s.regNo === (user.regNo || 'REG2024CS001'));
      const isPastDue = new Date(asg.dueDate) < new Date();

      let studentStatusHtml = '';
      if (user.role === 'student') {
        if (studentSub) {
          studentStatusHtml = `
            <div style="margin-top: 12px; padding: 10px; background: var(--bg-app); border-radius: var(--radius-md); font-size: 0.8rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 700; color: var(--primary);">My Submission:</span>
                <span class="status-pill ${studentSub.status === 'Graded' ? 'success' : 'info'}">${studentSub.status}</span>
              </div>
              <div style="color: var(--text-muted); word-break: break-all;">${studentSub.text}</div>
              ${studentSub.marks !== null ? `<div style="font-weight: 700; color: var(--success); margin-top: 4px;">Grade: ${studentSub.marks} / ${asg.maxMarks}</div>` : ''}
            </div>
          `;
        } else {
          studentStatusHtml = `
            <div style="margin-top: 12px; padding: 8px 10px; background: var(--warning-bg); border-radius: var(--radius-sm); font-size: 0.8rem; color: var(--warning); font-weight: 600;">
              <i class="fa-solid fa-clock"></i> Submission Pending
            </div>
          `;
        }
      }

      // Submissions table for faculty / admin
      let facultySubmissionsHtml = '';
      if (user.role !== 'student') {
        facultySubmissionsHtml = `
          <div style="margin-top: 16px; border-top: 1px solid var(--border-light); padding-top: 12px;">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary); margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span>Submissions (${asg.submissions.length})</span>
              <span style="color: var(--text-muted); font-size: 0.75rem;">Max ${asg.maxMarks} Marks</span>
            </div>
            ${asg.submissions.length === 0 ? '<div style="font-size: 0.75rem; color: var(--text-light);">No student submissions yet.</div>' : `
              <div style="max-height: 120px; overflow-y: auto;">
                ${asg.submissions.map(sub => `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed var(--border-light); font-size: 0.78rem;">
                    <div>
                      <span style="font-weight: 700; color: var(--primary);">${sub.studentName}</span>
                      <span style="color: var(--text-light); font-size: 0.7rem;">(${sub.regNo})</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span class="status-pill ${sub.status === 'Graded' ? 'success' : 'info'}">${sub.status}${sub.marks !== null ? `: ${sub.marks}` : ''}</span>
                      <button class="btn btn-sm btn-secondary" style="padding: 2px 6px; font-size: 0.7rem;" onclick="CampusAssignments.grade(${asg.id}, '${sub.regNo}')">Grade</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        `;
      }

      return `
        <div class="content-card">
          <div>
            <div class="card-badge-row">
              <span class="status-pill info">${asg.subject}</span>
              <span style="font-size: 0.75rem; color: ${isPastDue ? 'var(--danger)' : 'var(--text-muted)'}; font-weight: 600;">
                <i class="fa-regular fa-calendar"></i> Due: ${asg.dueDate}
              </span>
            </div>
            <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--primary); margin-bottom: 8px;">
              ${asg.title}
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px;">
              ${asg.description}
            </p>
            ${studentStatusHtml}
            ${facultySubmissionsHtml}
          </div>

          <div style="margin-top: 18px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-light); padding-top: 14px;">
            ${user.role === 'student' ? `
              <button class="btn btn-primary btn-sm" onclick="CampusAssignments.openSubmitModal(${asg.id})">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <span>${studentSub ? 'Update Solution' : 'Submit Solution'}</span>
              </button>
            ` : `
              <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">
                <i class="fa-solid fa-users"></i> ${asg.submissions.length} Turn-ins
              </span>
              <button class="btn btn-secondary btn-icon-only" onclick="CampusAssignments.remove(${asg.id}, '${asg.title.replace(/'/g, "\\'")}')" title="Delete Assignment">
                <i class="fa-regular fa-trash-can" style="color: var(--danger);"></i>
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  function grade(asgId, regNo) {
    gradeSubmission(asgId, regNo);
  }

  function remove(id, title) {
    deleteAssignment(id, title);
  }

  return {
    init,
    render,
    openSubmitModal,
    grade,
    remove
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  CampusAssignments.init();
});

