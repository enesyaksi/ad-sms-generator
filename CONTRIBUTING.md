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
- Issues should include clear acceptance criteria.

---

## 3. Branch Policy

- One issue = one branch.
- Branches must be created from `develop`.
- Branch naming must follow the convention:

```
feature/<scope>-<short-description>
```

### Branch Naming Examples

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<scope>-<description>` | `feature/frontend-campaign-details` |
| Bugfix | `fix/<scope>-<description>` | `fix/backend-date-validation` |
| Documentation | `docs/<description>` | `docs/update-user-guide` |
| Refactor | `refactor/<scope>-<description>` | `refactor/frontend-api-service` |

### Valid Scopes

| Scope | Usage |
|-------|-------|
| `frontend` | React/UI changes |
| `backend` | Python/API changes |
| `docs` | Documentation |
| `config` | Configuration files |
| *(empty)* | Cross-cutting changes |

---

## 4. Commit Rules

- Commits must be small and meaningful.
- Each commit message must clearly describe **what changed**.

### Commit Message Format

```
<type>(<scope>): <short description>
```

### Commit Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(frontend): add campaign details page` |
| `fix` | Bug fix | `fix(backend): validate campaign dates` |
| `docs` | Documentation | `docs: update user guide` |
| `style` | Formatting only | `style(frontend): fix indentation` |
| `refactor` | Code restructure | `refactor(frontend): extract modal component` |
| `test` | Adding tests | `test(backend): add campaign service tests` |
| `chore` | Maintenance | `chore: update dependencies` |

### Commit Rules

| Rule | Description |
|------|-------------|
| Use imperative mood | "add feature" not "added feature" |
| Lowercase | "fix bug" not "Fix Bug" |
| No period at end | "add feature" not "add feature." |
| Max 50 characters | Keep subject line short |
| Be specific | "fix form validation" not "fix bug" |

---

## 5. Pull Request Rules

- All changes must go through a Pull Request.
- Pull Requests must target the `develop` branch.
- A Pull Request must reference the related issue.

### Pull Request Description Must Include

- What was implemented
- Why it was implemented
- Related issue number (e.g., "Closes #42")
- Testing performed
- Affected areas

### PR Template

```markdown
## 📌 Summary
Brief description of changes.

## 🔗 Related Issue
Closes #XX

## 🧠 What was done?
- [x] Task 1
- [x] Task 2

## 🧪 How was it tested?
- [x] Manual testing
- [x] Browser verification

## 📂 Affected Areas
- [x] Frontend - ComponentName
- [x] Backend - ServiceName
```

---

## 6. Code Quality Expectations

### Architecture Rules
- Follow the architecture defined in README.md
- Respect layer separation (Controller / Service / Util / Client)
- No business logic in controllers
- No API calls in frontend components (use service layer)
- Keep code clean and readable

### Frontend Guidelines
- Use functional components with hooks
- Keep components focused and reusable
- Use proper TypeScript/JavaScript naming conventions
- Add proper error handling for API calls
- Use Turkish for user-facing text

### Backend Guidelines
- Use Pydantic models for request/response validation
- Implement proper error handling with HTTPException
- Use dependency injection for services
- Follow RESTful API design principles

---

## 7. Forbidden Practices

- Direct commits to `main` or `develop`
- Working without an issue
- Mixing multiple features in one branch
- Skipping Pull Requests
- Hardcoding API keys or secrets
- Committing `.env` or `serviceAccountKey.json`
- Ignoring lint errors
- Large commits without clear descriptions

---

## 8. Review Process

- Reviews focus on architecture compliance and code clarity
- Feedback must be addressed before merging
- Review comments are part of the learning process
- Self-review before requesting team review

### Review Checklist
- [ ] Code follows project structure
- [ ] No hardcoded values
- [ ] Proper error handling
- [ ] Turkish text for user-facing content
- [ ] Changes are documented if needed

---

## 9. Testing Requirements

### Before Creating PR
1. Verify all changes work locally
2. Test both frontend and backend
3. Check browser console for errors
4. Verify mobile responsiveness (if applicable)
5. Run any available automated tests

---

## 10. Final Note

This project is designed to simulate a **professional software development environment**.

Failure to follow these rules will negatively affect the evaluation.

> 📘 For detailed Git workflow, see [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)

> 📘 For branch naming rules, see [BRANCHING.md](./BRANCHING.md)
