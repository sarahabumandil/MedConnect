/**
 * MedConnect — Dental Core
 * data.js — Unified Dental Database Layer
 * -------------------------------------------------------------
 * Single source of truth for all dentist, slot, and clinic metadata.
 * No hardcoded UI strings live here — only data. Every consumer
 * (app.js / state.js) hydrates views dynamically from this module.
 */

const DentalDB = (() => {

  /** Generates a deterministic-but-realistic set of open slots for the next 5 business days */
  function generateSlotMatrix(seed = 1) {
    const days = [];
    const today = new Date();
    const baseSlots = ['08:00 AM', '09:15 AM', '10:30 AM', '11:45 AM', '01:00 PM', '02:15 PM', '03:30 PM', '04:45 PM'];

    let cursor = 0;
    while (days.length < 5) {
      const d = new Date(today);
      d.setDate(today.getDate() + cursor);
      cursor++;
      // Skip Sundays for clinic realism
      if (d.getDay() === 0) continue;

      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const isoDate = d.toISOString().split('T')[0];

      // Deterministic pseudo-random slot availability per dentist seed
      const available = baseSlots.filter((_, idx) => ((idx + seed + cursor) % 3) !== 0);

      days.push({ isoDate, dayLabel, slots: available });
    }
    return days;
  }

  const dentists = [
    {
      id: 'dr-amelia-hart',
      name: 'Dr. Amelia Hart, DDS',
      specialty: 'Cosmetic & Restorative Dentistry',
      credentials: 'DDS · Harvard School of Dental Medicine',
      yearsExperience: 14,
      rating: 4.9,
      reviewCount: 482,
      avatarInitials: 'AH',
      accentColor: '#0E7C7B',
      bio: 'Specializes in veneers, smile makeovers, and full-mouth restorations using digital smile design technology.',
      languages: ['English', 'Spanish'],
      clinic: { name: 'MedConnect Midtown Dental Studio', address: '212 Park Avenue, Suite 4B, New York, NY' },
      tags: ['Veneers', 'Whitening', 'Smile Design'],
      slots: generateSlotMatrix(1)
    },
    {
      id: 'dr-marcus-chen',
      name: 'Dr. Marcus Chen, DMD',
      specialty: 'Orthodontics & Invisalign',
      credentials: 'DMD · University of Pennsylvania',
      yearsExperience: 11,
      rating: 4.8,
      reviewCount: 367,
      avatarInitials: 'MC',
      accentColor: '#2563EB',
      bio: 'Board-certified orthodontist focused on Invisalign, ClearCorrect, and pediatric alignment correction.',
      languages: ['English', 'Mandarin'],
      clinic: { name: 'MedConnect Orthodontic Center', address: '88 Lexington St, Boston, MA' },
      tags: ['Invisalign', 'Braces', 'Pediatric Ortho'],
      slots: generateSlotMatrix(2)
    },
    {
      id: 'dr-sofia-ramirez',
      name: 'Dr. Sofia Ramirez, DDS',
      specialty: 'Periodontics & Gum Therapy',
      credentials: 'DDS · UCLA School of Dentistry',
      yearsExperience: 9,
      rating: 4.95,
      reviewCount: 298,
      avatarInitials: 'SR',
      accentColor: '#DB2777',
      bio: 'Expert in laser gum therapy, implant placement, and minimally invasive periodontal treatment.',
      languages: ['English', 'Spanish', 'Portuguese'],
      clinic: { name: 'MedConnect Periodontal Institute', address: '450 Sunset Blvd, Los Angeles, CA' },
      tags: ['Implants', 'Gum Therapy', 'Laser Dentistry'],
      slots: generateSlotMatrix(3)
    },
    {
      id: 'dr-james-okafor',
      name: 'Dr. James Okafor, DMD',
      specialty: 'Endodontics (Root Canal Specialist)',
      credentials: 'DMD · Columbia University College of Dental Medicine',
      yearsExperience: 17,
      rating: 4.85,
      reviewCount: 521,
      avatarInitials: 'JO',
      accentColor: '#7C3AED',
      bio: 'High-precision microscope-guided root canal therapy with same-day emergency pain relief protocols.',
      languages: ['English', 'French', 'Igbo'],
      clinic: { name: 'MedConnect Endodontic Specialists', address: '17 Wacker Drive, Chicago, IL' },
      tags: ['Root Canal', 'Emergency Care', 'Microscopic Dentistry'],
      slots: generateSlotMatrix(4)
    },
    {
      id: 'dr-emily-park',
      name: 'Dr. Emily Park, DDS',
      specialty: 'Pediatric & Family Dentistry',
      credentials: 'DDS · University of Michigan',
      yearsExperience: 8,
      rating: 4.97,
      reviewCount: 410,
      avatarInitials: 'EP',
      accentColor: '#EA580C',
      bio: 'Gentle, anxiety-free pediatric care with sedation options and behavior-guided treatment for children.',
      languages: ['English', 'Korean'],
      clinic: { name: 'MedConnect Family Dental Wing', address: '900 Pine Street, Seattle, WA' },
      tags: ['Pediatric Care', 'Sedation', 'Family Checkups'],
      slots: generateSlotMatrix(5)
    },
    {
      id: 'dr-david-castillo',
      name: 'Dr. David Castillo, DDS',
      specialty: 'Oral & Maxillofacial Surgery',
      credentials: 'DDS, MD · Stanford University',
      yearsExperience: 19,
      rating: 4.9,
      reviewCount: 603,
      avatarInitials: 'DC',
      accentColor: '#15803D',
      bio: 'Specialist in wisdom tooth extraction, jaw reconstruction, and complex full-arch implant surgery.',
      languages: ['English', 'Spanish'],
      clinic: { name: 'MedConnect Surgical Dental Center', address: '301 Market Street, San Francisco, CA' },
      tags: ['Wisdom Teeth', 'Jaw Surgery', 'Full-Arch Implants'],
      slots: generateSlotMatrix(6)
    }
  ];

  const symptomCategories = [
    'Tooth Pain / Sensitivity',
    'Bleeding or Swollen Gums',
    'Chipped or Broken Tooth',
    'Routine Checkup & Cleaning',
    'Braces / Invisalign Consultation',
    'Wisdom Tooth Concern',
    'Dental Emergency',
    'Cosmetic Consultation'
  ];

  function getAllDentists() {
    return dentists;
  }

  function getDentistById(id) {
    return dentists.find(d => d.id === id) || null;
  }

  function getSymptomCategories() {
    return symptomCategories;
  }

  return {
    getAllDentists,
    getDentistById,
    getSymptomCategories
  };
})();
