# Agentflow_AI: Agentic Operations Automation Platform

Agentflow_AI is an enterprise full-stack AI Operations Automation Platform that converts natural language automation prompts into executable visual DAG workflows. It executes workflows through a resilient chain of 5 cooperating AI agents, integrates natively with third-party tools (Gmail, Slack, Discord, Google Sheets) over encrypted credentials, schedules jobs via background queues, and streams live telemetry to an interactive operator console.

---

## 🌟 Key Features

- **Prompt-to-Workflow AI Generation**: Transform natural language instructions into complete visual DAG graphs with automatic node positioning, typing, and configuration.
  - *Provider hierarchy*: **OpenRouter** (Claude 3.5 Sonnet / GPT-4o) $\rightarrow$ **Google Gemini 1.5 Flash** $\rightarrow$ **Deterministic Rule Engine** (Zero-Key Offline Fallback).
- **Interactive Drag-and-Drop Canvas**: Powered by `@xyflow/react` (React Flow) with custom nodes (`TriggerNode`, `ActionNode`, `AgentNode`, `IntegrationNode`, `ConditionNode`), animated edges, minimap, node palette, and side-panel configuration.
- **5-Agent Autonomous Chain Architecture**:
  1. **Planner Agent**: Analyzes DAG topology, sorts step sequences, validates acyclic graphs, and outputs execution plans with confidence scoring.
  2. **Execution Agent**: Dispatches actions to integrations (Gmail, Slack, Discord, Google Sheets) and AI models with upstream variable templating (e.g. `{{node_1.id}}`).
  3. **Validation Agent**: Enforces data contracts and required payload schemas after each step.
  4. **Recovery Agent**: Classifies runtime errors (`AUTH_EXPIRED`, `RATE_LIMIT`, `MISSING_FIELDS`, `API_FAILURE`, `TRANSIENT`) and applies exponential backoff or escalation.
  5. **Monitoring Agent**: Emits audit log events to MongoDB and streams real-time Socket.IO events to the operator UI.
- **Zero-Config In-Memory Resilience**: Automatic fallback to `MongoMemoryServer` when external MongoDB is unavailable, and in-memory async queues when Redis is not running.
- **Enterprise Security**: Password hashing with `bcrypt` (cost factor 12), JWT session authentication, AES-256-CBC token encryption at rest, and Helmet HTTP security headers.
- **Real-Time Telemetry & Controls**: Live execution streaming, pause/resume/cancel runtime control, and notification alerts drawer.

---

## 🏗️ Architecture & Project Structure

```
AI Automation Project/
├── client/                     # Next.js Pages Router Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppShell/       # Header, Sidebar, Notifications Drawer
│   │   │   ├── MetricGrid/     # Dashboard KPIs & Stats
│   │   │   ├── NodePalette/    # Draggable node palette
│   │   │   ├── NodeConfigPanel/# Node property editor
│   │   │   ├── WorkflowCanvas/ # React Flow custom canvas
│   │   │   ├── ExecutionLogs/  # Live multi-agent timeline stream
│   │   │   └── ProtectedRoute/ # Operator authentication guard
│   │   ├── pages/
│   │   │   ├── _app.js         # Global Next.js app wrapper
│   │   │   ├── index.js        # Landing page & feature showcase
│   │   │   ├── login.js        # Operator login with demo quick-fill
│   │   │   ├── register.js     # Operator registration
│   │   │   ├── dashboard.js    # Operator mission console
│   │   │   ├── integrations.js # Third-party OAuth & API keys
│   │   │   ├── settings.js     # System & security settings
│   │   │   ├── executions/     # Execution list and live detail page
│   │   │   └── workflows/      # Workflows list, AI builder, canvas editor
│   │   ├── store/              # Zustand stores (auth, workflow, notification)
│   │   └── services/           # Axios API and Socket.IO client singletons
│   └── package.json
├── server/                     # Node.js / Express Backend
│   ├── src/
│   │   ├── config/             # Environment, DB (MongoMemoryServer), Socket.IO
│   │   ├── models/             # Mongoose schemas (User, Workflow, Execution, etc.)
│   │   ├── agents/             # 5 Agents (Planner, Execution, Validation, Recovery, Monitoring)
│   │   ├── integrations/       # Gmail, Slack, Discord, Google Sheets adapters
│   │   ├── services/           # Business logic & AES-256 encryption
│   │   ├── controllers/        # Thin controllers
│   │   ├── routes/             # Express API routes
│   │   ├── middleware/         # Auth, validation, error handler
│   │   ├── queues/             # BullMQ Redis queue + in-memory fallback
│   │   ├── scripts/seed.js     # Pre-seeded test accounts and workflows
│   │   └── server.js           # Server entry point
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (Tested on `v22.x`)
- **npm**: `v9.x` or higher
- *(Optional)*: MongoDB and Redis (Not required — the platform includes built-in in-memory engines).

---

### 2. Backend Setup (`server/`)

1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. *(Optional)* Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   > **Note**: You can run the backend with zero configuration. It will automatically initialize an in-memory MongoDB instance (`MongoMemoryServer`) and an in-memory queue.

4. Seed demo accounts & workflows:
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm start
   # or with auto-reload:
   npm run dev
   ```
   The backend will start on **`http://localhost:5000`** (Health check: `http://localhost:5000/api/health`).

---

### 3. Frontend Setup (`client/`)

1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at **`http://localhost:3000`**.

---

## 🔑 Default Credentials & Demo Logins

The database seed provides two pre-configured accounts (also accessible via one-click demo fill buttons on the `/login` page):

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Lead Operator** | `operator@agentflow.ai` | `Password123!` | Visual DAGs, executions, integrations, prompts |
| **Administrator** | `admin@agentflow.ai` | `Password123!` | Full security, audit, user management |

---

## 🧭 Step-by-Step Platform Walkthrough

### 1. AI Prompt-to-Workflow Generation
1. Navigate to **`http://localhost:3000/workflows/builder`** (or click **AI Builder** in sidebar).
2. Enter a natural language automation description, for example:
   > *"Ingest customer support emails from Gmail, analyze urgency and sentiment using Gemini, auto-reply acknowledging receipt, and post urgent alerts to Slack."*
3. Click **Generate Visual Workflow**.
4. The system synthesizes nodes, positions, and edges on the interactive canvas.
5. Click **Save to Canvas Editor** to persist the workflow.

### 2. Canvas Workflow Editing
1. Navigate to **`http://localhost:3000/workflows`** and open any workflow.
2. **Drag & Drop**: Drag nodes from the left-hand **Node Palette** (Triggers, AI Agents, Integrations, Logic) onto the canvas.
3. **Connect Edges**: Drag connection handles between nodes.
4. **Configure Parameters**: Click any node to open the right-hand **Node Configuration Panel** to customize action methods, service providers, and dynamic variables (e.g. `{{node_1.id}}`).
5. Click **Save Workflow**.

### 3. Executing & Real-Time Monitoring
1. Click **Run Agents Now** from any workflow editor or list view.
2. You will be redirected to the **Live Execution Audit** (`/executions/[id]`).
3. Observe the **5 AI Agents** streaming live events over WebSockets:
   - 🟣 **Planner Agent**: Resolves topological order and confidence score.
   - 🔵 **Execution Agent**: Executes steps and resolves inputs.
   - 🟢 **Validation Agent**: Confirms outputs match schema contracts.
   - 🟡 **Recovery Agent**: Handles transient failures with exponential backoff.
   - 🔴 **Monitoring Agent**: Emits audit events and alerts.
4. Use **Pause**, **Resume**, or **Cancel** buttons to interact with running executions in real time.

### 4. Third-Party Integrations & OAuth
1. Go to **`http://localhost:3000/integrations`**.
2. Connect or configure **Gmail**, **Slack**, **Discord**, and **Google Sheets**.
3. Use the **Test** button to verify connection health.
4. Use the **Key** icon to provide manual Webhook URLs or API keys.

---

## 🧪 Testing Backend Health Check

You can verify the backend status at any time:
```bash
curl http://localhost:5000/api/health
```

Expected JSON response:
```json
{
  "status": "healthy",
  "platform": "Agentflow_AI (Agentic Operations Console)",
  "features": {
    "multiAgentOrchestrator": "active",
    "langGraphSubstrate": "available",
    "inMemoryFallback": "ready",
    "socketStreaming": "ready"
  }
}
```

---

## 🔒 Security & Data Encryption

- **Credentials at Rest**: Tokens and API keys are stored encrypted via AES-256-CBC with dynamic IVs using `CREDENTIAL_ENCRYPTION_KEY`.
- **Decrypted Tokens Isolation**: Raw secrets are only decrypted in memory during the execution phase and never sent to clients or logged.
- **Password Hashes**: Securely hashed with `bcryptjs` (cost factor 12).
- **HTTP Protection**: Express Helmet, CORS filtering, and rate limiting on authentication routes.

---

## 📄 License
MIT License. Built for enterprise AI Operations & Visual Workflow Orchestration.
#   a g e n t i c A I  
 #   C o l l e g e - C o m p l a i n t - M a n a g e m e n t - S y s t e m  
 