# Contributing Guidelines

This document defines **how development must be done** in this project.

All contributors are expected to follow these rules strictly.

---

## 1. Repository Usage

- This repository is a **template**.
- Interns must use **"Use this template"** to create their own repository.
- No development is allowed directly in this template repository.

---

## 2. Issue Policy

- Every task must have a GitHub Issue.
- No work should start without an assigned issue.
- One issue represents one unit of work.

---

## 3. Branch Policy

- One issue = one branch.
- Branches must be created from `develop`.
- Branch naming must follow the convention:

feature/<scope>-<short-description>

Examples:
- `feature/frontend-ad-form`
- `feature/backend-image-generation`
- `feature/design-stitch-ui`

---

## 4. Commit Rules

- Commits must be small and meaningful.
- Each commit message must clearly describe **what changed**.

### Commit Message Format

<type>: <short description>

Examples:
- `feat: add image preview component`
- `fix: handle empty prompt input`
- `refactor: extract prompt builder utility`

---

## 5. Pull Request Rules

- All changes must go through a Pull Request.
- Pull Requests must target the `develop` branch.
- A Pull Request must reference the related issue.

### Pull Request Description Must Include

- What was implemented
- Why it was implemented
- Related issue number

---

## 6. Code Quality Expectations

- Follow the architecture defined in README.md
- Respect layer separation (Controller / Service / Util / Client)
- No business logic in controllers
- No API calls in frontend components
- Keep code clean and readable

---

## 7. Forbidden Practices

- Direct commits to `main`
- Working without an issue
- Mixing multiple features in one branch
- Skipping Pull Requests
- Hardcoding API keys

---

## 8. Review Process

- Reviews focus on architecture compliance and code clarity
- Feedback must be addressed before merging
- Review comments are part of the learning process

---

## 9. Final Note

This project is designed to simulate a **professional software development environment**.

Failure to follow these rules will negatively affect the evaluation.
