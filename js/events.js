/**
 * SMART CAMPUS MANAGEMENT SYSTEM - CAMPUS EVENTS MODULE
 * Events Showcase, Seat Capacity Tracking, 1-Click Registration, Event Creation
 */

const CampusEvents = (function () {

  function init() {
    bindActions();
    render();
  }

  function bindActions() {
    const addBtn = document.getElementById('open-add-event-modal-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        CampusApp.openModal('event-modal');
      });
    }

    const form = document.getElementById('event-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveEvent();
      });
    }

    const searchInput = document.getElementById('events-search');
    const catFilter = document.getElementById('events-category-filter');

    if (searchInput) searchInput.addEventListener('input', render);
    if (catFilter) catFilter.addEventListener('change', render);
  }

  function saveEvent() {
    const title = document.getElementById('evf-title').value.trim();
    const date = document.getElementById('evf-date').value;
    const time = document.getElementById('evf-time').value.trim();
    const venue = document.getElementById('evf-venue').value.trim();
    const category = document.getElementById('evf-cat').value;
    const description = document.getElementById('evf-desc').value.trim();

    if (!title || !date || !time || !venue || !description) {
      CampusApp.showToast('Validation Error', 'All fields are required.', 'danger');
      return;
    }

    const data = CampusStore.get();
    const newEvent = {
      id: Date.now(),
      title,
      date,
      time,
      venue,
      category,
      description,
      registeredUsers: [],
      maxCapacity: 150
    };

    data.events.unshift(newEvent);
    CampusStore.save(data);

    CampusApp.closeModal('event-modal');
    CampusApp.showToast('Event Created', `"${title}" has been added to the calendar.`, 'success');
    document.getElementById('event-form').reset();
    render();
  }

  function toggleRegistration(eventId) {
    const data = CampusStore.get();
    const ev = data.events.find(e => e.id === eventId);
    if (!ev) return;

    const user = CampusApp.getCurrentUser() || { email: 'student@campus.com', name: 'User' };
    const userEmail = user.email;

    if (!ev.registeredUsers) ev.registeredUsers = [];

    const isRegistered = ev.registeredUsers.includes(userEmail);

    if (isRegistered) {
      ev.registeredUsers = ev.registeredUsers.filter(e => e !== userEmail);
      CampusApp.showToast('Registration Cancelled', `You are no longer registered for "${ev.title}".`, 'info');
    } else {
      if (ev.registeredUsers.length >= ev.maxCapacity) {
        CampusApp.showToast('Event Full', 'Sorry, all available seats have been booked.', 'warning');
        return;
      }
      ev.registeredUsers.push(userEmail);
      CampusApp.showToast('Confirmed Registration!', `Pass issued for "${ev.title}". Check your portal for pass details.`, 'success');
    }

    CampusStore.save(data);
    render();
  }

  function deleteEvent(id, title) {
    CampusApp.confirmDialog(
      'Cancel Event',
      `Are you sure you want to cancel and remove event "${title}"? All registered participants will be notified.`,
      () => {
        const data = CampusStore.get();
        data.events = data.events.filter(e => e.id !== id);
        CampusStore.save(data);
        CampusApp.showToast('Event Removed', 'Event removed from campus schedule.', 'warning');
        render();
      },
      'Cancel Event',
      true
    );
  }

  function render() {
    const grid = document.getElementById('events-cards-grid');
    if (!grid) return;

    const data = CampusStore.get();
    const user = CampusApp.getCurrentUser() || { email: 'student@campus.com', role: 'student' };
    let list = data.events || [];

    const q = (document.getElementById('events-search')?.value || '').toLowerCase().trim();
    const cat = document.getElementById('events-category-filter')?.value || '';

    if (q) {
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
      );
    }

    if (cat) {
      list = list.filter(e => e.category === cat);
    }

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <i class="fa-solid fa-calendar-xmark" style="font-size: 2.2rem; color: var(--text-light); margin-bottom: 12px; display: block;"></i>
          No campus events match your criteria.
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(ev => {
      const regCount = (ev.registeredUsers || []).length;
      const isRegistered = (ev.registeredUsers || []).includes(user.email);
      const isFull = regCount >= ev.maxCapacity;

      return `
        <div class="content-card">
          <div>
            <div class="card-badge-row">
              <span class="status-pill ${ev.category === 'Tech Fest' ? 'info' : ev.category === 'Workshop' ? 'warning' : 'success'}">
                ${ev.category}
              </span>
              <span style="font-size: 0.78rem; font-weight: 700; color: var(--secondary);">
                <i class="fa-regular fa-calendar"></i> ${ev.date}
              </span>
            </div>

            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); margin-bottom: 8px;">
              ${ev.title}
            </h3>

            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
              ${ev.description}
            </p>

            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px; background: var(--bg-app); padding: 10px; border-radius: var(--radius-md);">
              <div><i class="fa-regular fa-clock" style="color: var(--secondary); width: 16px;"></i> ${ev.time}</div>
              <div><i class="fa-solid fa-location-dot" style="color: var(--danger); width: 16px;"></i> ${ev.venue}</div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span><i class="fa-solid fa-ticket" style="color: var(--success); width: 16px;"></i> <b>${regCount}</b> / ${ev.maxCapacity} Registered</span>
                <span style="font-size: 0.72rem; color: ${isFull ? 'var(--danger)' : 'var(--success)'}; font-weight: 700;">
                  ${isFull ? 'Sold Out' : `${ev.maxCapacity - regCount} seats left`}
                </span>
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-light); padding-top: 14px;">
            <button class="btn btn-sm ${isRegistered ? 'btn-secondary' : 'btn-primary'}" onclick="CampusEvents.toggleReg(${ev.id})">
              <i class="fa-solid ${isRegistered ? 'fa-check' : 'fa-ticket'}"></i>
              <span>${isRegistered ? 'Registered (Cancel)' : isFull ? 'Join Waitlist' : 'Register Now'}</span>
            </button>

            ${user.role === 'admin' ? `
              <button class="btn btn-secondary btn-icon-only" onclick="CampusEvents.remove(${ev.id}, '${ev.title.replace(/'/g, "\\'")}')" title="Delete Event">
                <i class="fa-regular fa-trash-can" style="color: var(--danger);"></i>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  function toggleReg(id) {
    toggleRegistration(id);
  }

  function remove(id, title) {
    deleteEvent(id, title);
  }

  return {
    init,
    render,
    toggleReg,
    remove
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  CampusEvents.init();
});

