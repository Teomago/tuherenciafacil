# ROADMAP — tuHerenciaFácil Implementation Plan

> This document defines the chronological execution phases for the **tuHerenciaFácil** web app. It serves as the master guide for the Phase 4 Executor.

---

## Technical Strategy Overview

- **Architecture:** Next.js 16 + Payload CMS 3.x (Single codebase for Marketing + App + Admin).
- **Design System:** "Stripe-Revolut-Wise" Hybrid (Ref: `docs/design/example/DESIGN.md`).
- **Development Workflow:** **Logic First, then Polish.**
  1. **Logic Pass:** Implement functional components, data fetching, and state management using the Base UI Kit.
  2. **Functional Verification:** Confirm the feature works as intended (DB writes, navigation, auth).
  3. **Visual Polish Loop:** Dedicated pass for pixel-perfect adjustments, animations (Framer Motion), and UX refinements.
- **Component Strategy:** **Atomic Design.** Build reusable UI primitives in `src/components/ui/` (Button, Card, Table) using Tailwind CSS to avoid hardcoding styles in pages.
- **Animations:** Simple, high-impact motion (e.g., Wise-style `scale(1.05)`) using Tailwind transitions or Framer Motion.
- **Security:** Layered access control (Auth -> Role -> Case Ownership).
- **Development Rule:** Schema changes use `push: true` (no manual migrations) until INFRA-001.

---

## Phase 1: The Succession Data Layer (The Foundation)
**Objective:** Implement the entire data model defined in `COLLECTIONS.md`. Without this, no screens can be built.

### RFC-003: Collections Implementation
- **Tasks:**
  1.  **Refine Members:** Add `role` (cliente/abogado), `cedula`, `telefono`, `creditoAcumulado`.
  2.  **Core Succession:** Create `Cases`, `CaseIntake`, `Appointments`.
  3.  **Data Entities:** Create `Heirs`, `Assets`, `Documents`.
  4.  **Process Tracking:** Create `DocumentChecklist`, `NotaryProcess`, `Payments`, `ChatMessages`.
- **Success Criteria:**
  - All 11 collections appear in `/admin`.
  - Relationships (e.g., Case -> Heirs) are functional.
  - Every field has a corresponding translation key in `es.json` and `en.json`.

---

## Phase 2: App Shell & Reusable UI Kit
**Objective:** Build the global layout and the atomic component library that will be used in all subsequent phases.

### RFC-004: Layout & Base Components
- **Tasks:**
  1.  **Layout Implementation:** Create `src/app/[locale]/(app)/layout.tsx` with Auth Guard.
  2.  **UI Primitives Library:** Create reusable React components in `src/components/ui/` (Button, Card, Badge, Input, Table) based on the `docs/design/example/` HTML/CSS.
  3.  **Navigation:** `AppNavbar` and `AppSidebar` using the UI Primitives and Azul Corporativo (`#002845`).
  4.  **Motion Config:** Set up base animations (Tailwind transitions or Framer Motion).
- **Success Criteria:**
  - A central library of components exists and is used to render the `/app` shell.
  - Sidebar and Navbar are responsive and role-aware.
  - Components match the visual weight and feel of the Hybrid Design previews.

---

## Phase 3: The "Pre-Pago" Onboarding Funnel
**Objective:** Convert a logged-in user into a paying customer with a created Case.

### RFC-005: Onboarding & Intake
- **Screens:**
  1.  **`/app`:** Welcome + Eligibility Filter (DEC-003 question logic).
  2.  **`/app/consulta`:** Appointment booking (Virtual/Presencial).
  3.  **`/app/consulta/pago`:** Wompi Payment Stub (Phase 1 version: auto-approve on click).
  4.  **`/app/nueva-consulta`:** The `CaseIntake` form (Causante, Herederos estimados, Bienes).
  5.  **`/app/pago`:** Package selection (Estándar/Premium) + Initial payment stub.
- **Success Criteria:**
  - A user can complete the filter, agendar a consultation, and fill the intake.
  - Successful "payment" results in the creation of a `Case` in the database.

---

## Phase 4: Client Core Experience (Case Tracking)
**Objective:** Provide the client with total visibility of their succession progress.

### RFC-006: Dashboard & Timeline
- **Screens:**
  1.  **`/app/dashboard`:** Case summary cards and "What's next" notifications.
  2.  **`/app/caso/[id]`:** El hito visual de 8 fases (estilo tracking de pedidos).
  3.  **Phase Logic:** Timeline adapts dynamically to the Tier (Estándar = 7 phases, Premium/Elite = 8).
- **Success Criteria:**
  - Client sees a visual representation of their actual `currentPhase`.

---

## Phase 5: Case Management (Client Data Entry)
**Objective:** Allow the client to upload documents and manage the details of their family's estate.

### RFC-007: Herederos, Bienes & Documentos
- **Screens:**
  1.  **`/app/caso/[id]/herederos`:** List and add family members.
  2.  **`/app/caso/[id]/bienes`:** Declare assets (Inmuebles, Vehículos, etc.).
  3.  **`/app/caso/[id]/documentos`:** The interactive checklist. Drag & Drop uploads to R2.
  4.  **`/app/caso/[id]/pagos`:** Financial transparency view (Honorarios vs. Terceros).
- **Success Criteria:**
  - Document status updates automatically (Pending -> Uploaded) upon file upload.
  - All data persists correctly in the sub-collections.

---

## Phase 6: Lawyer Operations & Notary Tracking
**Objective:** Enable Paola to manage cases, approve documents, and drive the notarial process.

### RFC-008: Abogado View & Phase Engine
- **Screens:**
  1.  **Lawyer Dashboard:** Priority tasks and "Pool" of unassigned cases.
  2.  **Lawyer Case Management:** Approve/Reject buttons for documents with notes.
  3.  **`/app/caso/[id]/notaria`:** Lawyer-only tracking (Radicación, Edictos, DIAN).
  4.  **The Phase Engine:** Implement the `/api/cases/:id/advance-phase` endpoint with its validation gates (e.g., Poder Gate DEC-002).
- **Success Criteria:**
  - Lawyer can "Take a Case" from the pool.
  - Advancing a phase is blocked if mandatory documents (like the Poder) are missing.

---

## Phase 7: Communication & Automation
**Objective:** Connect users through Chat and ensure they are notified of progress via Email.

### RFC-009: Chat & Notifications
- **Features:**
  1.  **Unified Chat:** Implement `ChatMessages` with 3 channels (Bot, Abogado, Soporte).
  2.  **Bot IA Integration:** (DEC-006) Basic succession-context responses.
  3.  **Email Automation:** SMTP2GO triggers for: Phase Change, Document Rejected, Payment Due.
- **Success Criteria:**
  - Messages appear in real-time in the `/app/chat` view.
  - Emails are delivered upon specific database hooks.

---

## Phase 8: Public Portal & Final Polish
**Objective:** External search functionality and global system validation.

### RFC-010: Portal de Transparencia & QA
- **Features:**
  1.  **Public Search:** `GET /api/public/cases/search` consumption on the marketing site.
  2.  **Global UI Polish:** Ensure Tailwind v4 consistency and responsiveness.
  3.  **Final QA:** End-to-end walkthrough from landing -> registration -> payment -> phase 8.
- **Success Criteria:**
  - A non-logged-in user can find a case status by Causante Name without seeing private data.
