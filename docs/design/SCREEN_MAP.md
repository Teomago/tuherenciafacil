# Mapa de pantallas — tuHerenciaFácil Web App

> Status: definición aprobada — pendiente diseño visual por pantalla
> Last updated: 2026-03-29
> Diagramas: `diagrams/01-prepago.svg`, `02-cliente.svg`, `03-abogado.svg`, `04-mapping.svg`

---

## Resumen ejecutivo

La web app de tuHerenciaFácil tiene **19 pantallas + 1 widget de chat público**, distribuidas en 3 zonas: pre-pago (3), cliente post-pago (7 + chat), y abogado (9 + chat). Estas 19 pantallas se implementan con **12 archivos `page.tsx`** en Next.js App Router, usando renderizado condicional por rol del member autenticado.

---

## Arquitectura de roles

### Modelo de autenticación

La colección `members` en Payload CMS tiene un campo `role` con dos valores posibles: `cliente` y `abogado`. Los `users` de Payload (colección nativa) son exclusivamente para el panel de admin — no interactúan con la web app.

### Modelo de cuenta

Una cuenta por caso, un responsable. El responsable es quien se registra, sube documentos, ve el progreso y coordina con los demás herederos. Los herederos existen como datos dentro del caso (nombre, cédula, parentesco) pero no necesitan cuenta propia.

### Renderizado condicional por rol

Una sola estructura de rutas en Next.js. El layout de `/app` carga el member autenticado y extrae su rol. Cada `page.tsx` importa el componente correspondiente según el rol:

```
if (member.role === 'cliente') → renderiza ClientDashboard
if (member.role === 'abogado') → renderiza LawyerDashboard
```

La única pantalla que bloquea activamente a un rol es `/app/caso/[id]/notaria` — devuelve 403 al cliente.

---

## Estructura de rutas (Next.js App Router)

```
src/app/[locale]/(app)/
  layout.tsx                          ← Auth guard + carga member + extrae rol
  page.tsx                            ← Bienvenida (pre-pago)
  nueva-consulta/page.tsx             ← Formulario de intake (pre-pago)
  pago/page.tsx                       ← Pasarela de pago (pre-pago)
  dashboard/page.tsx                  ← Dashboard (condicional por rol)
  casos/page.tsx                      ← Lista de casos (condicional por rol)
  caso/[id]/
    layout.tsx                        ← Verifica acceso al caso + tabs de navegación
    page.tsx                          ← Vista del caso (condicional por rol)
    herederos/page.tsx                ← Herederos (condicional por rol)
    bienes/page.tsx                   ← Bienes (condicional por rol)
    documentos/page.tsx               ← Documentos (condicional por rol)
    notaria/page.tsx                  ← EXCLUSIVA abogado (403 para cliente)
    pagos/page.tsx                    ← Pagos (condicional por rol)
  chat/page.tsx                       ← Chat (condicional por rol)
```

---

## Seguridad — 3 capas

### Capa 1 — Autenticación
El layout de `(app)` verifica sesión válida. Sin sesión → redirige a login.

### Capa 2 — Autorización por caso
El layout de `caso/[id]` verifica que el member tiene relación con el caso:
- Cliente: `caso.responsable === member.id`
- Abogado: `caso.abogadoAsignado === member.id`
- Sin relación → redirige a `/app/dashboard`

### Capa 3 — Protección de archivos
Los documentos en R2 se sirven con URLs firmadas (signed URLs) que expiran. Un PDF de un registro civil no es accesible con URL directa — solo desde dentro de la app con sesión válida.

---

## Zona 1 — Pre-pago (3 pantallas)

> Diagrama: `diagrams/01-prepago.svg`

Estas pantallas son accesibles después de crear cuenta pero antes de pagar. El flujo es lineal: bienvenida → formulario → pago → caso creado.

### Pantalla 1 · `/app`
**Nombre:** Bienvenida
**Propósito:** Punto de entrada después del login. Si el member ya tiene caso(s) pagado(s), redirige a `/app/dashboard`. Si no tiene casos, muestra la opción de crear uno.
**Contenido:**
- Mensaje de bienvenida personalizado con nombre del member
- CTA principal: "Iniciar proceso de sucesión" → lleva a `/app/nueva-consulta`
- Si hay consultas guardadas como borrador, mostrarlas

### Pantalla 2 · `/app/nueva-consulta`
**Nombre:** Consulta inicial / formulario de intake
**Propósito:** Recolectar los datos mínimos para crear un caso. Esta información se usa para la cotización (cuando se definan los tiers con Paola y Germán).
**Contenido:**
- Datos del solicitante: nombre completo, cédula, teléfono, email, ciudad
- Datos del causante: nombre completo, cédula, fecha de fallecimiento, ciudad de fallecimiento
- Número estimado de herederos
- Bienes conocidos: descripción general (texto libre)
- Relación del solicitante con el causante
- Botón: "Enviar y continuar al pago" → lleva a `/app/pago`
- Botón secundario: "Guardar borrador"

**Pendiente:** Definir con Paola y Germán si esta pantalla funcionará como cotizador automático (precio varía según complejidad) o si habrá precio fijo.

### Pantalla 3 · `/app/pago`
**Nombre:** Pasarela de pago
**Propósito:** Cobrar al cliente para crear el caso. Sin pago no se crea caso, no se abre acceso, no hay proceso.
**Contenido:**
- Resumen de la consulta (datos que llenó en el paso anterior)
- Precio del servicio (placeholder hasta definir tiers)
- Métodos de pago: PSE, tarjeta de crédito/débito, Nequi
- Al pagar exitosamente: se crea el caso con ID único (SUC-YYYY-NNN), se asigna al pool de "sin asignar", se redirige a `/app/dashboard`

**Pendiente:** Integración de pasarela de pago (Wompi recomendado para Colombia).

---

## Zona 2 — Cliente post-pago (7 pantallas + chat)

> Diagrama: `diagrams/02-cliente.svg`

### Pantalla 1 · `/app/dashboard`
**Nombre:** Mi panel
**Propósito:** Punto de entrada principal post-pago. Responde "¿cómo va mi herencia?" en 3 segundos.
**Contenido:**
- Si tiene 1 caso: muestra resumen directo (barra de progreso, fase actual, siguiente paso)
- Si tiene N casos: muestra tarjetas, cada una con nombre del causante, fase actual y progreso porcentual
- Notificaciones recientes: "La abogada aprobó 3 documentos", "Su caso avanzó a fase 5"
- CTA: "Iniciar nuevo caso" → lleva a `/app/nueva-consulta`

### Pantalla 2 · `/app/casos`
**Nombre:** Mis casos
**Propósito:** Lista completa de todos los casos del cliente.
**Contenido:**
- Lista de casos con: nombre del causante, ID del caso, fase actual, progreso %, fecha de último movimiento
- Click en un caso → lleva a `/app/caso/[id]`
- Indicador visual si hay acciones pendientes del cliente (ej: subir documento)

### Pantalla 3 · `/app/caso/[id]`
**Nombre:** Mi proceso
**Propósito:** La pantalla estrella del cliente. Muestra el avance del caso de forma visual y atractiva, como un tracking de pedido.
**Contenido:**
- Timeline visual con las 8 fases en lenguaje humano (no legal):
  - "Registro completado" (no "Fase 0 — Registro")
  - "Reunión inicial y contrato" (no "Fase 1")
  - "Documentos entregados" (no "Fase 2 — Documentos")
  - "Todo verificado y en orden" (no "Fase 3 — Validación")
  - "Tus documentos están en la notaría" (no "Fase 4 — Radicación")
  - "Publicación oficial en curso" (no "Fase 5 — Edictos")
  - "Verificando con entidades del gobierno" (no "Fase 6 — DIAN/UGPP")
  - "Firma de escritura" (no "Fase 7")
  - "Registrado a tu nombre" (no "Fase 8 — Registro")
- Fase actual destacada con descripción de qué está pasando y qué sigue
- Si hay acción requerida del cliente (subir doc, agendar firma), call-to-action directo
- Tarjetas resumen debajo del timeline:
  - Herederos: "5 registrados, 1 con documentos pendientes"
  - Bienes: "3 bienes declarados"
  - Documentos: "8 de 12 completos"
  - Pagos: "$2.500.000 pagados, $1.500.000 pendientes"
- Click en tarjeta → navega a la sección correspondiente con tabs

**Navegación interna:** Desde esta pantalla se accede a las 4 secciones del caso mediante tabs: Herederos, Bienes, Documentos, Pagos.

### Pantalla 4 · `/app/caso/[id]/herederos`
**Nombre:** Herederos
**Propósito:** Registrar y ver a todos los herederos del caso.
**Contenido:**
- Lista de herederos con: nombre completo, cédula, parentesco con el causante, estado de documentos (3/4 completos)
- Botón para agregar heredero
- Soporte para representación: si un heredero original falleció, marcar y agregar sus representantes (hijos)
- Cada heredero expandible para ver sus documentos específicos
- Porcentaje de distribución cuando esté definido por el abogado

### Pantalla 5 · `/app/caso/[id]/bienes`
**Nombre:** Bienes
**Propósito:** Lista de bienes incluidos en la sucesión.
**Contenido:**
- Lista de bienes con: tipo (inmueble, vehículo, financiero, otro), descripción, ubicación
- Estado de documentos por bien (ej: "Certificado de tradición — aprobado")
- Distribución de porcentajes por heredero cuando esté definida
- Botón para declarar un bien adicional

### Pantalla 6 · `/app/caso/[id]/documentos`
**Nombre:** Documentos
**Propósito:** Subir documentos y ver su estado de revisión. Esta es la pantalla más usada después del dashboard.
**Contenido organizado en 3 secciones:**
- **Documentos del causante** (una sola vez): registro civil de defunción, copia de cédula del causante
- **Documentos por heredero** (un bloque por persona): registro civil de nacimiento con notas marginales, copia de cédula
- **Documentos por bien** (un bloque por activo): certificado de tradición y libertad (max 30 días), escritura pública de tradición, tarjeta de propiedad (si vehículo)
- Cada documento con estado: pendiente (no subido), subido (en revisión), aprobado ✓, requiere corrección (con nota del abogado visible)
- Zona de carga: drag & drop o click, acepta PDF/JPG/PNG, máximo 10MB
- Notas del abogado visibles cuando hay corrección requerida

### Pantalla 7 · `/app/caso/[id]/pagos`
**Nombre:** Pagos
**Propósito:** Transparencia financiera del caso.
**Contenido:**
- Historial de pagos realizados: pago inicial (fecha, monto, método), pagos adicionales
- Saldo pendiente (excedente de honorarios cuando se defina)
- Costos notariales y de registro cuando el abogado los registre (derechos notariales, impuesto de registro, boleta fiscal)
- Si la pasarela está integrada: botón "Pagar saldo pendiente"

### Pantalla 8 · `/app/chat`
**Nombre:** Centro de mensajes
**Propósito:** Comunicación unificada con 3 canales en 1 interfaz.
**Contenido:**
- Si tiene varios casos: selector de caso en la parte superior
- 3 canales accesibles desde la misma interfaz:
  - **Bot IA**: disponible 24/7, responde preguntas frecuentes sobre el proceso de sucesión, siempre redirige hacia el proceso activo
  - **Abogado**: chat directo con el abogado asignado al caso, historial persistente (incluso si cambia de abogado)
  - **Soporte**: para temas administrativos (problemas con la plataforma, pagos, etc.)
- Historial completo de cada canal

---

## Zona 3 — Abogado (9 pantallas + chat)

> Diagrama: `diagrams/03-abogado.svg`

### Pantalla 1 · `/app/dashboard`
**Nombre:** Dashboard profesional
**Propósito:** Responde "¿qué está pasando en mi práctica?" y "¿qué tengo que hacer hoy?"
**Contenido:**
- Métricas en tarjetas: casos activos, casos sin asignar en pool, completados este mes, ingresos acumulados
- Acciones pendientes del día: lista priorizada de tareas (ej: "Revisar 3 documentos — Vélez Zapata", "Recoger comprobantes de edictos — Moreno")
- Alertas recientes: "Cliente Vélez subió 3 documentos hace 2 horas", "Caso Ramírez lleva 5 días sin movimiento"
- Link directo a `/app/casos`

### Pantalla 2 · `/app/casos`
**Nombre:** Central de casos
**Propósito:** La vista operativa principal del abogado. Aquí decide qué caso atender.
**Contenido:**
- **Sección superior: pool sin asignar**. Casos nuevos que ningún abogado ha tomado. Cada uno muestra: datos básicos del intake, fecha de pago, complejidad estimada. Botón "Tomar caso" que asigna `abogadoAsignado = member.id`.
- **Sección principal: mis casos**. Ordenados por "necesita mi atención" (lógica: tiene acciones pendientes del abogado primero, luego por progreso descendente). Cada caso muestra: nombre del causante, ID, fase actual, badge de alerta si hay acción pendiente, fecha de última actividad.
- Filtros: por fase (1-8), por estado (activo/completado), por fecha
- Click en un caso → lleva a `/app/caso/[id]`

### Pantalla 3 · `/app/caso/[id]`
**Nombre:** Gestión del caso
**Propósito:** Control total del caso. Desde aquí el abogado mueve el caso por el pipeline.
**Contenido:**
- Vista completa del caso: datos del causante, responsable, herederos, bienes, abogado asignado
- **Controles de fase**: botón "Avanzar a fase N" (con confirmación). El avance de fase genera notificación al cliente.
- **Notas internas**: solo visibles para el abogado. Para documentar observaciones, estrategia, o información que no debe ver el cliente.
- **Notas al cliente**: visibles para el cliente en su vista del caso. Para instrucciones, actualizaciones, o solicitudes.
- **Historial de cambios**: registro de quién hizo qué y cuándo (avances de fase, cambios de datos, documentos subidos/aprobados)
- Tarjetas resumen con acceso a tabs (herederos, bienes, documentos, pagos, notaría)

### Pantalla 4 · `/app/caso/[id]/herederos`
**Nombre:** Herederos (edición completa)
**Propósito:** El abogado tiene control total sobre los datos de herederos.
**Contenido:**
- Todo lo que ve el cliente, más:
- Editar datos de cualquier heredero (corregir nombres, cédulas, parentescos)
- Agregar herederos por representación con jerarquía (heredero original → representantes)
- Marcar conflictos entre herederos (nota interna)
- Definir porcentajes de distribución por heredero

### Pantalla 5 · `/app/caso/[id]/bienes`
**Nombre:** Bienes (edición completa)
**Propósito:** Gestión profesional de los bienes del caso.
**Contenido:**
- Todo lo que ve el cliente, más:
- Agregar bienes encontrados en la investigación de bienes
- Registrar hallazgos jurídicos: hipotecas, embargos, gravámenes
- Registrar la investigación de bienes ($150.000): estado (solicitada → en proceso → recibida), resultado subido como PDF
- Definir distribución de porcentajes por bien y heredero

### Pantalla 6 · `/app/caso/[id]/documentos`
**Nombre:** Documentos (revisión)
**Propósito:** Revisar lo que el cliente subió y gestionar documentos propios del abogado.
**Contenido:**
- Todo lo que ve el cliente, más:
- Botones de acción por documento: **Aprobar**, **Rechazar con nota** (la nota es visible para el cliente), **Solicitar adicional**
- Subir documentos propios del abogado: escritos a la notaría, autorización de edictos, edicto firmado, escritura pública final
- Marcar visibilidad: "Visible para el cliente" o "Solo interno"
- Solicitar documentos adicionales que no estaban en el checklist original

### Pantalla 7 · `/app/caso/[id]/notaria` ⚠️ EXCLUSIVA ABOGADO
**Nombre:** Proceso notarial
**Propósito:** Tracking completo de todo lo que pasa en la notaría. El cliente NO tiene acceso a esta pantalla (403). La información relevante le llega al cliente a través del timeline en "Mi proceso".
**Contenido:**
- **Radicación**: notaría, notario, fecha de radicación, número de radicado. Subir escritos radicados (PDF).
- **Respuesta del notario**: estado (aprobado sin observaciones / requiere documentos adicionales / requiere correcciones / pendiente de revisión). Fecha de respuesta. Detalle de lo solicitado.
- **Autorización de edictos**: fecha de recepción, subir autorización (PDF).
- **Edictos**: medio de publicación (ej: La República), fecha de publicación, costo, cálculo automático de vencimiento (10 días hábiles excluyendo fines de semana y festivos colombianos). Subir edicto y comprobante de publicación.
- **Comprobantes entregados**: fecha de entrega a la notaría.
- **Validación DIAN/UGPP**: fecha de inicio, estado (en validación / aprobado / hallazgos DIAN / hallazgos UGPP). Detalle de hallazgos si aplica.
- **Firma de escritura**: fecha y hora de firma, lugar. Costos notariales: derechos notariales, impuesto de registro, boleta fiscal (estos se reflejan automáticamente en la pantalla de Pagos del cliente).
- **Registro**: fecha de salida de escritura para registro, estado (en registro / registrada), fecha de registro en folio de matrícula. Subir certificado de tradición actualizado.

### Pantalla 8 · `/app/caso/[id]/pagos`
**Nombre:** Pagos del caso
**Propósito:** Gestión financiera del caso desde el lado del abogado.
**Contenido:**
- Registrar pagos recibidos: anticipo (monto, fecha, método), excedente (monto, fecha, método)
- Registrar costos del proceso: investigación de bienes ($150.000), publicación de edictos, gastos notariales
- Balance del caso: total cobrado vs total pagado vs pendiente
- Notas internas sobre acuerdos de pago

### Pantalla 9 · `/app/chat`
**Nombre:** Bandeja de mensajes
**Propósito:** Central de comunicación con todos los clientes.
**Contenido:**
- Lista de conversaciones agrupadas por caso
- Ve lo que el bot de IA respondió antes de la escalación (contexto completo)
- Historial persiste al reasignar: si un abogado anterior gestionó el caso, el nuevo abogado ve todo el historial
- Indicadores de mensajes sin leer por caso

---

## Widget público — Chat IA en marketing

**Ubicación:** Flotante en la esquina de la landing page (sitio de marketing gestionado por Payload CMS)
**Acceso:** Sin registro, sin autenticación
**Propósito:** Gancho de conversión. Responde dudas sobre sucesiones para generar confianza y redirigir a la creación de cuenta.
**Alcance:**
- Responde SOLO preguntas relacionadas con sucesiones en Colombia
- Si preguntan algo fuera de alcance → respuesta amigable redirigiendo al tema
- Cada respuesta incluye un CTA sutil: "¿Quieres que un abogado te asesore personalmente?"
- Sin historial persistente (sesión efímera)
- Respuestas más cortas y simples que el chat autenticado

---

## Notificaciones por email (SMTP2GO)

### Triggers para el cliente (5)
1. Documento aprobado o rechazado por el abogado
2. Caso avanzó de fase
3. Costos notariales definidos
4. Mensaje del abogado en el chat
5. Caso marcado como completado

### Triggers para el abogado (5)
1. Cliente subió documentos nuevos
2. Caso lleva más de N días sin movimiento
3. Plazo de edictos por vencer
4. Mensaje del cliente en el chat
5. Nuevo caso en el pool sin asignar

---

## Asignación y reasignación de abogados

### Asignación
- Al pagar, el caso se crea con `abogadoAsignado: null` (pool sin asignar)
- En `/app/casos`, el abogado ve la sección "Sin asignar" y puede tomar un caso con botón "Tomar caso"
- `Tomar caso` = `caso.abogadoAsignado = member.id`

### Reasignación
- Cambiar el abogado de un caso se hace desde el panel de admin de Payload (`/admin`)
- El campo `abogadoAsignado` se cambia a otro member con role `abogado`
- El historial de chat se mantiene intacto
- El nuevo abogado ve todo el contexto previo (chat, documentos, notas internas)
- El cliente ve un cambio en el nombre del abogado pero la experiencia es continua

---

## Modelo de datos del caso (estructura conceptual)

```
Caso
├── ID (SUC-YYYY-NNN)
├── estado (activo / completado)
├── faseActual (0-8)
├── responsable → Member (cliente que creó el caso)
├── abogadoAsignado → Member (abogado) | null
├── Causante
│   ├── nombre, cédula
│   ├── fechaFallecimiento, ciudadFallecimiento
│   └── documentos[] (defunción, cédula)
├── Herederos[]
│   ├── nombre, cédula, parentesco
│   ├── esRepresentante (boolean)
│   ├── herederoOriginal → Heredero | null
│   ├── porcentajeDistribución
│   └── documentos[] (nacimiento, cédula)
├── Bienes[]
│   ├── tipo (inmueble/vehículo/financiero/otro)
│   ├── descripción, ubicación
│   ├── hallazgosJurídicos (texto)
│   └── documentos[] (tradición, escritura, tarjeta propiedad)
├── ProcesoNotarial
│   ├── notaría, notario
│   ├── radicación (fecha, número)
│   ├── edictos (fecha publicación, medio, costo, fechaVencimiento)
│   ├── validaciónDIAN (estado, hallazgos)
│   ├── validaciónUGPP (estado, hallazgos)
│   └── firma (fecha, hora, lugar, costos)
├── Pagos[]
│   ├── tipo (anticipo/excedente/edictos/notariales)
│   ├── monto, fecha, método
│   └── registradoPor → Member
├── Chat
│   └── mensajes[] (autor, canal, timestamp, contenido)
└── Historial[]
    ├── acción, fecha
    ├── realizadoPor → Member
    └── detalles
```

---

## Paleta de colores

### Azul corporativo
| Token | Hex | Uso |
|---|---|---|
| Corporativo | #002845 | Texto, headers |
| Corporativo medio | #004A80 | Hover, links activos |
| Corporativo claro | #D6E8F5 | Fondos info, tags |
| Corporativo tinte | #EDF5FB | Fondos de sección |

### Azul tecnológico
| Token | Hex | Uso |
|---|---|---|
| Tecnológico | #3A8DA8 | CTAs, botones |
| Tecnológico oscuro | #2A6880 | Hover de botón, énfasis |
| Tecnológico suave | #7BBDD0 | Íconos, subtítulos |
| Tecnológico tinte | #EBF5FA | Botón secundario, chips |

### Naranja acento
| Token | Hex | Uso |
|---|---|---|
| Naranja | #FF8C3C | Alertas, urgencia |
| Naranja oscuro | #CC6010 | Texto sobre tinte, énfasis |
| Naranja suave | #FFB87A | Íconos de alerta, badges |
| Naranja tinte | #FFF4EC | Fondo de alertas, banners |

**Pendiente:** Confirmar naranja (#FF8C3C) y texto secundario (#5A8CA8) con diseñador.

---

## Decisiones pendientes

- [ ] Tiers de precio y cotización automática — reunión con Paola y Germán
- [ ] Pasarela de pago — RFC de Wompi (PSE + tarjeta + Nequi)
- [ ] Días festivos colombianos — para cálculo automático de plazo de edictos
- [ ] Confirmar colores naranja y texto secundario con diseñador
- [ ] Chat IA — modelo, alcance exacto de respuestas, costo por mensaje
- [ ] Facturación electrónica — ¿necesaria en v1 o solo registro de pagos?

---

## Próximo paso

Diseño visual pantalla por pantalla con la paleta de colores definida. Empezar por las 3 pantallas que más se van a usar: `/app/caso/[id]` (mi proceso), `/app/caso/[id]/documentos`, y `/app/dashboard`.
