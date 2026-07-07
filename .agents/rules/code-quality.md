---
trigger: model_decision
description: Apply whenever generating, modifying, reviewing, or refactoring source code.
---

Generate production-quality code.

Requirements:

- Small cohesive modules.
- Single responsibility.
- Reusable components.
- Consistent naming.
- Explicit error handling.
- Validate external input.
- Minimize dependencies.
- Prefer standard libraries and platform features.
- Keep implementations easy to understand.

When modifying code:

- Preserve style and architecture.
- Keep changes localized.
- Avoid unnecessary rewrites.
- Remove duplication when encountered.

Never sacrifice maintainability for cleverness.

TypeScript Error Handling:
- When encountering TypeScript errors like "No overload matches this call" or "undefined is not assignable" because a variable is typed as `Type | undefined` but being passed to a strictly typed parameter, resolve it by using a type assertion (e.g. `as string`) or an explicit `if` check, assuming you can guarantee the value will be present at runtime.