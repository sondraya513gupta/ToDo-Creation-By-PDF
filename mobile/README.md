# ToDoFlow AI — React Native Mobile Application

A cross-platform React Native mobile application built with **Expo**, tailored for the **ToDo-Creation-By-PDF & Autonomous AI Document Agent** backend.

---

## 📱 Mobile App Features

1. **Task Management (CRUD & Interactive UI)**:
   - Checkbox toggle with instant optimistic updates and strike-through styling.
   - Priority badges: 🔴 High, 🟡 Medium, 🟢 Low.
   - Origin badges: 🤖 AI Plan, 📄 PDF Extracted, ✍️ Manual.
   - Category filtering (All, AI Plan, PDF Extracted, Work, Study, General).
   - Real-time search by task title or description.
   - Swipe / one-tap delete with confirmation.

2. **🤖 AI Task Planner (Gemini Decomposer)**:
   - Type any natural language goal or milestone (e.g., *"Build an AI SaaS in 30 days"*).
   - Generates 4–8 structured, prioritized actionable tasks directly into your list.

3. **📄 PDF To-Do Extractor**:
   - Pick any PDF file (Project syllabus, meeting notes, assignments, contracts) from your phone.
   - Extracts actionable milestones and deadlines using AI or intelligent parsing.

4. **📑 Autonomous AI Document Agent Integration**:
   - Trigger the full autonomous document generation pipeline (`/agent`) directly from the mobile app.
   - View sequential milestone progress and the generated Microsoft Word (`.docx`) file path.

5. **⚡ Offline Mode & Multi-Device Network Config**:
   - Works fully offline using `@react-native-async-storage/async-storage`.
   - Real-time backend status indicator (🟢 Online / 🔴 Offline).
   - One-tap Network Settings modal to switch between:
     - **Wi-Fi LAN IP**: `http://192.168.1.42:8000` (for physical phones running Expo Go on the same Wi-Fi)
     - **Web / Localhost**: `http://localhost:8000`
     - **Android Emulator**: `http://10.0.2.2:8000`

---

## 🚀 Quick Start Guide

### Step 1: Start Backend Server
In the root directory (`c:\Users\sondr\OneDrive\Desktop\TODO`):
```powershell
# 1. Activate Python virtual environment (PowerShell)
.\.venv\Scripts\Activate.ps1

# 2. Run FastAPI server on 0.0.0.0:8000
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 2: Start the React Native Mobile App
In another terminal, navigate to `mobile/`:
```bash
cd mobile
npm start
```

### Step 3: Run on Your Device
- **On Android / iPhone (Real Phone)**:
  1. Install the free **Expo Go** app from Google Play Store or Apple App Store.
  2. Ensure your phone is connected to the same Wi-Fi network (`192.168.1.42`).
  3. Scan the QR code displayed in the terminal using Expo Go (or Camera app on iOS).
- **On Web Browser (Instant Preview)**:
  ```bash
  npm run web
  ```
  Open `http://localhost:8081` in Chrome or Edge!
- **On Android Emulator**:
  ```bash
  npm run android
  ```

---

## 📂 Project Architecture

```text
mobile/
├── App.js                     # Root container with state & modal coordination
├── app.json                   # Expo configuration & dark theme styling
├── package.json               # Dependencies & scripts
└── src/
    ├── components/
    │   ├── Header.js          # App header, connection pill & refresh button
    │   ├── StatsCard.js       # Progress bar & task statistics
    │   ├── FilterBar.js       # Search bar, category & status segment filters
    │   ├── TodoItem.js        # Interactive task card with priority/source badges
    │   ├── AddTodoModal.js    # Manual task creation sheet
    │   ├── AiPlanModal.js     # AI goal decomposition modal
    │   ├── PdfExtractModal.js # PDF picker & AI extractor modal
    │   ├── AgentDocModal.js   # Full AI Document Agent runner
    │   └── ServerConfigModal.js # LAN IP and network settings
    ├── services/
    │   └── api.js             # HTTP client with offline AsyncStorage fallback
    └── theme/
        └── colors.js          # Curated color palette and design tokens
```
