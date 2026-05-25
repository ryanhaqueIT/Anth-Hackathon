<!-- Auto-generated from PRD.docx by scripts/extract_docx.py. Edit the .docx, then re-run extraction. -->

Product Requirements Document — PRD

Product name

Neighbourhood Pulse

One-line problem statement

How might we help local residents discover nearby support, connection, and community resources before they become isolated or vulnerable?

Specific target demographic

Older residents aged 65+, especially those who may be isolated, disadvantaged, widowed, living alone, or disconnected from community support.

This is now strongly supported by the latest conversation. The group agreed to narrow the context to disadvantaged, isolated people over 65, and discussed a companion-style interface that can collect wellbeing signals and provide aggregated insights to councils, NDIS providers, and service organisations.

Primary user

Older resident aged 65+

They may want to:

- find nearby support services
- feel less lonely
- know what is happening nearby
- ask for help in a simple way
- discover community activities
- talk to a friendly voice assistant

Secondary users

| User | Why they care |
| --- | --- |
| Local council | Understand isolation, disconnection, and unmet support needs |
| Community service provider | Identify areas where services are missing |
| NDIS / aged-care / wellbeing provider | Offer targeted support |
| Volunteer group | Know where community help is needed |
| Family member / carer | Help an older person stay connected |

Product vision

Neighbourhood Pulse is a community wellbeing companion and insight platform that helps older residents find local support while giving councils and service providers privacy-safe insight into where isolation and unmet needs may exist.

Core idea

There are two layers:

1. Resident-facing layer

A simple voice-first companion for older residents.

Example questions:

- “What support is near me?”
- “Is there a walking group nearby?”
- “I feel lonely today. What can I do?”
- “Where can I get cheap meals or community help?”
- “What events are happening near me?”
- “Can someone check in on me?”

2. Council/provider insight layer

An aggregated dashboard showing:

- areas with higher isolation risk
- areas with low access to services
- common wellbeing concerns
- service gaps
- community connection opportunities

The latest conversation makes this distinction clearly: the product helps vulnerable people directly, but the aggregated analytics layer can help councils and providers understand gaps and allocate resources better.

Goals

User goals

Older residents should be able to:

- Discover local help.
- Discover social activities.
- Feel heard and less isolated.
- Get simple recommendations.
- Access support using voice, not complex typing.

Organisation goals

Councils and providers should be able to:

- Understand where older residents may be isolated.
- Identify unmet support needs.
- See service gaps by area.
- Plan outreach or community programs.
- Reduce expensive manual surveys and fragmented data analysis.

Hackathon / MVP goals

For the first build, do not build everything.

Build a small prototype that shows:

- A user can ask for help.
- The system recommends nearby services/resources.
- The system records non-sensitive wellbeing signals.
- A dashboard shows aggregated community needs.

MVP Scope

MVP title

Neighbourhood Pulse: Voice-first local support finder for older residents

MVP user journey

Step 1: Older resident opens the app

They see or hear:

“Hi, I’m here to help you find support, activities, and people nearby. How are you feeling today?”

Step 2: Resident speaks or types

Example:

“I’m feeling lonely and I want to find something nearby.”

Step 3: System asks simple follow-up

“Would you like a social activity, health support, food support, or someone to talk to?”

Step 4: System recommends local resources

Example:

“There is a community lunch 900 metres away, a library event tomorrow, and a free support service open today.”

Step 5: System stores anonymised signal

Example:

- location area: Carlton
- need type: social connection
- sentiment: lonely
- age band: 65+
- recommended service: community event

Step 6: Dashboard updates

Council/provider can see:

“Carlton has rising social connection requests among older residents, but limited nearby free support activities after 5pm.”

Features

Must-have features for MVP

| Feature | Description |
| --- | --- |
| Simple resident profile | Age band, suburb/local area, optional interests |
| Voice or chat input | User can ask for help conversationally |
| Local support search | Finds nearby services/resources |
| Recommendation engine | Suggests support based on need |
| Wellbeing check-in | Captures simple mood/need signal |
| Community insight dashboard | Aggregated view for councils/providers |
| Privacy-safe aggregation | No personal details shown in dashboard |

Should-have features

| Feature | Description |
| --- | --- |
| Service category filtering | Food, health, social, transport, cultural, emergency |
| Distance filter | Show support within walking/public transport range |
| Accessibility flag | Wheelchair access, public transport nearby, phone support |
| Follow-up reminder | “Would you like me to remind you tomorrow?” |
| Carer/family notification | Optional and consent-based only |

Not in MVP

Do not build these now:

- full social network
- real-time aged-care platform
- medical diagnosis
- emergency response system
- full digital twin
- business site-selection tool
- individual surveillance system
- automated escalation without consent

Data needed

Core data entities

| Data | Purpose |
| --- | --- |
| Older resident profile | Understand user segment |
| Location / suburb / small area | Match user to nearby support |
| Support services | Recommend resources |
| Community places | Libraries, community centres, places of worship, parks |
| Events / activities | Recommend connection opportunities |
| Wellbeing check-ins | Understand user need |
| Aggregated insight | Help council/provider planning |

Suggested external/open data

Use available datasets such as:

- older people demographic profile
- resident profiles
- social indicators
- free and cheap support services
- landmarks / places of interest
- pedestrian activity / accessibility
- public transport stops
- community facilities

Main user stories

Older resident

| ID | User story | Priority |
| --- | --- | --- |
| US01 | As an older resident, I want to ask what support is near me so I can get help easily. | Must |
| US02 | As an older resident, I want to say how I feel so the system can suggest useful support. | Must |
| US03 | As an older resident, I want recommendations in plain language so I can understand them easily. | Must |
| US04 | As an older resident, I want to find social activities nearby so I feel less isolated. | Must |
| US05 | As an older resident, I want to use voice instead of typing so the product is easier for me. | Should |

Council/provider

| ID | User story | Priority |
| --- | --- | --- |
| US06 | As a council officer, I want to see aggregated isolation signals by area so I can identify service gaps. | Must |
| US07 | As a service provider, I want to know which areas have unmet needs so I can plan outreach. | Must |
| US08 | As a council planner, I want to compare services against demographic need so I can prioritise funding. | Should |
| US09 | As a provider, I want privacy-safe insights so I do not expose individual residents. | Must |

Success metrics

Resident-facing metrics

| Metric | Meaning |
| --- | --- |
| Number of check-ins | Are residents using it? |
| Number of support recommendations viewed | Are they discovering services? |
| Number of social activity recommendations | Is it helping connection? |
| Repeat usage | Is it useful enough to return? |
| Positive sentiment change | Does mood improve after support? |

Council/provider metrics

| Metric | Meaning |
| --- | --- |
| Isolation risk areas identified | Can the platform find need? |
| Service gap areas identified | Can it guide planning? |
| Cost reduction vs surveys | Can it reduce manual research cost? |
| Number of aggregated insights generated | Is the dashboard useful? |

Risks and constraints

| Risk | Mitigation |
| --- | --- |
| Privacy risk | Store only consented and anonymised data |
| Vulnerable-user risk | Do not replace human care or emergency services |
| Data quality risk | Show confidence level for insights |
| Overly broad scope | Start with 65+ social isolation only |
| Voice complexity | MVP can simulate voice with text first |
| Ethical risk | Avoid individual tracking or labelling people as “at risk” publicly |
