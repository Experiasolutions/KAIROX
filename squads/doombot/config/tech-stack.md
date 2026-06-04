# Doombot V5 — Tech Stack

## Core Technologies

| Category | Technology | Purpose |
|----------|-----------|---------|
| Runtime | AIOX v5.0.0 | Agent orchestration framework |
| Language | Markdown + YAML | Agent/task/workflow definitions |
| Validation | JSON Schema | squad.yaml manifest validation |
| Config | YAML | Core and squad configuration |

## Agent Stack
- **Communication:** Markdown-based personas with YAML frontmatter
- **Tasks:** TASK-FORMAT-SPECIFICATION-V1 with checklists and handoffs
- **Workflows:** Multi-step pipelines with decision gates
- **Templates:** Fill-in-the-blank formats for standardized outputs

## Revenue Operations Stack
- **NMI 2.0:** 7-step offer generation engine
- **Arena:** Thompson Sampling bayesiano for variant testing
- **CCR++:** Causal structural model for revenue attribution
- **Profit Firewall:** Brownout automation for margin protection

## Security Stack
- **OPA:** Policy-as-Code (Rego) for output validation
- **C2PA:** Content provenance manifests
- **Privacy Budget:** Data consumption quota system
- **SBOM/SLSA:** Supply chain verification
