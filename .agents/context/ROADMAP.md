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

## Phase 1: Core Identity & Succession Shell
**Objective:** Implement the fundamental "Who" and "What" of the application.

### RFC-003.1: Members, Cases & Appointments
- **Tasks:**
  1.  **Refine Members:** Add `role` (cliente/abogado), `cedula`, `telefono`, `creditoAcumulado`. Remove any legacy eterhub fields.
  2.  **Cases Collection:** Create the central `Cases` object with `caseNumber` auto-generation.
  3.  **Appointments:** Create the `Appointments` collection for pre-case and case-active meetings.
  4.  **Credit System (DEC-009):** Implement `autorizarCredito` hooks to sync between `Appointments` and `Members.creditoAcumulado`.
- **Success Criteria:**
  - `Members`, `Cases`, and `Appointments` appear in `/admin`.
  - Relationships are functional and type-safe.
  - TDD: Hooks for credit calculation are verified with Vitest.

---

## Phase 2: App Shell & UI Kit (Accelerated)
**Objective:** Build the global layout and atomic components early to provide a testing environment for future data phases.

### RFC-004: App Shell & Primitives
- **Tasks:**
  1.  **App Layout:** Create `src/app/[locale]/(app)/layout.tsx` with Auth Guard and role-aware navigation.
  2.  **UI Kit:** Build `Button`, `Card`, `Badge`, and `Input` components in `src/components/ui/`.
  3.  **Branding:** Apply "Azul Corporativo" (`#002845`) and "Naranja Acento" (`#FF8C3C`) tokens.
- **Success Criteria:**
  - Logged-in users see a professional dashboard shell at `/app/dashboard`.
  - Navigation sidebar correctly reflects the user's role (Cliente vs. Abogado).

---

## Phase 3: Intake & The Estate Data
**Objective:** Capture user input for the succession process.

### RFC-003.2: Intake, Heirs & Assets
- **Tasks:**
  1.  **CaseIntake:** Implement the pre-payment form defined in `COLLECTIONS.md`.
  2.  **Heirs & Assets:** Create the sub-collections that feed into the `Cases` object.
  3.  **Intake Conversion:** Logic to convert a `CaseIntake` into a `Case` upon payment.
- **Success Criteria:**
  - A `CaseIntake` can be created and successfully converted to a `Case` via script/API.

---

## Phase 4: Workflow Engine & Payments
**Objective:** Build the interactive "Legal Machine" that drives the succession.

### RFC-003.3: Documents, Checklist & Workflow
- **Tasks:**
  1.  **Documents & R2:** Set up the `Documents` collection with Cloudflare R2 storage.
  2.  **Checklist Engine:** Auto-generation of the `DocumentChecklist` when a case advances to Phase 2.
  3.  **Notary Tracking:** Create the `NotaryProcess` collection (abogado-only).
  4.  **Phase Engine (RFC-007):** Implement the `advance-phase` logic and the **Poder Gate** (DEC-002).
  5.  **Payments:** Implement the `Payments` collection and Wompi integration (DEC-005).

---

## Phase 5: Onboarding Funnel (Front-end)
... (remaining phases shift down accordingly)

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
