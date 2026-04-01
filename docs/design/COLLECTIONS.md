# Colecciones de Payload CMS — tuHerenciaFácil

> Status: definición técnica — pendiente implementación
> Last updated: 2026-03-30
> Depende de: SCREEN_MAP.md, app-flowchart.html

---

## Resumen

9 colecciones nuevas o modificadas. 1 colección existente que se adapta (Members).
La colección `users` de Payload (admin panel) no se toca — es solo para editores internos.

| Colección | Estado | Propósito |
|---|---|---|
| Members | MODIFICAR | Usuarios del producto (clientes + abogados) |
| Cases | CREAR | Caso de sucesión — objeto central |
| Consultations | CREAR | Formulario de intake pre-pago |
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

**Hooks:**
- `afterCreate` → envía email de verificación vía SMTP2GO
- `beforeChange` → si se intenta cambiar `role` desde la API (no admin), bloquear

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
  consultation:     relationship → Consultations
                    (la consulta original que generó este caso)
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

## 3. Consultations (CREAR)

**Propósito:** Formulario de intake pre-pago. Se convierte en caso al pagar.
**Flujo CRM para Germán:** Las consultas en estado `draft` permiten al equipo de soporte contactar al cliente para cerrar la venta a través del chat de Soporte.

```
slug: 'consultations'

fields:
  member:               relationship → Members, required
  status:               select ['draft', 'submitted', 'paid'], default: 'draft'
  
  // --- Datos del causante (se copian al Case al pagar) ---
  causanteNombre:       text, required (en submit)
  causanteCedula:       text, required (en submit)
  causanteFechaFallecimiento: date, required (en submit)
  causanteCiudadFallecimiento: text, required (en submit)
  
  // --- Datos estimados ---
  herederosEstimados:   number, min: 1, required
  bienesDescripcion:    textarea, required
                        (texto libre: "apartamento en Chapinero, carro Renault...")
  parentescoConCausante: select ['hijo/a', 'hermano/a', 'cónyuge', 
                          'nieto/a', 'sobrino/a', 'padre/madre', 'otro']
  
  // --- Referencia al caso creado ---
  case:                 relationship → Cases, optional
                        (se llena cuando el pago se confirma)
  
  // --- Pago ---
  wompiTransactionId:   text, optional
  montoTotal:           number, optional
```

**Access control:**
```
read:    cliente — solo sus propias consultas
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
  investigacion:      group
    solicitada:         checkbox, default: false
    fechaSolicitud:     date, optional
    costo:              number, optional (default: 150000)
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
  required:         checkbox, default: true
  
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
Cuando Case.currentPhase cambia a 2:

Para el causante (siempre):
  - "Registro civil de defunción"
  - "Copia de cédula del causante"

Para cada heredero en el caso:
  - "Registro civil de nacimiento con notas marginales — {nombre}"
  - "Copia de cédula — {nombre}"

Para cada bien tipo 'inmueble':
  - "Certificado de tradición y libertad (no mayor a 30 días)"
  - "Escritura pública de tradición"

Para cada bien tipo 'vehiculo':
  - "Tarjeta de propiedad"
  - "Certificado de tradición del vehículo"

Para cada bien tipo 'financiero':
  - "Certificado bancario o extracto"
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
  tipo:             select ['causante', 'heredero', 'bien', 'legal', 'notarial'],
                    required
                    causante/heredero/bien = subidos por el cliente
                    legal = escritos del abogado, contrato, poder
                    notarial = edictos, escritura pública, certificados
  
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
                      'servicio',           // pago inicial del servicio
                      'anticipo',           // anticipo de honorarios
                      'excedente',          // excedente de honorarios
                      'investigacion',      // investigación de bienes
                      'edictos',            // publicación de edictos
                      'notariales_derechos',// derechos notariales
                      'notariales_impuesto',// impuesto de registro
                      'notariales_boleta',  // boleta fiscal
                    ], required
  
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
  
  // --- Notas ---
  notas:            textarea, optional
```

**Access control:**
```
read:    cliente — si payment.case.responsable === member.id
         abogado — si payment.case.abogadoAsignado === member.id
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
- Fase 4 → 5: NotaryProcess.respuestaNotario.status === 'aprobado'
- Fase 5 → 6: NotaryProcess.edictos.comprobantesEntregados === true
- Fase 6 → 7: NotaryProcess.dian.status === 'aprobado' Y ugpp.status === 'aprobado'
- Fase 7 → 8: NotaryProcess.firma.escrituraPublica existe
- Fase 8 → completed: NotaryProcess.registro.status === 'registrado'

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
  │   └── Members/            (MODIFICAR — agregar role, cedula, etc.)
  │
  └── succession/             (NUEVA carpeta — todo lo del producto)
      ├── Cases/
      │   └── index.ts
      ├── Consultations/
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

---

## Diagrama de relaciones

```
Members ──(1:N)──→ Cases (como responsable)
Members ──(1:N)──→ Cases (como abogadoAsignado)
Members ──(1:N)──→ Consultations
Members ──(1:N)──→ Documents (como uploadedBy)
Members ──(1:N)──→ Payments (como registradoPor)
Members ──(1:N)──→ ChatMessages (como author)

Cases ──(1:N)──→ Heirs
Cases ──(1:N)──→ Assets
Cases ──(1:1)──→ NotaryProcess
Cases ──(1:N)──→ Payments
Cases ──(1:N)──→ Documents
Cases ──(1:N)──→ DocumentChecklist
Cases ──(1:N)──→ ChatMessages
Cases ──(1:1)──→ Consultations

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
