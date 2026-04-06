# DEC-002 — Bloqueo de Fase por Poder Firmado

**Fecha:** 2026-03-31
**Fecha de aprobación:** 2026-04-01
**Participantes:** Mateo, Paola, Germán
**Estado:** Aprobada

## Contexto
Paola ha enfatizado que el **Poder** es el documento legal que la faculta para actuar ante la notaría, DIAN y otras entidades. Sin este documento, cualquier acción legal podría ser nula o generar responsabilidad. Actualmente, el sistema permite avanzar de fase de forma manual sin verificar la existencia de este documento.

## Opciones

### 1. Bloqueo Estricto ✅ ELEGIDA
El sistema **no permitirá** al abogado hacer clic en "Avanzar a Fase 4 (Notaría)" si el documento `Poder Firmado` no está cargado en la colección `Documents` y marcado como `Aprobado`.
- **Pros:** Seguridad legal absoluta. Paola tiene la tranquilidad de que el sistema actúa como su guardián.
- **Contras:** Cero flexibilidad en casos de extrema urgencia donde el documento físico existe pero no se ha digitalizado. → Resuelto con el flag `receivedPhysically`: marca el documento como "recibido físico, en proceso de digitalización", pero sigue bloqueando el avance hasta que esté digitalizado y aprobado.

### 2. Advertencia Informativa
Descartada — riesgo de error humano inaceptable en un proceso legal.

## Decisión
**Bloqueo estricto.** El endpoint `POST /api/cases/:id/advance-phase` para el avance de Fase 3 → 4 valida que exista exactamente un ítem en `DocumentChecklist` con `tipo: 'poder'` y `status: 'approved'` para el caso. Si la validación falla, el endpoint retorna error 422 con mensaje claro. En el frontend, el botón "Avanzar a Fase 4" aparece deshabilitado con el mensaje: *"Para radicar en notaría, el Poder de Representación debe estar cargado y aprobado."*

## Implementación técnica

### Identificación del poder en el sistema
- `Documents.tipo` incluye el valor `'poder'` como tipo específico.
- Al crear un caso (Fase 0), se auto-genera un ítem en `DocumentChecklist` con:
  - `nombre: "Poder de Representación Notarial"`
  - `categoria: 'causante'` (pertenece al caso, no a un heredero ni bien)
  - `required: true`
  - `guiaDePaola: "El poder debe estar autenticado ante notario, autorizar expresamente la tramitación de la sucesión notarial, y la firma debe coincidir con la cédula del poderdante."`
- Este ítem se genera en Fase 0, no en Fase 2 (se necesita visible desde el inicio del caso).

### Flag "Recibido Físico"
Si Paola ya tiene el papel físico pero el equipo aún no lo ha escaneado, puede activar el flag `receivedPhysically: true` en el ítem del checklist. Esto muestra al cliente: *"Tu abogada ya recibió el documento. En proceso de digitalización."* — pero **el bloqueo sigue activo** hasta que el documento esté digitalizado y `status: 'approved'`.

## Siguiente paso
Implementar la validación en el endpoint `advance-phase` al construir la colección `Cases` y el endpoint custom.
