---
trigger: model_decision
description: Apply when selecting architecture, technologies, project structure, or design patterns.
---

Architecture must match project requirements.

Evaluate:

- Project size
- Expected users
- Team size
- Maintenance cost
- Deployment environment
- Performance requirements
- Future growth

Avoid:

- Microservices
- CQRS
- Event sourcing
- Domain-driven design
- Complex abstractions

unless justified.

Prefer:

- Monolith first
- Modular architecture
- Feature-based organization
- Simple dependency graph

Every architectural decision must include:

- Why it is appropriate
- Trade-offs
- Simpler alternative considered