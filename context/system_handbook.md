# GOTCHA System Handbook

## Overview
GOTCHA is a structured system for organizing AI agent workflows, prompts, tools, and goals. This document provides the architecture and operational guidelines.

## Architecture Components

### Goals
- Define primary objectives and deliverables
- Store goal manifests with status tracking
- Support progressive goal achievement

### Tools
- Catalog available tools and capabilities
- Document tool usage patterns
- Support tool discovery and sharing

### Context
- System-wide context and orchestration rules
- Environment-specific configuration
- Shared knowledge base

### Hardprompts
- High-priority system prompts
- Behavioral constraints and guardrails
- Safety and alignment directives

### Args
- Configuration overrides and runtime parameters
- Behavior setting controls
- Environment-specific flags

## Orchestration

GOTCHA loads components in this order:
1. Read `context/system_handbook.md` for architecture guidance
2. Read `TOOLS.md` for tool specifics and local configurations
3. Read `AGENTS.md` for persona and behavior settings
4. Apply any behavior settings from `args/`

## Workflow

1. **Initialization**: Read all HANDSHAKE components in specified order
2. **Context Loading**: Merge system context with runtime arguments
3. **Tool Discovery**: Catalog available tools and capabilities
4. **Goal Execution**: Work through goals sequentially with progress tracking
5. **Context Updates**: Record outcomes and lessons learned

## File Structure

```
~
├── goals/
│   ├── manifest.md
│   └── [goal-files...]
├── tools/
│   ├── manifest.md
│   └── [tool-files...]
├── context/
│   ├── manifest.md
│   ├── system_handbook.md
│   └── [context-files...]
├── hardprompts/
│   ├── manifest.md
│   └── [prompt-files...]
├── args/
│   └── [arg-config-file...]
├── MEMORY.md
├── MEMORY.md
└── [other runtime files]
```

## Best Practices

- Keep manifests up-to-date and concise
- Use args for runtime overrides, not code changes
- Document all tools thoroughly
- Maintain clear separation of concerns
- Review and prune goals regularly
