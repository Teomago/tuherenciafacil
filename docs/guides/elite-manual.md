# Manual Operativo — Casos Elite

> **Audiencia:** Paola (abogada) y Mateo (durante los primeros 6 meses de operación)
> **Propósito:** Guía paso a paso para crear y gestionar un caso Elite a través del panel de administración `/admin`. La interfaz de usuario para Elite dentro del app del abogado se construirá más adelante — por ahora, todo se gestiona manualmente desde aquí.

---

## ¿Qué es un caso Elite?

Un caso Elite es una sucesión de alta complejidad que no encaja en los tiers Estándar o Premium. Características típicas:
- Múltiples bienes en diferentes ciudades
- Gran número de herederos (>8) o árbol genealógico complejo
- Requiere gestiones en múltiples notarías
- Condiciones de pago personalizadas
- Cargos adicionales que surgen durante el proceso

---

## Paso 1 — Crear el caso

1. Entra a `tuherenciafacil.com/admin`
2. Ve a **Collections → Cases**
3. Haz clic en **"Create New"**
4. Llena los campos:
   - `caseNumber`: el sistema lo genera automáticamente (no tocar)
   - `status`: `active`
   - `currentPhase`: `0`
   - **`tier`: selecciona `elite`** ← esto es clave
   - `responsable`: busca al cliente por nombre o email
   - `abogadoAsignado`: asigna al abogado (generalmente Paola)
   - Datos del causante: nombre, cédula, fecha y ciudad de fallecimiento
   - `acuerdoHerederos`: confirmar que es `si`
5. Guarda el caso

---

## Paso 2 — Configurar el plan de pagos personalizado

En Elite, el plan de pagos lo define Paola. Cada pago se crea manualmente como un registro en **Collections → Payments**.

### Crear la primera cuota

1. Ve a **Collections → Payments → Create New**
2. Llena los campos:
   - `case`: busca el caso por número (SUC-YYYY-NNN)
   - `category`: `legal_fees`
   - `tipo`: `anticipo`
   - `monto`: el monto acordado (ej: 2000000)
   - `fecha`: fecha en que se espera el pago
   - `metodo`: el método que usará el cliente
   - `registradoPor`: tu usuario de abogado
   - `visibleParaCliente`: `true`
   - `esCuota`: `true`
   - `numeroCuota`: `1`
   - `totalCuotas`: el total de cuotas acordadas (ej: `3`)
   - `notas`: descripción del hito (ej: "Primera cuota — activación del caso")
3. Repite para cada cuota

### Aplicar crédito de consulta previa (si aplica)

Si el cliente pagó una consulta y Paola autorizó el crédito:
1. Ve al `Appointment` correspondiente en **Collections → Appointments**
2. Activa el campo `autorizarCredito`: `true`
3. El sistema creará automáticamente el Payment de `tipo: creditoConsulta` con monto negativo

---

## Paso 3 — Agregar un cargo adicional mid-proceso

Cuando durante el caso surge un gasto no contemplado (ej: "necesito ir a Cali a gestionar un documento"):

1. Ve a **Collections → Payments → Create New**
2. Llena los campos:
   - `case`: el caso Elite
   - `category`: `legal_fees` (si es honorario tuyo) o `third_party_costs` (si es gasto de tercero)
   - `tipo`: `cargo_custom`
   - `labelPersonalizado`: nombre corto del cargo (ej: "Gestión en Notaría de Cali")
   - `descripcionParaCliente`: explicación clara (ej: "Para obtener el certificado de tradición del inmueble ubicado en Cali, es necesario presentarse personalmente en la notaría. Este costo no estaba contemplado en el paquete original.")
   - `monto`: el monto total del cargo
   - `visibleParaCliente`: `true`
3. Si el cargo se divide en cuotas:
   - Crea el registro "padre" con el monto total y `esCuota: false`
   - Crea cada cuota con `esCuota: true` + `pagoParent: [ID del padre]` + `numeroCuota` + `totalCuotas`
   - El cliente verá: "Gestión en Notaría de Cali — Cuota 1 de 2: $150.000"

---

## Paso 4 — Gestionar la Fase 8 (Registro)

En Elite, la Fase 8 está activa. Cuando el caso llega a Fase 7 (firma):

1. El endpoint `advance-phase` detecta que el tier es `elite` → avanza a Fase 8 en lugar de cerrar
2. Ve a **Collections → NotaryProcess** y busca el registro del caso
3. Llena los campos de `registro`:
   - `fechaSalida`: fecha en que sale la escritura para registro
   - `status`: cambia a `en_registro` cuando sale, a `registrado` cuando queda en folio
   - `fechaRegistro`: fecha de inscripción en el folio de matrícula
   - `certificadoTradicion`: sube el PDF del certificado actualizado
4. Al marcar `status: registrado` → el webhook cierra el caso automáticamente

---

## Paso 5 — Monitoreo y notas internas

En **Collections → Cases**, el campo `notasInternas` (richText) es tu espacio de trabajo. Úsalo para:
- Estrategia del caso
- Acuerdos verbales con el cliente sobre pagos
- Observaciones sobre complejidad
- Historial de llamadas o reuniones relevantes

Este campo **nunca es visible para el cliente**.

---

## Checklist para abrir un caso Elite

- [ ] Caso creado con `tier: elite`
- [ ] Abogado asignado
- [ ] Plan de pagos registrado en Payments (todas las cuotas)
- [ ] Crédito de consulta aplicado (si aplica)
- [ ] Checklist del poder generado (automático al crear el caso)
- [ ] Notas internas del caso actualizadas con la estrategia

---

## Preguntas frecuentes

**¿Puedo cambiar el tier de un caso después de crearlo?**
Sí, desde `/admin → Cases → [caso] → tier`. Cambiar de Estándar a Elite no afecta los pagos ya registrados — solo cambia el comportamiento futuro (Fase 8 activa, cargos custom disponibles).

**¿Qué ve el cliente de los cargos custom?**
Ve el `labelPersonalizado` y la `descripcionParaCliente`. No ve el campo `notas` interno.

**¿Cómo sé si el cliente pagó una cuota?**
Ve al Payment correspondiente. Si se pagó por Wompi, el campo `wompiStatus` será `approved`. Si fue offline (transferencia, efectivo), actualiza el campo `wompiStatus` manualmente o agrega una nota.

**¿Puedo hacer un cargo no visible para el cliente?**
Sí — `visibleParaCliente: false`. Úsalo para registros internos de gastos operativos. El cliente nunca lo ve pero tú sí tienes el control de tus costos.
