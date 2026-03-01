# Axiom OS: V1 Architecture Guide

This document outlines the architectural patterns and state management strategies employed in the V1 React frontend for Axiom OS.

## 1. Directory Structure

The V1 application follows a feature-based folder structure to maintain high cohesion:

- `src/v1/components/ui/` - Contains incredibly reusable, purely presentational components (`Card`, `Badge`, `Tabs`) and the global CSS token system (`theme.css`).
- `src/v1/context/` - Centralized React Context providers for global state management.
- `src/v1/features/` - Domain-specific modules:
  - `analysis/` - Tools for `SiteAnalysis`, `MarketIntel`, `SiteMap` (Leaflet GIS).
  - `crm/` - Relationship and `Contacts` management.
  - `deals/` - Kanban-style pipeline tracking.
  - `output/` - LLM-powered `Reports` and IC Memo templates.
  - `system/` - User profiles, Supabase connection mapping, and LLM proxy configuration.
- `src/v1/lib/` - Hooks and API/utility wrappers, heavily featuring `supabase.ts`.

## 2. State Management & Persistence

Axiom V1 utilizes a hybrid approach for maximum responsiveness and offline capability:

- **Local Storage First (`useLS`)**: Almost all form state and workspace UI parameters are synced to `localStorage`. This ensures blazing fast reloads and zero layout shifts.
- **Global Contexts**:
  - `AuthContext`: Manages the active user session and top-level organization ID.
  - `ProjectContext`: The core "singleton" state for the currently active development project. It hoists Financials, Comparables (`comps`), Risks, and Permits into a single state tree.
- **Supabase Auto-Save**: Inside `ProjectContext.tsx`, a highly optimized debounced `useEffect` passively synchronizes the local state blob to the `projects` table in Supabase every 1.5 seconds if changes are detected. This enables completely invisible save workflows.
- **Direct Upserts**: For discrete records like Contacts and Deals, components call `supa.upsert()` directly when the user finishes editing.

## 3. Styling & Theming

Axiom heavily leverages a **Utility-First UI approach**:

- All styling scales from `src/v1/components/ui/theme.css`.
- Complex multi-line inline styles were historically migrated to classes like `axiom-flex-sb`, `axiom-card-inner`, and `axiom-badge`.
- Micro-animations are implemented explicitly through classes like `axiom-animate-slide-up` mapped to CSS `@keyframes`.

## 4. AI & LLM Report Generation

The reporting module `src/v1/features/output/Reports.tsx` is an AI-driven text compilation engine.

- Extracts live constraints and variables directly from the `useProject` Context.
- Dynamically generates massive Markdown prompts injected with live Financials, Comps, and Risks.
- Hits a configured standard proxy (set via `Settings.tsx`) to build institutional memos instantly.

## 5. Extensibility

When adding new data facets to a Project:

1. Define the default schema in `ProjectContext.tsx`.
2. Add the `useLS` tuple to the `ProjectProvider`.
3. Add the property to the auto-save payload in the `useEffect` hook.
4. Consume via `useProject()` anywhere globally.
