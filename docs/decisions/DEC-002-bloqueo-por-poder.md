# DEC-002 — Bloqueo de Fase por Poder Firmado

**Fecha:** 2026-03-31
**Participantes:** Mateo, Paola, Germán
**Estado:** Pendiente de Aprobación

## Contexto
Paola ha enfatizado que el **Poder** es el documento legal que la faculta para actuar ante la notaría, DIAN y otras entidades. Sin este documento, cualquier acción legal podría ser nula o generar responsabilidad. Actualmente, el sistema permite avanzar de fase de forma manual sin verificar la existencia de este documento.

## Opciones

### 1. Bloqueo Estricto (Recomendado por Ingeniería)
El sistema **no permitirá** al abogado hacer clic en "Avanzar a Fase 4 (Notaría)" si el documento `Poder Firmado` no está cargado en la colección `Documents` y marcado como `Aprobado`.
- **Pros:** Seguridad legal absoluta. Paola tiene la tranquilidad de que el sistema actúa como su guardián.
- **Contras:** Cero flexibilidad en casos de extrema urgencia donde el documento físico existe pero no se ha digitalizado.

### 2. Advertencia Informativa
El sistema muestra un mensaje de alerta: *"Atención: El poder no ha sido aprobado. ¿Desea continuar bajo su responsabilidad?"* pero permite el avance.
- **Pros:** Flexibilidad total para el abogado.
- **Contras:** Riesgo de error humano (olvido).

## Decisión
*Pendiente de discusión con Paola.*

## Siguiente paso
Paola debe confirmar si prefiere la seguridad del bloqueo (Opción 1) o la flexibilidad de la advertencia (Opción 2).
