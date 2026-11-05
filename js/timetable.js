/**
 * SMART CAMPUS MANAGEMENT SYSTEM - TIMETABLE MANAGEMENT MODULE
 * Monday to Saturday Schedule Grid, Day Switching, Add/Delete Slots, Room Tracking
 */

const CampusTimetable = (function () {
  let activeDay = 'Monday';

  function init() {
    bindDayTabs();
    bindSlotModal();
    render();
  }

  function bindDayTabs() {
    const tabs = document.querySelectorAll('#timetable-day-tabs .day-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        activeDay = this.getAttribute('data-day') || 'Monday';
        render();
      });
    });

    const deptFilter = document.getElementById('timetable-dept-filter');
    const semFilter = document.getElementById('timetable-sem-filter');

    if (deptFilter) deptFilter.addEventListener('change', render);
    if (semFilter) semFilter.addEventListener('change', render);
  }

  function bindSlotModal() {
    const addBtn = document.getElementById('open-add-slot-modal-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        openAddSlotModal();
      });
    }

    const form = document.getElementById('timetable-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveSlot();
      });
    }
  }

  function openAddSlotModal() {
    const daySelect = document.getElementById('ttf-day');
    const subjInput = document.getElementById('ttf-subject');
    const facInput = document.getElementById('ttf-faculty');
    const roomInput = document.getElementById('ttf-room');

    if (daySelect) daySelect.value = activeDay;
    if (subjInput) subjInput.value = '';
    if (facInput) facInput.value = 'Prof. Sarah Jenkins';
    if (roomInput) roomInput.value = 'LH-301';

    CampusApp.openModal('timetable-modal');
  }

  function saveSlot() {
    const day = document.getElementById('ttf-day').value;
    const time = document.getElementById('ttf-time').value;
    const subject = document.getElementById('ttf-subject').value.trim();
    const faculty = document.getElementById('ttf-faculty').value.trim();
    const room = document.getElementById('ttf-room').value.trim();
    const type = document.getElementById('ttf-type').value;

    if (!subject || !faculty || !room) {
      CampusApp.showToast('Validation Error', 'Subject, Faculty and Classroom room are required.', 'danger');
      return;
    }

    const data = CampusStore.get();
    const newSlot = {
      id: Date.now(),
      day,
      time,
      subject,
      faculty,
      room,
      type
    };

    data.timetable.push(newSlot);
    CampusStore.save(data);

    CampusApp.closeModal('timetable-modal');
    CampusApp.showToast('Slot Added', `${subject} added to ${day} schedule.`, 'success');
    activeDay = day;

    // Sync tab
    document.querySelectorAll('#timetable-day-tabs .day-tab').forEach(t => {
      if (t.getAttribute('data-day') === day) t.classList.add('active');
      else t.classList.remove('active');
    });

    render();
  }

  function deleteSlot(id, subject) {
    CampusApp.confirmDialog(
      'Remove Class Period',
      `Are you sure you want to delete the scheduled period for "${subject}"?`,
      () => {
        const data = CampusStore.get();
        data.timetable = data.timetable.filter(s => s.id !== id);
        CampusStore.save(data);
        CampusApp.showToast('Slot Deleted', 'Schedule slot removed.', 'warning');
        render();
      },
      'Delete Slot',
      true
    );
  }

  function render() {
    const tbody = document.getElementById('timetable-table-body');
    if (!tbody) return;

    const data = CampusStore.get();
    const slots = (data.timetable || []).filter(s => s.day === activeDay);

    if (slots.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
            <i class="fa-regular fa-calendar-xmark" style="font-size: 2rem; margin-bottom: 10px; color: var(--text-light); display: block;"></i>
            No class schedules configured for ${activeDay}.
          </td>
        </tr>
      `;
      return;
    }

    // Sort chronologically by time
    slots.sort((a, b) => a.time.localeCompare(b.time));

    tbody.innerHTML = slots.map(slot => `
      <tr>
        <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--primary); font-size: 0.85rem; background: var(--bg-app);">
          <i class="fa-regular fa-clock" style="color: var(--secondary); margin-right: 6px;"></i>
          ${slot.time}
        </td>
        <td>
          <div style="font-weight: 700; color: var(--primary); font-size: 0.95rem;">${slot.subject}</div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--secondary-tint); color: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700;">
              ${slot.faculty.replace(/Prof\.|Dr\./g, '').trim().substring(0, 2).toUpperCase()}
            </div>
            <span style="font-weight: 600;">${slot.faculty}</span>
          </div>
        </td>
        <td>
          <span style="background: rgba(53, 106, 230, 0.1); color: var(--secondary); font-weight: 700; padding: 3px 10px; border-radius: 4px; font-family: 'JetBrains Mono', monospace;">
            ${slot.room}
          </span>
        </td>
        <td>
          <span class="status-pill ${slot.type === 'Practical Lab' ? 'warning' : slot.type === 'Workshop' ? 'success' : 'info'}">
            ${slot.type}
          </span>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-icon-only" onclick="CampusTimetable.remove(${slot.id}, '${slot.subject.replace(/'/g, "\\'")}')" title="Delete Slot">
            <i class="fa-regular fa-trash-can" style="color: var(--danger);"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  function remove(id, subject) {
    deleteSlot(id, subject);
  }

  return {
    init,
    render,
    remove
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  CampusTimetable.init();
});

