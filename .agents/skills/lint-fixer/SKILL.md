---
name: lint-fixer
description: Fix lint errors and contribute prevention tips back to the typescript-coding skill so future code avoids the same issues.
---

# Lint Fixer

Fix lint errors and contribute prevention tips back to the typescript-coding skill so future code avoids the same issues.

## Workflow

### Step 1: Identify Lint Errors

Run lint to see current errors:

```bash
npm run lint
```

Parse the output to identify:

- Rule name (e.g., `@typescript-eslint/no-explicit-any`, `@typescript-eslint/consistent-type-imports`)
- File path and line number
- Error message

### Step 2: Categorize the Error

Determine if this is:

- **Auto-fixable**: ESLint can fix it with `--fix`
- **Manual fix required**: Requires code changes
- **Pattern-based**: Represents a recurring anti-pattern worth documenting

### Step 3: Fix the Error

For auto-fixable errors:

```bash
npx eslint --fix .
```

For manual fixes, apply the appropriate correction based on the rule:

| Rule                                     | Fix Pattern                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `@typescript-eslint/no-explicit-any`     | Replace `any` with proper type, `unknown`, or generic                  |
| `@typescript-eslint/consistent-type-imports` | Change `import { Foo }` to `import type { Foo }` for type-only imports |
| `@typescript-eslint/no-unused-vars`      | Remove the variable or prefix with `_`                                 |
| `prefer-const`                           | Change `let` to `const` for non-reassigned variables                   |
| `@typescript-eslint/no-non-null-assertion` | Use proper null checks, optional chaining, or invariant              |

### Step 4: Extract the Lesson

For each fix, ask:

- What was the anti-pattern? (the code that triggered the error)
- What is the correct pattern? (the fix)
- Why does this matter? (type safety, performance, maintainability)

### Step 5: Update typescript-coding Skill

If the fix represents a valuable lesson not already in the `typescript-coding` skill:

1. Read the current skill:
   `.agents/skills/typescript-coding/SKILL.md` (Note: adjust path as needed if the skill resides elsewhere)
2. Check if a similar tenet already exists. If yes, skip.
3. If novel, append a new tenet following this format:

```markdown
### Tenet: [Concise principle statement]

DON'T:

\`\`\`ts
// Brief comment explaining the anti-pattern
[code that triggers the lint error]
\`\`\`

DO:

\`\`\`ts
// Brief comment explaining the correct approach
[corrected code]
\`\`\`

> [Optional note about edge cases or additional context]
```

## Guidelines for Adding Tenets

**Add a tenet when:**

- The pattern is non-obvious to intermediate TypeScript developers
- The fix requires understanding beyond "follow the error message"
- The pattern relates to type safety, not just style preferences
- The lesson applies broadly, not just to one specific file

**Do NOT add a tenet when:**

- The fix is trivial (e.g., removing unused import)
- The `typescript-coding` skill already covers this pattern
- The issue is purely stylistic with no type safety implications
- The pattern is specific to one unusual edge case

## Common Lint Errors and Lessons

### `useImportType` / `useExportType`

```ts
// DON'T: Import types as values (larger bundle, confusing semantics)
import { MyInterface } from './types';

// DO: Use type-only imports for types
import type { MyInterface } from './types';
```

### `noExplicitAny`

```ts
// DON'T: Use any (defeats type checking)
function process(data: any) { ... }

// DO: Use unknown and narrow, or define proper types
function process(data: unknown) {
  if (isValidData(data)) { ... }
}
```

### `noNonNullAssertion`

```ts
// DON'T: Assert non-null without proof
const value = maybeNull!;

// DO: Use invariant or proper null handling
invariant(maybeNull, 'Expected value to be defined');
const value = maybeNull;
```

## Integration with Verification Pipeline

After fixing lint errors, run type checking to confirm no regressions:

```bash
npm run check
```

This ensures:

- Lint passes
- TypeScript types still check
- No regressions introduced

## Example Session

```
$ npm run lint
src/parser.ts:42:10 - @typescript-eslint/no-explicit-any - Unexpected any. Specify a different type.

> Analysis: The function accepts `any` because the input type wasn't defined.
> Fix: Create a proper input type and use type guards.
> Lesson: This pattern is already covered in typescript-coding skill. No new tenet needed.

$ npm run lint
src/utils.ts:15:1 - @typescript-eslint/consistent-type-imports - All these imports are only used as types.

> Analysis: Importing types as values causes unnecessary runtime code.
> Fix: Change to `import type { ... }`.
> Lesson: Too trivial for a new tenet.

$ npm run lint
src/cache.ts:88:5 - @typescript-eslint/no-unused-vars - Variable 'temp' is declared but never used.

> Analysis: Dead code from refactoring.
> Fix: Remove the variable.
> Lesson: No tenet needed (trivial cleanup).
```

## Updating Existing Tenets

If a lint fix reveals that an existing tenet is incomplete or unclear:

- Locate the relevant tenet in `typescript-coding` skill
- Edit to add the missing case or clarify the guidance
- Ensure the example code is accurate and runs without lint errors
