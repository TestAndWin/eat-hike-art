---
name: simplify
description: Reviews recently changed code for unnecessary complexity and suggests simplifications. Use this skill after completing implementation work to ensure KISS and YAGNI principles are followed.
---

# Code Simplifier

## Purpose

Review code changes for unnecessary complexity, over-engineering, and violations of KISS/YAGNI principles. This skill helps ensure the codebase stays simple and maintainable.

## When to Use

- After completing a feature or bug fix
- Before committing code
- When refactoring feels "too heavy"

## Steps

1. **Identify changed files:**
   - Run `git diff --name-only HEAD~1` or `git status` to find recently modified files
   - If no git changes, ask user which files to review

2. **Analyze each file for:**

   | Anti-Pattern | Description | Solution |
   |--------------|-------------|----------|
   | Over-abstraction | Helpers/utilities for one-time operations | Inline the code |
   | Premature generalization | Extra parameters/config for hypothetical cases | Remove unused flexibility |
   | Defensive over-coding | Try-catch/validation for impossible scenarios | Trust internal code |
   | Verbose patterns | Long-winded code that could be simpler | Use language idioms |
   | Dead code | Commented code, unused imports, unused variables | Delete it |
   | Backwards-compat hacks | `_unusedVar`, re-exports, `// removed` comments | Remove completely |

3. **For each issue found:**
   - Show the problematic code
   - Explain why it's over-engineered
   - Suggest a simpler alternative
   - Ask user if they want to apply the change

4. **Summary:**
   - List all simplifications made
   - Note any code that was already simple and clean

## Questions to Ask

For each potential simplification:
- "Is this abstraction used in more than one place?"
- "Could this be inlined without losing readability?"
- "What's the simplest code that would work?"
- "Are we handling errors that can't actually happen?"

## Examples

### Over-abstraction
```typescript
// Before: Unnecessary helper
function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}
const displayName = formatUserName(user);

// After: Inline (if used once)
const displayName = `${user.firstName} ${user.lastName}`;
```

### Premature Generalization
```typescript
// Before: Config for hypothetical cases
function fetchData(url: string, options: {
  retries?: number;
  timeout?: number;
  cache?: boolean;
  transform?: (data: any) => any;
} = {}) { ... }

// After: Just what we need
function fetchData(url: string) { ... }
```

### Defensive Over-coding
```typescript
// Before: Checking for impossible state
function processEntry(entry: Entry) {
  if (!entry) throw new Error('Entry required');
  if (!entry.id) throw new Error('Entry must have id');
  // ... entry is always valid here from TypeScript
}

// After: Trust the type system
function processEntry(entry: Entry) {
  // Entry is guaranteed to exist and have id by TypeScript
}
```

## Checklist

- [ ] No unused abstractions
- [ ] No unused parameters or config options
- [ ] No backwards-compatibility hacks
- [ ] No commented-out code
- [ ] No excessive error handling for internal code
- [ ] Code reads naturally without unnecessary indirection
- [ ] Three similar lines are better than a premature abstraction
