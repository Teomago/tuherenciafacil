# Colecciones de Payload CMS — tuHerenciaFácil

> Status: definición técnica — pendiente implementación
> Last updated: 2026-04-06
> Depende de: SCREEN_MAP.md, app-flowchart.html

---

## Resumen

11 colecciones nuevas o modificadas. 1 colección existente que se adapta (Members).
La colección `users` de Payload (admin panel) no se toca — es solo para editores internos.

| Colección | Estado | Propósito |
|---|---|---|
| Members | MODIFICAR | Usuarios del producto (clientes + abogados) |
| Cases | CREAR | Caso de sucesión — objeto central |
| Appointments | CREAR | Citas de consulta previa ($70k/$100k) — generan crédito |
| CaseIntake | CREAR | Formulario de intake pre-pago (antes: Consultations) |
| Heirs | CREAR | Herederos de un caso |
| Assets | CREAR | Bienes de un caso |
| DocumentChecklist | CREAR | Checklist auto-generado de documentos requeridos |
| Documents | CREAR | Archivos subidos (PDFs, imágenes) en R2 |
| NotaryProcess | CREAR | Tracking del proceso notarial |
| Payments | CREAR | Registro de pagos y costos (Honorarios vs Gastos terceros) |
| ChatMessages | CREAR | Mensajes del chat (bot, abogado, soporte) |

---

## Convenciones

- Nombres de colección en inglés, PascalCase en el slug de Payload
- Campos en camelCase
- Todos los campos de texto usan `minLength`/`maxLength` donde aplique
- Relaciones usan `relationship` de Payload, nunca IDs manuales
- Fechas usan `date` de Payload (ISO 8601)
- Archivos usan `upload` con `@payloadcms/storage-s3` → R2
- Access control definido por colección con funciones que reciben `req.user`
- Hooks documentados cuando disparan acciones (emails, cálculos, etc.)

---

## 1. Members (MODIFICAR — ya existe)

**Ubicación actual:** `src/payload/collections/settings/Members/`

**Campos actuales (heredados de eterhub):**
- firstName, secondName, lastName, secondLastName ✓ (mantener)
- tier — ELIMINAR (concepto de Miru, no aplica)
- currency — ELIMINAR (no aplica)
- preferredLocale ✓ (mantener, útil para i18n)

**Campos a agregar:**

```
slug: 'members'
auth: true  // ya está habilitado

fields:
  // --- Datos personales (existentes, se mantienen) ---
  firstName:        text, required
  secondName:       text, optional
  lastName:         text, required
  secondLastName:   text, optional
  preferredLocale:  select ['es', 'en'], default: 'es'

  // --- Campos nuevos ---
  role:             select ['cliente', 'abogado'], required, default: 'cliente'
  cedula:           text, required, unique
                    validate: solo números y puntos, 6-12 caracteres
  telefono:         text, required
                    validate: formato colombiano (10 dígitos)
  ciudad:           text, required
  
  // --- Sistema de Créditos (DEC-004) ---
  creditoAcumulado: number, default: 0, min: 0
                    (suma de pagos tipo 'consulta' sin caso asignado aún)
                    (campo calculado — se actualiza por hook, no se edita manualmente)
  
  // --- Campos de sistema ---
  isActive:         checkbox, default: true
                    (para desactivar abogados que renuncian sin borrar datos)
  isVerified:       checkbox, default: false
                    (se activa cuando confirma email)
```

**Access control:**
```
read:    authenticated — leer su propio perfil siempre
         abogados — leer datos básicos de clientes en sus casos
create:  público (registro), pero el hook fuerza role: 'cliente'
         role: 'abogado' solo se asigna desde /admin por nosotros
update:  propio perfil (excepto role, isActive, isVerified)
         admin puede cambiar todo
delete:  solo admin
```

**Nota de implementación — campos a eliminar del código actual:**
Los campos `tier` (free/premium) y `currency` heredados de la base anterior deben eliminarse antes de agregar los campos nuevos. El concepto de "tier" en este proyecto vive en `Cases`, no en `Members`.

**Hooks:**
- `afterCreate` → envía email de verificación vía SMTP2GO
- `beforeChange` → si se intenta cambiar `role` desde la API (no admin), bloquear
- `afterChange` → si un `Payment` de tipo `'consulta'` se vincula al Member: recalcular `creditoAcumulado`

---

## 2. Cases (CREAR)

**Propósito:** El objeto central de la app. Cada sucesión es un caso.

```
slug: 'cases'

fields:
  // --- Identificación ---
  caseNumber:       text, required, unique, admin-readOnly
                    formato: 'SUC-YYYY-NNN' (auto-generado en hook)
  
  // --- Estado ---
  status:           select ['active', 'completed'], default: 'active'
  currentPhase:     number, min: 0, max: 8, default: 0
                    (0=asignación, 1=reunión, 2=docs, 3=validación,
                     4=notaría, 5=edictos, 6=DIAN, 7=firma, 8=registro)
  
  // --- Tier de servicio (DEC-004) ---
  tier:             select ['estandar', 'premium', 'elite'], required
                    default: 'estandar'
                    (determina el modelo de pagos, qué incluye el servicio,
                     y si la Fase 8 está activa o no)
  
  // --- Tipo de sucesión (DEC-003) ---
  // tuHerenciaFácil maneja ÚNICAMENTE sucesiones intestadas por mutuo acuerdo.
  // Estos campos se registran en el intake y se copian al Case para referencia.
  tieneTestamento:  checkbox, default: false
                    (siempre false — si el cliente dice que sí tiene testamento,
                     el flujo lo desvía en el filtro de elegibilidad y no llega aquí)
  acuerdoHerederos: select ['si', 'no_sabe'], default: 'si'
                    (si es 'no', el caso no puede crearse — el filtro lo bloquea en UI)
                    (si es 'no_sabe', se permite el caso con alerta visible para el abogado)

  // --- Personas ---
  responsable:      relationship → Members, required
                    (el cliente que creó y es dueño del caso)
  abogadoAsignado:  relationship → Members, optional
                    (null = en pool sin asignar)

  // --- Datos del causante ---
  causante:         group
    nombre:           text, required
    cedula:           text, required
    fechaFallecimiento: date, required
    ciudadFallecimiento: text, required

  // --- Datos de la reunión (fase 1) ---
  reunion:          group
    fecha:            date, optional
    lugar:            text, optional
    notas:            textarea, optional
    contratoFirmado:  checkbox, default: false
    poderFirmado:     checkbox, default: false

  // --- Notas ---
  notasInternas:    richText (solo visible para abogado)
                    Para observaciones, estrategia, info sensible
  notasAlCliente:   richText (visible para el cliente)
                    Para instrucciones, actualizaciones

  // --- Metadatos ---
  caseIntake:       relationship → CaseIntake
                    (el formulario de intake que originó este caso)
  appointment:      relationship → Appointments, optional
                    (la consulta previa si el cliente tuvo una antes de abrir el caso)
  fechaCreacion:    date, auto (createdAt de Payload)
  fechaCompletado:  date, optional (se llena al cerrar)
```

**Access control:**
```
read:    cliente — solo si case.responsable === member.id
         abogado — si case.abogadoAsignado === member.id
                   O si case.abogadoAsignado === null (pool)
create:  solo el webhook de pago (server-side)
         nunca desde el frontend directamente
update:  abogado — puede cambiar: currentPhase, abogadoAsignado (tomar caso),
                   reunion, notasInternas, notasAlCliente, status
         cliente — solo puede leer, no actualizar
         admin — todo
delete:  solo admin (nunca se borran casos)
```

**Hooks:**
- `beforeCreate` → genera `caseNumber` automático: `SUC-{año}-{secuencial con padding 3 dígitos}`
- `afterChange` → si `currentPhase` cambió: email al cliente "su caso avanzó a fase X"
- `afterChange` → si `status` cambió a `completed`: email al cliente + métricas
- `afterChange` → si `abogadoAsignado` cambió de null a un ID: email al cliente "abogado asignado"

---

## 3. Appointments (CREAR)

**Propósito:** Todas las citas entre el cliente y el abogado — pre-caso y durante el caso. La colección maneja la logística, el cobro, y el sistema de crédito de forma unificada.

**Nota de nomenclatura:** Esta colección cubre todos los tipos de reunión. "CaseIntake" (sección 3b) es el formulario de datos para abrir un caso — cosa diferente.

**Principio de cobro:** Si el cliente solicita la reunión, paga siempre. Si el abogado solicita la reunión, el abogado decide si cobrar o no (`chargeToClient`). El objetivo es mantener el proceso lo más virtual y asíncrono posible — el bot y el chat resuelven la mayoría de dudas sin necesidad de reunión.

```
slug: 'appointments'

fields:
  member:               relationship → Members, required
  case:                 relationship → Cases, optional
                        (null = reunión pre-caso | con ID = reunión dentro de un caso activo)
  
  // --- Quién inició la reunión ---
  initiatedBy:          select ['client', 'lawyer'], required
                        client = el cliente la solicitó → chargeToClient siempre true
                        lawyer = el abogado la solicitó → chargeToClient editable por abogado
  
  // --- Cobro ---
  chargeToClient:       checkbox, default: true
                        (si initiatedBy === 'client': siempre true, bloqueado)
                        (si initiatedBy === 'lawyer': el abogado decide si cobrar o no)
                        (si false: la reunión es gratuita — no se genera Payment ni se bloquea por pago)
  
  // --- Tipo de reunión ---
  tipo:                 select [
                          'consulta_virtual',       // pre-caso, asesoría, puede generar crédito
                          'consulta_presencial',    // pre-caso, asesoría, puede generar crédito
                          'mediacion_virtual',      // pre-caso, herederos en conflicto, sin crédito
                          'mediacion_presencial',   // pre-caso, herederos en conflicto, sin crédito
                          'caso_virtual',           // dentro de caso activo, nunca genera crédito
                          'caso_presencial',        // dentro de caso activo, nunca genera crédito
                        ], required
  
  monto:                number, required (COP)
                        (consulta_*: 70000 virtual / 100000 presencial)
                        (mediacion_*: mismo precio que consulta equivalente)
                        (caso_*: precio a definir por el abogado o tarifa estándar)
                        (si chargeToClient === false: monto = 0)
  
  // --- Estado ---
  status:               select ['pendiente_pago', 'pagada', 'realizada', 'cancelada'],
                        default: 'pendiente_pago'
                        (si chargeToClient === false: inicia directamente en 'pagada')
  
  // --- Fecha y resultado ---
  fechaAgendada:        date, optional
  fechaRealizada:       date, optional
  notasResultado:       textarea, optional
                        (solo visible para el abogado y admin — nunca para el cliente)
  cotizacionEntregada:  checkbox, default: false
                        (solo consulta_* — marca que Paola entregó la cotización del paquete)
  acuerdoAlcanzado:     checkbox, default: false
                        (solo mediacion_* — marca si los herederos llegaron a acuerdo)
  
  // --- Sistema de Crédito (DEC-004) ---
  autorizarCredito:     checkbox, default: false
                        SOLO para tipo consulta_* — solo el abogado puede activarlo
                        Significa: "Esta consulta da derecho a descuento en el paquete."
                        El crédito NO se aplica automáticamente — requiere que el abogado
                        marque este campo DESPUÉS de que la reunión ocurrió y el cliente
                        decidió abrir un caso. Esto da control total a Paola sobre cuándo
                        el descuento es válido y crea urgencia para que el cliente proceda.
  creditoAplicado:      checkbox, default: false
                        (se activa cuando el crédito fue descontado en el Payment del Case)
  
  // --- Pago ---
  wompiTransactionId:   text, optional
  wompiStatus:          select ['pending', 'approved', 'declined'], optional
```

**Access control:**
```
read:    cliente — solo sus propias citas
         abogado — todas las citas (para ver historial antes de asignar)
create:  cliente autenticado (siempre con chargeToClient: true)
         abogado (puede crear con chargeToClient: false si la inició el abogado)
update:  cliente — cancelar si status === 'pendiente_pago'
         abogado — fechaRealizada, notasResultado, cotizacionEntregada,
                   acuerdoAlcanzado, autorizarCredito, chargeToClient (solo si initiatedBy: lawyer)
         server  — status, wompiTransactionId, wompiStatus (webhook de Wompi)
delete:  solo admin
```

**Hooks:**
- `afterChange` → si `status` cambia a `'pagada'` Y `tipo` es `'consulta_*'` Y `autorizarCredito === true`: sumar monto a `Member.creditoAcumulado`
- `afterChange` → si `autorizarCredito` cambia a `true` Y `status === 'realizada'`: sumar monto a `Member.creditoAcumulado` (para cuando el abogado autoriza después de la reunión)
- `afterChange` → si `autorizarCredito` cambia a `false` Y `creditoAplicado === false`: restar monto de `Member.creditoAcumulado` (el abogado puede revocar la autorización antes de que se abra el caso)
- `afterCreate` → si `chargeToClient === true` Y `status !== 'cancelada'`: email al cliente con instrucciones de pago
- `afterCreate` → si `chargeToClient === false`: email al cliente con confirmación de cita (sin pago pendiente)

**Lógica de crédito al crear el Case (en el webhook de Wompi):**
```
Al crear el Case:
1. Buscar Appointments del member con:
   tipo IN ['consulta_virtual', 'consulta_presencial']
   autorizarCredito === true
   creditoAplicado === false
   status === 'realizada'
2. Si existen → sumar sus montos
3. Crear Payment de tipo: 'creditoConsulta', monto: -(suma), en el Case
4. Marcar todos esos Appointments con creditoAplicado: true
5. Recalcular Member.creditoAcumulado = 0 (o el saldo pendiente si hay varios casos)
```

---

## 3b. CaseIntake (CREAR)

**Propósito:** Formulario de intake para abrir un caso. El cliente llena los datos del causante, herederos estimados y bienes conocidos. Se convierte en `Case` al confirmar el pago del paquete.

**Flujo CRM para Germán:** Los intakes en estado `draft` permiten al equipo de soporte contactar al cliente para cerrar la venta a través del chat de Soporte.

**Nota:** Antes se llamaba `Consultations`. Se renombró a `CaseIntake` para distinguirlo de las citas de asesoría (`Appointments`).

```
slug: 'case-intakes'

fields:
  member:               relationship → Members, required
  status:               select ['draft', 'submitted', 'paid'], default: 'draft'
  
  // --- Tier elegido ---
  tierElegido:          select ['estandar', 'premium', 'elite'], optional
                        (el cliente elige antes de pagar; se copia al Case al crear)
  
  // --- Filtro de elegibilidad (DEC-003) ---
  tieneTestamento:      checkbox, default: false
                        (si true, el intake no debería existir — el filtro lo previene en UI)
  acuerdoHerederos:     select ['si', 'no_sabe'], required
                        (viene de la respuesta en la pantalla de Bienvenida)
  
  // --- Datos del causante (se copian al Case al pagar) ---
  causanteNombre:       text, required (en submit)
  causanteCedula:       text, required (en submit)
  causanteFechaFallecimiento: date, required (en submit)
  causanteCiudadFallecimiento: text, required (en submit)
  
  // --- Datos estimados ---
  herederosEstimados:   number, min: 1, required
  bienesDescripcion:    textarea, required
                        (texto libre guiado: "1 apartamento en Bogotá, 1 carro modelo...")
  parentescoConCausante: select ['hijo/a', 'hermano/a', 'cónyuge', 
                          'nieto/a', 'sobrino/a', 'padre/madre', 'otro']
  
  // --- Referencia a la consulta previa ---
  appointment:          relationship → Appointments, optional
                        (si el cliente tuvo cita previa con Paola)
  
  // --- Referencia al caso creado ---
  case:                 relationship → Cases, optional
                        (se llena cuando el pago se confirma)
  
  // --- Pago ---
  wompiTransactionId:   text, optional
  montoTotal:           number, optional
```

**Access control:**
```
read:    cliente — solo sus propios intakes
create:  cliente autenticado
update:  cliente — solo si status === 'draft'
         server — cambia status a 'paid' y asigna case
delete:  solo admin
```

**Hooks:**
- `beforeChange` → si `status` cambia a `submitted`: validar que todos los campos requeridos estén llenos
- No hay hook para crear el Case aquí — eso lo hace el endpoint del webhook de Wompi

---

## 4. Heirs (CREAR)

**Propósito:** Herederos de un caso. Soporta herencia por representación.

```
slug: 'heirs'

fields:
  case:               relationship → Cases, required
  
  // --- Datos personales ---
  nombreCompleto:     text, required
  cedula:             text, required
  parentesco:         select ['hijo/a', 'hermano/a', 'cónyuge', 'nieto/a',
                       'sobrino/a', 'padre/madre', 'otro'], required
  telefono:           text, optional
  email:              email, optional
  
  // --- Representación ---
  esRepresentante:    checkbox, default: false
                      (true si hereda en representación de alguien que falleció)
  herederoOriginal:   relationship → Heirs, optional
                      (a quién representa — ej: "representa a mi papá")
  
  // --- Distribución ---
  porcentaje:         number, min: 0, max: 100, optional
                      (se define después, cuando el abogado lo calcula)
  
  // --- Notas (solo abogado) ---
  notasInternas:      textarea, optional
                      (ej: "Hay conflicto con este heredero sobre el %")
```

**Access control:**
```
read:    cliente — si heir.case.responsable === member.id
         abogado — si heir.case.abogadoAsignado === member.id
create:  cliente (agregar herederos a su caso)
         abogado (agregar/corregir herederos)
update:  abogado — todo
         cliente — solo campos básicos (nombre, cédula, parentesco, tel, email)
                   NO puede cambiar: porcentaje, notasInternas, representación
delete:  solo abogado + admin
```

**Hooks:**
- `afterCreate` → si el caso está en fase 2+: genera automáticamente items en DocumentChecklist para este heredero (registro civil + cédula)

---

## 5. Assets (CREAR)

**Propósito:** Bienes incluidos en la sucesión.

```
slug: 'assets'

fields:
  case:               relationship → Cases, required
  
  // --- Datos del bien ---
  tipo:               select ['inmueble', 'vehiculo', 'financiero', 'otro'], required
  descripcion:        text, required
                      (ej: "Apartamento Cra 24 #53-18, Bogotá")
  ubicacion:          text, optional
  valorEstimado:      number, optional (COP)
  
  // --- Hallazgos jurídicos (solo abogado) ---
  hallazgosJuridicos: textarea, optional
                      (ej: "Hipoteca activa con Davivienda — requiere paz y salvo")
  
  // --- Investigación de bienes ---
  // POLÍTICA POR TIER (DEC-004):
  //   Premium: la investigación está INCLUIDA en el paquete — tarifa plana $150.000 COP
  //            el costo NO aparece como cargo adicional en la pantalla de Pagos del cliente
  //   Estándar: la investigación es un SERVICIO ADICIONAL — se cobra aparte ($150.000 COP)
  //             se muestra al cliente como opción opcional con CTA claro en su pantalla de Bienes
  //   En ambos casos: Paola gestiona la investigación (vehículos, cuentas bancarias)
  //                   Inmuebles: sin costo (Paola consulta directamente, sin cobro)
  investigacion:      group
    solicitada:         checkbox, default: false
    fechaSolicitud:     date, optional
    costo:              number, optional (default: 150000)
                        (0 si el tier es Premium — incluido en paquete)
                        (150000 si el tier es Estándar — cobro adicional)
    status:             select ['pendiente', 'en_proceso', 'recibida'], 
                        default: 'pendiente'
    resultado:          relationship → Documents, optional
                        (PDF del resultado de la investigación)
```

**Access control:**
```
read:    cliente — si asset.case.responsable === member.id
         abogado — si asset.case.abogadoAsignado === member.id
create:  cliente (declarar bienes) + abogado (agregar de investigación)
update:  abogado — todo
         cliente — solo descripcion, ubicacion, valorEstimado
                   NO: hallazgosJuridicos, investigacion
delete:  solo abogado + admin
```

**Hooks:**
- `afterCreate` → si el caso está en fase 2+: genera items en DocumentChecklist para este bien (certificado de tradición si inmueble, tarjeta de propiedad si vehículo)

---

## 6. DocumentChecklist (CREAR)

**Propósito:** Lista auto-generada de documentos requeridos por caso. Se genera cuando el abogado avanza a fase 2.

```
slug: 'document-checklist'

fields:
  case:             relationship → Cases, required
  
  // --- Definición del documento ---
  nombre:           text, required
                    (ej: "Registro civil de nacimiento con notas marginales")
  descripcion:      text, optional
                    (ej: "No mayor a 30 días, expedido por registraduría")
  
  // --- Guía de Paola (Tips para el cliente) ---
  guiaDePaola:      text, optional
                    (ej: "Asegúrese que la fecha de expedición no supere los 90 días")
  
  // --- A quién pertenece ---
  categoria:        select ['causante', 'heredero', 'bien'], required
  heredero:         relationship → Heirs, optional
                    (si categoria === 'heredero')
  asset:            relationship → Assets, optional
                    (si categoria === 'bien')
  
  // --- Estado ---
  status:           select ['pending', 'uploaded', 'approved', 'rejected'],
                    default: 'pending'
                    pending   = no ha sido subido
                    uploaded  = subido, en revisión por el abogado
                    approved  = revisado y aprobado por el abogado
                    rejected  = rechazado con nota, cliente debe corregir
  required:         checkbox, default: true
  
  // --- Flag: Recibido Físico (DEC-002) ---
  receivedPhysically: checkbox, default: false
                    (true = el abogado ya tiene el papel físico, pendiente de digitalización)
                    (cuando está en true, se muestra al cliente: "Recibido físico — en proceso de digitalización")
                    (no desbloquea el avance de fase — el documento sigue bloqueado hasta estar digitalizado y aprobado)
  receivedPhysicallyAt: date, optional
                    (fecha en que el abogado confirmó tener el físico)
  
  // --- Documento asociado ---
  document:         relationship → Documents, optional
                    (se llena cuando el cliente sube el archivo)
  
  // --- Revisión ---
  reviewNote:       textarea, optional
                    (nota del abogado cuando rechaza — visible para el cliente)
  reviewedBy:       relationship → Members, optional
  reviewedAt:       date, optional
```

**Access control:**
```
read:    cliente — si checklist.case.responsable === member.id
         abogado — si checklist.case.abogadoAsignado === member.id
create:  server-side (auto-generado por hook de Cases al avanzar a fase 2)
         abogado (solicitar documento adicional)
update:  abogado — status, reviewNote, reviewedBy, reviewedAt
         cliente — NO puede actualizar directamente (sube Document, el link se hace por hook)
delete:  solo admin
```

**Generación automática — lógica del hook:**
```
Al crear el Case (Fase 0 — siempre, para TODOS los tiers):

  - "Poder de Representación Notarial"
      categoria: 'causante'
      tipo en Document: 'poder'
      required: true
      guiaDePaola: "El poder debe estar autenticado ante notario, autorizar 
        expresamente la tramitación de la sucesión notarial, y la firma debe 
        coincidir con la cédula del poderdante. Sin este documento aprobado, 
        no es posible radicar en la notaría."
      → Este ítem es el GATE para el avance Fase 3 → 4 (DEC-002)

Cuando Case.currentPhase cambia a 2:

  Para el causante (siempre):
    - "Registro civil de defunción"
        guiaDePaola: "Debe ser el original o una copia auténtica reciente. 
          Expedida por la Registraduría Nacional."
    - "Copia de cédula del causante"
        guiaDePaola: "Copia legible de ambas caras."

  Para cada heredero en el caso:
    - "Registro civil de nacimiento con notas marginales — {nombre}"
        guiaDePaola: "Debe incluir las notas marginales actualizadas. 
          No mayor a 90 días de expedición. Expedido por la Registraduría."
    - "Copia de cédula — {nombre}"
        guiaDePaola: "Copia legible de ambas caras."

  Para cada bien tipo 'inmueble':
    - "Certificado de tradición y libertad — {descripcion}"
        guiaDePaola: "Debe tener máximo 30 días de expedición. 
          Se obtiene en la Oficina de Registro de Instrumentos Públicos 
          o en línea en orip.gov.co."
    - "Escritura pública de tradición — {descripcion}"

  Para cada bien tipo 'vehiculo':
    - "Tarjeta de propiedad — {descripcion}"
        guiaDePaola: "Documento original o copia auténtica."
    - "Certificado de tradición del vehículo — {descripcion}"
        guiaDePaola: "Se obtiene en el RUNT en runt.com.co."

  Para cada bien tipo 'financiero':
    - "Certificado bancario o extracto — {descripcion}"
        guiaDePaola: "Extracto reciente o certificado del banco 
          con el saldo a fecha de fallecimiento."
```

---

## 7. Documents (CREAR)

**Propósito:** Archivos subidos al sistema. PDFs, imágenes, escaneados. Se almacenan en R2.

```
slug: 'documents'

fields:
  case:             relationship → Cases, required
  
  // --- Archivo ---
  file:             upload, required
                    mimeTypes: ['application/pdf', 'image/jpeg', 'image/png']
                    maxSize: 10MB
                    storage: R2 via @payloadcms/storage-s3
  
  // --- Clasificación ---
  tipo:             select ['causante', 'heredero', 'bien', 'poder', 'legal', 'notarial'],
                    required
                    causante  = documentos del causante (defunción, cédula)
                    heredero  = documentos por heredero (nacimiento, cédula)
                    bien      = documentos por activo (tradición, escritura, tarjeta)
                    poder     = Poder de Representación Notarial — tipo exclusivo y crítico
                                (es el gate para Fase 4 — ver DEC-002)
                    legal     = escritos del abogado, contrato
                    notarial  = edictos, escritura pública, certificados
  
  nombre:           text, required
                    (ej: "Registro civil de nacimiento — Juan Vélez")
  
  // --- Relaciones opcionales ---
  checklistItem:    relationship → DocumentChecklist, optional
                    (si es un documento del checklist)
  heredero:         relationship → Heirs, optional
  asset:            relationship → Assets, optional
  
  // --- Quién lo subió ---
  uploadedBy:       relationship → Members, required
  
  // --- Visibilidad ---
  visibility:       select ['client', 'internal'], default: 'client'
                    client = visible para el cliente
                    internal = solo el abogado y admin lo ven
  
  // --- Historial (para resubidas) ---
  version:          number, default: 1
  previousVersion:  relationship → Documents, optional
                    (referencia al documento que reemplaza)
```

**Access control:**
```
read:    cliente — si document.case.responsable === member.id
                   Y document.visibility === 'client'
         abogado — si document.case.abogadoAsignado === member.id
                   (ve todos, incluyendo internal)
create:  cliente (subir docs de su caso)
         abogado (subir docs legales/notariales)
update:  abogado — visibility, nombre
         cliente — NO (para corregir, sube nueva versión)
delete:  solo admin (los documentos nunca se borran, se versionan)
```

**Hooks:**
- `afterCreate` → si tiene `checklistItem`: actualizar el ChecklistItem con `document = this.id` y `status = 'uploaded'`
- `afterCreate` → si `uploadedBy.role === 'cliente'`: trigger email al abogado "N documentos nuevos en caso X"

**Signed URLs:**
Los archivos NO se sirven con URLs públicas. Endpoint custom:
```
GET /api/documents/:id/url → genera signed URL de R2, TTL: 1 hora
```
Solo accesible si el member tiene permiso de read sobre el documento.

---

## 8. NotaryProcess (CREAR)

**Propósito:** Todo el tracking del proceso notarial. Solo el abogado tiene acceso. La información relevante para el cliente se refleja en el timeline del caso a través de `Case.currentPhase`.

```
slug: 'notary-process'

fields:
  case:             relationship → Cases, required, unique
                    (one-to-one con el caso)
  
  // --- Notaría ---
  notaria:          text, optional
                    (ej: "Notaría 62 del Círculo de Bogotá D.C.")
  notario:          text, optional
                    (ej: "César Augusto Ariza Otálora")
  
  // --- Radicación (fase 4) ---
  radicacion:       group
    fecha:            date, optional
    numero:           text, optional (ej: "RAD 202405621")
    escritos:         relationship → Documents, optional (PDFs radicados)
  
  // --- Respuesta del notario ---
  respuestaNotario: group
    status:           select ['pendiente', 'aprobado', 'requiere_documentos',
                       'requiere_correcciones'], default: 'pendiente'
    detalle:          textarea, optional
    fecha:            date, optional
    autorizacionEdictos: relationship → Documents, optional
  
  // --- Edictos (fase 5) ---
  edictos:          group
    medio:            text, optional (ej: "Periódico La República + Radio")
    fechaPublicacion: date, optional
    costo:            number, optional (COP)
    fechaVencimiento: date, optional
                      (calculada automáticamente: +10 días hábiles)
    edictoPDF:        relationship → Documents, optional
    comprobantePago:  relationship → Documents, optional
    comprobantesEntregados: checkbox, default: false
    fechaEntrega:     date, optional
  
  // --- Validación DIAN (fase 6) ---
  dian:             group
    status:           select ['pendiente', 'en_validacion', 'aprobado', 
                       'hallazgos'], default: 'pendiente'
    hallazgos:        textarea, optional
    fechaResolucion:  date, optional
  
  // --- Validación UGPP (fase 6) ---
  ugpp:             group
    status:           select ['pendiente', 'en_validacion', 'aprobado', 
                       'hallazgos'], default: 'pendiente'
    hallazgos:        textarea, optional
    fechaResolucion:  date, optional
  
  // --- Firma (fase 7) ---
  firma:            group
    fecha:            date, optional
    hora:             text, optional (ej: "10:00 AM")
    lugar:            text, optional
    escrituraPublica: relationship → Documents, optional
  
  // --- Costos notariales (fase 7) ---
  costosNotariales: group
    derechosNotariales: number, optional (COP)
    impuestoRegistro:   number, optional (COP)
    boletaFiscal:       number, optional (COP)
  
  // --- Registro (fase 8) ---
  registro:         group
    fechaSalida:      date, optional (cuando sale para registro)
    status:           select ['pendiente', 'en_registro', 'registrado'],
                      default: 'pendiente'
    fechaRegistro:    date, optional (cuando queda en folio de matrícula)
    certificadoTradicion: relationship → Documents, optional
```

**Access control:**
```
read:    SOLO abogado — si notaryProcess.case.abogadoAsignado === member.id
         cliente — BLOQUEADO (403)
         admin — sí
create:  abogado (cuando inicia el proceso notarial en fase 4)
update:  abogado — todo
delete:  solo admin
```

**Hooks:**
- `beforeChange` → si `edictos.fechaPublicacion` cambió: calcular `edictos.fechaVencimiento` automáticamente (+10 días hábiles, excluyendo sábados, domingos y festivos colombianos)
- `afterChange` → si `costosNotariales` cambió: crear/actualizar Payments correspondientes y trigger email al cliente con desglose

---

## 9. Payments (CREAR)

**Propósito:** Registro de todos los pagos y costos del caso.

**Política de transparencia con el cliente (acordada con Paola):**
El cliente tiene derecho a saber qué pagó y cuánto debe. Sin embargo, hay una distinción importante:
- **Gastos operativos ($500k en Estándar):** Se muestran como una sola línea — "Gastos operativos del proceso: $500.000". NO se desglosan internamente (papelería, transporte, etc.). Esto evita expectativas de devolución de excedentes.
- **Gastos de terceros (notaría, edictos, registro):** SÍ se muestran en detalle porque son variables, impredecibles, y el cliente necesita tener ese dinero disponible para la firma.
- **Honorarios de tuHerenciaFácil:** Se muestran como cuotas del paquete (primera cuota, segunda cuota) sin desglose interno.
- **Investigación de bienes:** Se muestra solo si es Estándar (cobro adicional). En Premium está incluida y no aparece como cargo separado.

```
slug: 'payments'

fields:
  case:             relationship → Cases, required
  
  // --- Categoría de pago ---
  category:         select ['legal_fees', 'third_party_costs'], required
                    (legal_fees = honorarios de tuHerenciaFácil)
                    (third_party_costs = notaría, edictos, registro, etc.)

  // --- Tipo de pago ---
  tipo:             select [
                      // Pagos pre-caso (vinculados al Member, no al Case)
                      'consulta',             // cita de asesoría previa ($70k o $100k)
                      
                      // Pagos del caso — honorarios tuHerenciaFácil
                      'servicio',             // pago inicial del paquete
                      'anticipo',             // anticipo de honorarios
                      'excedente',            // excedente de honorarios
                      'creditoConsulta',      // crédito oculto por consulta previa (monto negativo)
                      
                      // Pagos del caso — gastos operativos del paquete
                      'gastos_operativos',    // los $500k del paquete Estándar
                                              // se muestran como UNA línea, sin desglose
                                              // (incluido en el precio del paquete — no es cobro adicional)
                      
                      // Pagos del caso — gastos de terceros (siempre visibles en detalle)
                      'investigacion',        // investigación de bienes ($150k — solo Estándar)
                      'edictos',              // publicación de edictos
                      'notariales_derechos',  // derechos notariales
                      'notariales_impuesto',  // impuesto de registro
                      'notariales_boleta',    // boleta fiscal
                      
                      // Solo tier Elite — cargos dinámicos mid-proceso
                      'cargo_custom',         // cargo personalizado definido por la abogada
                                              // (requiere labelPersonalizado y descripcionParaCliente)
                    ], required
  
  // --- Campos adicionales para cargo_custom (Elite) ---
  labelPersonalizado:       text, optional
                            (requerido si tipo === 'cargo_custom')
                            (ej: "Trámite en Notaría de Medellín")
  descripcionParaCliente:   textarea, optional
                            (visible para el cliente — explicación del cargo)
  
  // --- Cuotas (Elite) ---
  esCuota:          checkbox, default: false
                    (true si este pago es una cuota de un cargo mayor)
  pagoParent:       relationship → Payments, optional
                    (el pago "padre" al que pertenece esta cuota)
  numeroCuota:      number, optional (ej: 1, 2, 3)
  totalCuotas:      number, optional (ej: 3 — "cuota 1 de 3")
  
  // --- Datos del pago ---
  monto:            number, required (COP)
  fecha:            date, required
  metodo:           select ['transferencia', 'efectivo', 'nequi', 
                     'pse', 'tarjeta'], required
  
  // --- Quién registró ---
  registradoPor:    relationship → Members, required
  
  // --- Pasarela (si aplica) ---
  wompiTransactionId: text, optional
  wompiStatus:        select ['pending', 'approved', 'declined'], optional
  
  // --- Visibilidad (política de transparencia) ---
  visibleParaCliente: checkbox, default: true
                    (false = pago solo visible para abogado y admin)
                    Casos donde es false:
                    - Notas internas de costos que Paola registra para su control
                    - Gastos menores que están dentro del $500k operativo
                    El cliente siempre ve: cuotas del paquete, crédito, terceros, investigación (Estándar)
                    El cliente nunca ve: desglose interno del $500k operativo
  
  // --- Notas ---
  notas:            textarea, optional
```

**Access control:**
```
read:    cliente — si payment.case.responsable === member.id
                   Y payment.visibleParaCliente === true
         abogado — si payment.case.abogadoAsignado === member.id
                   (ve todos, incluyendo los no visibles)
create:  abogado (registrar pagos recibidos offline)
         server (webhook de Wompi para pagos online)
update:  solo admin (los pagos no se modifican)
delete:  solo admin
```

**Hooks:**
- `afterCreate` → si `tipo === 'servicio'` y viene del webhook de Wompi: crear el Case asociado
- `afterCreate` → si `registradoPor.role === 'abogado'` y tipo es notarial: email al cliente con desglose

---

## 10. ChatMessages (CREAR)

**Propósito:** Mensajes del sistema de chat. Soporta 3 canales: bot IA, abogado, soporte.

```
slug: 'chat-messages'

fields:
  case:             relationship → Cases, optional
                    (null para chats pre-pago o generales)
  
  // --- Mensaje ---
  content:          textarea, required
  channel:          select ['bot', 'abogado', 'soporte'], required
  
  // --- Autor ---
  author:           relationship → Members, optional
                    (null si es el bot)
  isFromBot:        checkbox, default: false
  
  // --- Metadata ---
  timestamp:        date, required, default: now
  readByClient:     checkbox, default: false
  readByLawyer:     checkbox, default: false
```

**Access control:**
```
read:    cliente — si message.case.responsable === member.id
                   (ve todos los canales de su caso)
         abogado — si message.case.abogadoAsignado === member.id
                   (ve todos los canales, incluido historial previo)
create:  cliente (enviar mensaje)
         abogado (responder)
         server (mensajes del bot)
update:  solo readByClient/readByLawyer (marcar como leído)
delete:  solo admin
```

**Hooks:**
- `afterCreate` → si `author.role === 'cliente'` y `channel === 'abogado'`: email al abogado "nuevo mensaje de cliente X"
- `afterCreate` → si `author.role === 'abogado'`: email al cliente "su abogado le envió un mensaje"

---

## Endpoints custom (fuera de colecciones)

Además de los endpoints REST automáticos de Payload, necesitamos:

### `GET /api/public/cases/search` — Portal de Transparencia
Endpoint público (sin autenticación) para el buscador del sitio de marketing.

**Parámetros:** `?q={nombre_causante}` (mínimo 3 caracteres)

**Retorna (solo datos no sensibles):**
```json
{
  "results": [
    {
      "caseId": "SUC-2026-001",
      "causanteNombre": "Carlos Alberto Vélez",
      "ciudadFallecimiento": "Bogotá D.C.",
      "currentPhase": 4,
      "phaseLabel": "Tus documentos están en la notaría",
      "estimatedCompletionMonth": "Agosto 2026",
      "status": "active"
    }
  ]
}
```

**Campos que NUNCA se retornan:** nombre/cédula del responsable, herederos, activos, montos, documentos, notas, nombre del abogado asignado.

**Rate limit:** 10 consultas por IP por minuto (protección contra scraping).

**Uso:** Este endpoint es consumido exclusivamente desde el sitio de marketing (gestionado por Germán en Payload CMS). No está expuesto como endpoint directo en la web app del cliente.

---

### `POST /api/webhooks/wompi`
Recibe confirmación de pago de Wompi. Verifica firma. Si pago exitoso:
1. Actualiza Consultation.status = 'paid'
2. Crea Case con datos de la Consultation
3. Crea Payment con tipo 'servicio'
4. Email al cliente: confirmación
5. Email a abogados: nuevo caso en pool

### `GET /api/documents/:id/url`
Genera signed URL de R2 para descargar/ver un documento. Verifica que el member tiene permiso. TTL: 1 hora.

### `POST /api/cases/:id/advance-phase`
Avanza el caso a la siguiente fase. Validaciones server-side:
- Fase 2 → 3: no hay docs en status 'pending'
- Fase 3 → 4: todos los docs están en 'approved'
                **+ Gate del Poder (DEC-002):** debe existir exactamente 1 ítem en
                `DocumentChecklist` con `tipo: 'poder'` y `status: 'approved'` para este caso.
                Si no → error 422: "El Poder de Representación Notarial debe estar aprobado antes de radicar."
- Fase 4 → 5: NotaryProcess.respuestaNotario.status === 'aprobado'
- Fase 5 → 6: NotaryProcess.edictos.comprobantesEntregados === true
- Fase 6 → 7: NotaryProcess.dian.status === 'aprobado' Y ugpp.status === 'aprobado'
- Fase 7 → 8: NotaryProcess.firma.escrituraPublica existe
               **+ Condicional por tier (DEC-004):**
               - Si tier === 'estandar': NO avanza a Fase 8. En cambio → Case.status = 'completed' 
                 + trigger "Email de Finalización" al cliente
               - Si tier === 'premium' o 'elite': SÍ avanza a Fase 8 (tracking de registro)
- Fase 8 → completed: NotaryProcess.registro.status === 'registrado'
                       (solo aplica para tiers premium y elite)

### `POST /api/chat/bot`
Endpoint para el chat con IA. Recibe mensaje del usuario, lo pasa al modelo de IA con contexto acotado a sucesiones, retorna respuesta. Rate limited.

---

## Función utilitaria: cálculo de días hábiles

```typescript
// Para calcular vencimiento de edictos
function addBusinessDays(startDate: Date, days: number): Date {
  // Excluye sábados y domingos
  // Excluye festivos colombianos (Ley 51 de 1983 + festivos fijos)
  // Retorna la fecha de vencimiento
}
```

Los festivos colombianos para cada año se pueden hardcodear como constante o calcular con la ley de emiliani (lunes festivos trasladados).

---

## Estructura de carpetas para las colecciones

```
src/payload/collections/
  ├── content/
  │   ├── Pages/              (ya existe — marketing site)
  │   ├── Articles/           (ya existe — blog)
  │   └── Media/              (ya existe — imágenes del CMS)
  │
  ├── settings/
  │   ├── Users/              (ya existe — admin panel)
  │   └── Members/            (MODIFICAR — limpiar campos Miru/Eterhub + agregar role, cedula, etc.)
  │
  └── succession/             (NUEVA carpeta — todo lo del producto)
      ├── Cases/
      │   └── index.ts
      ├── Appointments/       (nuevo — citas de consulta previa)
      │   └── index.ts
      ├── CaseIntake/         (antes: Consultations)
      │   └── index.ts
      ├── Heirs/
      │   └── index.ts
      ├── Assets/
      │   └── index.ts
      ├── DocumentChecklist/
      │   └── index.ts
      ├── Documents/
      │   └── index.ts
      ├── NotaryProcess/
      │   └── index.ts
      ├── Payments/
      │   └── index.ts
      └── ChatMessages/
          └── index.ts
```

**Orden de implementación (por dependencias):**
1. Members (modificar — limpiar primero)
2. Cases
3. Appointments
4. CaseIntake
5. Heirs
6. Assets
7. DocumentChecklist
8. Documents
9. NotaryProcess
10. Payments
11. ChatMessages

---

## Diagrama de relaciones

```
Members ──(1:N)──→ Cases (como responsable)
Members ──(1:N)──→ Cases (como abogadoAsignado)
Members ──(1:N)──→ Appointments
Members ──(1:N)──→ CaseIntakes
Members ──(1:N)──→ Documents (como uploadedBy)
Members ──(1:N)──→ Payments (como registradoPor)
Members ──(1:N)──→ ChatMessages (como author)

Appointments ──(1:1)──→ Cases (cuando el cliente abre el caso tras la consulta)

CaseIntakes ──(1:1)──→ Cases (cuando el pago del paquete se confirma)
CaseIntakes ──(1:1)──→ Appointments (consulta previa que originó el intake)

Cases ──(1:N)──→ Heirs
Cases ──(1:N)──→ Assets
Cases ──(1:1)──→ NotaryProcess
Cases ──(1:N)──→ Payments
Cases ──(1:N)──→ Documents
Cases ──(1:N)──→ DocumentChecklist
Cases ──(1:N)──→ ChatMessages

Payments ──(self)──→ Payments (pagoParent, para cuotas del tier Elite)

Heirs ──(self)──→ Heirs (herederoOriginal, para representación)
Heirs ──(1:N)──→ DocumentChecklist (docs de este heredero)

Assets ──(1:N)──→ DocumentChecklist (docs de este bien)

DocumentChecklist ──(1:1)──→ Documents (el doc subido para este item)

Documents ──(self)──→ Documents (previousVersion, para historial)
```

---

## Decisiones de diseño

### ¿Por qué NotaryProcess es una colección separada y no un group dentro de Cases?
Porque tiene ~25 campos agrupados en 7 sub-groups. Meterlo como group en Cases haría la colección inmanejable en el panel de Payload y complicaría el access control (necesitamos que el cliente NO vea esto pero SÍ vea el resto del caso).

### ¿Por qué DocumentChecklist es separado de Documents?
El checklist es la DEFINICIÓN de qué se necesita (nombre, descripción, a quién pertenece). El document es el ARCHIVO subido. Un item del checklist puede existir sin documento (status: pending). Un documento puede existir sin checklist (documentos del abogado, escritura pública, etc.).

### ¿Por qué no usar Payload Globals para NotaryProcess?
Los globals son singleton (un solo registro). Necesitamos un NotaryProcess por caso.

### ¿Por qué versionar documentos en vez de borrar y resubir?
Trazabilidad legal. En un proceso de sucesión, poder demostrar qué documento se subió, cuándo se rechazó, y qué se corrigió es importante. Nunca se borra un archivo de R2.

---

## Próximo paso

Con las colecciones definidas, el siguiente paso es:
1. Pedirle a Claude Code que implemente las colecciones en orden de dependencia:
   Members (modificar) → Cases → Consultations → Heirs → Assets → 
   DocumentChecklist → Documents → NotaryProcess → Payments → ChatMessages
2. Correr migraciones con Drizzle
3. Verificar en /admin que todo aparece y se puede crear datos de prueba
ations → Heirs → Assets → 
   DocumentChecklist → Documents → NotaryProcess → Payments → ChatMessages
2. Correr migraciones con Drizzle
3. Verificar en /admin que todo aparece y se puede crear datos de prueba
s con Drizzle
3. Verificar en /admin que todo aparece y se puede crear datos de prueba
