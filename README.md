# MedConnect : Dental Core

> **Clinical Grade Dentistry Appointment Platform**  
> A HIPAA-aligned, fully interactive prototype for dental practice management and patient registration.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Technical Stack](#technical-stack)
- [State Management](#state-management)
- [API Simulation](#api-simulation)
- [Browser Support](#browser-support)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

**MedConnect — Dental Core** is a premium, fully interactive clinical registration and telehealth access prototype designed for dental practices. It simulates the complete patient journey from identity verification to appointment confirmation with real-time SMS/push notifications.

### **Why MedConnect?**

- **Clinical Precision:** Designed with a "surgical suite" aesthetic — calm, trustworthy, and professional.
- **HIPAA-Aligned:** Built with patient privacy and data security as core principles.
- **Realistic Workflow:** Simulates carrier-grade SMS delivery with network jitter for authentic user experience.
- **Production-Ready Prototype:** Clean architecture that can be extended into a full production application.

---

## Features

### **Identity & Access Management**
- Secure login with real-time form validation
- Automatic phone number formatting
- Optional email collection for enhanced communication
- HIPAA-compliant authentication flow

### **Advanced Dentistry Dashboard**
- Browse 6+ specialized dentists with rich profiles
- Each dentist features:
  - Professional avatar with initials
  - Rating (⭐ 4.5–4.97)
  - Specialty, credentials, and years of experience
  - Tags for quick specialty identification
  - Clinic location and address
  - Custom accent colors for visual distinction

### **Clinical Patient Registration**
- Multi-step form with sections:
  1. **Patient Information** — Full name and mobile phone
  2. **Reason for Visit** — Symptom category dropdown (8 categories)
  3. **Detailed Symptoms** — Free-text description with 500-character limit and live counter
  4. **Appointment Slot Selection** — Date and time picker with real-time availability

### **Appointment Confirmation System**
- Unique confirmation ID generation (e.g., `MC-XXXX`)
- Detailed appointment summary with all patient and dentist information
- SMS preview that mirrors real carrier gateway notifications
- Push notification simulation with toast messages

### **Notification System**
- Toast notifications for:
  - Identity verification success
  - Form validation errors
  - Queued processing states
  - Appointment confirmation
- Visual feedback for every action

### **State-Driven Navigation**
- Bottom navigation with 3 primary views:
  - **Dentists** — Browse and select specialists
  - **Booking** — Complete the registration form
  - **Confirmed** — View appointment details
- Intelligent navigation: buttons are disabled when contextually unavailable

---

## Screenshots

### Login Screen
*Clean, professional authentication with gradient background and HIPAA compliance notice.*

### Dashboard
*Grid layout showing all dentists with ratings, specialties, and location.*

### Registration Form
*Multi-step form with symptom selection, notes, and slot picker.*

### Confirmation Screen
*Full appointment details with SMS preview and confirmation ID.*

---

## Installation

### **Prerequisites**
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: Local development server (Live Server, http-server, etc.)

### **Quick Start**

```bash
# Clone the repository
git clone https://github.com/yourusername/medconnect-dental-core.git

# Navigate to project directory
cd medconnect-dental-core

# Open in browser
# Method 1: Double-click index.html
# Method 2: Open with Live Server (VS Code)
# Method 3: Use Python's built-in server
python -m http.server 8000
# Then visit http://localhost:8000
