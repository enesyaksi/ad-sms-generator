# 🚀 Setup Guide

This guide walks you through setting up the AI Ad Creative Generator project from scratch.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1: Create Your Repository](#step-1-create-your-repository)
- [Step 2: Clone and Setup](#step-2-clone-and-setup)
- [Step 3: Backend Setup](#step-3-backend-setup)
- [Step 4: Frontend Setup](#step-4-frontend-setup)
- [Step 5: Environment Variables](#step-5-environment-variables)
- [Step 6: Running the Project](#step-6-running-the-project)
- [Step 7: Verify Everything Works](#step-7-verify-everything-works)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, make sure you have the following installed:

| Tool | Version | Check Command | Download |
|------|---------|---------------|----------|
| Git | 2.30+ | `git --version` | [git-scm.com](https://git-scm.com/) |
| Python | 3.10+ | `python --version` | [python.org](https://python.org/) |
| Node.js | 18+ | `node --version` | [nodejs.org](https://nodejs.org/) |
| npm | 9+ | `npm --version` | Comes with Node.js |
| VS Code | Latest | - | [code.visualstudio.com](https://code.visualstudio.com/) |

### Recommended VS Code Extensions

```
- Python (Microsoft)
- Pylance
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- GitLens
```

---

## Step 1: Create Your Repository

### 1.1 Use the Template

1. Go to the template repository on GitHub
2. Click the green **"Use this template"** button
3. Select **"Create a new repository"**
4. Configure your new repository:
   - Owner: Your GitHub account
   - Repository name: `ai-ad-creative-generator`
   - Visibility: Private (recommended)
5. Click **"Create repository"**

### 1.2 Verify Repository Created

Your new repository should have:
```
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── CODEOWNERS
│   └── PULL_REQUEST_TEMPLATE.md
├── BRANCHING.md
├── CONTRIBUTING.md
├── LICENSE
├── PR_EVALUATION.md
├── README.md
└── TASKS.md
```

---

## Step 2: Clone and Setup

### 2.1 Clone Your Repository

```bash
# Clone your repository (not the template!)
git clone https://github.com/YOUR_USERNAME/ai-ad-creative-generator.git

# Navigate into the project
cd ai-ad-creative-generator
```

### 2.2 Setup Git Configuration

```bash
# Set your identity (if not already set globally)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Verify configuration
git config --list
```

### 2.3 Create Development Branch

```bash
# Create and switch to develop branch
git checkout -b develop

# Push develop branch to remote
git push -u origin develop
```

---

## Step 3: Backend Setup

### 3.1 Create Folder Structure

```bash
# Create backend directory structure
mkdir -p backend/app/{controllers,services,clients,utils,models,config,exceptions}

# Create empty __init__.py files (required for Python packages)
touch backend/app/__init__.py
touch backend/app/controllers/__init__.py
touch backend/app/services/__init__.py
touch backend/app/clients/__init__.py
touch backend/app/utils/__init__.py
touch backend/app/models/__init__.py
touch backend/app/config/__init__.py
touch backend/app/exceptions/__init__.py
```

Your backend structure should look like:
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # (create later)
│   ├── controllers/
│   │   ├── __init__.py
│   │   └── image_controller.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── image_generation_service.py
│   ├── clients/
│   │   ├── __init__.py
│   │   ├── openai_client.py
│   │   └── gemini_client.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── prompt_builder.py
│   │   └── image_utils.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── request_models.py
│   │   └── response_models.py
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py
│   └── exceptions/
│       ├── __init__.py
│       └── api_exceptions.py
├── requirements.txt
└── .env.example
```

### 3.2 Create Virtual Environment

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Verify activation (should show venv path)
which python  # macOS/Linux
where python  # Windows
```

### 3.3 Create requirements.txt

```bash
# Create requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.109.0
uvicorn==0.27.0
pydantic==2.5.3
python-dotenv==1.0.0
httpx==0.26.0
openai==1.12.0
google-generativeai==0.3.2
python-multipart==0.0.6
EOF
```

### 3.4 Install Dependencies

```bash
# Install all dependencies
pip install -r requirements.txt

# Verify installation
pip list
```

### 3.5 Create Main Entry Point

```bash
# Create main.py
cat > app/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Ad Creative Generator",
    description="Generate advertising images using AI",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI Ad Creative Generator API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
EOF
```

### 3.6 Test Backend

```bash
# Run the server
uvicorn app.main:app --reload

# You should see:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete.
```

Open http://localhost:8000 in your browser. You should see:
```json
{"message": "AI Ad Creative Generator API", "status": "running"}
```

Press `Ctrl+C` to stop the server.

---

## Step 4: Frontend Setup

### 4.1 Create React Project

```bash
# Go back to project root
cd ..

# Create React project with Vite
npm create vite@latest frontend -- --template react

# Navigate to frontend
cd frontend
```

### 4.2 Install Dependencies

```bash
# Install base dependencies
npm install

# Install additional dependencies
npm install axios
```

### 4.3 Create Folder Structure

```bash
# Create folder structure
mkdir -p src/components/{Form,Preview,common}
mkdir -p src/services
mkdir -p src/pages
```

Your frontend structure should look like:
```
frontend/
├── src/
│   ├── components/
│   │   ├── Form/
│   │   │   └── AdForm.jsx
│   │   ├── Preview/
│   │   │   └── ImagePreview.jsx
│   │   └── common/
│   │       └── Button.jsx
│   ├── services/
│   │   └── api.js
│   ├── pages/
│   │   └── Home.jsx
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── .env.example
```

### 4.4 Create API Service

```bash
# Create API service file
cat > src/services/api.js << 'EOF'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const generateImage = async (params) => {
  const response = await fetch(`${API_BASE_URL}/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to generate image');
  }

  return response.json();
};

export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
};
EOF
```

### 4.5 Test Frontend

```bash
# Start development server
npm run dev

# You should see:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

Open http://localhost:5173 in your browser. You should see the Vite + React welcome page.

Press `Ctrl+C` to stop the server.

---

## Step 5: Environment Variables

### 5.1 Backend Environment

```bash
# Navigate to backend
cd ../backend

# Create .env.example (commit this)
cat > .env.example << 'EOF'
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Google Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Application Configuration
APP_DEBUG=false
APP_PORT=8000
APP_HOST=0.0.0.0
EOF

# Create actual .env file (DO NOT commit this!)
cp .env.example .env

# Edit .env and add your real API keys
# nano .env  or  code .env
```

### 5.2 Frontend Environment

```bash
# Navigate to frontend
cd ../frontend

# Create .env.example (commit this)
cat > .env.example << 'EOF'
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
EOF

# Create actual .env file
cp .env.example .env
```

### 5.3 Update .gitignore

```bash
# In project root, create/update .gitignore
cd ..

cat > .gitignore << 'EOF'
# Environment files
.env
.env.local
.env.*.local

# Python
__pycache__/
*.py[cod]
*$py.class
venv/
.venv/
*.egg-info/
dist/
build/

# Node
node_modules/
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Build outputs
*.log
EOF
```

---

## Step 6: Running the Project

### 6.1 Start Backend

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000
```

### 6.2 Start Frontend

```bash
# Terminal 2: Frontend
cd frontend
npm run dev
```

### 6.3 Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

---

## Step 7: Verify Everything Works

### 7.1 Check Backend Health

```bash
# Using curl
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy"}
```

### 7.2 Check API Documentation

Open http://localhost:8000/docs in your browser.
You should see the Swagger UI with available endpoints.

### 7.3 Check Frontend Connects to Backend

Open browser developer tools (F12) → Network tab.
The frontend should be able to call the backend without CORS errors.

---

## Troubleshooting

### Python Issues

| Problem | Solution |
|---------|----------|
| `python: command not found` | Use `python3` instead, or add Python to PATH |
| `venv not activating` | Check the activation command for your OS |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` again |
| `Port 8000 already in use` | Kill the process or use `--port 8001` |

### Node.js Issues

| Problem | Solution |
|---------|----------|
| `npm: command not found` | Reinstall Node.js |
| `EACCES permission denied` | Don't use `sudo`, fix npm permissions |
| `node_modules issues` | Delete `node_modules` and run `npm install` |
| `Port 5173 already in use` | Kill the process or Vite will auto-pick another |

### Git Issues

| Problem | Solution |
|---------|----------|
| `Permission denied (publickey)` | Setup SSH keys for GitHub |
| `Failed to push` | Run `git pull` first, then push |
| `Merge conflicts` | See GIT_WORKFLOW.md for resolution steps |

### CORS Issues

If you see CORS errors in browser console:

```python
# Make sure backend has CORS configured in main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Environment Variable Issues

| Problem | Solution |
|---------|----------|
| API key not loading | Check `.env` file exists and has correct format |
| Frontend can't read env | Prefix with `VITE_` for Vite projects |
| Changes not reflecting | Restart the server after changing `.env` |

---

## Next Steps

After completing setup:

1. ✅ Read [TASKS.md](./TASKS.md) to understand your assignments
2. ✅ Read [CODING_STANDARDS.md](./CODING_STANDARDS.md) before writing code
3. ✅ Read [BRANCHING.md](./BRANCHING.md) for Git workflow
4. ✅ Create your first feature branch
5. ✅ Start with your assigned issue

---

## Quick Reference

```bash
# Start Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Start Frontend
cd frontend && npm run dev

# Create Feature Branch
git checkout develop && git pull && git checkout -b feature/your-feature

# Commit Changes
git add . && git commit -m "feat(scope): description"

# Push Branch
git push -u origin feature/your-feature
```

---

> 💡 **Tip:** Keep this guide open in a separate tab while working.  
> You'll likely refer back to it multiple times!
