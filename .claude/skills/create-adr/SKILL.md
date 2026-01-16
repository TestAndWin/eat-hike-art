---
name: create-adr
description: Creates an Architecture Decision Record (ADR) in the docs/adr/ folder. Use this skill when the user wants to finalize an architecture decision (tech stack, database, pattern).
---

# Architecture Decision Record (ADR) Generator

## Purpose

Document important architecture decisions to make them binding for the entire project.

## Steps

1. **Generate filename:**
   - Check the `docs/adr/` folder
   - Find the next available number (e.g., `003`)
   - Create the filename: `docs/adr/NNN-title-in-kebab-case.md`

2. **Ask user:**
   - Ask for the status (Proposed | Accepted | Rejected)
   - Ask for the decision makers

3. **Create ADR:**
   - Use the template strictly
   - Fill in the sections based on the discussion

4. **Update CLAUDE.md:**
   - Mark the corresponding open decision as completed
   - Link to the ADR if appropriate

## Template

```markdown
# ADR-[NNN]: [Title]

**Status:** [Proposed | Accepted | Rejected]
**Date:** [YYYY-MM-DD]
**Decision Makers:** [Names]

## Context

[Why is this decision needed? What is the problem?]

## Decision

[What was decided? Which option was chosen?]

## Alternatives

[What other options were considered?]

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Drawback 1]
- [Drawback 2]
```
