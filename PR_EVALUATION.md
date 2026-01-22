# 🧪 Pull Request Evaluation Checklist (Interns)

This document defines how intern pull requests are evaluated.
Each PR is reviewed based on code quality, discipline, and engineering mindset, not just whether it "works".

---

## 1️⃣ Basic PR Hygiene (Mandatory)

❌ **Bunlardan biri yoksa PR direkt RED**

- [ ] PR title is clear and meaningful  
  *(e.g. `Feature: prompt validation logic`)*
- [ ] PR description explains what and why
- [ ] PR references an Issue or Task *(Closes #12)*
- [ ] PR targets the correct branch *(main)*
- [ ] No unrelated files included

---

## 2️⃣ Branch & Commit Discipline

### Branching

- [ ] Branch name follows convention  
  *(`feature/...`, `fix/...`, `chore/...`)*
- [ ] No direct commits to main

### Commits

- [ ] Commits are small and logical
- [ ] Commit messages are meaningful  
  ❌ `fix`, `update`, `wip`  
  ✅ `Add input validation for prompt payload`
- [ ] No excessive "fix typo / fix again" commits

---

## 3️⃣ Code Quality & Structure

### Readability

- [ ] Code is easy to read
- [ ] Variable / function names are meaningful
- [ ] No unnecessary comments
- [ ] No commented-out dead code

### Structure

- [ ] Files placed in correct folders
- [ ] No god-files or giant functions
- [ ] Responsibility separation is clear

---

## 4️⃣ Architecture & Design Thinking

> We evaluate **how you think**, not just what you wrote.

- [ ] Solution matches the intended architecture
- [ ] Logic is placed in the correct layer
- [ ] No hard-coded values where config is expected
- [ ] Reusable logic is not duplicated

💡 **Bonus:**
- [ ] Alternative approaches considered and mentioned in PR description

---

## 5️⃣ Error Handling & Edge Cases

- [ ] Errors are handled properly
- [ ] User input is validated
- [ ] Edge cases are considered
- [ ] No silent failures

---

## 6️⃣ Testing & Verification

- [ ] Feature manually tested
- [ ] Test steps explained in PR description
- [ ] No obvious breaking changes

*(Automated tests are a plus but not mandatory unless specified)*

---

## 7️⃣ Documentation

- [ ] README updated if needed
- [ ] New behavior documented
- [ ] API / config changes explained

---

## 8️⃣ Professionalism & Ownership

- [ ] PR description is written professionally
- [ ] Reviewer comments are answered clearly
- [ ] Feedback is applied, not ignored
- [ ] Author shows ownership of the change

---

## 🧮 Evaluation Outcome

| Result | Meaning |
|--------|---------|
| ✅ Approved | Ready to merge |
| 🔄 Changes Requested | Needs improvement |
| ❌ Rejected | Major issues, rework required |

---

## 🎯 What We Care About Most

1. Thinking like an engineer
2. Clean and intentional code
3. Ability to receive feedback
4. Consistency and discipline

---

## 🧠 Mentor Notes (Internal)

> A PR does not need to be perfect.  
> It must show **clear reasoning** and **learning ability**.
