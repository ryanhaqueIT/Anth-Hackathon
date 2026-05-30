# Neighbourhood Pulse

A community wellbeing companion for the Anthropic Impact Lab 2026. Built for older residents (65+) discovering nearby support, and for councils wanting privacy-safe visibility into connection gaps.

Our entry consists of 2 apps: a hyper-localised resident companion and an council insights dashboard.

**Resident Companion app**: Users are served prompts with accessible one-tap check-ins. Voice mode and a small set of tools let the companion go deeper when someone wants to talk and discover nearby support.

<p align="center">
  <img src="docs/screenshots/resident-companion-app.png" width="300" alt="Resident check-in: four mood buttons and voice mic">
</p>

**Council Insights app**: An aggregate view - 'mood pulse', heat map, and suburb panels - showing where residents are doing it tough. Tap into any suburb for a closer read of what's driving the signal.

<p align="center">
  <img src="docs/screenshots/dashboard.png" width="800" alt="Council dashboard: suburb heatmap with live aggregates">
</p>

<p align="center">
  <img src="docs/screenshots/dashboard-detail.png" width="800" alt="Carlton drill-in: support gap score, service density, suggested actions">
</p>

## System Architecture

```mermaid
flowchart TD
    %% ============ CLIENT TIER ============
    subgraph RESIDENT["Resident companion"]
        direction TB
        R1["Voice / mood check-in"]
        R2["Recommendations + companion chat"]
    end

    %% ============ INGRESS TIER ============
    subgraph EDGE["Ingress"]
        direction TB
        STT["Speech-to-text"]
        GW["API gateway · Fastify"]
    end

    %% ============ ORCHESTRATION + SAFETY TIER ============
    subgraph CORE["Orchestration &amp; safety"]
        direction TB
        ORCH["Check-in orchestrator"]
        SAFE{"Distress classifier"}
        CRISIS["Crisis routing<br/>e.g. Lifeline, Beyond Blue"]
    end

    %% ============ AI REASONING TIER ============
    subgraph AI["AI reasoning"]
        direction TB
        LLM["LLM orchestration<br/>tool-calling · max 4 steps"]
        SEARCH["Geo ranking results"]
        PICKS["1–3 ranked recommendations + why"]
    end

    %% ============ DATA TIER ============
    subgraph DATA["Data sources"]
        direction TB
        CACHE[("Service cache · 1h TTL")]
        COM[("City of Melbourne Open Data<br/>'Helping Out' dataset")]
        STORE[("Check-in store")]
    end

    %% ============ ANALYTICS TIER ============
    subgraph ANALYTICS["Analytics"]
        direction TB
        AGG["Aggregation + scoring<br/>service-gap index"]
        METRICS[("Suburb metrics")]
    end

    %% ============ COUNCIL TIER ============
    subgraph COUNCIL["Council dashboard"]
        DASH["Mood pulse · heat map"]
    end

    %% ---- Resident → ingress ----
    R1 -->|audio| STT
    R1 -->|check-in| GW
    STT -->|"transcript + mood + suburb + age band"| GW

    %% ---- Ingress → orchestration ----
    GW -->|"POST /checkin"| ORCH
    ORCH --> SAFE
    SAFE -->|crisis cue| CRISIS
    SAFE -->|ok| LLM

    %% ---- AI reasoning loop ----
    LLM -->|find_local_services| SEARCH
    SEARCH --> CACHE
    CACHE -. miss .-> COM
    SEARCH -->|candidates| LLM
    LLM -->|structured output| PICKS

    %% ---- Back to resident ----
    PICKS --> GW
    CRISIS --> GW
    GW --> R2
    R2 -->|"/chat SSE stream"| LLM

    %% ---- Analytics path ----
    ORCH -->|check-in event| STORE
    STORE --> AGG
    AGG --> METRICS
    METRICS --> DASH

    %% ============ STYLING ============
    classDef client    fill:#e8f0fe,stroke:stroke-width:1px,color:#1a1a1a
    classDef ingress   fill:#e6f4ea,stroke:stroke-width:1px,color:#1a1a1a
    classDef core      fill:#fef7e0,stroke:stroke-width:1px,color:#1a1a1a
    classDef ai        fill:#f3e8fd,stroke:stroke-width:1px,color:#1a1a1a
    classDef data      fill:#f1f3f4,stroke:stroke-width:1px,color:#1a1a1a
    classDef analytics fill:#fce8e6,stroke:stroke-width:1px,color:#1a1a1a
    classDef crisis    fill:#fad2cf,stroke:stroke-width:2px,color:#1a1a1a

    class R1,R2 client
    class STT,GW ingress
    class ORCH,SAFE core
    class CRISIS crisis
    class LLM,SEARCH,PICKS ai
    class CACHE,COM,STORE data
    class AGG,METRICS analytics
    class DASH client
```

## Setup & Run

```sh
pnpm install
cp .env.example .env   # set ANTHROPIC_API_KEY
pnpm dev
```

Open browser at <http://localhost:5173/>

## Structure

- `src/components/resident/` — companion app
- `src/components/dashboard/` — council dashboard
- `server/` — Fastify API

## Build plan

[`docs/exec-plans/active/2026-05-23-neighbourhood-pulse-e2e-build.md`](./docs/exec-plans/active/2026-05-23-neighbourhood-pulse-e2e-build.md). Product context: [`docs/`](./docs/).

## Demo

<p align="center">
  <img src="docs/screenshots/resident-app-demo.gif" width="300" alt="Resident check-in demo">
</p>

---
