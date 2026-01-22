# AI Ad Creative Generator – Template Repository

> ⚠️ **This repository contains no implementation code by design.**  
> Interns must create the folder structure and code according to this document.

A template project designed for intern evaluation. It defines the architecture, rules, and expectations for a full-stack AI-powered ad creative generator.

---

## Table of Contents

- [Project Overview](#project-overview)
- [High-Level Architecture](#high-level-architecture)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [API Contract](#api-contract)
- [Prompt Construction](#prompt-construction)
- [Development Rules](#development-rules)
- [Evaluation Criteria](#evaluation-criteria)
- [Ownership](#ownership)

---

## Project Overview

The goal of this project is to build a web-based application that generates advertising images using AI.

**Users will be able to:**

- Enter an ad headline
- Describe the desired visual
- Select an ad size (e.g., `300x250`, `320x480`)
- Choose an AI image generation model (ChatGPT or Gemini)
- Generate and preview an AI-created image

This project simulates a real-world full-stack development workflow.

---

## High-Level Architecture

```
React Frontend → Python Backend (API) → AI Providers (OpenAI / Gemini)
```

| Layer | Responsibilities |
|-------|------------------|
| **Frontend** | UI rendering, user interaction, API communication |
| **Backend** | Business logic, prompt construction, AI provider selection |
| **AI Providers** | Image generation only |

> ⚠️ **Important:** Frontend must never communicate directly with AI providers.

---

## Backend Architecture

The backend must follow a **layered architecture**.

### Layers

| Layer | Responsibility |
|-------|----------------|
| **Controller** | HTTP request / response handling |
| **Service** | Business logic and orchestration |
| **Client** | External AI provider communication |
| **Util** | Shared helpers and prompt building |
| **Model** | Request and response schemas |
| **Config** | Environment and application configuration |

### Required Folder Structure

```
backend/
├── app/
│   ├── main.py
│   │
│   ├── controllers/
│   │   └── image_controller.py
│   │
│   ├── services/
│   │   └── image_generation_service.py
│   │
│   ├── clients/
│   │   ├── openai_client.py
│   │   └── gemini_client.py
│   │
│   ├── utils/
│   │   ├── prompt_builder.py
│   │   └── image_utils.py
│   │
│   ├── models/
│   │   ├── request_models.py
│   │   └── response_models.py
│   │
│   ├── config/
│   │   └── settings.py
│   │
│   └── exceptions/
│       └── api_exceptions.py
│
├── requirements.txt
└── .env.example
```

### Backend Rules

- ✅ Controllers must **not** contain business logic
- ✅ Services must **not** contain HTTP logic
- ✅ Clients must **only** handle external API calls
- ✅ Prompt construction must be isolated in `utils`
- ✅ API keys must be loaded via environment variables

---

## Frontend Architecture

The frontend must be implemented using **React.js** with functional components.

### Required Folder Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Form/
│   │   │   └── AdForm.jsx
│   │   │
│   │   ├── Preview/
│   │   │   └── ImagePreview.jsx
│   │   │
│   │   └── common/
│   │       └── Button.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── pages/
│   │   └── Home.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
```

### Frontend Rules

- ✅ No API keys in frontend
- ✅ API calls must be isolated in `services`
- ✅ Components must be small and reusable
- ✅ UI must follow the **Google Stitch** design

---

## API Contract

### Endpoint

```
POST /generate-image
```

### Request Body

```json
{
  "headline": "Summer Sale",
  "description": "Minimal product ad with bright background",
  "size": "300x250",
  "model": "chatgpt"
}
```

### Response Body

```json
{
  "image": "base64_or_url",
  "provider": "chatgpt",
  "size": "300x250"
}
```

---

## Prompt Construction

Prompt building must happen **only in the backend**.

### Responsibilities

- Merge headline and visual description
- Apply ad size constraints
- Optimize prompt for ad creatives
- Handle provider-specific formatting

### Implementation Location

```
backend/app/utils/prompt_builder.py
```

---

## Development Rules

| Rule | Description |
|------|-------------|
| **Template Usage** | Interns must use "Use this template" to create their own repository |
| **Development Location** | All development happens in the intern's repository |
| **Issue Tracking** | One GitHub issue = one feature |
| **Branching** | One feature = one branch |
| **Main Protection** | No direct commits to `main` |
| **Code Review** | All changes must go through Pull Requests |

---

## Evaluation Criteria

Interns will be evaluated based on:

- 📐 Architecture compliance
- 📝 Code quality and readability
- 🧩 Proper layer separation
- 🌿 Git discipline (branches, commits, PRs)
- 📚 Documentation clarity

---

## Ownership

- Architecture and rules are defined in this repository
- Deviations must be proposed and discussed before implementation
- This repository remains clean and implementation-free

---

## License

This project is for internal evaluation purposes only.
