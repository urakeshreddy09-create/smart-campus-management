/**
 * SMART CAMPUS MANAGEMENT SYSTEM - AUTHENTICATION MODULE
 * Demo Credentials, Role-Based Access Control, Session Handling
 */

const CampusAuth = (function () {
  const SESSION_KEY = 'CAMPUS_ACTIVE_SESSION';

  // Demo User Directory
  const demoUsers = {
    'admin@campus.com': {
      email: 'admin@campus.com',
      password: 'admin123',
      name: 'Dr. Robert Sterling',
      role: 'admin',
      department: 'Campus Administration',
      title: 'Chief Campus Administrator & Dean'
    },
    'faculty@campus.com': {
      email: 'faculty@campus.com',
      password: 'faculty123',
      name: 'Prof. Sarah Jenkins',
      role: 'faculty',
      department: 'Computer Science',
      title: 'Associate Professor & Academic Lead'
    },
    'student@campus.com': {
      email: 'student@campus.com',
      password: 'student123',
      name: 'Alex Morgan',
      role: 'student',
      regNo: 'REG2024CS001',
      department: 'Computer Science',
      year: '3rd Year',
      section: 'A',
      title: 'Undergraduate Scholar'
    }
  };

  function init() {
    bindLoginForm();
    bindDemoChips();
    bindPasswordToggle();
    checkExistingSession();
  }

  function bindLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim().toLowerCase();
      const password = document.getElementById('login-password').value;
      const remember = document.getElementById('remember-me').checked;
      const errorBanner = document.getElementById('login-error-msg');
      const errorText = document.getElementById('login-error-text');

      // Validation
      if (!email || !password) {
        showError('Please enter both your email and password.');
        return;
      }

      // Check credentials
      const user = demoUsers[email];
      if (user && user.password === password) {
        if (errorBanner) errorBanner.style.display = 'none';

        // Save session
        const sessionPayload = {
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          title: user.title,
          regNo: user.regNo || null,
          loginTime: new Date().toISOString()
        };

        if (remember) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionPayload));
        } else {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionPayload));
        }

        loginSuccess(sessionPayload);
      } else {
        showError('Invalid email or password. Please use one of the demo accounts.');
      }
    });

    // Forgot password hint
    const forgotLink = document.getElementById('forgot-password-link');
    if (forgotLink) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        CampusApp.showToast(
          'Password Assistance',
          'Demo accounts use passwords: admin123, faculty123, student123',
          'info'
        );
      });
    }
  }

  function showError(msg) {
    const banner = document.getElementById('login-error-msg');
    const text = document.getElementById('login-error-text');
    if (banner && text) {
      text.textContent = msg;
      banner.style.display = 'flex';
    }
  }

  function loginSuccess(user) {
    CampusApp.setCurrentUser(user);
    CampusApp.showToast(`Welcome back, ${user.name}!`, `Signed in as ${user.role.toUpperCase()} (${user.department})`, 'success');

    // Switch Views
    const authView = document.getElementById('auth-view');
    const appView = document.getElementById('app-container');
    if (authView) authView.style.display = 'none';
    if (appView) appView.style.display = 'flex';

    // Route to dashboard
    CampusApp.navigateTo('dashboard');
  }

  function checkExistingSession() {
    let session = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const user = JSON.parse(session);
        loginSuccess(user);
      } catch (e) {
        console.error('Session corrupt, clearing', e);
        logout();
      }
    }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);

    const authView = document.getElementById('auth-view');
    const appView = document.getElementById('app-container');
    if (appView) appView.style.display = 'none';
    if (authView) authView.style.display = 'flex';

    CampusApp.showToast('Signed Out', 'You have been successfully logged out of the portal.', 'info');
  }

  // Quick Demo Chips Switcher
  function bindDemoChips() {
    const adminBtn = document.getElementById('demo-admin-btn');
    const facultyBtn = document.getElementById('demo-faculty-btn');
    const studentBtn = document.getElementById('demo-student-btn');

    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const chips = [adminBtn, facultyBtn, studentBtn];

    function selectChip(activeBtn, email, pass) {
      chips.forEach(c => c && c.classList.remove('active'));
      if (activeBtn) activeBtn.classList.add('active');
      if (emailInput) emailInput.value = email;
      if (passInput) passInput.value = pass;
      const banner = document.getElementById('login-error-msg');
      if (banner) banner.style.display = 'none';
    }

    if (adminBtn) {
      adminBtn.addEventListener('click', () => {
        selectChip(adminBtn, 'admin@campus.com', 'admin123');
      });
    }
    if (facultyBtn) {
      facultyBtn.addEventListener('click', () => {
        selectChip(facultyBtn, 'faculty@campus.com', 'faculty123');
      });
    }
    if (studentBtn) {
      studentBtn.addEventListener('click', () => {
        selectChip(studentBtn, 'student@campus.com', 'student123');
      });
    }
  }

  // Toggle Password Eye
  function bindPasswordToggle() {
    const toggleBtn = document.getElementById('toggle-password-btn');
    const passInput = document.getElementById('login-password');
    const eyeIcon = document.getElementById('password-eye-icon');

    if (!toggleBtn || !passInput || !eyeIcon) return;

    toggleBtn.addEventListener('click', () => {
      if (passInput.type === 'password') {
        passInput.type = 'text';
        eyeIcon.className = 'fa-regular fa-eye-slash';
      } else {
        passInput.type = 'password';
        eyeIcon.className = 'fa-regular fa-eye';
      }
    });
  }

  return {
    init,
    logout,
    demoUsers
  };
})();

document.addEventListener('DOMContentLoaded', function () {
  CampusAuth.init();
});

