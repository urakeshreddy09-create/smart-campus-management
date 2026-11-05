/**
 * SMART CAMPUS MANAGEMENT SYSTEM - ANNOUNCEMENTS MODULE
 * Campus Notices, Priority Badges, Audience Filtering, Add/Edit Modals, LocalStorage
 */

const CampusAnnouncements = (function () {
  let editAnnouncementId = null;

  function init() {
    bindActions();
    render();
  }

  function bindActions() {
    const addBtn = document.getElementById('open-add-announcement-modal-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        openAnnouncementModal();
      });
    }

    const form = document.getElementById('announcement-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveAnnouncement();
      });
    }

    const searchInput = document.getElementById('announcement-search');
    const priorityFilter = document.getElementById('announcement-priority-filter');
    const targetFilter = document.getElementById('announcement-target-filter');

    if (searchInput) searchInput.addEventListener('input', render);
    if (priorityFilter) priorityFilter.addEventListener('change', render);
    if (targetFilter) targetFilter.addEventListener('change', render);
  }

  function openAnnouncementModal(item = null) {
    const title = document.getElementById('announcement-modal-title');
    const titleInput = document.getElementById('anf-title');
    const prioSelect = document.getElementById('anf-priority');
    const audSelect = document.getElementById('anf-audience');
    const contentInput = document.getElementById('anf-content');
    const hiddenId = document.getElementById('anf-id');

    if (item) {
      editAnnouncementId = item.id;
      if (title) title.innerHTML = '<i class="fa-solid fa-pen-to-square" style="color: var(--secondary);"></i><span>Edit Notice</span>';
      if (hiddenId) hiddenId.value = item.id;
      if (titleInput) titleInput.value = item.title;
      if (prioSelect) prioSelect.value = item.priority;
      if (audSelect) audSelect.value = item.targetAudience;
      if (contentInput) contentInput.value = item.content;
    } else {
      editAnnouncementId = null;
      if (title) title.innerHTML = '<i class="fa-solid fa-bullhorn" style="color: var(--secondary);"></i><span>Create Announcement</span>';
      if (hiddenId) hiddenId.value = '';
      if (titleInput) titleInput.value = '';
      if (prioSelect) prioSelect.value = 'Medium';
      if (audSelect) audSelect.value = 'All';
      if (contentInput) contentInput.value = '';
    }

    CampusApp.openModal('announcement-modal');
  }

  function saveAnnouncement() {
    const title = document.getElementById('anf-title').value.trim();
    const priority = document.getElementById('anf-priority').value;
    const targetAudience = document.getElementById('anf-audience').value;
    const content = document.getElementById('anf-content').value.trim();

    if (!title || !content) {
      CampusApp.showToast('Validation Error', 'Title and Content are required.', 'danger');
      return;
    }

    const data = CampusStore.get();
    const user = CampusApp.getCurrentUser() || { name: 'Campus Administration', role: 'admin' };

    if (editAnnouncementId) {
      const idx = data.announcements.findIndex(a => a.id === editAnnouncementId);
      if (idx !== -1) {
        data.announcements[idx] = {
          ...data.announcements[idx],
          title,
          priority,
          targetAudience,
          content
        };
        CampusApp.showToast('Notice Updated', `"${title}" has been updated.`, 'success');
      }
    } else {
      const newNotice = {
        id: Date.now(),
        title,
        priority,
        targetAudience,
        date: new Date().toISOString().split('T')[0],
        author: user.name,
        content
      };

      data.announcements.unshift(newNotice);

      // Add to notifications
      if (!data.notifications) data.notifications = [];
      data.notifications.unshift({
        id: Date.now(),
        title: `Notice: ${title}`,
        time: 'Just now',
        type: priority === 'High' ? 'warning' : 'info',
        read: false
      });

      CampusApp.showToast('Announcement Published', `New notice issued for ${targetAudience}.`, 'success');
    }

    CampusStore.save(data);
    CampusApp.closeModal('announcement-modal');
    render();
  }

  function deleteAnnouncement(id, title) {
    CampusApp.confirmDialog(
      'Delete Announcement',
      `Are you sure you want to remove announcement "${title}"?`,
      () => {
        const data = CampusStore.get();
        data.announcements = data.announcements.filter(a => a.id !== id);
        CampusStore.save(data);
        CampusApp.showToast('Notice Deleted', 'Announcement removed from board.', 'warning');
        render();
      },
      'Delete Notice',
      true
    );
  }

  function render() {
    const grid = document.getElementById('announcements-cards-grid');
    if (!grid) return;

    const data = CampusStore.get();
    let list = data.announcements || [];

    const q = (document.getElementById('announcement-search')?.value || '').toLowerCase().trim();
    const prio = document.getElementById('announcement-priority-filter')?.value || '';
    const aud = document.getElementById('announcement-target-filter')?.value || '';

    if (q) {
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q)
      );
    }

    if (prio) {
      list = list.filter(a => a.priority === prio);
    }

    if (aud) {
      list = list.filter(a => a.targetAudience === aud);
    }

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <i class="fa-solid fa-bullhorn" style="font-size: 2.2rem; color: var(--text-light); margin-bottom: 12px; display: block;"></i>
          No announcements match your search criteria.
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(item => `
      <div class="content-card">
        <div>
          <div class="card-badge-row">
            <span class="priority-badge priority-${item.priority.toLowerCase()}">
              ${item.priority} Priority
            </span>
            <span class="status-pill info">
              <i class="fa-solid fa-bullseye"></i> ${item.targetAudience}
            </span>
          </div>

          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 8px;">
            ${item.title}
          </h3>

          <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 14px;">
            ${item.content}
          </p>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-light); padding-top: 14px; margin-top: 14px; font-size: 0.78rem; color: var(--text-light);">
          <div>
            <i class="fa-solid fa-user-pen" style="margin-right: 4px;"></i> ${item.author}
            <div style="font-size: 0.72rem;"><i class="fa-regular fa-calendar"></i> ${item.date}</div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-icon-only" onclick="CampusAnnouncements.edit(${item.id})" title="Edit Notice">
              <i class="fa-solid fa-pen-to-square" style="color: var(--secondary);"></i>
            </button>
            <button class="btn btn-secondary btn-icon-only" onclick="CampusAnnouncements.remove(${item.id}, '${item.title.replace(/'/g, "\\'")}')" title="Delete Notice">
              <i class="fa-regular fa-trash-can" style="color: var(--danger);"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function edit(id) {
    const data = CampusStore.get();
    const item = data.announcements.find(a => a.id === id);
    if (item) openAnnouncementModal(item);
  }

  function remove(id, title) {
    deleteAnnouncement(id, title);
  }

  return {
    init,
    render,
    edit,
    remove
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  CampusAnnouncements.init();
});

