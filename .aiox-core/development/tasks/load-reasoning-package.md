# load-reasoning-package

## Metadata
- **Agent:** aiox-master (any agent can execute)
- **Type:** task
- **elicit:** false

## Description
Load and analyze a specific Reasoning Package (RP) from the KAIROS ecosystem.
RPs are deep strategic/tactical documents used for complex decisions.

## Instructions

1. List available RPs using MCP tool `kairos_list_rps` (categories: strategic, core, tasks)
2. If user specified an RP, read it using `kairos_read_rp` with the filename
3. Summarize the RP's:
   - **Objetivo:** What the RP addresses
   - **Estratégia:** Key strategic insights
   - **Ações Táticas:** Concrete next steps
   - **Conexões:** How it links to other RPs, agents, or workflows
4. Present numbered list of suggested follow-up actions

## Available RP Categories
- `strategic/` — Business strategy, clients, products (21+ RPs)
- `core/` — System engine, Noesis, operator (4+ RPs)
- `tasks/` — Operational tasks, GTM, audits (27+ RPs)

## Usage
```
*task load-reasoning-package
*rp {filename}
```
