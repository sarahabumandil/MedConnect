/**
 * MedConnect — Dental Core
 * app.js — Central Application Controller / Router / Navigation Manager
 * -------------------------------------------------------------
 * Renders every view from AppState + DentalDB. No view markup lives
 * statically in index.html beyond the shell containers.
 */

const App = (() => {

  const root = document.getElementById('view-root');
  const bottomNav = document.getElementById('bottom-nav');
  const toastHost = document.getElementById('toast-host');

  // ---------------------------------------------------------------
  // Toast / Notification UI (visual layer for the SMS simulator)
  // ---------------------------------------------------------------
  function showToast({ title, body, variant = 'info' }) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${variant}`;
    toast.innerHTML = `
      <div class="toast__icon">${variant === 'success' ? '✅' : variant === 'error' ? '⚠️' : '📲'}</div>
      <div class="toast__content">
        <p class="toast__title">${title}</p>
        <p class="toast__body">${body}</p>
      </div>
    `;
    toastHost.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast--visible'));
    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 350);
    }, 4200);
  }

  // ---------------------------------------------------------------
  // Bottom Navigation — state-driven, tracks user location visually
  // ---------------------------------------------------------------
  const NAV_ITEMS = [
    { view: AppState.VIEWS.DASHBOARD, label: 'Dentists', icon: '🦷' },
    { view: AppState.VIEWS.REGISTRATION, label: 'Booking', icon: '📋' },
    { view: AppState.VIEWS.CONFIRMATION, label: 'Confirmed', icon: '✅' }
  ];

  function renderBottomNav(state) {
    if (state.currentView === AppState.VIEWS.LOGIN) {
      bottomNav.classList.add('bottom-nav--hidden');
      bottomNav.innerHTML = '';
      return;
    }
    bottomNav.classList.remove('bottom-nav--hidden');

    bottomNav.innerHTML = NAV_ITEMS.map(item => {
      const isActive = state.currentView === item.view;
      const isDisabled =
        (item.view === AppState.VIEWS.REGISTRATION && !state.selectedDentistId) ||
        (item.view === AppState.VIEWS.CONFIRMATION && state.booking.status !== 'confirmed');
      return `
        <button
          class="nav-item ${isActive ? 'nav-item--active' : ''} ${isDisabled ? 'nav-item--disabled' : ''}"
          data-nav="${item.view}"
          ${isDisabled ? 'disabled' : ''}
        >
          <span class="nav-item__icon">${item.icon}</span>
          <span class="nav-item__label">${item.label}</span>
        </button>
      `;
    }).join('');

    bottomNav.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => AppState.setView(btn.dataset.nav));
    });
  }

  // ---------------------------------------------------------------
  // VIEW: Identity Access Log-In
  // ---------------------------------------------------------------
  function renderLogin() {
    root.innerHTML = `
      <section class="view view--login">
        <div class="login-card">
          <div class="brand-mark">
            <div class="brand-mark__logo">MC</div>
            <h1 class="brand-mark__title">MedConnect</h1>
            <p class="brand-mark__subtitle">Dental Core · Clinical Access Portal</p>
          </div>

          <form id="login-form" novalidate>
            <div class="field-group">
              <label for="login-name">Full Legal Name</label>
              <input type="text" id="login-name" placeholder="e.g. Jordan A. Reyes" autocomplete="name" required />
              <p class="field-error" id="err-login-name"></p>
            </div>

            <div class="field-group">
              <label for="login-phone">Mobile Phone</label>
              <input type="tel" id="login-phone" placeholder="(555) 123-4567" autocomplete="tel" required />
              <p class="field-error" id="err-login-phone"></p>
            </div>

            <div class="field-group">
              <label for="login-email">Email <span class="optional-tag">(optional)</span></label>
              <input type="email" id="login-email" placeholder="you@example.com" autocomplete="email" />
              <p class="field-error" id="err-login-email"></p>
            </div>

            <button type="submit" class="btn btn--primary btn--block">
              <span>Verify &amp; Access Dashboard</span>
            </button>

            <p class="hipaa-note">🔒 HIPAA-Compliant · End-to-end encrypted intake · No video infrastructure used</p>
          </form>
        </div>
      </section>
    `;

    const form = document.getElementById('login-form');
    const phoneInput = document.getElementById('login-phone');

    phoneInput.addEventListener('input', (e) => {
      e.target.value = AppState.formatPhone(e.target.value);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = document.getElementById('login-name').value;
      const phone = document.getElementById('login-phone').value;
      const email = document.getElementById('login-email').value;

      const nameErr = AppState.ValidationRules.fullName(fullName);
      const phoneErr = AppState.ValidationRules.phone(phone);
      const emailErr = AppState.ValidationRules.email(email);

      document.getElementById('err-login-name').textContent = nameErr || '';
      document.getElementById('err-login-phone').textContent = phoneErr || '';
      document.getElementById('err-login-email').textContent = emailErr || '';

      document.getElementById('login-name').classList.toggle('input--error', !!nameErr);
      document.getElementById('login-phone').classList.toggle('input--error', !!phoneErr);
      document.getElementById('login-email').classList.toggle('input--error', !!emailErr);

      if (nameErr || phoneErr || emailErr) return;

      AppState.authenticate({ fullName, phone, email });
      showToast({ title: 'Identity Verified', body: `Welcome, ${fullName.split(' ')[0]}. Loading your dashboard…`, variant: 'success' });
    });
  }

  // ---------------------------------------------------------------
  // VIEW: Advanced Dentistry Dashboard
  // ---------------------------------------------------------------
  function renderDashboard(state) {
    const dentists = DentalDB.getAllDentists();

    root.innerHTML = `
      <section class="view view--dashboard">
        <header class="view-header">
          <div>
            <p class="view-header__eyebrow">Welcome back, ${state.patient.fullName.split(' ')[0] || 'Patient'}</p>
            <h2 class="view-header__title">Choose Your Specialist</h2>
          </div>
          <div class="patient-chip">
            <span class="patient-chip__avatar">${(state.patient.fullName || 'P').charAt(0)}</span>
          </div>
        </header>

        <div class="dentist-grid">
          ${dentists.map(d => `
            <article class="dentist-card" data-dentist="${d.id}" style="--accent:${d.accentColor}">
              <div class="dentist-card__top">
                <div class="dentist-card__avatar" style="background:${d.accentColor}">${d.avatarInitials}</div>
                <div class="dentist-card__rating">⭐ ${d.rating.toFixed(2)} <span>(${d.reviewCount})</span></div>
              </div>
              <h3 class="dentist-card__name">${d.name}</h3>
              <p class="dentist-card__specialty">${d.specialty}</p>
              <p class="dentist-card__credentials">${d.credentials} · ${d.yearsExperience} yrs experience</p>
              <div class="dentist-card__tags">
                ${d.tags.map(t => `<span class="tag">${t}</span>`).join('')}
              </div>
              <div class="dentist-card__clinic">📍 ${d.clinic.name}</div>
              <button class="btn btn--secondary btn--block" data-dentist-select="${d.id}">
                Select &amp; Book Appointment
              </button>
            </article>
          `).join('')}
        </div>
      </section>
    `;

    root.querySelectorAll('[data-dentist-select]').forEach(btn => {
      btn.addEventListener('click', () => {
        AppState.selectDentist(btn.dataset.dentistSelect);
        AppState.setView(AppState.VIEWS.REGISTRATION);
      });
    });
  }

  // ---------------------------------------------------------------
  // VIEW: Clinical Patient Data Registration & Slot Selection
  // ---------------------------------------------------------------
  function renderRegistration(state) {
    const dentist = DentalDB.getDentistById(state.selectedDentistId);

    if (!dentist) {
      AppState.setView(AppState.VIEWS.DASHBOARD);
      return;
    }

    const symptomCategories = DentalDB.getSymptomCategories();

    root.innerHTML = `
      <section class="view view--registration">
        <header class="view-header">
          <button class="btn-back" id="back-to-dashboard">← Back</button>
          <h2 class="view-header__title">Clinical Registration</h2>
        </header>

        <div class="dentist-summary" style="--accent:${dentist.accentColor}">
          <div class="dentist-summary__avatar" style="background:${dentist.accentColor}">${dentist.avatarInitials}</div>
          <div>
            <p class="dentist-summary__name">${dentist.name}</p>
            <p class="dentist-summary__specialty">${dentist.specialty}</p>
            <p class="dentist-summary__clinic">📍 ${dentist.clinic.name}, ${dentist.clinic.address}</p>
          </div>
        </div>

        <form id="registration-form" novalidate>

          <fieldset class="form-section">
            <legend>1. Patient Information</legend>
            <div class="field-group">
              <label for="reg-name">Full Name</label>
              <input type="text" id="reg-name" value="${state.patient.fullName}" required />
              <p class="field-error" id="err-reg-name"></p>
            </div>
            <div class="field-group">
              <label for="reg-phone">Mobile Phone (for SMS confirmation)</label>
              <input type="tel" id="reg-phone" value="${state.patient.phone}" required />
              <p class="field-error" id="err-reg-phone"></p>
            </div>
          </fieldset>

          <fieldset class="form-section">
            <legend>2. Reason for Visit</legend>
            <div class="field-group">
              <label for="reg-symptom-cat">Symptom Category</label>
              <select id="reg-symptom-cat" required>
                <option value="">Select a reason…</option>
                ${symptomCategories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
              <p class="field-error" id="err-reg-symptom-cat"></p>
            </div>
            <div class="field-group">
              <label for="reg-symptom-notes">Describe Your Symptoms</label>
              <textarea id="reg-symptom-notes" rows="4" maxlength="500"
                placeholder="e.g. Sharp pain in lower-left molar when chewing, started 3 days ago…"></textarea>
              <div class="char-counter"><span id="char-count">0</span>/500</div>
              <p class="field-error" id="err-reg-symptom-notes"></p>
            </div>
          </fieldset>

          <fieldset class="form-section">
            <legend>3. Select Appointment Slot</legend>
            <div class="slot-matrix" id="slot-matrix">
              ${dentist.slots.map(day => `
                <div class="slot-day">
                  <p class="slot-day__label">${day.dayLabel}</p>
                  <div class="slot-day__buttons">
                    ${day.slots.length === 0
                      ? `<p class="slot-day__empty">Fully booked</p>`
                      : day.slots.map(time => `
                        <button type="button" class="slot-btn" data-date="${day.isoDate}" data-time="${time}">
                          ${time}
                        </button>
                      `).join('')
                    }
                  </div>
                </div>
              `).join('')}
            </div>
            <p class="field-error" id="err-reg-slot"></p>
          </fieldset>

          <button type="submit" class="btn btn--primary btn--block" id="submit-booking-btn">
            <span id="submit-btn-label">Confirm Appointment Request</span>
          </button>
        </form>
      </section>
    `;

    document.getElementById('back-to-dashboard').addEventListener('click', () => {
      AppState.setView(AppState.VIEWS.DASHBOARD);
    });

    const phoneInput = document.getElementById('reg-phone');
    phoneInput.addEventListener('input', (e) => {
      e.target.value = AppState.formatPhone(e.target.value);
    });

    const notesField = document.getElementById('reg-symptom-notes');
    const charCount = document.getElementById('char-count');
    notesField.addEventListener('input', () => {
      charCount.textContent = notesField.value.length;
    });

    root.querySelectorAll('.slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('slot-btn--selected'));
        btn.classList.add('slot-btn--selected');
        AppState.selectSlot(btn.dataset.date, btn.dataset.time);
        document.getElementById('err-reg-slot').textContent = '';
      });
    });

    const form = document.getElementById('registration-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleBookingSubmit(dentist);
    });
  }

  function handleBookingSubmit(dentist) {
    const formData = {
      fullName: document.getElementById('reg-name').value,
      phone: document.getElementById('reg-phone').value,
      symptomCategory: document.getElementById('reg-symptom-cat').value,
      symptomNotes: document.getElementById('reg-symptom-notes').value
    };

    const submitBtn = document.getElementById('submit-booking-btn');
    const submitLabel = document.getElementById('submit-btn-label');

    const errorMap = {
      fullName: 'err-reg-name',
      phone: 'err-reg-phone',
      symptomCategory: 'err-reg-symptom-cat',
      symptomNotes: 'err-reg-symptom-notes',
      slot: 'err-reg-slot'
    };

    // Clear previous errors
    Object.values(errorMap).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });

    submitBtn.disabled = true;
    submitBtn.classList.add('btn--loading');

    AppState.submitBooking(formData, (status, payload) => {
      switch (status) {
        case 'failed':
          submitBtn.disabled = false;
          submitBtn.classList.remove('btn--loading');
          submitLabel.textContent = 'Confirm Appointment Request';
          if (payload && payload.errors) {
            Object.entries(payload.errors).forEach(([key, msg]) => {
              const el = document.getElementById(errorMap[key]);
              if (el) el.textContent = msg;
            });
            showToast({ title: 'Form Incomplete', body: 'Please review the highlighted fields.', variant: 'error' });
          }
          break;
        case 'validating':
          submitLabel.textContent = 'Validating clinical intake…';
          break;
        case 'queued':
          submitLabel.textContent = 'Queued for SMS gateway…';
          showToast({ title: 'Intake Validated', body: 'Your request has been queued for confirmation.', variant: 'info' });
          break;
        case 'sending':
          submitLabel.textContent = 'Sending confirmation SMS…';
          break;
        case 'confirmed':
          submitLabel.textContent = 'Confirmed ✅';
          showToast({
            title: payload.message.push.title,
            body: payload.message.push.body,
            variant: 'success'
          });
          break;
      }
    });
  }

  // ---------------------------------------------------------------
  // VIEW: Automated Asynchronous Confirmation & Verification Gateway
  // ---------------------------------------------------------------
  function renderConfirmation(state) {
    const record = state.booking.lastConfirmation;

    if (!record) {
      AppState.setView(AppState.VIEWS.DASHBOARD);
      return;
    }

    const dateObj = new Date(record.isoDate + 'T00:00:00');
    const niceDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    root.innerHTML = `
      <section class="view view--confirmation">
        <div class="confirmation-card">
          <div class="confirmation-card__check">✅</div>
          <h2 class="confirmation-card__title">Appointment Confirmed</h2>
          <p class="confirmation-card__id">Confirmation ID: ${record.id}</p>

          <div class="confirmation-detail-grid">
            <div class="confirmation-detail">
              <p class="confirmation-detail__label">Patient</p>
              <p class="confirmation-detail__value">${record.patient.fullName}</p>
            </div>
            <div class="confirmation-detail">
              <p class="confirmation-detail__label">Dentist</p>
              <p class="confirmation-detail__value">${record.dentist.name}</p>
            </div>
            <div class="confirmation-detail">
              <p class="confirmation-detail__label">Date</p>
              <p class="confirmation-detail__value">${niceDate}</p>
            </div>
            <div class="confirmation-detail">
              <p class="confirmation-detail__label">Time</p>
              <p class="confirmation-detail__value">${record.time}</p>
            </div>
            <div class="confirmation-detail">
              <p class="confirmation-detail__label">Reason</p>
              <p class="confirmation-detail__value">${record.symptomCategory}</p>
            </div>
            <div class="confirmation-detail">
              <p class="confirmation-detail__label">Location</p>
              <p class="confirmation-detail__value">${record.dentist.clinic.name}</p>
            </div>
          </div>

          <div class="sms-preview">
            <p class="sms-preview__label">📲 SMS Sent to ${record.patient.phone}</p>
            <p class="sms-preview__bubble">${record.message.sms}</p>
          </div>

          <button class="btn btn--primary btn--block" id="book-another-btn">Book Another Appointment</button>
        </div>
      </section>
    `;

    document.getElementById('book-another-btn').addEventListener('click', () => {
      AppState.resetBookingFlow();
    });
  }

  // ---------------------------------------------------------------
  // Router
  // ---------------------------------------------------------------
  function render(state) {
    renderBottomNav(state);

    switch (state.currentView) {
      case AppState.VIEWS.LOGIN:
        renderLogin();
        break;
      case AppState.VIEWS.DASHBOARD:
        renderDashboard(state);
        break;
      case AppState.VIEWS.REGISTRATION:
        renderRegistration(state);
        break;
      case AppState.VIEWS.CONFIRMATION:
        renderConfirmation(state);
        break;
      default:
        renderLogin();
    }
  }

  function init() {
    AppState.subscribe(render);
    render(AppState.getState());
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
