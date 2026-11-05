/**
 * SMART CAMPUS MANAGEMENT SYSTEM - DASHBOARD MODULE
 * Key Performance Indicators, Chart.js Visualizations, Role Customization, Recent Feeds
 */

const CampusDashboard = (function () {
  let enrollmentChartInstance = null;
  let attendanceChartInstance = null;

  function init() {
    bindActions();
  }

  function bindActions() {
    const refreshBtn = document.getElementById('dash-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        render();
        CampusApp.showToast('Data Synced', 'Dashboard statistics and analytics refreshed.', 'success');
      });
    }

    const quickActionBtn = document.getElementById('dash-quick-action-btn');
    if (quickActionBtn) {
      quickActionBtn.addEventListener('click', () => {
        const user = CampusApp.getCurrentUser();
        if (!user || user.role === 'admin') {
          CampusApp.navigateTo('students');
          CampusApp.openModal('student-modal');
        } else if (user.role === 'faculty') {
          CampusApp.navigateTo('attendance');
        } else {
          CampusApp.navigateTo('assignments');
        }
      });
    }
  }

  function render() {
    const data = CampusStore.get();
    const user = CampusApp.getCurrentUser() || { role: 'admin', name: 'Dr. Robert Sterling' };

    renderRoleHeader(user, data);
    renderKPICards(user, data);
    renderCharts(data);
    renderTodayTimetable(data, user);
    renderRecentAnnouncements(data);
    renderUpcomingEventsAndActivities(data);
  }

  function renderRoleHeader(user, data) {
    const greetingEl = document.getElementById('dash-greeting-title');
    const breadcrumbEl = document.getElementById('dash-breadcrumb-role');
    const quickActionBtn = document.getElementById('dash-quick-action-btn');

    if (!greetingEl) return;

    if (user.role === 'student') {
      greetingEl.textContent = `Welcome back, ${user.name} (${user.regNo || 'REG2024CS001'})`;
      if (breadcrumbEl) breadcrumbEl.textContent = 'Student Portal';
      if (quickActionBtn) quickActionBtn.innerHTML = '<i class="fa-solid fa-file-arrow-up"></i><span>Submit Assignment</span>';
    } else if (user.role === 'faculty') {
      greetingEl.textContent = `Welcome back, ${user.name}`;
      if (breadcrumbEl) breadcrumbEl.textContent = 'Faculty Console';
      if (quickActionBtn) quickActionBtn.innerHTML = '<i class="fa-solid fa-clipboard-user"></i><span>Mark Attendance</span>';
    } else {
      greetingEl.textContent = 'Executive Campus Dashboard';
      if (breadcrumbEl) breadcrumbEl.textContent = 'Admin Overview';
      if (quickActionBtn) quickActionBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i><span>Add Student</span>';
    }
  }

  function renderKPICards(user, data) {
    const elStudents = document.getElementById('kpi-total-students');
    const elFaculty = document.getElementById('kpi-total-faculty');
    const elCourses = document.getElementById('kpi-total-courses');
    const elAttendance = document.getElementById('kpi-today-attendance');

    const totalStudentsCount = (data.students && data.students.length > 0) ? 1240 + data.students.length : 1250;
    const totalFacultyCount = (data.faculty && data.faculty.length > 0) ? 80 + data.faculty.length : 85;
    const totalCoursesCount = (data.courses && data.courses.length > 0) ? 22 + data.courses.length : 32;

    if (user.role === 'student') {
      // Tailor metrics for student
      const studentObj = data.students.find(s => s.regNo === user.regNo) || data.students[0];
      if (elStudents) elStudents.textContent = `${studentObj.gpa.toFixed(2)} GPA`;
      if (elFaculty) elFaculty.textContent = '6 Courses';
      if (elCourses) elCourses.textContent = '2 Pending';
      if (elAttendance) elAttendance.textContent = `${studentObj.attendanceRate}%`;

      // Update labels visually
      updateKpiLabel(0, 'Cumulative GPA', 'Semester 5 Performance');
      updateKpiLabel(1, 'Registered Courses', 'Current Fall Term');
      updateKpiLabel(2, 'Active Assignments', 'Due this week');
      updateKpiLabel(3, 'My Attendance', 'Healthy Threshold (>75%)');
    } else if (user.role === 'faculty') {
      if (elStudents) elStudents.textContent = '184';
      if (elFaculty) elFaculty.textContent = '3 Classes';
      if (elCourses) elCourses.textContent = '4 Courses';
      if (elAttendance) elAttendance.textContent = '94.5%';

      updateKpiLabel(0, 'Total Enrolled Students', 'Across my 3 subjects');
      updateKpiLabel(1, 'Daily Scheduled Lectures', 'LH-301 & CS-Lab-1');
      updateKpiLabel(2, 'Active Syllabus Courses', 'Curriculum In-Charge');
      updateKpiLabel(3, 'Average Class Attendance', 'Weekly Aggregate');
    } else {
      if (elStudents) elStudents.textContent = totalStudentsCount.toLocaleString();
      if (elFaculty) elFaculty.textContent = totalFacultyCount.toLocaleString();
      if (elCourses) elCourses.textContent = totalCoursesCount.toLocaleString();
      if (elAttendance) elAttendance.textContent = '92%';

      updateKpiLabel(0, 'Total Students', 'Active enrollments');
      updateKpiLabel(1, 'Total Faculty', 'Across 6 Departments');
      updateKpiLabel(2, 'Total Courses', 'Active syllabus');
      updateKpiLabel(3, "Today's Attendance", 'vs previous week');
    }
  }

  function updateKpiLabel(index, label, subtext) {
    const cards = document.querySelectorAll('.kpi-card');
    if (cards[index]) {
      const lblEl = cards[index].querySelector('.kpi-label');
      const metaSpan = cards[index].querySelector('.kpi-meta span:last-child');
      if (lblEl) lblEl.textContent = label;
      if (metaSpan) metaSpan.textContent = subtext;
    }
  }

  function renderCharts(data) {
    renderEnrollmentChart(data);
    renderAttendanceChart();
  }

  function renderEnrollmentChart(data) {
    const canvas = document.getElementById('chart-enrollment');
    if (!canvas) return;

    if (enrollmentChartInstance) {
      enrollmentChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    enrollmentChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Computer Science', 'Electronics & Comm', 'Mechanical Eng', 'Civil Eng', 'Info Tech', 'Business Admin'],
        datasets: [{
          label: 'Enrolled Students',
          data: [420, 240, 190, 140, 160, 100],
          backgroundColor: '#356AE6',
          borderRadius: 6,
          barThickness: 28
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#172B4D',
            titleFont: { size: 13, family: 'Plus Jakarta Sans', weight: 'bold' },
            bodyFont: { size: 12, family: 'Plus Jakarta Sans' },
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#F1F5F9' },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#64748B' }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#64748B' }
          }
        }
      }
    });
  }

  function renderAttendanceChart() {
    const canvas = document.getElementById('chart-attendance-overview');
    if (!canvas) return;

    if (attendanceChartInstance) {
      attendanceChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    attendanceChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon (Oct 30)', 'Tue (Oct 31)', 'Wed (Nov 1)', 'Thu (Nov 2)', 'Fri (Nov 3)', 'Sat (Nov 4)'],
        datasets: [{
          label: 'Campus Attendance %',
          data: [94.2, 92.8, 95.1, 91.5, 92.0, 89.4],
          borderColor: '#16A36A',
          backgroundColor: 'rgba(22, 163, 106, 0.08)',
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#16A36A',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#172B4D',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => ` Attendance: ${context.parsed.y}%`
            }
          }
        },
        scales: {
          y: {
            min: 80,
            max: 100,
            grid: { color: '#F1F5F9' },
            ticks: {
              font: { family: 'Plus Jakarta Sans', size: 11 },
              color: '#64748B',
              callback: (val) => `${val}%`
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#64748B' }
          }
        }
      }
    });
  }

  function renderTodayTimetable(data, user) {
    const container = document.getElementById('dash-today-schedule-list');
    if (!container) return;

    // Pick Monday slots or current day
    const slots = data.timetable.filter(s => s.day === 'Monday').slice(0, 4);

    if (slots.length === 0) {
      container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No classes scheduled for today</div>';
      return;
    }

    container.innerHTML = slots.map(slot => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid var(--border-light);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="background: var(--secondary-tint); color: var(--secondary); font-weight: 700; font-size: 0.75rem; padding: 6px 10px; border-radius: var(--radius-sm); white-space: nowrap;">
            ${slot.time.split(' - ')[0]}
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--primary);">${slot.subject}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${slot.faculty} • <span style="font-weight: 600; color: var(--secondary);">${slot.room}</span></div>
          </div>
        </div>
        <span class="status-pill ${slot.type === 'Practical Lab' ? 'warning' : 'info'}">${slot.type}</span>
      </div>
    `).join('');
  }

  function renderRecentAnnouncements(data) {
    const container = document.getElementById('dash-announcements-list');
    if (!container) return;

    const list = data.announcements.slice(0, 3);
    container.innerHTML = list.map(item => `
      <div style="padding: 10px 12px; border-bottom: 1px solid var(--border-light); cursor: pointer;" onclick="CampusApp.navigateTo('announcements')">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <span class="priority-badge priority-${item.priority.toLowerCase()}">${item.priority}</span>
          <span style="font-size: 0.72rem; color: var(--text-light);"><i class="fa-regular fa-clock"></i> ${item.date}</span>
        </div>
        <div style="font-weight: 700; font-size: 0.88rem; color: var(--primary); margin-bottom: 4px;">${item.title}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.content}</div>
      </div>
    `).join('');
  }

  function renderUpcomingEventsAndActivities(data) {
    const container = document.getElementById('dash-events-activities-list');
    if (!container) return;

    const events = (data.events || []).slice(0, 2);
    const activities = (data.activities || []).slice(0, 2);

    let html = '';

    // Events snippet
    events.forEach(ev => {
      html += `
        <div style="padding: 10px 12px; border-bottom: 1px solid var(--border-light); background: #FAFBFD; border-radius: var(--radius-sm); margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span class="status-pill info">${ev.category}</span>
            <span style="font-size: 0.72rem; color: var(--secondary); font-weight: 600;"><i class="fa-regular fa-calendar"></i> ${ev.date}</span>
          </div>
          <div style="font-weight: 700; font-size: 0.88rem; color: var(--primary);">${ev.title}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-solid fa-location-dot"></i> ${ev.venue}</div>
        </div>
      `;
    });

    // Recent activity log
    activities.forEach(act => {
      html += `
        <div style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; font-size: 0.8rem; border-bottom: 1px solid var(--border-light);">
          <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--border-light); color: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">
            <i class="fa-solid ${act.icon}"></i>
          </div>
          <div style="flex: 1;">
            <span style="font-weight: 700; color: var(--primary);">${act.user}</span>: ${act.action}
          </div>
          <span style="color: var(--text-light); font-size: 0.7rem; white-space: nowrap;">${act.time}</span>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  return {
    init,
    render
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  CampusDashboard.init();
});

