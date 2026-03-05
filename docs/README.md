# Documentation

This directory contains the architectural and technical documentation for the Qwen3.5-0.8B WebGPU project.

---

## Table of contents

| Document | Description |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | High-level system design, runtime flow, and component relationships |
| [COMPONENTS.md](./COMPONENTS.md) | React component tree, props contracts, and rendering decisions |
| [HOOKS.md](./HOOKS.md) | Custom hook responsibilities, state machines, and data flow |
| [SECURITY.md](./SECURITY.md) | Cross-origin isolation, COEP/COOP headers, and same-origin ORT strategy |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | CI/CD pipeline, Cloudflare Pages configuration, and build process |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute, coding conventions, and SOLID principles guide |

---

## Quick orientation

If you are new to the codebase, read in this order:

1. [ARCHITECTURE.md](./ARCHITECTURE.md) — understand the big picture
2. [SECURITY.md](./SECURITY.md) — understand the browser constraints that shaped many design decisions
3. [HOOKS.md](./HOOKS.md) — understand how state and side effects are managed
4. [COMPONENTS.md](./COMPONENTS.md) — understand the UI layer
5. [DEPLOYMENT.md](./DEPLOYMENT.md) — understand how it gets to production
