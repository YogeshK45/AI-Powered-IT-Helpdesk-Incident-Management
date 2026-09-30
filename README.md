# AI-Powered IT Helpdesk & Incident Management System

> **An enterprise-style SAP Fiori/SAPUI5 IT Helpdesk application with AI-powered incident analysis and a grounded RAG knowledge assistant.**

[![SAPUI5](https://img.shields.io/badge/Frontend-SAPUI5%20%2F%20Fiori-0070F2?logo=sap&logoColor=white)](https://ui5.sap.com/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Qdrant](https://img.shields.io/badge/Vector%20DB-Qdrant-DC2626?logo=qdrant&logoColor=white)](https://qdrant.tech/)
[![SentenceTransformers](https://img.shields.io/badge/Embeddings-all--MiniLM--L6--v2-FFA116)](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
[![Groq](https://img.shields.io/badge/LLM-Groq%20Cloud-F55036)](https://groq.com/)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Important Architecture Note](#important-architecture-note)
3. [System Architecture](#system-architecture)
4. [Core Features](#core-features)
   - [Incident Management](#incident-management)
   - [SLA Management](#sla-management)
   - [Knowledge Base](#knowledge-base)
   - [AI Incident Assistant](#ai-incident-assistant)
5. [Retrieval-Augmented Generation (RAG)](#retrieval-augmented-generation-rag)
   - [RAG Pipeline Architecture](#rag-pipeline-architecture)
   - [Sentence Transformer Embeddings](#sentence-transformer-embeddings)
   - [Qdrant Vector Database](#qdrant-vector-database)
   - [Document Chunking](#document-chunking)
   - [Grounded Answer Generation](#grounded-answer-generation)
   - [No-Context Guardrail](#no-context-guardrail)
6. [API Documentation](#api-documentation)
7. [Knowledge Base Catalog & Retrieval Verification](#knowledge-base-catalog--retrieval-verification)
8. [Technology Stack](#technology-stack)
9. [Project Directory Structure](#project-directory-structure)
10. [Quick Start & Local Setup](#quick-start--local-setup)
11. [Testing & Quality Assurance](#testing--quality-assurance)

---

## Project Overview

In enterprise IT environments, support teams handle incidents across diverse technical areas:

- **VPN & Remote Connectivity** (Cisco AnyConnect, IPsec/SSL, routing table collisions)
- **SAP Login** (account lockouts in SU01, SNC single sign-on, SAP GUI connections)
- **SAP Authorization** (SU53 authorization checks, PFCG roles, GRC requests)
- **Network** (wired LAN, enterprise 802.1x Wi-Fi, Winsock stack resets)
- **Corporate DNS** (Domain Controller lookups, DHCP DNS settings, VPN split-DNS NRPT)
- **Hardware** (laptop performance, CPU/disk bottlenecks, thermal throttling, BSODs)
- **Software** (driver corruptions, Windows system integrity SFC/DISM)
- **Email** (Outlook sync, modern authentication token loops, OST corruption)
- **Printer** (print spooler service recovery, network print queues, badge release)
- **User Access & Identity** (Active Directory password resets, lockout loops, SAP GRC)

Traditional ticket handling requires support engineers to manually search knowledge articles and troubleshoot recurring incidents. This project provides:

- **IT Incident Management**: Structured incident handling and worklists.
- **Ticket Lifecycle Management**: Formal state transitions from intake to closure.
- **SLA Monitoring**: Real-time urgency tracking and warning states.
- **Knowledge Base**: Centralized IT troubleshooting runbooks.
- **AI Incident Assistant**: Incident classification, issue type detection, and similar incident mapping.
- **Retrieval-Augmented Generation (RAG)**: AI recommendations grounded in verified IT runbooks designed to reduce hallucination through retrieval grounding, source attribution, and a no-context guardrail.
- **Grounded Troubleshooting Recommendations**: Step-by-step diagnostic workflows structured for support staff.
- **Knowledge Source Attribution**: Verifiable document citations and retrieval confidence scores for every recommendation.

---

## Important Architecture Note

> **Transparency Statement**:  
> The current implementation focuses on the **SAPUI5/Fiori frontend** and an independent **Python/FastAPI AI/RAG service**. The SAP RAP/ABAP/OData backend is not part of the current implementation.  
> 
> The frontend is designed with SAP Fiori enterprise patterns and is structured to remain compatible with a future SAP RAP/OData V4 backend.

---

## System Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                    SAP Fiori / SAPUI5 Frontend                  │
│       Overview | Ticket Worklist | Object Page | AI Assistant   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP / JSON (REST API)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI RAG Backend                        │
│            CORS | Request Validation | Routing | Health         │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
                ▼                                 ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│     Semantic Retrieval        │ │     Grounded RAG Service      │
│     (retrieval_service)       │ │        (rag_service)          │
└───────────────┬───────────────┘ └───────────────┬───────────────┘
                │                                 │ Context Builder
        ┌───────┴───────┐                         │ + Grounding Rules
        ▼               ▼                         ▼
┌──────────────┐ ┌──────────────┐ ┌───────────────────────────────┐
│  Embedding   │ │    Qdrant    │ │        LLM Abstraction        │
│   Service    │ │    Vector    │ │         (llm_service)         │
│ (all-MiniLM  │ │   Database   │ └───────────────┬───────────────┘
│   -L6-v2)    │ │ (Cosine 384) │                 │ HTTPS (JSON)
└──────────────┘ └──────────────┘                 ▼
        ▲               ▲         ┌───────────────────────────────┐
        │               │         │   Groq / OpenAI Compatible    │
┌───────┴───────────────┴───────┐ │    (openai/gpt-oss-120b)      │
│     10 Knowledge Runbooks     │ └───────────────────────────────┘
│ (VPN, SAP, DNS, Printer...)   │
└───────────────────────────────┘
```

---

## Core Features

### Incident Management

- **Create Incidents**: Guided ticket creation with mandatory categorization, business impact, and priority selection.
- **View Incidents**: Filterable worklist with visual status badges and urgency indicators.
- **Search Incidents**: Instant text filtering across ticket titles, descriptions, and IDs.
- **Filter Incidents**: Multi-criteria filtering by priority, category, status, and assigned engineer.
- **Sort Incidents**: Sort by creation date, priority, or SLA deadline.
- **Ticket Object Page**: Complete single-ticket view with caller info, technical details, timeline history, and resolution notes.
- **Assignment Workflow**: Assign tickets directly to support engineers or resolver groups.
- **Status Lifecycle**: Governed state transitions:
  ```text
  NEW ──► ASSIGNED ──► IN_PROGRESS ──► RESOLVED ──► CLOSED
  ```
- **Reopen Workflow**: Controlled reopen path when issues recur:
  ```text
  RESOLVED / CLOSED ──► REOPENED ──► ASSIGNED / IN_PROGRESS
  ```
- **Comments & Work Notes**: Internal communication thread between support engineers.
- **Resolution**: Captures resolution codes, root cause notes, and resolution timestamps.
- **Escalation**: Escalates critical tickets requiring specialized engineering intervention.

---

### SLA Management

Automated deadline tracking based on incident priority:

| Priority | Resolution SLA Target | Warning Threshold | Operational Context |
|---|---|---|---|
| **Critical** | **4 hours** | 1 hour remaining | Business halted, production outage |
| **High** | **8 hours** | 2 hours remaining | Department disruption, degraded core service |
| **Medium** | **24 hours** | 4 hours remaining | Single user degraded functionality |
| **Low** | **48 hours** | 8 hours remaining | Minor inquiry, administrative request |

**SLA States:**
- `WITHIN_SLA`: Resolution timeline on track.
- `AT_RISK`: Warning threshold crossed, breach imminent if unassigned or stalled.
- `BREACHED`: Target resolution timeframe exceeded.
- `MET`: Ticket successfully resolved within the SLA window.

---

### Knowledge Base

- **Knowledge Article Search**: Full-text and keyword lookup across technical guides.
- **Category Filtering**: Domain-specific runbook browsing:
  - Network
  - VPN
  - SAP
  - SAP Security
  - Hardware
  - Software
  - Email
  - Printer
  - Security
  - Access Management
- **Article Details**: Problem overviews, prerequisites, step-by-step diagnostic workflows, and escalation matrices.
- **AI Knowledge Sources**: Connected knowledge articles used as citations for AI recommendations.

---

### AI Incident Assistant

- **Incident Classification**: Categorizes incoming tickets into technical domains.
- **Issue Type Detection**: Identifies the sub-issue (e.g., *Authentication*, *Routing*, *Spooler Deadlock*).
- **Priority Recommendation**: Suggests urgency based on business impact keywords.
- **Support Team Recommendation**: Routes tickets to the responsible team (Network Operations, SAP Security, EUC).
- **Incident Summary**: Generates concise executive summaries from technical descriptions.
- **Recommended Resolution**: Formulates step-by-step diagnostic workflows.
- **Confidence**: Deterministic metric indicating retrieval quality and classification certainty.
- **Similar Incidents**: Identifies historical tickets with matching technical patterns.
- **Knowledge Source Retrieval**: Displays exact knowledge articles cited.

> **Human-in-the-Loop Safeguard**:  
> *"AI recommendations do not automatically modify or close incidents. User confirmation is required."*  
> The support engineer reviews, tests, and validates all guidance before applying changes or closing tickets.

---

## Retrieval-Augmented Generation (RAG)

The RAG pipeline grounds AI responses in the IT Helpdesk Knowledge Base instead of relying only on the LLM's general knowledge.

### RAG Pipeline Architecture

```text
Knowledge Documents (articles.json)
         ↓
Document Loading & Validation
         ↓
Paragraph-Aware Chunking (~250 words, 60 overlap)
         ↓
Sentence Transformer Embeddings (384 dimensions)
         ↓
Qdrant Vector Database (COSINE metric)
         ↓
Semantic Retrieval (Threshold >= 0.35)
         ↓
Relevant Knowledge Context
         ↓
Context Assembly (ID, Title, Category, Content)
         ↓
Grounded LLM Prompt (9 Grounding Rules)
         ↓
LLM (Groq / OpenAI Compatible)
         ↓
Grounded Answer (5 Structured Sections)
         ↓
Knowledge Sources + Confidence Score
```

**Stage Breakdown:**
1. **Document Loading**: Reads structured JSON articles containing problem descriptions, prerequisites, step-by-step procedures, and escalation matrices.
2. **Chunking**: Splits articles at natural paragraph boundaries (`\n\n`) to preserve step continuity without cutting commands mid-sentence.
3. **Embeddings**: Converts text chunks and incoming queries into dense 384-dimensional vector embeddings.
4. **Qdrant Storage**: Indexes vector points alongside structured payload metadata.
5. **Semantic Retrieval**: Queries Qdrant using cosine similarity, filters by `SIMILARITY_THRESHOLD >= 0.35`, and applies optional category filters.
6. **Context Assembly**: Structures retrieved chunks with clear source labels, titles, and categories.
7. **Grounded Prompting**: Injects 9 strict grounding rules forbidding hallucination and invented procedures.
8. **LLM Generation**: Generates recommendations adhering strictly to the 5-part structure.
9. **Attribution**: Returns verifiable source citations and deterministic confidence scores.

---

### Sentence Transformer Embeddings

- **Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Vector Dimension**: `384` floating-point values
- **Distance Metric**: `COSINE`
- **Execution**: Singleton service initialized once during application startup and reused across all requests.

> *"Knowledge-base chunks and user queries are converted into 384-dimensional embeddings and compared using semantic similarity."*

---

### Qdrant Vector Database

- **Engine**: Qdrant Vector Search Engine
- **Collection Name**: `it_helpdesk_knowledge`
- **Vector Size**: `384`
- **Distance**: `COSINE`
- **Supported Storage Modes**:
  1. **Embedded Local Mode** (`./data/qdrant_storage`): On-disk embedded storage requiring no external Docker containers. The backend automatically falls back to this mode if a remote server is unreachable.
  2. **Qdrant Server / Docker Mode** (`http://localhost:6333`): Containerized or server deployment for concurrent access.
  3. **Qdrant Cloud**: Managed cloud clusters using HTTPS endpoint and API key.

**Stored Payload Schema:**
```json
{
  "document_id": "KB-1001",
  "title": "VPN Connectivity Troubleshooting",
  "category": "VPN",
  "subcategory": "Connectivity",
  "source": "IT Helpdesk Knowledge Base",
  "tags": ["vpn", "cisco anyconnect", "connectivity"],
  "chunk_index": 0,
  "content": "Problem Overview\nUser is unable to establish a secure remote connection...",
  "last_updated": "2026-09-15"
}
```
*Chunk content is stored with metadata so retrieved knowledge can be passed directly into the RAG context without secondary database roundtrips.*

---

### Document Chunking

- **Strategy**: Paragraph-aware chunking split on logical section boundaries (`\n\n`) to keep troubleshooting steps, registry paths, and commands intact.
- **Target Chunk Size**: `~250 words` per chunk.
- **Chunk Overlap**: `60 words` preserved from preceding section to maintain technical context across chunk boundaries.
- **Ingestion Result**: The 10 knowledge runbooks produce **37 distinct knowledge chunks** (averaging 3.7 chunks per document).

> *"Chunking keeps troubleshooting information semantically meaningful while allowing the retrieval layer to locate specific sections of knowledge articles."*

---

### Grounded Answer Generation

The grounded generation layer transforms incoming incidents into actionable recommendations:

```text
User Incident
      ↓
Semantic Retrieval (Threshold >= 0.35)
      ↓
Relevant Knowledge
      ↓
Context Construction
      ↓
LLM (Groq / OpenAI)
      ↓
Grounded Answer
```

#### Grounding Rules:
- **Primary Source**: Use the retrieved knowledge as the primary source for the answer.
- **No Invented Procedures**: Do not invent troubleshooting procedures, commands, policies, configurations, or facts.
- **No Invented Policies**: Adhere strictly to stated corporate policies (e.g., identity verification before password resets).
- **No Claimed Actions**: Do not claim that an action has been performed (e.g., *"I have unlocked your account"*).
- **No Claimed Status**: Do not claim that a ticket has been resolved, assigned, closed, or escalated.
- **Controlled No-Context Handling**: If sufficient knowledge is unavailable, return a controlled no-context response.
- **Knowledge Source Attribution**: Return the knowledge sources used to generate the answer.
- **Engineer Responsibility**: The support engineer remains responsible for deciding and applying the recommendation.

#### Output Structure:
Grounded answers return the following 5 structured sections:
1. **Summary**: Concise description of the incident.
2. **Likely Cause**: Probable technical defect derived from retrieved documentation.
3. **Recommended Troubleshooting**: Concrete diagnostic steps.
4. **Recommended Resolution**: Specific fix to apply.
5. **Escalation Condition**: Conditions under which the ticket should be escalated and the target resolver team.

---

### No-Context Guardrail

If semantic retrieval returns **zero chunks** above the similarity threshold (`SIMILARITY_THRESHOLD >= 0.35`), the system **bypasses the LLM entirely**.

It immediately returns:

```json
{
  "query": "How do I cook pasta?",
  "answer": "I could not find sufficient information in the IT Helpdesk Knowledge Base to answer this incident confidently. Please provide additional incident details or escalate the issue to the appropriate support team.",
  "grounded": false,
  "confidence": 0.0,
  "sources": [],
  "retrieved_chunks": 0,
  "error": null
}
```

This guardrail prevents the LLM from generating ungrounded answers or hallucinating non-IT troubleshooting advice.

---

## API Documentation

FastAPI exposes the following endpoints (available on port `8000` with interactive Swagger UI at `/docs`):

### 1. `GET /health`

**Purpose**: System health verification.  
**Method**: `GET`  
**Request**: None  
**Example Response**:
```json
{
  "status": "healthy"
}
```

---

### 2. `GET /health/vector-db`

**Purpose**: Verifies Qdrant connection and reports collection statistics.  
**Method**: `GET`  
**Request**: None  
**Example Response**:
```json
{
  "status": "healthy",
  "collection": "it_helpdesk_knowledge",
  "points_count": 37
}
```

---

### 3. `POST /api/v1/retrieve`

**Purpose**: Pure semantic vector similarity search against Qdrant with optional category filtering and similarity thresholding.  
**Method**: `POST`  

**Example Request:**
```json
{
  "query": "VPN is not connecting after password reset",
  "top_k": 3,
  "category": "VPN"
}
```

**Example Response:**
```json
{
  "query": "VPN is not connecting after password reset",
  "results": [
    {
      "document_id": "KB-1001",
      "title": "VPN Connectivity Troubleshooting",
      "category": "VPN",
      "subcategory": "Connectivity",
      "chunk_index": 1,
      "content": "Phase 1: Authentication and Account Verification\n1. Confirm the user is entering their standard UPN and current domain password.\n2. Ensure the user acknowledges and approves the MFA push notification within 30 seconds...\n3. Check Active Directory Users and Computers (ADUC) to verify the account is neither locked out nor expired...",
      "source": "IT Helpdesk Knowledge Base",
      "score": 0.5938
    }
  ],
  "count": 1,
  "message": null
}
```

*Negative Query Example (query: "How do I cook pasta?"):*
```json
{
  "query": "How do I cook pasta?",
  "results": [],
  "count": 0,
  "message": "No sufficiently relevant knowledge was found."
}
```

---

### 4. `POST /api/v1/rag/query`

**Purpose**: Full grounded RAG pipeline. Retrieves relevant chunks, constructs context, and invokes the LLM with grounding rules.  
**Method**: `POST`  

**Example Request:**
```json
{
  "query": "Corporate DNS is not resolving internal hostnames",
  "top_k": 3
}
```

**Example Response:**
```json
{
  "query": "Corporate DNS is not resolving internal hostnames",
  "answer": "**Summary**\nWorkstations cannot resolve internal FQDNs (e.g., portal.corp.internal) while IP-based connectivity works.\n\n**Likely Cause**\nThe client is using an incorrect DNS server (public resolver or local gateway) instead of internal Domain Controllers, or has stale DNS client cache.\n\n**Recommended Troubleshooting**\n1. Confirm workstation has active network link and obtained IP via corporate DHCP.\n2. Run 'ipconfig /all' and check DNS Servers point to internal DCs (10.0.1.10, 10.0.1.11).\n3. Execute 'ipconfig /flushdns' to clear stale resolution cache.\n4. Run 'nslookup portal.corp.internal 10.0.1.10' to test the internal DC directly.\n5. For remote users, run 'Get-DnsClientNrptPolicy' to verify VPN split-DNS rules.\n\n**Recommended Resolution**\nSet IPv4 adapter properties to Obtain DNS server address automatically and flush DNS cache.\n\n**Escalation Condition**\nEscalate to Enterprise Directory and Core Network Infrastructure team if direct queries to internal DCs time out across multiple workstations.",
  "grounded": true,
  "confidence": 0.7062,
  "sources": [
    {
      "document_id": "KB-1004",
      "title": "Corporate DNS Troubleshooting",
      "score": 0.7062
    }
  ],
  "retrieved_chunks": 3,
  "error": null
}
```

---

### 5. `POST /api/v1/rag/analyze-incident`

**Purpose**: Incident ticket classification, priority recommendation, resolver team assignment, and knowledge mapping.  
**Method**: `POST`  

**Example Request:**
```json
{
  "ticket_id": "INC-10042",
  "title": "VPN connection fails with error 412",
  "description": "User reports Cisco AnyConnect fails during virtual adapter initialization with error code 412.",
  "category": "VPN",
  "priority": "High"
}
```

**Example Response:**
```json
{
  "ticket_id": "INC-10042",
  "classification": "VPN Connectivity",
  "issue_type": "Authentication / VPN Client",
  "recommended_priority": "High",
  "recommended_team": "Network Operations",
  "summary": "Incident regarding VPN Connectivity",
  "recommended_resolution": "Verify virtual network adapter in ncpa.cpl, restart Cisco AnyConnect Secure Mobility Agent service, and reinstall client from Software Center if driver code 412 persists.",
  "confidence": 0.5938,
  "knowledge_sources": [
    {
      "document_id": "KB-1001",
      "title": "VPN Connectivity Troubleshooting",
      "score": 0.5938
    }
  ]
}
```

---

## Knowledge Base Catalog & Retrieval Verification

The system includes 10 structured enterprise-style knowledge runbooks (`data/knowledge_base/articles.json`).

All retrieval mappings have been verified using `python scripts/test_retrieval.py`:

| Document ID | Title | Category | Verified Query | Observed Top Match | Score |
|---|---|---|---|---|---|
| **KB-1001** | VPN Connectivity Troubleshooting | VPN | *"VPN is not connecting after changing password"* | **KB-1001** | **0.5675** |
| **KB-1002** | SAP Authorization Troubleshooting | SAP | *"SAP user cannot access a transaction"* | **KB-1010 / KB-1002** | **0.6386** |
| **KB-1003** | SAP Login Troubleshooting | SAP | *"SAP login is failing"* | **KB-1003** | **0.7678** |
| **KB-1004** | Corporate DNS Troubleshooting | Network | *"Corporate DNS is not resolving"* | **KB-1004** | **0.6511** |
| **KB-1005** | Network Connectivity Troubleshooting | Network | *"Internet connection is unstable"* | **KB-1005** | **0.5299** |
| **KB-1006** | Password Reset Procedure | Access Management | *"I forgot my corporate password"* | **KB-1006** | **0.4921** |
| **KB-1007** | Printer Connectivity Guide | Printer | *"Office printer cannot be reached"* | **KB-1007** | **0.6530** |
| **KB-1008** | Laptop Performance Troubleshooting | Hardware | *"Laptop is very slow"* | **KB-1008** | **0.4815** |
| **KB-1009** | Email Access Troubleshooting | Email | *"Unable to access corporate email"* | **KB-1009** | **0.4807** |
| **KB-1010** | SAP User Access Procedure | SAP | *"User needs SAP system access"* | **KB-1010** | **0.6648** |
| — | *(Out-of-Domain Negative Test)* | — | *"How do I cook pasta?"* | **None (0 results)** | **0.0000** |

---

## Technology Stack

### Frontend
- **Framework**: SAPUI5 (v1.120+) / SAP Fiori Design Guidelines
- **Architecture**: MVC (Model-View-Controller)
- **Tooling**: `@ui5/cli`
- **Data Binding**: JSONModel (structured for future OData V4 compatibility)

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Server**: Uvicorn (ASGI)
- **Data Validation**: Pydantic v2 & Pydantic-Settings
- **HTTP Client**: HTTPX (Async)

### Vector Database & Embeddings
- **Embeddings**: SentenceTransformers (`sentence-transformers/all-MiniLM-L6-v2`)
- **Vector Database**: Qdrant (`qdrant-client` 1.19+)
- **Distance Metric**: Cosine Similarity

### LLM Provider Abstraction
- **Supported Providers**: **Groq Cloud** (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`) and **OpenAI-compatible APIs** (`gpt-3.5-turbo`, `gpt-4o`).
- **Resilience**: Automatic exponential backoff on HTTP 429 rate limits.
- **Configuration**: Provider and keys configured purely through environment variables.
- *Note: Live LLM generation requires a configured LLM API key.*

---

## Project Directory Structure

```text
.
├── .gitignore                      # Excludes node_modules, .venv, .env, and local vector storage
├── package.json                    # SAPUI5 npm scripts & dependencies
├── ui5.yaml                        # UI5 tooling server configuration
├── webapp/                         # SAP Fiori Frontend Application
│   ├── Component.js                # UI5 application descriptor & initialization
│   ├── manifest.json               # App routing, data sources, and component config
│   ├── index.html                  # Frontend bootstrap entry point
│   ├── controller/                 # View controllers
│   │   ├── AIAssistant.controller.js # AI diagnosis & recommendation controller
│   │   ├── Overview.controller.js    # Metric tiles & helpdesk KPIs
│   │   ├── TicketList.controller.js  # Filterable incident worklist
│   │   ├── TicketObject.controller.js# Incident detail, timeline, and resolution
│   │   └── CreateTicket.controller.js# Ticket submission wizard
│   ├── view/                       # SAPUI5 XML views
│   ├── service/                    # Mock data and local abstraction services
│   └── model/                      # Formatters and state models
│
└── rag-backend/                    # Python FastAPI RAG Service
    ├── app/
    │   ├── main.py                 # FastAPI bootstrap & CORS setup
    │   ├── core/
    │   │   └── config.py           # Pydantic Settings reading .env
    │   ├── models/
    │   │   └── schemas.py          # Pydantic request/response models
    │   ├── api/routes/
    │   │   ├── health.py           # /health and /health/vector-db
    │   │   ├── rag.py              # /api/v1/rag/query, /retrieve, /analyze-incident
    │   │   └── ingest.py           # Ingestion trigger route
    │   └── services/
    │       ├── embedding_service.py # SentenceTransformers singleton (384-dim)
    │       ├── chunking_service.py  # Paragraph chunker with context overlap
    │       ├── vector_service.py    # Qdrant client & idempotent upsert
    │       ├── retrieval_service.py # Cosine search & threshold filtering
    │       ├── rag_service.py       # Context builder & grounding rules
    │       ├── llm_service.py       # Groq/OpenAI caller with 429 retry
    │       └── document_service.py  # File ingestion orchestrator
    ├── data/
    │   ├── knowledge_base/
    │   │   └── articles.json       # 10 enterprise knowledge documents
    │   └── qdrant_storage/         # Local persistent vector database
    ├── scripts/
    │   ├── ingest_knowledge.py     # Vector ingestion script
    │   ├── test_retrieval.py       # Automated 10-query retrieval test suite
    │   └── test_rag.py             # End-to-end grounded RAG test suite
    ├── tests/
    │   ├── test_api.py             # Endpoint tests (4 tests)
    │   ├── test_chunking.py        # Chunking & metadata preservation tests (3 tests)
    │   ├── test_embeddings.py      # Embedding dimension & singleton tests (5 tests)
    │   ├── test_retrieval.py       # 9 retrieval verification test cases (9 tests)
    │   └── test_rag_grounding.py   # 8 grounding & anti-hallucination tests (8 tests)
    ├── requirements.txt            # Python dependencies
    ├── pytest.ini                  # Pytest configuration
    ├── .env.example                # Example environment template (safe to commit)
    └── .env                        # Local runtime configuration (DO NOT COMMIT)
```

---

## Quick Start & Local Setup

### 1. Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.11+)

---

### 2. Configure Environment (`rag-backend/.env`)

Copy `rag-backend/.env.example` to `rag-backend/.env`:

```bash
cp rag-backend/.env.example rag-backend/.env
```

Edit `rag-backend/.env` with your settings:

```bash
# Vector Database
# Uses local on-disk storage by default (zero Docker required):
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION_NAME=it_helpdesk_knowledge

# Embeddings
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384

# Retrieval Configuration
TOP_K=5
SIMILARITY_THRESHOLD=0.35

# LLM Provider Configuration (Groq / OpenAI)
LLM_PROVIDER=groq
LLM_API_KEY=your_groq_api_key_here
LLM_MODEL=openai/gpt-oss-120b
```

> **Security Warning**:  
> `.env` contains local secrets and is listed in `.gitignore`. **Never commit `.env` to source control.**

---

### 3. Run Backend & Ingest Knowledge Base

```bash
cd rag-backend

# Install dependencies
pip install -r requirements.txt

# Ingest and index knowledge runbooks into Qdrant
python scripts/ingest_knowledge.py

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Backend Base URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

### 4. Run Frontend (SAPUI5)

Open a separate terminal in the root workspace directory:

```bash
# Install UI5 CLI & dependencies
npm install

# Start the SAPUI5 development server
npm start
```

- **Application URL**: `http://localhost:8080/index.html`

---

## Testing & Quality Assurance

### Automated Unit Test Suite (29 Tests - 100% Passed)

Run the full pytest suite from `rag-backend/`:

```bash
cd rag-backend
python -m pytest -v
```

**Observed Test Results:**
```text
============================== test session starts ==============================
collected 29 items

tests/test_api.py::test_health_check PASSED                              [  3%]
tests/test_api.py::test_vector_db_health PASSED                          [  6%]
tests/test_api.py::test_rag_query_empty PASSED                           [ 10%]
tests/test_api.py::test_rag_retrieve_empty PASSED                        [ 13%]
tests/test_chunking.py::test_chunking_metadata_preservation PASSED       [ 17%]
tests/test_chunking.py::test_chunking_all_kb_articles_produce_multiple_chunks PASSED [ 20%]
tests/test_chunking.py::test_empty_document_produces_no_chunks PASSED    [ 24%]
tests/test_embeddings.py::test_embedding_dimension PASSED                [ 27%]
tests/test_embeddings.py::test_embed_vpn_query PASSED                    [ 31%]
tests/test_embeddings.py::test_embed_singleton_model PASSED              [ 34%]
tests/test_embeddings.py::test_embed_empty_text PASSED                   [ 37%]
tests/test_embeddings.py::test_embed_documents_batch PASSED              [ 41%]
tests/test_rag_grounding.py::test_1_retrieved_context_passed_to_llm PASSED [ 44%]
tests/test_rag_grounding.py::test_2_sources_come_from_retrieval_results PASSED [ 48%]
tests/test_rag_grounding.py::test_3_no_context_queries_do_not_call_llm PASSED [ 51%]
tests/test_rag_grounding.py::test_4_empty_queries_rejected PASSED        [ 55%]
tests/test_rag_grounding.py::test_5_grounded_response_contains_sources PASSED [ 58%]
tests/test_rag_grounding.py::test_6_document_ids_cannot_be_invented PASSED [ 62%]
tests/test_rag_grounding.py::test_7_retrieval_scores_preserved PASSED    [ 65%]
tests/test_rag_grounding.py::test_8_rag_response_schema_is_valid PASSED  [ 68%]
tests/test_retrieval.py::test_1_empty_query_rejected PASSED              [ 72%]
tests/test_retrieval.py::test_2_embedding_dimension PASSED               [ 75%]
tests/test_retrieval.py::test_3_chunk_metadata_exists PASSED             [ 79%]
tests/test_retrieval.py::test_4_retrieval_returns_correct_schema PASSED  [ 82%]
tests/test_retrieval.py::test_5_results_sorted_by_score PASSED           [ 86%]
tests/test_retrieval.py::test_6_similarity_threshold_works PASSED        [ 89%]
tests/test_retrieval.py::test_7_category_filter_works PASSED             [ 93%]
tests/test_retrieval.py::test_8_irrelevant_query_returns_zero_results PASSED [ 96%]
tests/test_retrieval.py::test_9_top_k_validation_works PASSED            [100%]

============================== 29 passed in 9.47s ==============================
```

*All unit tests use mock LLM responses where applicable, validating grounding rules, schemas, and thresholds without requiring external network calls.*

---

### Standalone Retrieval Test Script

Evaluates semantic search across all 10 domain queries and the negative query:

```bash
python scripts/test_retrieval.py
```

---

### Live Grounded RAG Test Script

Validates the full end-to-end RAG pipeline against live Qdrant retrieval and Groq LLM generation:

```bash
python scripts/test_rag.py
```
*(Requires a valid `LLM_API_KEY` in `rag-backend/.env`)*
