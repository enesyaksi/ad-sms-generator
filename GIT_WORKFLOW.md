# 🔀 Git Workflow Guide

This document covers the practical aspects of working with Git in this project.
For branching strategy, see [BRANCHING.md](./BRANCHING.md).

---

## Table of Contents

- [Commit Message Format](#commit-message-format)
- [Step-by-Step Workflow](#step-by-step-workflow)
- [Resolving Conflicts](#resolving-conflicts)
- [Common Git Commands](#common-git-commands)
- [Tips & Best Practices](#tips--best-practices)

---

## Commit Message Format

We use **Conventional Commits** format for all commit messages.

### Structure

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(backend): add image generation endpoint` |
| `fix` | Bug fix | `fix(frontend): resolve form validation error` |
| `docs` | Documentation only | `docs: update README with setup instructions` |
| `style` | Formatting, no code change | `style(backend): fix indentation in service` |
| `refactor` | Code change, no new feature or fix | `refactor(frontend): extract button component` |
| `test` | Adding or updating tests | `test(backend): add unit tests for prompt builder` |
| `chore` | Maintenance tasks | `chore: update dependencies` |

### Scopes

| Scope | Usage |
|-------|-------|
| `frontend` | React/UI changes |
| `backend` | Python/API changes |
| `docs` | Documentation |
| `config` | Configuration files |
| *(empty)* | Cross-cutting changes |

### Examples

```bash
# ✅ Good commit messages
feat(backend): add OpenAI client for image generation
fix(frontend): prevent form submission with empty headline
docs: add API examples to README
refactor(backend): move prompt logic to utils
style(frontend): format components with prettier
chore: add .env.example file

# ❌ Bad commit messages
update code
fix bug
WIP
asdfgh
changes
final fix
fix fix fix
```

### Rules

| Rule | Description |
|------|-------------|
| Use imperative mood | "add feature" not "added feature" |
| Lowercase | "fix bug" not "Fix Bug" |
| No period at end | "add feature" not "add feature." |
| Max 50 characters | Keep subject line short |
| Be specific | "fix form validation" not "fix bug" |

---

## Step-by-Step Workflow

### 1. Start a New Feature

```bash
# Make sure you're on develop and up to date
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/backend-generate-endpoint

# Verify you're on the correct branch
git branch
```

### 2. Make Changes and Commit

```bash
# Check what files changed
git status

# Stage specific files
git add app/controllers/image_controller.py
git add app/services/image_service.py

# Or stage all changes (use carefully)
git add .

# Commit with a proper message
git commit -m "feat(backend): add image generation endpoint"
```

### 3. Keep Your Branch Updated

```bash
# Fetch latest changes
git fetch origin

# Rebase your branch on develop
git rebase origin/develop

# If conflicts occur, resolve them (see next section)
```

### 4. Push Your Branch

```bash
# First push (set upstream)
git push -u origin feature/backend-generate-endpoint

# Subsequent pushes
git push

# After rebase (force push required)
git push --force-with-lease
```

### 5. Create Pull Request

1. Go to GitHub
2. Click "Compare & pull request"
3. Fill in the PR template
4. Request review
5. Wait for approval

### 6. After PR is Merged

```bash
# Switch back to develop
git checkout develop

# Pull the merged changes
git pull origin develop

# Delete your local feature branch
git branch -d feature/backend-generate-endpoint

# Delete remote branch (if not auto-deleted)
git push origin --delete feature/backend-generate-endpoint
```

---

## Resolving Conflicts

### When Do Conflicts Happen?

Conflicts occur when:
- Two branches modify the same line
- A file is deleted in one branch but modified in another
- Two branches add different content at the same location

### Step-by-Step Conflict Resolution

#### 1. Start the Rebase

```bash
git checkout feature/your-branch
git rebase origin/develop
```

#### 2. Identify Conflicted Files

```bash
# Git will show which files have conflicts
git status

# Output example:
# Unmerged paths:
#   both modified: app/services/image_service.py
```

#### 3. Open and Fix the Conflict

The conflicted file will look like this:

```python
def generate_image(prompt):
<<<<<<< HEAD
    # Your changes
    return openai_client.generate(prompt)
=======
    # Changes from develop
    return ai_client.generate(prompt, model="gpt-4")
>>>>>>> origin/develop
```

Choose the correct version or combine them:

```python
def generate_image(prompt):
    # Combined solution
    return ai_client.generate(prompt, model="gpt-4")
```

#### 4. Mark as Resolved and Continue

```bash
# Stage the resolved file
git add app/services/image_service.py

# Continue the rebase
git rebase --continue
```

#### 5. If Things Go Wrong

```bash
# Abort and start over
git rebase --abort

# You're back to where you started
```

### Conflict Prevention Tips

| Tip | Description |
|-----|-------------|
| Pull frequently | `git pull origin develop` daily |
| Small commits | Easier to resolve conflicts |
| Communicate | Tell team what files you're working on |
| Don't hoard changes | Push and create PR early |

---

## Common Git Commands

### Daily Commands

```bash
# Check current status
git status

# See commit history
git log --oneline -10

# See what branch you're on
git branch

# Switch branches
git checkout develop
git checkout feature/your-branch

# Create and switch to new branch
git checkout -b feature/new-feature
```

### Viewing Changes

```bash
# See unstaged changes
git diff

# See staged changes
git diff --staged

# See changes in a specific file
git diff app/services/image_service.py

# See what changed in last commit
git show
```

### Undoing Things

```bash
# Unstage a file (keep changes)
git reset HEAD app/services/image_service.py

# Discard changes in a file (⚠️ destructive)
git checkout -- app/services/image_service.py

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes - ⚠️ destructive)
git reset --hard HEAD~1

# Change last commit message
git commit --amend -m "new message"
```

### Stashing

```bash
# Save changes temporarily
git stash

# Save with a name
git stash save "work in progress on form"

# List stashes
git stash list

# Apply most recent stash
git stash pop

# Apply specific stash
git stash apply stash@{2}

# Delete a stash
git stash drop stash@{0}
```

### Cleaning Up

```bash
# Delete local branch
git branch -d feature/old-branch

# Force delete (unmerged branch)
git branch -D feature/old-branch

# Delete remote branch
git push origin --delete feature/old-branch

# Clean up deleted remote branches
git fetch --prune
```

---

## Tips & Best Practices

### ✅ Do's

| Practice | Why |
|----------|-----|
| Commit often | Small, logical chunks are easier to review |
| Pull before push | Avoid unnecessary conflicts |
| Write clear messages | Future you will thank present you |
| Use `--force-with-lease` | Safer than `--force` |
| Review your own PR first | Catch mistakes before reviewers do |

### ❌ Don'ts

| Anti-pattern | Why It's Bad |
|--------------|--------------|
| `git add .` blindly | Might include unwanted files |
| `git push --force` | Can delete others' work |
| Commit `.env` files | Security risk |
| Giant commits | Hard to review and debug |
| Vague commit messages | No idea what changed |

### Commit Frequency

```
❌ Bad: One giant commit after 3 days of work

✅ Good: Multiple focused commits
  - feat(backend): add request validation
  - feat(backend): implement OpenAI client
  - feat(backend): add image generation service
  - test(backend): add tests for image service
  - docs: update API documentation
```

### Before Creating a PR

```bash
# 1. Make sure all changes are committed
git status

# 2. Rebase on latest develop
git fetch origin
git rebase origin/develop

# 3. Run tests locally
pytest  # backend
npm test  # frontend

# 4. Check for linting issues
flake8 .  # backend
npm run lint  # frontend

# 5. Push your branch
git push -u origin feature/your-branch
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│                    GIT CHEAT SHEET                      │
├─────────────────────────────────────────────────────────┤
│  START FEATURE                                          │
│  git checkout develop && git pull                       │
│  git checkout -b feature/name                           │
├─────────────────────────────────────────────────────────┤
│  SAVE WORK                                              │
│  git add <files>                                        │
│  git commit -m "type(scope): description"               │
├─────────────────────────────────────────────────────────┤
│  STAY UPDATED                                           │
│  git fetch origin                                       │
│  git rebase origin/develop                              │
├─────────────────────────────────────────────────────────┤
│  PUSH & PR                                              │
│  git push -u origin feature/name                        │
│  → Create PR on GitHub                                  │
├─────────────────────────────────────────────────────────┤
│  AFTER MERGE                                            │
│  git checkout develop && git pull                       │
│  git branch -d feature/name                             │
└─────────────────────────────────────────────────────────┘
```

---

> 💡 **Remember:** Git is a tool to help you, not fight you.  
> When in doubt, `git status` is your friend.
