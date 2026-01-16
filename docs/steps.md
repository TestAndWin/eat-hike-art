# Project Setup Best Practice

A structured approach for starting new projects with Claude Code.

---

## Overview

```
Phase 1: Requirements     →  Understand what to build
Phase 2: Architecture     →  Decide how to build it
Phase 3: Documentation    →  Write it down
Phase 4: Implementation   →  Build it
```

---

## Phase 1: Requirements Clarification

### Goal
Understand the project before making technical decisions.

### Steps

1. **Start with a project idea document** (`idea.md`)
   - Write down the initial vision in your native language
   - Include: purpose, features, users, constraints
   - Don't worry about technical details yet

2. **Clarify requirements with Claude**
   - Let Claude ask questions about unclear aspects
   - Topics to cover:
     - User types and authentication needs
     - Data volume and growth expectations
     - Language requirements (UI vs. code)
     - Hosting preferences (self-hosted, cloud, etc.)
     - Budget constraints
     - Future extensions (Phase 2 features)

3. **Update idea.md with answers**
   - Keep it as the single source of truth for requirements

### Output
- Clear, complete `idea.md`

---

## Phase 2: Architecture Decisions

### Goal
Make and document all major technical decisions before writing code.

### Steps

1. **Create CLAUDE.md** with:
   - Project overview
   - Current phase: "Architecture" (no implementation allowed)
   - List of open decisions
   - Architecture principles (KISS, YAGNI, etc.)

2. **Work through decisions systematically**
   - One topic at a time
   - Claude presents options with pros/cons
   - Discuss and decide together
   - Document each decision as an ADR

### Decision Categories

| Category | Typical Questions |
|----------|-------------------|
| Data Model | SQL vs. NoSQL vs. File-based? Schema design? |
| Backend | Framework? API style? Hosting? |
| Frontend | Framework? SSR/SSG/SPA? Styling? Components? |
| Auth | Authentication method? Session handling? |
| Integrations | External APIs? Third-party services? |

### ADR Format

```markdown
# ADR-NNN: Title

**Status:** Accepted
**Date:** YYYY-MM-DD
**Decision Makers:** Names

## Context
[Why is this decision needed?]

## Decision
[What was decided?]

## Alternatives
[What else was considered?]

## Consequences
### Positive
- ...
### Negative
- ...
```

### Output
- `docs/adr/001-xxx.md`, `002-xxx.md`, etc.
- Updated CLAUDE.md with links to ADRs

---

## Phase 3: Documentation

### Goal
Create reference documents for implementation.

### Documents to Create

| Document | Purpose |
|----------|---------|
| `docs/TECH_STACK.md` | Dependencies, architecture diagram, directory structure |
| `docs/DOMAIN_MODEL.md` | Data model, TypeScript interfaces, validation rules |
| `docs/UI_WIREFRAMES.md` | Screen descriptions, routes, component mapping |

### Skills Definition

Create Claude Code skills for recurring tasks:

```
.claude/skills/
├── create-adr/SKILL.md           # Architecture decisions
├── create-component/SKILL.md     # UI components
├── create-api-endpoint/SKILL.md  # API endpoints
└── ...
```

Each skill should include:
- Purpose
- Steps to follow
- Templates
- Naming conventions
- Checklist

### Output
- Complete documentation in `docs/`
- Skills in `.claude/skills/`

---

## Phase 4: Implementation Transition

### Goal
Prepare CLAUDE.md for development.

### Steps

1. **Update CLAUDE.md**
   - Change phase from "Architecture" to "Implementation"
   - Simplify architecture decisions (remove strikethrough history)
   - Add implementation roadmap with phases
   - List available skills and plugins

2. **Final Review**
   - Check all documents for consistency
   - Verify naming conventions match across documents
   - Ensure no contradictions between ADRs and other docs

3. **Start Implementation**
   - Follow the roadmap in CLAUDE.md
   - Use skills for recurring tasks
   - Update documentation as needed

---

## Key Principles

### 1. No Code Before Architecture
- Resist the urge to start coding
- Technical decisions are harder to change later
- Documentation saves time in the long run

### 2. One Decision at a Time
- Don't try to decide everything at once
- Let each decision inform the next
- Example: Storage decision affects backend decision

### 3. Document Immediately
- Create ADR right after making a decision
- Don't rely on memory
- Future-you will thank present-you

### 4. Keep It Simple (KISS)
- Choose the simplest solution that works
- Avoid over-engineering
- "You Ain't Gonna Need It" (YAGNI)

### 5. Consistency Over Perfection
- Use the same patterns everywhere
- Naming conventions matter
- Templates help maintain consistency

---

## File Structure Template

```
project/
├── CLAUDE.md                 # Main project config for Claude
├── idea.md                   # Original requirements
├── docs/
│   ├── adr/
│   │   ├── 001-xxx.md
│   │   ├── 002-xxx.md
│   │   └── ...
│   ├── TECH_STACK.md
│   ├── DOMAIN_MODEL.md
│   └── UI_WIREFRAMES.md
├── .claude/
│   └── skills/
│       ├── create-adr/SKILL.md
│       └── .../SKILL.md
└── src/                      # Implementation (Phase 4)
```

---

## Checklist

### Before Starting Implementation

- [ ] Requirements are clear and documented
- [ ] All major architecture decisions are made
- [ ] Each decision has an ADR
- [ ] Tech stack is documented with dependencies
- [ ] Data model is defined with TypeScript interfaces
- [ ] UI structure is planned (routes, components)
- [ ] Skills are created for recurring tasks
- [ ] CLAUDE.md is updated for implementation phase
- [ ] Final consistency review is done

---

## Timeline Estimate

| Phase | Typical Duration |
|-------|------------------|
| Requirements | 1-2 sessions |
| Architecture | 2-4 sessions |
| Documentation | 1-2 sessions |
| Review | 1 session |
| **Total before coding** | **5-9 sessions** |

This investment pays off through faster, more consistent implementation.
