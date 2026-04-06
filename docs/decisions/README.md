# Registro de Decisiones (RFCs) — tuHerenciaFácil

> Aquí documentamos las decisiones de producto, arquitectura, y notas de reuniones con Paola y Germán. Seguimos un proceso de **Request for Comments (RFC)** para asegurar que cada cambio estructural sea validado.

## Historial de Decisiones

| ID | Título | Estado | Fecha |
|:---|:---|:---:|:---|
| [DEC-001](/docs/TECHNICAL_STACK) | Stack Tecnológico Inicial | ✅ Aprobada | 2026-03-25 |
| [DEC-002](/docs/decisions/DEC-002-bloqueo-por-poder) | Bloqueo estricto por Poder Firmado (Fase 3→4) | ✅ Aprobada | 2026-04-01 |
| [DEC-003](/docs/decisions/DEC-003-arquitectura-legal-avanzada) | Arquitectura Legal: Solo intestadas, solo mutuo acuerdo | 🔶 Parcial | 2026-04-05 |
| [DEC-004](/docs/decisions/DEC-004-tiers-de-servicio) | Tiers de Servicio y Modelo de Pagos | ✅ Aprobada | 2026-04-01 |

## Decisiones pendientes

- [x] ~~**DEC-003 — Testada vs Intestada**~~ — Solo intestadas. El checklist nunca pide testamento.
- [x] ~~**DEC-003 — Mutuo acuerdo vs Contencioso**~~ — Solo mutuo acuerdo (notaría). Filtro de elegibilidad en pantalla de Bienvenida.
- [ ] **DEC-003 — Puntaje de Complejidad**: Algoritmo para calcular complejidad según herederos, bienes y ciudades. Ayuda a Paola para asignación y a Germán para el precio del Excedente en Elite.
- [ ] **DEC-003 — Link de Seguimiento Familiar**: ¿Puede el responsable generar un link de solo lectura para que los demás herederos vean el progreso sin necesidad de crear cuenta?
- [ ] **DEC-005 — Pasarela de Pago Wompi**: Integración final (Webhooks, PSE, tarjeta, Nequi, manejo de estados y reintentos).
- [ ] **DEC-006 — Chat IA**: Modelo a usar, límite de tokens por usuario, costo por mensaje, alcance exacto de respuestas para sucesiones colombianas.
- [x] ~~**DEC-007 — Estructura de Rutas**~~ — Decidido: renombrar `(herencia)/herencia` → `(app)/app`. Locale prefix-free para español (default). URL final: `tuherenciafacil.com/app/...`. Ejecutar antes de implementar las 14 pantallas.
- [x] ~~**DEC-008 — Cargos Dinámicos Elite**~~ — Schema completo diseñado en COLLECTIONS.md (`cargo_custom`, `labelPersonalizado`, `descripcionParaCliente`, cuotas). UI deferred. Casos Elite gestionables vía `/admin` — ver `docs/guides/elite-manual.md`.
- [x] ~~**DEC-009 — Sistema de Créditos**~~ — Decidido: crédito gateado por `autorizarCredito` en Appointments. Solo Paola activa el descuento, no el sistema. Sin autorización no hay crédito aunque el cliente haya pagado una consulta. Ver COLLECTIONS.md § Appointments.
- [x] ~~**Política de Reuniones**~~ — Decidido: cliente-iniciadas siempre pagan. Abogado-iniciadas: Paola decide (`chargeToClient`). 6 tipos de reunión: consulta_*, mediacion_*, caso_*. Minimizar reuniones — bot y chat primero. Ver COLLECTIONS.md § Appointments.
- [ ] **Días festivos**: Implementación del cálculo para vencimiento de edictos (Ley Emiliani + festivos fijos colombianos).
- [ ] **Facturación electrónica**: ¿Necesaria en v1 o solo registro de pagos?

## Tareas pre-implementación (antes de escribir código)

Antes de implementar las colecciones, estos problemas técnicos deben resolverse:

1. **Limpiar Members en código**: Eliminar campos `tier` (free/premium) y `currency` heredados de Miru/Eterhub. El nuevo `tier` vive en `Cases`, no en `Members`.
2. **Resolver DEC-007 (URL Refactor)**: Definir estructura de rutas final para el app.
3. **Confirmar DEC-003 (Testada vs Intestada)**: Afecta la lógica de generación del `DocumentChecklist`.

---

> Ver también: [Notas de Reunión — 2026-04-01](/docs/decisions/NOTES)

---

## 🚀 El Pipeline de Decisiones (Cómo crear un RFC)

Para asegurar que todos estemos alineados, cualquier cambio grande debe pasar por este flujo:

1.  **Propuesta**: Crea un nuevo archivo `.md` en esta carpeta siguiendo el formato de abajo. Usa el siguiente número disponible (ej. `DEC-004-nombre.md`).
2.  **Discusión**: Se comparte el link en el equipo (WhatsApp/Reunión). Los agentes de IA (Gemini/Claude) auditan la viabilidad técnica.
3.  **Aprobación**: Germán o Paola dan el visto bueno. El estado cambia a `✅ Aprobada`.
4.  **Ejecución**: Solo cuando el RFC está aprobado, se procede a escribir el código.

### Formato Sugerido

```markdown
# DEC-XXX — Título de la decisión

**Fecha:** YYYY-MM-DD
**Participantes:** Paola, Germán, Mateo
**Estado:** pendiente | aprobada | descartada

## Contexto
¿Qué problema estamos resolviendo? ¿Por qué ahora?

## Opciones
1. **Opción A**: Descripción, pros (+) y contras (-).
2. **Opción B**: Descripción, pros (+) y contras (-).

## Decisión
Cuál elegimos y por qué es la mejor para el negocio.

## Siguiente paso
Tareas técnicas inmediatas para implementar esto.
```
