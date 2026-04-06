# DEC-003 — Arquitectura Legal Avanzada y Complejidad

**Fecha:** 2026-03-31
**Última actualización:** 2026-04-05
**Estado:** Parcialmente aprobada — 2 puntos resueltos, 2 pendientes

---

## Punto 1 — Tipos de Sucesión ✅ Aprobado

**Decisión (Paola, 2026-04-05):** tuHerenciaFácil maneja **únicamente sucesiones intestadas** (sin testamento). Los casos con testamento no requieren el servicio porque el testamento ya establece cómo se distribuye la herencia.

**Implicación técnica:**
- El `DocumentChecklist` nunca incluirá un ítem de testamento.
- No es necesario preguntar "testada o intestada" en el intake — la respuesta siempre es intestada.
- El campo `tipoSucesion` en `Cases` puede eliminarse del diseño o simplificarse a un valor fijo.

---

## Punto 2 — Mutuo Acuerdo vs Contencioso ✅ Aprobado

**Decisión (Paola, 2026-04-05):** tuHerenciaFácil maneja **únicamente sucesiones por mutuo acuerdo ante notaría**. Las sucesiones contenciosas (donde hay conflicto entre herederos y el proceso va a juzgado) no son atendidas.

**La pregunta filtro desde el primer contacto:**
> *"¿Sabes si todos los herederos están de acuerdo en realizar la sucesión?"*
- ✅ **Sí, todos están de acuerdo** → puede continuar con el proceso
- ❌ **No, hay conflicto** → tuHerenciaFácil no puede ayudar → mensaje amigable explicando que el caso requiere un proceso judicial y recomendando buscar asesoría en litigio
- ❓ **No estoy seguro** → puede continuar y Paola evaluará en la consulta (se marca en el `Appointment`)

**Implicación en el flujo:**
Esta pregunta es un **gate en la pantalla de Bienvenida** (`/app`), antes de que el usuario llegue a agendar una consulta o pagar cualquier cosa. Si la respuesta es "No", el sistema no bloquea la cuenta pero sí muestra la pantalla de "Caso contencioso — fuera de nuestro alcance" con información de próximos pasos.

**Implicación técnica:**
- `CaseIntake` y `Cases` agregan un campo: `acuerdoHerederos: select ['si', 'no', 'no_sabe']`
- Si `acuerdoHerederos === 'no'` → el intake no puede avanzar a pago (bloqueo en UI, no en API)
- Si `acuerdoHerederos === 'no_sabe'` → se permite avanzar con un banner de advertencia visible para el abogado al revisar el caso

---

## Punto 3 — Lógica de Representación de Herederos ✅ Aprobado (diseño técnico)

**Decisión:** El sistema valida que si un heredero tiene `esRepresentante: true`, el campo `herederoOriginal` (relación a otro `Heir`) es obligatorio. El sistema "entiende" el árbol genealógico para evitar errores de digitación del cliente.

---

## Punto 4 — Puntaje de Complejidad ⏳ Pendiente

**Propuesta:** Algoritmo que suma puntos según: número de herederos (>5 = +10 pts), número de bienes (>3 = +15 pts), bienes en distintas ciudades (+20 pts). Ayuda a Paola con la asignación y a Germán con el precio del Excedente en Elite.

**Estado:** Pendiente de aprobación. Proponer en próxima reunión.

---

## Punto 5 — Link de Seguimiento Familiar ⏳ Pendiente (DEC-007)

**Propuesta:** El responsable puede generar un link de solo lectura para que los demás herederos vean el progreso sin crear cuenta. (Alternativa: cada heredero crea su propia cuenta.)

**Estado:** Pendiente de aprobación. Ver también DEC-007.
