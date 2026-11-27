# SafeVoice (SafeHer) 🛡️

**AI Voice Distress & Emergency SOS System for Women Safety**

SafeVoice is a comprehensive, full-stack real-time emergency safety platform designed to protect individuals in distress. It combines continuous voice keyword recognition ("Help", "Bachao", "Save me"), ambient decibel scream analysis, automatic audio evidence recording, and instant multi-channel SOS dispatch with live GPS tracking via Telegram Bot API and SMS.

---

## 🌟 Key Features

1. **Continuous Voice Distress Detection**
   - In-browser continuous Speech Recognition listening for emergency keywords: *"Help"*, *"Bachao"*, *"Save me"*, *"Emergency"*, *"Police"*, *"Danger"*.
   - Web Audio API decibel sentinel to detect loud screams and violent spikes (>85 dB).

2. **Emergency SOS Panic Hub**
   - High-visibility pulsating SOS button with 1-tap activation.
   - 5-Second emergency cancellation grace period with siren audio warning.
   - Emergency cancellation PIN protection to prevent unauthorized cancellation.

3. **Live GPS Tracking & Reverse Geocoding**
   - High-accuracy GPS tracking with interactive Google Maps and OpenStreetMap coordinates.
   - OpenStreetMap Nominatim reverse geocoding to resolve coordinates to physical street addresses.

4. **Forensic Audio Evidence Recording**
   - Automatically captures 15-20 seconds of ambient audio evidence upon SOS trigger.
   - Securely uploads evidence to the backend and sends audio directly to Telegram emergency channels.

5. **Multi-Channel Dispatch (Telegram Bot & SMS)**
   - Telegram Bot API integration to instantly broadcast location, trigger cause, timestamp, and user details to emergency guardians.

6. **Safety Helplines, Legal Knowledge & AI Chatbot**
   - One-tap calling for national helplines: `112` (National Emergency), `1091` (Women Helpline), `181` (NCW), `1930` (Cyber Crime).
   - Knowledge base on constitutional & legal protections: Zero FIR, right to free legal aid, right to privacy.
   - Interactive Emergency Safety AI Chatbot.

7. **Safety Readiness & Analytics Dashboard**
   - Real-time safety readiness score (0-100%).
   - Detailed incident audit log and 7-day threat trend visualization.

---

## 📁 Repository Structure

```
safeher/
├── backend/
│   ├── config/            # db.js, env.js
│   ├── controllers/       # authController, contactController, alertController, evidenceController, analyticsController
│   ├── models/            # User, Contact, Alert
│   ├── routes/            # authRoutes, contactRoutes, alertRoutes, evidenceRoutes, analyticsRoutes
│   ├── middleware/        # authMiddleware, errorHandler, validate, rateLimiter, upload
│   ├── services/          # telegramService, locationService
│   ├── utils/             # asyncHandler, generateToken, mapsLink
│   ├── uploads/           # evidence audio (gitignored)
│   ├── app.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/            # manifest.json, icons, service worker (PWA)
    ├── src/
    │   ├── components/    # SOSButton, CountdownModal, ListeningStatus, ContactForm, ContactCard, AlertCard, Navbar, ProtectedRoute, Chatbot
    │   ├── pages/         # Login, Register, Dashboard, Contacts, AlertHistory, Analytics, Safety
    │   ├── hooks/         # useAudioDetection, useKeywordDetection, useGeolocation, useCountdown, useEvidenceRecorder
    │   ├── context/       # AuthContext, AlertContext
    │   ├── services/      # api.js, alertService, contactService
    │   ├── utils/         # constants.js, mapsLink.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas cluster URI)
- (Optional) Telegram Bot Token from [@BotFather](https://t.me/botfather)

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure your environment variables in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/safevoice
JWT_SECRET=your_super_secret_jwt_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_optional
TELEGRAM_DEFAULT_CHAT_ID=your_chat_id_optional
```

Start the backend server:
```bash
npm run dev
# Server runs at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

---

### 2. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🔒 Security & Emergency Verification
- **Default PIN:** `1234` (configurable upon registration or in user settings)
- **Voice Sentinel Keywords:** `help`, `bachao`, `save me`, `emergency`, `police`, `danger`
- **Scream Threshold:** >85 dB sustained
