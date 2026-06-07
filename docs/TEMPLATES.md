# Issue & PR Templates — stumble-clone

## User Story Template

Use this structure when creating a feature issue.

**Title:** Brief description in imperative mood

**Labels:** user-story, size:S/M/L/XL, priority:high/medium/low, area:api/frontend/ai/database

**Body:**

### User Story

As a [role],
I want [capability],
So that [benefit].

### Context

[Why this story now. Link to PROGRESS.md or architecture docs.]

### Acceptance Criteria

- [ ] [Concrete, testable condition]
- [ ] [Another condition]
- [ ] All new code has strict TypeScript types
- [ ] Unit tests written
- [ ] Coverage remains at least 80 percent

### Test Scenarios

| Scenario   | Given | When | Then |
| ---------- | ----- | ---- | ---- |
| Happy path | ...   | ...  | ...  |
| Edge case  | ...   | ...  | ...  |
| Error case | ...   | ...  | ...  |

### Technical Notes

[Optional — any implementation constraints]

### Sub-Tasks

**Backend:**

- [ ] [Task]

**Frontend:**

- [ ] [Task]

**QA:**

- [ ] Write tests

## Bug Report Template

**Title:** [Component] Brief description of defect

**Labels:** bug, severity:critical/high/medium/low, area:api/frontend/ai/database

**Body:**

### Bug Summary

[Clear 1-2 sentence description]

### Environment

| Field            | Value                 |
| ---------------- | --------------------- |
| Commit / Version | [sha]                 |
| OS               | [Windows/macOS/Linux] |
| Node Version     | [20.x]                |

### Reproduction Steps

1.
2.
3. **Reproduction rate:** Always / Intermittent

### Expected Result

[What should happen]

### Actual Result

[What actually happens, including error messages]

### Evidence

[Paste error log or screenshot]

### Root Cause Analysis

**Likely cause:** [file and line if known]
**What has been ruled out:** [...]

### Acceptance Criteria (Fixed)

- [ ] ...
- [ ] Regression tests added

## Pull Request Template

Save as .github/pull_request_template.md

**Body:**

Closes #(issue)

### Summary

[What changed and why]

### Changes

- [List specific files/modules]

### Test Plan

- [ ] All existing tests pass
- [ ] New tests added (coverage at least 80 percent)
- [ ] Linting clean
- [ ] Manual test steps (if UI/API): ...

### Screenshots / GIFs

[If UI changes]

---

All team members must use these templates to maintain consistency.
