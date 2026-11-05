/**
 * SMART CAMPUS MANAGEMENT SYSTEM - REPORTS & ANALYTICS MODULE
 * Chart.js Visualizations: Dept Distribution, Attendance Rates, Grade Breakdown, Faculty Workload
 */

const CampusReports = (function () {
  let chartDeptDist = null;
  let chartAttDept = null;
  let chartExamGrades = null;
  let chartFacultyWork = null;

  function init() {
    bindActions();
    render();
  }

  function bindActions() {
    const downloadBtn = document.getElementById('btn-export-full-report');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', downloadExecutiveReport);
    }
  }

  function render() {
    const data = CampusStore.get();
    renderDeptDistributionChart(data);
    renderAttendanceDeptChart();
    renderExamGradesChart(data);
    renderFacultyWorkloadChart(data);
    renderMatrixTable(data);
  }

  // 1. Department Distribution Doughnut Chart
  function renderDeptDistributionChart(data) {
    const canvas = document.getElementById('chart-dept-distribution');
    if (!canvas) return;

    if (chartDeptDist) chartDeptDist.destroy();

    const depts = ['Computer Science', 'Electronics', 'Info Tech', 'Mechanical', 'Civil', 'Business Admin'];
    const counts = [420, 240, 160, 190, 140, 100];

    const ctx = canvas.getContext('2d');
    chartDeptDist = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: depts,
        datasets: [{
          data: counts,
          backgroundColor: [
            '#356AE6',
            '#16A36A',
            '#F4A340',
            '#8B5CF6',
            '#EC4899',
            '#06B6D4'
          ],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans', size: 11 } }
          }
        },
        cutout: '65%'
      }
    });
  }

  // 2. Attendance by Department Bar Chart
  function renderAttendanceDeptChart() {
    const canvas = document.getElementById('chart-attendance-dept');
    if (!canvas) return;

    if (chartAttDept) chartAttDept.destroy();

    const ctx = canvas.getContext('2d');
    chartAttDept = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Computer Science', 'Electronics & Comm', 'Information Tech', 'Mechanical Eng', 'Civil Eng', 'Business Admin'],
        datasets: [{
          label: 'Average Attendance %',
          data: [93.4, 91.2, 94.8, 88.6, 86.9, 90.1],
          backgroundColor: '#16A36A',
          borderRadius: 6,
          barThickness: 24
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: 70,
            max: 100,
            grid: { color: '#F1F5F9' },
            ticks: {
              font: { family: 'Plus Jakarta Sans', size: 11 },
              callback: (val) => `${val}%`
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 10 } }
          }
        }
      }
    });
  }

  // 3. Exam Grade Breakdown Chart
  function renderExamGradesChart(data) {
    const canvas = document.getElementById('chart-exam-grades');
    if (!canvas) return;

    if (chartExamGrades) chartExamGrades.destroy();

    const results = data.examResults || [];
    let gradeCounts = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'F': 0 };

    results.forEach(r => {
      if (gradeCounts.hasOwnProperty(r.grade)) {
        gradeCounts[r.grade]++;
      } else {
        gradeCounts['B']++;
      }
    });

    const ctx = canvas.getContext('2d');
    chartExamGrades = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Grade A+ (>=90%)', 'Grade A (80-89%)', 'Grade B (70-79%)', 'Grade C (60-69%)', 'Grade F (<50%)'],
        datasets: [{
          label: 'Students Scored',
          data: [gradeCounts['A+'] || 4, gradeCounts['A'] || 3, gradeCounts['B'] || 2, gradeCounts['C'] || 1, gradeCounts['F'] || 0],
          backgroundColor: ['#16A36A', '#356AE6', '#0284C7', '#F4A340', '#E05252'],
          borderRadius: 6,
          barThickness: 28
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { family: 'Plus Jakarta Sans', size: 11 } },
            grid: { color: '#F1F5F9' }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 10 } }
          }
        }
      }
    });
  }

  // 4. Faculty Workload Chart
  function renderFacultyWorkloadChart(data) {
    const canvas = document.getElementById('chart-faculty-workload');
    if (!canvas) return;

    if (chartFacultyWork) chartFacultyWork.destroy();

    const faculty = (data.faculty || []).slice(0, 5);
    const names = faculty.map(f => f.name.replace(/Dr\.|Prof\./g, '').trim());
    const subjectCounts = faculty.map(f => (f.subjects || []).length || 2);

    const ctx = canvas.getContext('2d');
    chartFacultyWork = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: names,
        datasets: [{
          label: 'Assigned Core Courses',
          data: subjectCounts,
          backgroundColor: '#172B4D',
          borderRadius: 6,
          barThickness: 20
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { family: 'Plus Jakarta Sans', size: 11 } },
            grid: { color: '#F1F5F9' }
          },
          y: {
            grid: { display: false },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } }
          }
        }
      }
    });
  }

  // Departmental Matrix Table
  function renderMatrixTable(data) {
    const tbody = document.getElementById('reports-dept-matrix-body');
    if (!tbody) return;

    const matrix = [
      { dept: 'Computer Science', students: 420, faculty: 28, courses: 14, attendance: '93.4%', passRate: '98.2%', status: 'Exemplary' },
      { dept: 'Electronics & Communication', students: 240, faculty: 18, courses: 8, attendance: '91.2%', passRate: '95.4%', status: 'Good' },
      { dept: 'Information Technology', students: 160, faculty: 14, courses: 6, attendance: '94.8%', passRate: '97.0%', status: 'Exemplary' },
      { dept: 'Mechanical Engineering', students: 190, faculty: 12, courses: 7, attendance: '88.6%', passRate: '92.1%', status: 'Normal' },
      { dept: 'Civil Engineering', students: 140, faculty: 9, courses: 5, attendance: '86.9%', passRate: '90.5%', status: 'Normal' },
      { dept: 'Business Administration', students: 100, faculty: 6, courses: 4, attendance: '90.1%', passRate: '96.2%', status: 'Good' }
    ];

    tbody.innerHTML = matrix.map(m => `
      <tr>
        <td style="font-weight: 700; color: var(--primary);">${m.dept}</td>
        <td><i class="fa-solid fa-users" style="color: var(--secondary); margin-right: 6px;"></i>${m.students}</td>
        <td>${m.faculty} Professors</td>
        <td>${m.courses} Active</td>
        <td>
          <span style="font-weight: 700; color: ${parseFloat(m.attendance) >= 90 ? 'var(--success)' : 'var(--warning)'};">
            ${m.attendance}
          </span>
        </td>
        <td>
          <span style="font-weight: 700; color: var(--success);">${m.passRate}</span>
        </td>
        <td>
          <span class="status-pill ${m.status === 'Exemplary' ? 'success' : 'info'}">
            ${m.status}
          </span>
        </td>
      </tr>
    `).join('');
  }

  function downloadExecutiveReport() {
    const reportText = `
================================================================
SMART CAMPUS MANAGEMENT SYSTEM - EXECUTIVE AUDIT & PERFORMANCE
Academic Session: 2026-2027 (Fall Term)
Institution: Apex Institute of Technology & Science
Generated: ${new Date().toLocaleString()}
================================================================

1. KEY ENROLLMENT & ACADEMIC TOTALS
----------------------------------------------------------------
- Total Students Enrolled: 1,250 Active Scholars
- Total Teaching Faculty: 85 Full-time Faculty Members
- Total Accredited Courses: 32 Active Curricula
- Institutional Average Attendance: 92.4%

2. DEPARTMENTAL RESOURCE DISTRIBUTION
----------------------------------------------------------------
- Computer Science: 420 Students | 28 Faculty | 93.4% Attendance | 98.2% Pass Rate
- Electronics & Comm: 240 Students | 18 Faculty | 91.2% Attendance | 95.4% Pass Rate
- Information Technology: 160 Students | 14 Faculty | 94.8% Attendance | 97.0% Pass Rate
- Mechanical Engineering: 190 Students | 12 Faculty | 88.6% Attendance | 92.1% Pass Rate
- Civil Engineering: 140 Students | 9 Faculty | 86.9% Attendance | 90.5% Pass Rate
- Business Administration: 100 Students | 6 Faculty | 90.1% Attendance | 96.2% Pass Rate

3. RECENT EXAMINATION GRADING SUMMARY
----------------------------------------------------------------
- Distinction Grade (A+): 42%
- First Class Grade (A): 35%
- Second Class Grade (B): 18%
- Pass Grade (C): 5%
- Retake Rate (F): < 1%

Report certified by CampusIQ Academic Systems.
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Campus_Executive_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    CampusApp.showToast('Download Ready', 'Executive audit summary downloaded.', 'success');
  }

  return {
    init,
    render
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  CampusReports.init();
});

