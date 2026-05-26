# VibeBasket Hardening Roadmap Design

## Goal

Move VibeBasket from "feature-rich and mostly working" to "community-ready, trustworthy, and operationally predictable".

This roadmap is intentionally biased toward correctness, explainability, and safe delivery rather than adding another large user-facing feature immediately.

## Why This Is The Right Next Step

VibeBasket already has meaningful product surface:

- large trusted catalog ingestion
- search and filtering
- bundle creation
- adapter-backed apply flows
- auth foundations
- saved stacks foundations

The current risk is not "missing a flashy feature". The current risk is shipping a system that looks more complete than it really is in a few critical places:

- catalog provenance and deduplication edge cases
- apply/install truthfulness across targets
- search relevance at catalog scale
- operational visibility into sync health
- security and rate-shaping around public endpoints

The next phase should reduce that risk.

## Product Principles

This roadmap follows five principles:

1. **Truth over appearance**  
   The product must never imply that an item is verified, installable, or supported unless that is defensible in code and in docs.

2. **One source of capability truth**  
   UI, API, CLI, and adapters must agree on what each target can actually do.

3. **Graceful degradation**  
   Upstream catalog failures should reduce freshness, not destroy the user experience or silently prune valid local data.

4. **Auditability**  
   If a sync, classification, dedupe, or apply behavior is questioned, we should be able to explain it from stored metadata and tests.

5. **Low-regret architecture**  
   Prefer improvements that simplify future work: stronger contracts, better tests, better observability, smaller boundaries.

## Scope

This roadmap covers:

- catalog correctness
- search quality foundations
- bundle/apply correctness
- public-surface security hardening
- code quality and test depth
- operational visibility for sync behavior

This roadmap does **not** include a new major product surface such as team workspaces, billing, or marketplace curation tools.

## Recommended Approach

Use a **hardening-first** roadmap with three sequential tracks:

1. correctness and contract hardening
2. security and operational hardening
3. quality/performance follow-through

This is preferred over a feature-first roadmap because VibeBasket is already at the stage where trust failures are more expensive than missing features.

## Approach Alternatives Considered

### Option A: Hardening-first

Focus first on correctness, apply parity, testing, and security before expanding scope.

**Pros**

- strongest release confidence
- reduces hidden regressions
- makes future features cheaper to add safely

**Cons**

- fewer immediately visible product changes

### Option B: Balanced roadmap

Split effort between hardening and visible feature growth.

**Pros**

- product looks more active externally
- can improve user excitement

**Cons**

- increases coordination cost
- makes debugging and regression ownership less clear

### Option C: Feature-first

Push deeper into sharing, profiles, stack UX, or richer UI before hardening.

**Pros**

- best short-term demo energy

**Cons**

- highest long-term regret
- increases the chance of shipping incorrect behavior under a polished UI

### Recommendation

Choose **Option A**.

## Architecture Direction

### 1. Catalog Correctness Layer

Strengthen the catalog pipeline around explicit stages:

- collector
- classifier
- canonicalizer
- deduper
- persister
- query/search layer

The code does not need a large rewrite immediately, but the roadmap should move toward these boundaries. Today too much catalog correctness knowledge is concentrated inside registry ingestion flow details.

### 2. Target Capability Contract

Define a single source of truth for:

- target ID
- display metadata
- supported scopes
- supported content types
- config write locations
- remote/local MCP support
- readiness state for apply

This contract should drive:

- basket target UI
- bundle validation
- CLI apply preflight
- adapter tests
- future install-readiness badges

### 3. Search Strategy

The current weighted `LIKE` ranking is a good intermediate step, but not the end state.

The next design target should be:

- weighted local relevance
- optional SQLite FTS for large catalogs
- deterministic ranking rules that still preserve trust-aware ordering

Remote HTML enrichment should stay out of the design unless the upstream provides a formally stable machine surface.

### 4. Sync Observability

Treat sync as an operational subsystem, not a background convenience.

Minimum useful sync telemetry:

- per-source success/failure
- duration
- item delta
- official/community/verified counts
- duplicate/anomaly counts
- last healthy sync timestamp

This can remain lightweight and DB-backed; a full metrics stack is not required for the current phase.

## Workstreams

### Workstream 1: Catalog Correctness

#### Objectives

- verify source classification
- verify canonical identity rules
- verify mirror dedupe
- verify same-name/different-source preservation
- verify stale prune behavior
- verify search ordering behavior

#### Deliverables

- regression tests for official/community classification
- regression tests for mirror-family dedupe
- regression tests for same-name non-merge behavior
- regression tests for search ranking
- documented provenance rules in docs and memory-bank

### Workstream 2: Bundle And Apply Correctness

#### Objectives

- ensure bundles only advertise what can be applied honestly
- ensure every adapter writes the right config for local/project/user scopes
- ensure failures never look like success

#### Deliverables

- adapter contract tests for every supported target
- fixture-based config output tests
- shared capability metadata
- stronger UI/CLI parity around unsupported content types

### Workstream 3: Security Hardening

#### Objectives

- reduce abuse of public endpoints
- reduce misleading production defaults
- make auth and bundle routes safer by default

#### Deliverables

- route-level rate limiting for public expensive endpoints
- security headers and CSP review
- auth flow edge-case coverage
- bundle route abuse-path regression tests

### Workstream 4: Code Quality And Maintainability

#### Objectives

- keep the codebase understandable as it grows
- reduce duplicate logic and ambiguous ownership
- avoid dead dependencies and misleading abstractions

#### Deliverables

- adapter metadata consolidation
- registry boundary cleanup where it improves clarity
- conservative unused dependency audit
- generated artifact hygiene

### Workstream 5: Search And Performance Follow-Through

#### Objectives

- keep large catalog behavior fast and relevant
- reduce sync cost and uncertainty

#### Deliverables

- evaluate SQLite FTS or equivalent weighted index
- benchmark search behavior against real large corpus
- scheduled sync path
- better sync timing visibility

## Order Of Execution

Recommended order:

1. finalize current correctness fixes and commit them cleanly
2. add catalog and apply regression coverage
3. add security headers and rate limiting
4. consolidate target capability contract
5. improve search architecture
6. add scheduled sync and stronger observability
7. return to broader UX/product polish

## Testing Strategy

### Unit

- canonical identity helpers
- source classification helpers
- target capability metadata
- search ranking helpers

### Integration

- sync collectors against stable fixtures
- bundle creation from catalog rows
- adapter config generation from bundle inputs
- auth-protected stack APIs

### E2E

- catalog browse and search smoke
- bundle generation smoke
- login CTA and provider-gating smoke
- saved stack lifecycle smoke

### Chaos / Edge Cases

- partial upstream source failure
- timeout on official registry
- malformed collector payload
- duplicate source variants
- unsupported target scope
- target write failure

## Documentation Requirements

As this roadmap is executed, docs must stay truthful in three places:

- `docs/PROJECT_OVERVIEW.md` for product reality
- `docs/CHANGELOG.md` for recent change history
- `memory-bank/*` for current engineering state and next steps

The memory-bank should describe live truths, not outdated intentions.

## Success Criteria

This roadmap is successful when:

- catalog source attribution is explainable and regression-tested
- search returns meaningfully ranked results on the large live corpus
- every visible target has a truthful, tested capability contract
- bundle/apply failures are explicit and never silent
- public routes have baseline abuse protection
- docs and memory-bank match reality closely enough to guide future work without rediscovery

## Non-Goals

This roadmap does not attempt to solve:

- collaborative teams
- billing
- user-generated public marketplaces
- full skill/rule/workflow auto-install parity in one pass

Those can come later, after the platform surface is trustworthy enough to deserve them.
