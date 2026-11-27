export const DISTRESS_KEYWORDS = [
  'help',
  'bachao',
  'save me',
  'emergency',
  'danger',
  'police',
  'chodo',
  'madad',
  'help me',
  'safevoice'
];

export const EMERGENCY_HELPLINES = [
  {
    name: 'National Emergency Number',
    number: '112',
    description: 'All-in-one emergency service (Police, Fire, Ambulance)',
    category: 'police',
    color: 'from-blue-600 to-indigo-600'
  },
  {
    name: 'Women Helpline (All India)',
    number: '1091',
    description: '24x7 dedicated emergency helpline for women',
    category: 'women',
    color: 'from-rose-600 to-pink-600'
  },
  {
    name: 'Women in Distress (NCW)',
    number: '181',
    description: 'National Commission for Women 24/7 toll-free helpline',
    category: 'women',
    color: 'from-pink-600 to-purple-600'
  },
  {
    name: 'Student & Cyber Crime Helpline',
    number: '1930',
    description: 'Report financial frauds and cyber harassment',
    category: 'cyber',
    color: 'from-cyan-600 to-teal-600'
  },
  {
    name: 'Childline',
    number: '1098',
    description: 'Emergency assistance for children & minors',
    category: 'child',
    color: 'from-amber-600 to-orange-600'
  }
];

export const TRIGGER_TYPES = {
  manual_sos: {
    label: 'Manual SOS Button',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    icon: 'AlertCircle'
  },
  voice_keyword: {
    label: 'Voice Keyword ("Help/Bachao")',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: 'Mic'
  },
  scream_detected: {
    label: 'Loud Scream / Distress Decibels',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: 'Volume2'
  },
  fall_detected: {
    label: 'Impact / Sudden Fall',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    icon: 'Activity'
  },
  test_alert: {
    label: 'Test Safety Verification',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: 'CheckCircle2'
  }
};
