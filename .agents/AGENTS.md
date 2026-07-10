### Require Explicit Approval in Planning Mode

When presenting an `implementation_plan.md` to the user:

- **NEVER** assume approval if the user simply adds a new requirement, asks a question, or makes a comment about the plan.
- You **MUST** update the plan to reflect their feedback and wait for explicit confirmation (e.g., "go ahead", "approved", "execute", "yes") before writing any code or executing modifying commands.

### RTK Prefix for Shell Commands

When executing shell commands using the `bash` tool on PowerShell, prefix the command with `rtk`:

- **Correct**: `rtk npm run dev`
- **Correct**: `rtk npx playwright test`

### PowerShell Command Chaining

Do NOT use `&&` to chain commands in PowerShell. Use `;` instead:

- **Correct**: `rtk npm run format ; rtk npm run lint`
