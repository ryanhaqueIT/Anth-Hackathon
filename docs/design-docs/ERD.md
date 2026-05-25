<!-- Auto-generated from ERD.docx by scripts/extract_docx.py. Edit the .docx, then re-run extraction. -->

Got it — you need an Engineering Requirements Document (ERD), not an Entity Relationship Diagram.

Below is a clean Engineering Requirements Document for your build.

Engineering Requirements Document

Product: Neighbourhood Pulse

1. Purpose

Neighbourhood Pulse is a prototype platform that helps older residents aged 65+ discover nearby support, community connections, and local resources before they become isolated or vulnerable.

The system also provides privacy-safe aggregated insights to councils and service providers so they can understand unmet needs, service gaps, and areas of higher isolation risk.

2. Problem Being Solved

Older residents may have support services, community spaces, events, and social resources nearby, but these are often hard to discover. Many older residents may also prefer simple conversational or voice-based interaction instead of searching through websites or complex apps.

The engineering goal is to build a small MVP that can:

- Capture a resident’s need through a simple conversational interface.
- Match the need to nearby support services or community resources.
- Return simple recommendations.
- Store anonymised check-in signals.
- Show aggregated area-level insights for councils/providers.

3. MVP Scope

In scope

| Area | Requirement |
| --- | --- |
| Resident interface | Simple chat or voice-like input screen |
| User profile | Basic age band, suburb/postcode, optional needs |
| Check-in | Capture mood, need type, free-text request |
| Service matching | Match user need to nearby support resources |
| Recommendation | Return 1–3 relevant local services/actions |
| Admin dashboard | Show aggregated check-ins and needs by area |
| Data ingestion | Load initial open datasets manually or from CSV/API |
| Privacy | Store only minimal and anonymised data for MVP |

Out of scope

| Area | Reason |
| --- | --- |
| Full production voice AI | Too large for MVP |
| Real-time emergency escalation | Safety and compliance risk |
| Medical diagnosis | Not appropriate |
| Full council integration | Too large |
| Full authentication system | Not needed for prototype |
| Payment or monetisation | Not needed for MVP |
| Live NDIS/aged-care provider integration | Future phase |

4. User Types

4.1 Older resident

The resident uses the system to ask for support.

Example:

“I feel lonely. What can I do nearby?”

4.2 Council / provider user

The provider views aggregated insights.

Example:

“Which suburbs show higher social isolation needs among older residents?”

4.3 System admin

The admin loads datasets, manages categories, and reviews system health.

5. Functional Requirements

FR1 — Resident Profile

The system shall allow creation of a lightweight resident profile.

| Field | Required? |
| --- | --- |
| Age band | Yes |
| Suburb/postcode | Yes |
| Preferred language | Optional |
| Mobility needs | Optional |
| Accessibility needs | Optional |
| Consent flag | Yes |

Acceptance criteria:

- User can enter suburb/postcode.
- User can select age band.
- User can give consent for anonymised insight use.
- System does not require full name for MVP.

FR2 — Conversational Check-in

The system shall allow the resident to submit a check-in.

Check-in data:

| Field | Example |
| --- | --- |
| Mood | lonely, okay, anxious, tired |
| Need type | social, food, transport, health, financial |
| Free text | “I want something to do near me” |
| Channel | text, simulated voice |
| Time | timestamp |

Acceptance criteria:

- User can enter a natural-language request.
- System extracts or lets user select need type.
- System stores check-in against suburb/area.
- System marks check-in as anonymised for dashboard use.

FR3 — Need Classification

The system shall classify user requests into support categories.

Example mapping:

| User says | Need type |
| --- | --- |
| “I feel lonely” | Social connection |
| “I need cheap food” | Food support |
| “I cannot get there” | Transport support |
| “I feel unsafe” | Safety support |
| “I need to talk to someone” | Wellbeing support |

Acceptance criteria:

- MVP can use rule-based keyword matching.
- AI classification can be simulated or added later.
- Unclear requests default to “general support.”

FR4 — Support Service Search

The system shall search for support services near the resident’s suburb/postcode.

Service attributes:

| Field | Example |
| --- | --- |
| Name | Community lunch program |
| Category | Social / food |
| Address | Carlton |
| Distance | 0.8 km |
| Opening hours | Monday–Friday |
| Cost | Free |
| Accessibility | Wheelchair access |
| Contact | Phone / website |

Acceptance criteria:

- System returns services matching need type.
- System prioritises free or low-cost services.
- System ranks nearby services higher.
- System can return fallback services if no exact match is found.

FR5 — Recommendation Engine

The system shall recommend 1–3 actions or services.

Recommendation logic for MVP:

Score = category_match + distance_score + cost_score + accessibility_score

Example:

| Factor | Weight |
| --- | --- |
| Need/category match | 40% |
| Distance/proximity | 25% |
| Free or low cost | 20% |
| Accessibility | 15% |

Acceptance criteria:

- User receives simple recommendations.
- Each recommendation includes a reason.
- Example reason: “This is nearby, free, and matches your interest in social activities.”

FR6 — Community Insight Dashboard

The system shall show aggregated insights for council/provider users.

Dashboard metrics:

| Metric | Description |
| --- | --- |
| Total check-ins | Number of check-ins by area |
| Top need types | Social, food, transport, health |
| Isolation signal | Number/share of loneliness-related check-ins |
| Service availability | Count of nearby services |
| Gap indicator | High need + low service availability |
| Recommended action | Example: add outreach, promote service, run event |

Acceptance criteria:

- Dashboard does not show personally identifiable information.
- Dashboard groups data by suburb/area.
- Dashboard shows at least one simple risk/gap score.
- Dashboard can be built using mock data for MVP.

FR7 — Area Risk / Connection Score

The system shall calculate a simple area-level connection score.

Suggested formula:

Connection Gap Score =

Need Score - Support Availability Score

Example scoring:

| Component | Input |
| --- | --- |
| Need Score | older population, loneliness check-ins, low-income indicators |
| Support Availability Score | support services, community spaces, events |
| Access Score | public transport, walkability, pedestrian activity |

Acceptance criteria:

- Each area receives a simple low/medium/high indicator.
- Score is explainable.
- Score should not label individual residents as risky.
- Score is used only at aggregated area level.

6. Non-Functional Requirements

NFR1 — Privacy

The system must protect vulnerable users.

Requirements:

- Do not collect full name unless necessary.
- Do not expose individual check-ins on dashboard.
- Store consent status.
- Aggregate insights by suburb or area.
- Avoid showing small groups where re-identification is possible.

NFR2 — Accessibility

The system should be easy for older residents.

Requirements:

- Large text.
- Simple language.
- Minimal buttons.
- Voice-first or voice-simulated interaction.
- High contrast UI.
- No complex navigation.

NFR3 — Performance

For MVP:

| Action | Target |
| --- | --- |
| Submit check-in | Under 2 seconds |
| Return recommendations | Under 3 seconds |
| Load dashboard | Under 5 seconds |

NFR4 — Reliability

For MVP:

- App should run locally or on a simple hosted environment.
- If recommendation fails, show generic support resources.
- If location is missing, ask for suburb/postcode.

NFR5 — Safety

The system must not claim to be an emergency service.

Requirements:

- If user expresses urgent distress, show emergency support message.
- Include disclaimer: “This is not a crisis or medical service.”
- Provide helpline fallback where appropriate.
- Do not provide medical diagnosis.

NFR6 — Explainability

The system should explain recommendations.

Example:

“I suggested this because it is nearby, free, and offers social activities for older residents.”

7. Data Requirements

7.1 Data sources

| Data type | Example use |
| --- | --- |
| Older people profile | Identify areas with higher 65+ population |
| Resident profile | Understand area demographics |
| Social indicators | Estimate isolation/wellbeing risk |
| Free and cheap support services | Recommend support |
| Landmarks / places of interest | Identify community spaces |
| Pedestrian activity | Estimate active areas |
| Public transport / walking network | Estimate access |

7.2 Data ingestion

For MVP:

- Load CSV files manually.
- Store cleaned data in database or JSON.
- Standardise suburb, postcode, latitude, longitude.
- Tag each support service with category.

7.3 Data quality rules

| Rule | Description |
| --- | --- |
| Required location | Service must have suburb or coordinates |
| Required category | Service must be classified |
| Required name | Service must have readable name |
| Duplicates removed | Same service should not appear twice |
| Freshness noted | Show data source/update date if available |

8. System Architecture

8.1 MVP architecture

Resident UI

|

v

Check-in API

|

v

Need Classifier

|

v

Recommendation Engine

|

v

Support Service Database

|

v

Recommendation Response

Council Dashboard

|

v

Aggregated Insight API

|

v

Check-in + Area + Service Data

8.2 Suggested tech stack

| Layer | Suggested option |
| --- | --- |
| Frontend | React / Next.js |
| Backend | Node.js / Express |
| Database | SQLite, PostgreSQL, or Supabase |
| Maps | Leaflet or Mapbox |
| Data processing | Python or Node scripts |
| AI / classification | Rule-based MVP, later OpenAI/Claude |
| Hosting | Vercel + Supabase, or local demo |

9. API Requirements

POST /checkins

Creates a user check-in.

Request:

{

"resident_id": "R001",

"suburb": "Carlton",

"age_band": "65+",

"mood": "lonely",

"free_text": "I feel lonely and want something nearby",

"input_channel": "text"

}

Response:

{

"checkin_id": "C001",

"need_type": "social_connection",

"recommendations": [

{

"service_name": "Carlton Community Centre",

"reason": "Nearby and offers social activities",

"distance_km": 0.8

}

]

}

GET /services

Returns nearby services.

Query parameters:

suburb=Carlton

need_type=social_connection

GET /dashboard/areas

Returns area-level insight.

Response:

{

"area": "Carlton",

"total_checkins": 42,

"top_need": "social_connection",

"connection_gap_score": "High",

"recommended_action": "Promote low-cost social events and volunteer outreach"

}

10. Data Model

Main tables

| Table | Purpose |
| --- | --- |
| residents | Stores lightweight resident profile |
| checkins | Stores wellbeing/support requests |
| need_types | Stores categories of need |
| support_services | Stores available resources |
| service_categories | Classifies services |
| recommendations | Stores generated recommendations |
| areas | Stores suburb/council/small area |
| area_profiles | Stores demographic indicators |
| area_insights | Stores aggregated dashboard insights |

11. Security Requirements

| Requirement | Description |
| --- | --- |
| Consent | User must consent before data is used for aggregated insights |
| Minimal data | Do not collect unnecessary personal information |
| Access control | Dashboard only available to provider/admin users |
| Anonymisation | Remove direct identifiers from check-ins |
| Auditability | Track data source and generated insight date |

12. Build Plan

Phase 1 — Data setup

- Prepare sample suburbs.
- Load support services.
- Load demographic profile.
- Create service categories.

Phase 2 — Resident interface

- Build simple input form.
- Add simulated voice prompt text.
- Capture mood and need.

Phase 3 — Matching engine

- Classify request.
- Match to support services.
- Return recommendations.

Phase 4 — Dashboard

- Show area-level check-ins.
- Show top needs.
- Show connection gap score.
- Show suggested action.

Phase 5 — Pitch demo

Demo story:

“An older resident in Carlton feels lonely. They ask Neighbourhood Pulse what they can do nearby. The system recommends local free social activities. At the same time, councils see that social isolation signals are increasing in that area and can plan outreach.”

13. Test Cases

| Test ID | Scenario | Expected result |
| --- | --- | --- |
| TC01 | User says “I feel lonely” | Need type = social connection |
| TC02 | User enters Carlton | Services near Carlton returned |
| TC03 | No matching service found | Generic support option returned |
| TC04 | User does not consent | Check-in not used in dashboard |
| TC05 | Dashboard opened | Aggregated area data shown |
| TC06 | User expresses crisis phrase | Emergency/support disclaimer shown |
| TC07 | Service has no category | Data validation flags issue |

14. Key Engineering Decisions

| Decision | Choice |
| --- | --- |
| Primary interface | Conversational text; voice simulated for MVP |
| Target group | Older residents 65+ |
| First geography | City of Melbourne |
| Data strategy | Use open datasets + mock check-ins |
| Recommendation method | Rule-based scoring |
| Dashboard | Aggregated only |
| Privacy model | Minimal, consent-based, anonymised |

15. Final MVP Requirement Summary

The MVP must prove this:

An older resident can ask for local help, receive relevant nearby support recommendations, and contribute anonymised wellbeing signals that help councils and providers understand community connection gaps.

That is the engineering goal.

Example of pulling Melbourne data

#!/usr/bin/env python3

"""

prefetch_melbourne.py

=====================

Pre-fetch + cache City of Melbourne open data for a hackathon, and TEST three

demo addresses by reporting how much data sits within walking distance of each.

Why this exists: on hackathon day the public API gets slow/flaky under load.

Run this the night before. It writes JSON snapshots you can fall back to so your

demo never shows an empty screen.

USAGE

-----

python3 prefetch_melbourne.py

No dependencies beyond the Python 3 standard library. No API key required for

public datasets (set COM_APIKEY env var if you ever need one).

WHAT IT DOES

------------

1. Pulls the full dataset catalogue (authoritative dataset_ids) so it can

self-heal if any hard-coded slug is wrong.

2. Caches a 100-record sample of each priority dataset (the most-connected

nodes on the linkage map + every live feed).

3. Grabs fresh snapshots of the near-real-time feeds (pedestrian-per-minute,

parking sensors, microclimate).

4. For each of 3 demo addresses, runs proximity queries across the geospatial

datasets and prints a density report -> this is the "test" of the addresses.

5. Writes everything under ./cache/ plus a manifest.json describing the run.

VERIFIED DATASET TOTALS (from pre-hackathon run)

-------------------------------------------------

pedestrian-counting-system-monthly-counts-per-hour  1,573,618 hourly records

trees-with-species-and-dimensions-urban-forest          82,064 trees

customer-service-requests-with-resolution-time          46,479 requests

on-street-parking-bays                                  23,864 bays

on-street-parking-bay-sensors                            3,309 live sensors

development-activity-monitor                             1,465 permits

pedestrian-counting-system-sensor-locations                137 sensors

microclimate-sensor-readings (live, all sensors)            56 current readings

CONFIRMED NEAREST SENSORS PER DEMO ADDRESS

-------------------------------------------

Bourke St Mall    -> sensor_id 2

Lygon/Faraday     -> sensor_id 50

Southbank         -> sensor_id 212

NOTE: road-segment (static geometry) is cached in place of road-disruptions.

The live DTP disruptions API does not appear to have a slug on the CoM portal.

Check /api/explore/v2.1/catalog/datasets?q=disruption on the day.

OUTPUT

------

cache/

catalog.json                      full dataset list (id -> title)

datasets/<id>.json                100-record sample + total_count

live/<id>.<ISO>.json              timestamped live snapshots

addresses/<slug>.json             per-address proximity bundle + counts

manifest.json                     summary of the whole run

"""

import json, os, sys, time, math, urllib.parse, urllib.request, urllib.error

from datetime import datetime, timezone

BASE = "https://data.melbourne.vic.gov.au/api/explore/v2.1"

APIKEY = os.environ.get("COM_APIKEY", "").strip()

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")

SAMPLE = 100          # records per dataset sample (API max per call is 100)

PROX_RADIUS_M = 400   # walking-distance radius for demo-address tests

PROX_CAP = 300        # max records to pull per dataset per address

PAUSE = 0.3           # politeness delay between calls (seconds)

# ---------------------------------------------------------------------------

# Three demo addresses (chosen for dense, overlapping data coverage inside the

# City of Melbourne LGA). Coordinates are lon/lat-ready (we store lat & lon).

# ---------------------------------------------------------------------------

DEMO_ADDRESSES = [

{"slug": "bourke-st-mall",  "label": "Bourke Street Mall, Melbourne CBD",

"lat": -37.8137, "lon": 144.9646,

"nearest_sensor_id": 2,   # confirmed from prefetch run

"why": "Heart of CBD retail; multiple pedestrian sensors, dense CLUE blocks, street trees."},

{"slug": "lygon-carlton",   "label": "Lygon St & Faraday St, Carlton",

"lat": -37.7986, "lon": 144.9669,

"nearest_sensor_id": 50,  # confirmed from prefetch run

"why": "Famous hospitality strip; cafes/bars with seat counts, rich CLUE history, canopy."},

{"slug": "southbank-promenade", "label": "Southbank Promenade (Southgate), Southbank",

"lat": -37.8205, "lon": 144.9648,

"nearest_sensor_id": 212, # confirmed from prefetch run

"why": "Riverside arts/dining precinct; high footfall, microclimate sensors, venues."},

]

# ---------------------------------------------------------------------------

# Priority datasets. `id` is the best-known slug (verified where possible);

# `kw` are fallback keywords used to resolve the real id from the catalogue if

# the slug 404s. `geo` = include in per-address proximity tests. `live` = also

# take a timestamped snapshot.

# ---------------------------------------------------------------------------

DATASETS = [

# ---- spatial backbone / most-connected hubs ----

{"id": "blocks-for-census-of-land-use-and-employment-clue", "kw": ["clue", "blocks"], "geo": True},

... (380 lines left)
