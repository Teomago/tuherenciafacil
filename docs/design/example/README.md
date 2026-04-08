# tuHerenciaFácil Design System Example

This directory contains the visual "North Star" for the **tuHerenciaFácil** application. It is a hybrid design system that combines the best of **Stripe**, **Revolut**, and **Wise**, adapted to our unique color scheme and legal context.

## Files
- `DESIGN.md`: Technical specification of the hybrid system (Typography, Colors, Components, Motion).
- `preview.html`: Dashboard overview — Light Theme. Shows: header, hero, 3 summary cards (Documentos/Pagos/Herederos), activity table.
- `preview-dark.html`: Dashboard overview — Dark Theme. Same structure as `preview.html` with dark surface tokens.
- `preview-phase-timeline.html`: The 8-phase succession progress tracker (estilo tracking de pedidos). Shows all phase states: Completada, En progreso (active), Upcoming, Locked. Includes the progress bar, next-action CTA card, and Estándar/Premium tier differences (Phase 8 locked for lower tiers).
- `preview-documents.html`: Document upload checklist with all 4 document states: Aprobado (green), En revisión (blue), Corrección solicitada (orange, with lawyer note + re-upload), and Pendiente (with drag-and-drop upload zone). Documents are grouped by category (Causante, Herederos, Bienes, Adicionales).

## Usage for Agents
1. **Read `DESIGN.md` first** to understand the token values.
2. **Open the relevant preview file** in a browser before building the corresponding screen.
3. **Use the Tailwind CSS tokens** defined in the HTML files when building React components.
4. **Follow the shadow and motion specs** exactly to maintain the "Premium Fintech-Legal" feel.
5. **Match document states exactly** — the 4-state document row pattern in `preview-documents.html` is the canonical reference for RFC-007.
6. **Match phase states exactly** — the timeline dot/connector/row pattern in `preview-phase-timeline.html` is the canonical reference for RFC-006.
