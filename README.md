# AXIOM OS — V1

Axiom OS is a shared-engine platform for real asset development underwriting, CRM, and spatial intelligence.
V1 introduces a complete React-based "Premiere" frontend heavily integrated with Supabase for cloud persistence, replacing the legacy vanilla JS MVP.

## Core Features (V1)

- **CRM & Deal Pipeline**: Full relationship management and kanban board for deal flow.
- **Site Analysis & GIS**: Interactive Leaflet maps (`react-leaflet`) for spatial context and comparable sales plotting.
- **Financial Pro Forma**: Real-time project underwriting (IRR, Margin, ROI) with scenario handling.
- **AI Reporting**: Auto-generation of Investment Committee Memos and Lender Packages using LLMs and dynamic project context generation.
- **Supabase Persistence**: Multi-device sync, auth, and auto-saving for deals, contacts, and global project instances.

## Quick Start

### Frontend (React/Vite)

```bash
cd frontend
npm install
npm run dev
```

Access the V1 Dashboard at `http://localhost:5173`.

### Backend (FastAPI - Legacy MVP access)

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8009
```

## V1 Project Structure

\`\`\`text
axiom/
├── frontend/                 # V1 React Application
│   ├── src/
│   │   ├── v1/               # Primary V1 Source
│   │   │   ├── components/   # Reusable UI (Card, Badge, theme.css)
│   │   │   ├── context/      # Global State (AuthContext, ProjectContext with Auto-Save)
│   │   │   ├── features/     # Domain Modules (crm, deals, analysis, output, system)
│   │   │   └── lib/          # Utilities and Supabase Client
│   │   ├── main.tsx          # Vite Entrypoint
│   │   └── index.css         # Global Styles
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Python API Engine
├── docs/                     # Architecture & Deployment Guides
└── README.md
\`\`\`

## Architecture & Developer Guide

For an in-depth mapping of the frontend architecture, state management, and Supabase integration, see [V1\_ARCHITECTURE\_GUIDE.md](docs/V1_ARCHITECTURE_GUIDE.md).

## License

Proprietary — Juniper Rose Capital
