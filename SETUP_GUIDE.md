# 🚀 Setup Guide

Complete setup guide for the AI SMS Ad Generator with Firebase integration and Campaign Management.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1: Firebase Setup](#step-1-firebase-setup)
- [Step 2: Clone and Setup](#step-2-clone-and-setup)
- [Step 3: Backend Setup](#step-3-backend-setup)
- [Step 4: Frontend Setup](#step-4-frontend-setup)
- [Step 5: Running the Project](#step-5-running-the-project)
- [Step 6: Verify Everything Works](#step-6-verify-everything-works)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Check Command | Download |
|------|---------|---------------|----------|
| Git | 2.30+ | `git --version` | [git-scm.com](https://git-scm.com/) |
| Python | 3.10+ | `python --version` | [python.org](https://python.org/) |
| Node.js | 18+ | `node --version` | [nodejs.org](https://nodejs.org/) |
| npm | 9+ | `npm --version` | Comes with Node.js |

### Required Accounts
- **Google AI Studio Account** - For Gemini API key ([aistudio.google.com](https://aistudio.google.com/))
- **Firebase Account** - For Authentication and Firestore ([console.firebase.google.com](https://console.firebase.google.com/))

---

## Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** (or **"Add project"**)
3. Enter project name (e.g., `ai-sms-generator`)
4. Disable Google Analytics (optional for this project)
5. Click **Create project**

### 1.2 Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable the following providers:
   - **Email/Password**: Click, toggle "Enable", Save
   - **Google**: Click, toggle "Enable", configure support email, Save

### 1.3 Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a region close to you
5. Click **Enable**

### 1.4 Get Firebase Web Configuration

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll down to **"Your apps"**
3. Click the **Web** icon (`</>`) to add a web app
4. Register app with a nickname (e.g., `ai-sms-web`)
5. Copy the configuration object - you'll need these values:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

### 1.5 Generate Service Account Key (Backend)

1. Go to **Project Settings** → **Service accounts**
2. Click **"Generate new private key"**
3. Confirm by clicking **"Generate key"**
4. Save the downloaded JSON file as `serviceAccountKey.json`
5. **⚠️ IMPORTANT**: Keep this file secure, never commit to Git!

---

## Step 2: Clone and Setup

### 2.1 Clone the Repository

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ai-sms-generator.git

# Navigate into the project
cd ai-sms-generator
```

### 2.2 Verify Project Structure

```
ai-sms-generator/
├── backend/
│   ├── app/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── config/
│   │   └── ...
│   └── requirements.txt
├── frontend/
│   ├── src/
│   └── package.json
├── README.md
└── SETUP_GUIDE.md
```

---

## Step 3: Backend Setup

### 3.1 Create Virtual Environment

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate
```

### 3.2 Install Dependencies

```bash
pip install -r requirements.txt
```

### 3.3 Configure Environment Variables

Create a `.env` file in the `backend` folder:

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### 3.4 Add Firebase Service Account

Copy the `serviceAccountKey.json` file you downloaded earlier to the `backend` folder:

```bash
# Your backend folder should now contain:
backend/
├── app/
├── venv/
├── .env
├── serviceAccountKey.json  # ← Place here
└── requirements.txt
```

### 3.5 Verify .gitignore

Ensure these files are in `.gitignore`:

```
.env
serviceAccountKey.json
venv/
__pycache__/
```

### 3.6 Test Backend

```bash
# Start the backend server
uvicorn app.main:app --reload --port 8000

# Expected output:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete.
```

Open http://localhost:8000/docs to see the Swagger UI.

---

## Step 4: Frontend Setup

### 4.1 Install Dependencies

```bash
# Navigate to frontend folder
cd ../frontend

# Install dependencies
npm install
```

### 4.2 Configure Environment Variables

Create a `.env` file in the `frontend` folder with your Firebase config:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Firebase Configuration (from Step 1.4)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4.3 Verify .env.example

Update `frontend/.env.example` with template values:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4.4 Test Frontend

```bash
# Start the development server
npm run dev

# Expected output:
#   VITE v5.x.x  ready in xxx ms
#   ➜  Local:   http://localhost:5173/
```

---

## Step 5: Running the Project

### Start Both Servers

You need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate      # Windows
# source venv/bin/activate  # Mac/Linux
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| ReDoc Docs | http://localhost:8000/redoc |

---

## Step 6: Verify Everything Works

### 6.1 Check Backend Health

```bash
curl http://localhost:8000/health

# Expected: {"status": "healthy"}
```

### 6.2 Test Login Flow

1. Open http://localhost:5173
2. You should see the Login page
3. Click **"Kayıt Ol"** to create a new account
4. Fill in:
   - Display Name
   - Email
   - Password (8+ chars, upper, lower, special)
5. After registration, you'll be redirected to **Email Verification** page
6. Check your email for verification link
7. Click the link to verify your email
8. Return to the app - you'll be redirected to the Overview Dashboard

### 6.3 Test Customer Creation

1. Navigate to **Müşteriler** (Customers) page
2. Click **"+ Yeni Müşteri Ekle"**
3. Enter company name and website URL
4. Click **"Kaydet"**
5. Customer card should appear with auto-extracted logo

### 6.4 Test Campaign Creation

1. Navigate to **Kampanyalar** (Campaigns) page
2. Click **"+ Yeni Kampanya"**
3. Fill in campaign details:
   - Select a customer
   - Add products (comma-separated or press Enter)
   - Set discount rate
   - Choose start and end dates
4. Click **"Oluştur"**
5. Campaign should appear with "Taslak" status

### 6.5 Test SMS Generation

1. Open a campaign detail page
2. Click **"SMS Oluştur"** button
3. SMS drafts should be generated based on campaign data
4. Copy any draft to clipboard by clicking on it

---

## Troubleshooting

### Backend Issues

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| Firebase init error | Check `serviceAccountKey.json` path in `.env` |
| Port 8000 in use | Use `--port 8001` or kill existing process |

### Frontend Issues

| Problem | Solution |
|---------|----------|
| Firebase auth error | Verify all `VITE_FIREBASE_*` env vars are set |
| CORS error | Ensure backend is running on port 8000 |
| Blank page | Check browser console for errors |

### Firebase Issues

| Problem | Solution |
|---------|----------|
| `auth/invalid-api-key` | Check `VITE_FIREBASE_API_KEY` is correct |
| `auth/unauthorized-domain` | Add `localhost` to authorized domains in Firebase Console |
| Firestore permission denied | Check Firestore rules (use test mode for dev) |

### Adding Localhost to Authorized Domains

1. Go to Firebase Console → Authentication → Settings
2. Under **Authorized domains**, ensure `localhost` is listed
3. If not, click **Add domain** and add `localhost`

---

## Quick Reference

```bash
# Start Backend
cd backend && venv\Scripts\activate && uvicorn app.main:app --reload

# Start Frontend
cd frontend && npm run dev

# Create Feature Branch
git checkout develop && git pull && git checkout -b feature/your-feature

# Commit Changes
git add . && git commit -m "feat(scope): description"
```

---

> 💡 **Tip:** Keep both terminal windows visible while developing.
> Backend logs will show API requests, frontend console shows React errors.
