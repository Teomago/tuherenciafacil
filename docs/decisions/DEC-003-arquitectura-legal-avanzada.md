# DEC-003 — Arquitectura Legal Avanzada y Complejidad

**Fecha:** 2026-03-31
**Estado:** Para Discusión (Mesa Técnica con Paola y Germán)

## Temas a discutir

### 1. Tipos de Sucesión (El "Filtro Inteligente")
**Propuesta:** ¿Debemos preguntar desde el inicio si la sucesión es *Testada* (con testamento) o *Intestada*? 
- **Impacto:** Esto cambia automáticamente el `DocumentChecklist`. Si es Testada, se exige el testamento. Si es Intestada, no.
- **Pregunta para Paola:** ¿Hay otros tipos (ej. Mutuo Acuerdo vs Contenciosa) que debamos filtrar desde la primera pantalla?

### 2. Lógica de Representación (Herederos)
**Propuesta:** Validar que si un heredero es "Representante", el sistema exija vincularlo a un heredero original fallecido.
- **Impacto:** Evita errores de digitación del cliente. El sistema "entiende" el árbol genealógico.

### 3. Puntaje de Complejidad (Complexity Score)
**Propuesta:** Crear un algoritmo que sume puntos según:
- Número de herederos (>5 herederos = +10 puntos).
- Número de bienes (>3 bienes = +15 puntos).
- Ubicación de bienes (Diferentes ciudades = +20 puntos).
- **Meta:** Ayudar a Paola a decidir la asignación y a Germán a ajustar el precio final (Excedente).

### 4. Acceso Compartido (Visualización para la Familia)
**Propuesta:** El "Responsable" (quien paga) es el dueño de la cuenta, pero los demás herederos quieren "ver" cómo va el proceso.
- **Opción A:** El responsable puede generar un "Link de Seguimiento" (solo lectura) para enviar por WhatsApp a la familia.
- **Opción B:** Cada heredero debe crear su propia cuenta (Más complejo, mayor fricción).
- **Pregunta:** ¿Cómo manejamos la privacidad vs. la necesidad de informar a toda la familia?

## Siguientes pasos
Presentar estos puntos en la próxima reunión para definir la lógica de implementación.
