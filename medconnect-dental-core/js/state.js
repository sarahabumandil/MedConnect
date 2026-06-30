/**
 * MedConnect — Dental Core
 * state.js — Advanced State Machine
 * -------------------------------------------------------------
 * Owns: application state, booking validation engine, and the
 * asynchronous SMS/push notification queue simulator that mimics
 * Zocdoc-style real-time confirmation delivery.
 */

const AppState = (() => {

  /** Canonical view states for the bottom navigation / router */
  const VIEWS = Object.freeze({
    LOGIN: 'login',
    DASHBOARD: 'dashboard',
    REGISTRATION: 'registration',
    CONFIRMATION: 'confirmation'
  });

  let state = {
    currentView: VIEWS.LOGIN,
    patient: {
      identityVerified: false,
      fullName: '',
      phone: '',
      email: ''
    },
    selectedDentistId: null,
    selectedDate: null,
    selectedTime: null,
    booking: {
      symptomCategory: '',
      symptomNotes: '',
      status: 'idle' // idle | validating | queued | sending | confirmed | failed
    },
    notificationQueue: [],
    listeners: []
  };

  // ---------------------------------------------------------------
  // Pub/Sub — lets app.js re-render on every state mutation
  // ---------------------------------------------------------------
  function subscribe(fn) {
    state.listeners.push(fn);
  }

  function emit() {
    state.listeners.forEach(fn => fn(state));
  }

  function getState() {
    return state;
  }

  function setView(view) {
    state.currentView = view;
    emit();
  }

  // ---------------------------------------------------------------
  // Identity Access Log-In
  // ---------------------------------------------------------------
  function authenticate({ fullName, phone, email }) {
    state.patient.fullName = fullName.trim();
    state.patient.phone = phone.trim();
    state.patient.email = (email || '').trim();
    state.patient.identityVerified = true;
    setView(VIEWS.DASHBOARD);
  }

  // ---------------------------------------------------------------
  // Dentist / Slot Selection
  // ---------------------------------------------------------------
  function selectDentist(dentistId) {
    state.selectedDentistId = dentistId;
    state.selectedDate = null;
    state.selectedTime = null;
    emit();
  }

  function selectSlot(isoDate, time) {
    state.selectedDate = isoDate;
    state.selectedTime = time;
    emit();
  }

  // ---------------------------------------------------------------
  // Validation Engine
  // ---------------------------------------------------------------
  const ValidationRules = {
    fullName(value) {
      if (!value || value.trim().length < 3) return 'Please enter your full legal name (min 3 characters).';
      if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) return 'Name may only contain letters, spaces, apostrophes, and hyphens.';
      return null;
    },
    phone(value) {
      const digits = (value || '').replace(/\D/g, '');
      if (digits.length !== 10) return 'Enter a valid 10-digit US phone number.';
      return null;
    },
    email(value) {
      if (!value) return null; // optional
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(value)) return 'Enter a valid email address.';
      return null;
    },
    symptomCategory(value) {
      if (!value) return 'Please select a reason for your visit.';
      return null;
    },
    symptomNotes(value) {
      if (!value || value.trim().length < 10) return 'Describe your symptoms in at least 10 characters so the dentist can prepare.';
      if (value.trim().length > 500) return 'Symptom description is too long (max 500 characters).';
      return null;
    },
    slotSelected() {
      if (!state.selectedDate || !state.selectedTime) return 'Please select an available date and time slot.';
      return null;
    }
  };

  function validateRegistrationForm(formData) {
    const errors = {};
    const nameErr = ValidationRules.fullName(formData.fullName);
    const phoneErr = ValidationRules.phone(formData.phone);
    const emailErr = ValidationRules.email(formData.email);
    const symptomCatErr = ValidationRules.symptomCategory(formData.symptomCategory);
    const symptomNotesErr = ValidationRules.symptomNotes(formData.symptomNotes);
    const slotErr = ValidationRules.slotSelected();

    if (nameErr) errors.fullName = nameErr;
    if (phoneErr) errors.phone = phoneErr;
    if (emailErr) errors.email = emailErr;
    if (symptomCatErr) errors.symptomCategory = symptomCatErr;
    if (symptomNotesErr) errors.symptomNotes = symptomNotesErr;
    if (slotErr) errors.slot = slotErr;

    return { valid: Object.keys(errors).length === 0, errors };
  }

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // ---------------------------------------------------------------
  // SMS / Push Notification Queue Simulator
  // Mimics a realistic asynchronous carrier-grade delivery pipeline:
  // validating -> queued -> sending -> confirmed, each with network jitter.
  // ---------------------------------------------------------------
  function buildConfirmationMessage({ fullName, dentist, isoDate, time }) {
    const dateObj = new Date(isoDate + 'T00:00:00');
    const niceDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    return {
      sms: `MedConnect: Hi ${fullName.split(' ')[0]}, your appointment with ${dentist.name} is CONFIRMED for ${niceDate} at ${time}. Location: ${dentist.clinic.name}. Reply C to cancel.`,
      push: {
        title: 'Appointment Confirmed ✅',
        body: `${dentist.name} · ${niceDate} · ${time}`
      }
    };
  }

  function jitter(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Runs the full async confirmation pipeline.
   * onStatusChange(status, payload?) fires at each transition for UI binding.
   */
  function submitBooking(formData, onStatusChange) {
    const validation = validateRegistrationForm(formData);
    if (!validation.valid) {
      onStatusChange('failed', { errors: validation.errors });
      return;
    }

    const dentist = DentalDB.getDentistById(state.selectedDentistId);
    state.booking.symptomCategory = formData.symptomCategory;
    state.booking.symptomNotes = formData.symptomNotes.trim();
    state.booking.status = 'validating';
    onStatusChange('validating');

    // Stage 1: Validating clinical intake (simulated backend check)
    setTimeout(() => {
      state.booking.status = 'queued';
      onStatusChange('queued');

      // Stage 2: Queued in SMS gateway (carrier handoff)
      setTimeout(() => {
        state.booking.status = 'sending';
        onStatusChange('sending');

        // Stage 3: Sending via carrier network (jittered latency)
        setTimeout(() => {
          const message = buildConfirmationMessage({
            fullName: state.patient.fullName,
            dentist,
            isoDate: state.selectedDate,
            time: state.selectedTime
          });

          const confirmationRecord = {
            id: `MC-${Date.now().toString(36).toUpperCase()}`,
            timestamp: new Date().toISOString(),
            patient: { ...state.patient },
            dentist,
            isoDate: state.selectedDate,
            time: state.selectedTime,
            symptomCategory: state.booking.symptomCategory,
            symptomNotes: state.booking.symptomNotes,
            message
          };

          state.notificationQueue.push(confirmationRecord);
          state.booking.status = 'confirmed';
          state.booking.lastConfirmation = confirmationRecord;

          onStatusChange('confirmed', confirmationRecord);
          setView(VIEWS.CONFIRMATION);
        }, jitter(900, 1600));

      }, jitter(500, 900));

    }, jitter(400, 800));
  }

  function resetBookingFlow() {
    state.selectedDentistId = null;
    state.selectedDate = null;
    state.selectedTime = null;
    state.booking = { symptomCategory: '', symptomNotes: '', status: 'idle' };
    setView(VIEWS.DASHBOARD);
  }

  return {
    VIEWS,
    subscribe,
    getState,
    setView,
    authenticate,
    selectDentist,
    selectSlot,
    validateRegistrationForm,
    formatPhone,
    submitBooking,
    resetBookingFlow,
    ValidationRules
  };
})();
