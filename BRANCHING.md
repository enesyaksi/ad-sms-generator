# Branching Strategy

This document defines the mandatory branching strategy for this project.

---

## Main Branches

- `main`  
  Production-ready code only.  
  Direct commits are **not allowed**.

- `develop`  
  Active development branch.  
  All feature branches must be merged here first.

---

## Feature Branches

All work must be done in feature branches.

### Naming Convention

feature/<scope>-<short-description>

Examples:
- `feature/frontend-two-column-layout`
- `feature/backend-generate-image-endpoint`
- `feature/design-stitch-ui`

---

## Workflow

1. Create a branch from `develop`
2. Work only on the assigned issue
3. Commit frequently with clear messages
4. Open a Pull Request to `develop`
5. Request review before merging

---

## Rules

- One issue = one branch
- No direct commits to `main`
- No long-lived feature branches
- Rebase or merge conflicts before PR review
