# Project Tasks

This document defines the task breakdown for the project.
Each task can be converted into a GitHub issue.

---

## 1. Design

- [ ] Create UI design using Google Stitch
- [ ] Design two-column layout (form + image preview)
- [ ] Define input components and CTA placement
- [ ] Export design screenshots
- [ ] Store design assets under `docs/design/`

---

## 2. Frontend (React)

### Setup
- [ ] Initialize React project
- [ ] Setup basic project structure
- [ ] Configure API base URL

### Layout & Components
- [ ] Implement two-column layout
- [ ] Create ad input form
- [ ] Create image preview component
- [ ] Handle loading and empty states

### Integration
- [ ] Connect frontend to backend API
- [ ] Handle API errors gracefully
- [ ] Make preview responsive based on selected size

---

## 3. Backend (Python)

### Setup
- [ ] Initialize FastAPI project
- [ ] Create layered folder structure
- [ ] Load environment variables

### API
- [ ] Implement POST /generate-image endpoint
- [ ] Validate request payload
- [ ] Define request and response models

### Business Logic
- [ ] Implement image generation service
- [ ] Implement prompt builder utility
- [ ] Add size-based prompt constraints

### AI Providers
- [ ] Integrate OpenAI image generation
- [ ] Integrate Google Gemini image generation
- [ ] Provider selection based on request

### Error Handling
- [ ] Implement centralized error handling
- [ ] Handle external API failures gracefully

---

## 4. Documentation

- [ ] Update README with setup instructions
- [ ] Document API usage
- [ ] Add architecture notes if needed

---

## 5. Optional / Bonus

- [ ] Regenerate image functionality
- [ ] Download generated image
- [ ] History of generated images
