### Require Explicit Approval in Planning Mode

When presenting an `implementation_plan.md` to the user:

- **NEVER** assume approval if the user simply adds a new requirement, asks a question, or makes a comment about the plan.
- You **MUST** update the plan to reflect their feedback and wait for explicit confirmation (e.g., "go ahead", "approved", "execute", "yes") before writing any code or executing modifying commands.

### Explicit RTK (Rust Token Killer) Enforcement

When executing any shell command using the `run_command` tool, you MUST explicitly prefix the command with `rtk`. Do not rely on automatic shell hooks to do this for you.

- **Example (Incorrect)**: `npm run dev`
- **Example (Correct)**: `rtk npm run dev`
- **Example (Incorrect)**: `npx playwright test`
- **Example (Correct)**: `rtk npx playwright test`
