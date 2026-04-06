# Mapa de pantallas — tuHerenciaFácil Web App

> Status: definición aprobada — pendiente diseño visual por pantalla
> Last updated: 2026-03-29
> Diagramas: `diagrams/01-prepago.svg`, `02-cliente.svg`, `03-abogado.svg`, `04-mapping.svg`

---

## Resumen ejecutivo

La web app de tuHerenciaFácil tiene **21 pantallas + 1 widget de chat público + 1 Portal de Transparencia**, distribuidas en 3 zonas: pre-pago (5), cliente post-pago (7 + chat), y abogado (9 + chat). Estas pantallas se implementan con **14 archivos `page.tsx`** en Next.js App Router, usando renderizado condicional por rol del member autenticado. El Portal de Transparencia vive en el sitio de marketing (fuera del app).

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
  consulta/
    page.tsx                          ← Agenda tu consulta (pre-pago)
    pago/page.tsx                     ← Pago de la cita de consulta (pre-pago)
  nueva-consulta/page.tsx             ← Formulario de apertura del caso (pre-pago)
  pago/page.tsx                       ← Pago del paquete (pre-pago)
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

**Nota sobre la ruta base:** La ruta actual en código es `[locale]/(herencia)/herencia/`. La estructura documentada aquí usa `[locale]/(app)/` como grupo de rutas. Esta discrepancia debe resolverse en DEC-007 antes de implementar las pantallas.

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

## Zona 1 — Pre-pago (5 pantallas)

> Diagrama: `diagrams/01-prepago.svg`

Estas pantallas son accesibles después de crear cuenta pero antes de pagar el paquete de servicio. El flujo completo incluye una consulta previa con Paola, que genera un crédito aplicable al paquete.

**Flujo completo:** Bienvenida → Consulta → Pago de consulta → Formulario de apertura → Pago del paquete → Caso creado.

**Principio de diseño:** Cada paso debe ser completable por cualquier persona, incluyendo adultos mayores con poca experiencia digital. Cada pantalla tiene: título claro, instrucciones en lenguaje cotidiano (no legal), tooltips o notas de Paola donde se necesite contexto, y un único CTA principal visible. No hay opciones ambiguas.

### Pantalla 1 · `/app`
**Nombre:** Bienvenida + Filtro de Elegibilidad
**Propósito:** Punto de entrada después del login. Antes de mostrar cualquier CTA, el sistema verifica si el caso del cliente es elegible para el servicio. Esta es la pantalla más crítica para el embudo — un cliente que no cumple los requisitos debe saberlo antes de pagar.

**Lógica de redirección:**
- Si ya tiene caso(s) pagado(s) → redirige automáticamente a `/app/dashboard`
- Si tiene consulta pagada pendiente → muestra CTA "Abrir mi proceso"
- Si no tiene nada → muestra el filtro de elegibilidad (ver abajo)

**Contenido — Filtro de Elegibilidad (DEC-003):**

Antes de mostrar el botón para agendar consulta, la pantalla hace DOS preguntas secuenciales en lenguaje simple:

**Paso A — ¿Quién falleció?**
- "¿La persona que falleció dejó un testamento?"
  - No, no dejó testamento → ✅ puede continuar
  - Sí, dejó testamento → pantalla de "No es nuestro servicio" (ver abajo)
  - No sé / No estoy seguro → ✅ puede continuar (Paola evaluará en consulta)

**Paso B — ¿Están todos de acuerdo?**
- "¿Sabes si todos los herederos están de acuerdo en hacer la sucesión juntos?"
  - Sí, todos están de acuerdo → ✅ puede continuar → CTA "Agenda tu consulta"
  - No, hay conflicto entre herederos → pantalla "Caso contencioso — no es nuestro servicio"
  - No estoy seguro → ✅ puede continuar con banner de advertencia para Paola

**Pantalla de "Fuera de nuestro alcance" — Caso con testamento:**
Si el cliente indica que hay testamento:
- "Si el causante dejó testamento, la distribución de la herencia ya está establecida en ese documento. Nuestro servicio está diseñado para casos sin testamento. Te recomendamos acudir directamente a una notaría para el proceso de protocolización del testamento."
- Botón: "Entendido" → vuelve a `/app`
- El cliente puede corregir si se equivocó al responder

**Pantalla de "Retención" — Caso con conflicto entre herederos:**
Si el cliente indica que no todos están de acuerdo (conflicto), NO se le cierra la puerta. En cambio se le ofrece una ruta de mediación (idea de Germán y Paola, 2026-04-05):

- Mensaje empático: "Entendemos que estas situaciones son difíciles. Nuestro proceso notarial requiere que todos los herederos estén de acuerdo para poder avanzar."
- Pregunta: "¿Crees que sería posible que los herederos pudieran llegar a un acuerdo?"
- **Opción A:** "Sí, creo que podría lograrse" → CTA: "Agenda una reunión de mediación con la abogada" → lleva a `/app/consulta` con tipo `mediacion_*` preseleccionado
  - Nota visible: "En esta reunión, Paola analizará la situación y buscará un camino que funcione para toda la familia. La reunión tiene el mismo costo que una consulta regular."
  - Si la mediación resulta exitosa (`acuerdoAlcanzado: true`), Paola puede activar el proceso normal desde el admin
- **Opción B:** "No es posible en este momento" → Información útil:
  - "En ese caso, la sucesión debe tramitarse ante un juzgado civil — un proceso diferente al nuestro. Recomendamos buscar un abogado especialista en litigios sucesorales."
  - Botón: "Entendido" → vuelve a `/app`
- Botón secundario en ambas opciones: "Me equivoqué — volver a responder"

**Nota de diseño:** La pantalla de retención es la diferencia entre perder un cliente y convertir un rechazo en una oportunidad de servicio. El tono debe ser cálido, nunca frío ni burocrático.

**Resto del contenido (si pasó el filtro):**
- Mensaje de bienvenida: "Hola, {nombre}. ¡Podemos ayudarte!"
- CTA principal: "Agenda tu consulta con la abogada" → lleva a `/app/consulta`
- Si hay un borrador de intake guardado: "Tienes un formulario guardado — continuar"
- Sección informativa breve: "¿Cómo funciona?" — 3 pasos en lenguaje simple

### Pantalla 2 · `/app/consulta`
**Nombre:** Agenda tu consulta
**Propósito:** El cliente elige el tipo de consulta y procede al pago. La consulta con Paola es el primer paso para entender el caso y recibir la cotización del paquete.
**Contenido:**
- Explicación breve: "Antes de iniciar, Paola revisará tu caso en una consulta de 30-45 minutos y te dará la estrategia y el costo exacto del proceso."
- Tarjeta: **Consulta Virtual — $70.000 COP**
  - Descripción: "Por videollamada desde tu casa. Recibirás un link de Google Meet."
  - Disponibilidad: horarios próximos disponibles
- Tarjeta: **Consulta Presencial — $100.000 COP**
  - Descripción: "En la oficina de Paola en {ciudad}. Paola te confirmará la dirección."
- Nota informativa: "El valor de esta consulta se descuenta automáticamente del paquete si decides continuar."
- CTA principal: "Continuar al pago" (activo solo cuando se selecciona un tipo)

### Pantalla 3 · `/app/consulta/pago`
**Nombre:** Pago de consulta
**Propósito:** Procesar el pago de la cita de asesoría.
**Contenido:**
- Resumen: tipo de consulta elegida + monto
- Métodos de pago: PSE, tarjeta de crédito/débito, Nequi
- Nota: "Al pagar, recibirás un correo de confirmación. Paola se contactará contigo para confirmar la fecha y hora."
- Al pagar exitosamente: crea `Appointment` con `status: 'pagada'`, genera email de confirmación, redirige a `/app` con mensaje "¡Listo! Paola se comunicará contigo para agendar la cita."

**Nota técnica:** El crédito se aplica automáticamente cuando el cliente abre el caso — no es necesario que el cliente lo gestione.

### Pantalla 4 · `/app/nueva-consulta`
**Nombre:** Abre tu caso
**Propósito:** Recolectar los datos del causante para crear el caso. Esta pantalla es accesible después de haber tenido la consulta con Paola (o directamente si Paola lo autorizó). Se diseña para que cualquier persona pueda llenarlo sin asistencia.
**Contenido:**
- Indicador de progreso: paso 1 de 2 ("Datos del proceso")
- **Sección 1 — ¿Quién falleció?**
  - Nombre completo del causante
  - Número de cédula
  - Fecha de fallecimiento (selector de fecha — no campo de texto libre)
  - Ciudad donde falleció
  - Tooltip: "¿Para qué necesitamos esto? Con estos datos identificamos el caso ante la notaría y las entidades del Estado."
- **Sección 2 — ¿Quiénes son los herederos?**
  - Tu relación con el causante (selector: hijo/a, hermano/a, cónyuge, etc.)
  - Número estimado de herederos (incluye usted) — selector numérico simple
  - Tooltip: "No tiene que ser exacto en este punto. La abogada verificará esta información."
- **Sección 3 — ¿Qué dejó?**
  - Descripción de bienes conocidos (campo de texto con placeholder guiado: "Ej: 1 apartamento en Bogotá, 1 carro marca Renault, una cuenta de ahorros en Bancolombia...")
  - Tooltip: "No importa si no sabe todos los detalles ahora. Puede agregar más información después de abrir el caso."
- **Selector de paquete:**
  - Tarjeta: **Estándar — $4.500.000 COP**
    - Incluye: elaboración de escritos, gestión notarial, acompañamiento hasta la firma de escritura
    - No incluye: investigación de bienes, recogida de documentos, registro en Instrumentos Públicos
    - Nota de investigación: "Si necesitas investigar vehículos o cuentas bancarias, podemos hacerlo por $150.000 adicionales."
  - Tarjeta: **Premium — $X.XXX.000 COP**
    - Incluye todo lo del Estándar más: investigación de bienes (incluida), recogida de paquetería, obtención de documentos, entrega de escritura registrada en tu domicilio, trámite de registro en Supernotariado
    - La investigación de bienes está incluida sin costo adicional
  - Tarjeta: **Elite — Cotización personalizada** (solo aparece si Paola lo habilitó — ver /admin)
    - "Paola ya habrá discutido este paquete contigo en la consulta."
  - Si el cliente tuvo consulta previa con crédito autorizado por Paola: banner verde visible "Tienes un crédito de $70.000 que se descontará automáticamente de tu primer pago."
- Botón: "Continuar al pago" → lleva a `/app/pago`
- Botón secundario: "Guardar y continuar después"

### Pantalla 5 · `/app/pago`
**Nombre:** Pago del paquete
**Propósito:** Confirmar el pago para crear el caso. Sin este paso no existe el caso, no se abre acceso al proceso.
**Contenido:**
- **Resumen del paquete:**
  - Nombre del causante
  - Paquete elegido y descripción de lo que incluye
  - Precio base del paquete
  - Si aplica: "Crédito por consulta previa: -$70.000" (deducción visible)
  - **Total a pagar hoy** (primera cuota según el tier: 50% Estándar, 40% Premium)
  - Nota: "El resto se paga en hitos del proceso. Te avisaremos con anticipación."
- Métodos de pago: PSE, tarjeta de crédito/débito, Nequi
- Al pagar exitosamente:
  - Se crea el caso con ID único (SUC-YYYY-NNN)
  - Se aplica el crédito de consulta si existe
  - El caso entra al pool de "sin asignar"
  - Redirige a `/app/dashboard` con mensaje de bienvenida al proceso

**Pendiente (DEC-005):** Integración con Wompi (webhooks, manejo de estados y reintentos).

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
  - "Registro completado" (Fase 0)
  - "Reunión inicial y firma de contrato" (Fase 1)
  - "Documentos cargados y en revisión" (Fase 2)
  - "Todo verificado y subsanado" (Fase 3)
  - "Tus documentos están en la notaría (Radicación)" (Fase 4)
  - "Publicación de edictos en curso (10 días hábiles)" (Fase 5)
  - "Verificación con DIAN y UGPP (Aprox. 3 semanas)" (Fase 6)
  - "Firma de escritura pública y pago de gastos" (Fase 7)
  - "Registrado en el folio de matrícula inmobiliaria" (Fase 8)
- Fase actual destacada con descripción de qué está pasando y qué sigue
- Registro de Gestión Física: Ver en tiempo real qué está haciendo el abogado (ej: "En la notaría recogiendo autorización de edictos")
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
**Propósito:** Transparencia financiera del caso — el cliente sabe exactamente cuánto ha pagado, cuánto debe, y cuánto necesita tener disponible para la firma. La pantalla muestra lo necesario sin entrar en desglose operativo interno.

**Política de visibilidad (acordada con Paola):**
- El cliente ve: cuotas del paquete, crédito por consulta previa, costos de terceros (notariales, edictos), investigación de bienes (solo Estándar si se solicitó)
- El cliente NO ve: desglose interno de los $500k de gastos operativos. Aparece como una sola línea: "Gastos operativos del proceso — incluidos en tu paquete"
- Razón: el desglose interno puede generar expectativas de devolución de excedentes, lo cual no aplica en el modelo de negocio

**Contenido:**
- **Resumen general:** total del paquete, pagado hasta hoy, pendiente — visible siempre en la parte superior
- **Historial de pagos realizados:**
  - "Primera cuota — 50% del paquete" — fecha, monto, método
  - "Crédito por consulta previa" — monto negativo si aplica
  - Las siguientes cuotas con sus fechas reales de pago
- **Próximo pago:** fecha estimada y monto del siguiente hito con descripción clara ("Segunda cuota — al confirmar la publicación de edictos")
- **Costos notariales** — solo aparecen cuando la abogada los registra. Título: "Gastos que debes pagar directamente en la notaría":
  - Derechos notariales: $X
  - Impuesto de registro: $X
  - Boleta fiscal: $X
  - Nota: "Estos valores son pagados por ti directamente en la notaría el día de la firma — no pasan por tuHerenciaFácil."
- **Investigación de bienes** (solo si Estándar y se solicitó): $150.000 — fecha, estado
- Si la pasarela está integrada: botón "Pagar cuota pendiente"
- **Calculadora de Gastos Notariales:**
  - Sección informativa: "Para saber cuánto necesitarás tener disponible el día de la firma, consulta la calculadora de gastos notariales."
  - Enlace: [Calcular mis gastos notariales →] (Notaría 19 de Bogotá)
  - Aclaración: "Esta calculadora es orientativa basada en el valor de los bienes. El valor exacto lo confirma la notaría asignada a tu caso."

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

**Tiempos de referencia (para el abogado):**
- Elaboración de escritos: ~2 semanas desde que todos los documentos están aprobados
- Revisión notarial: 15 días hábiles desde la radicación
- Ciclo de respuesta: VoBo (pasa a edictos) ó Devolución (requiere corrección de escritos y nueva radicación)

**Contenido:**
- **Elaboración de escritos** (nueva sección antes de radicación):
  - Fecha de inicio de elaboración
  - Fecha estimada de entrega a notaría (auto-calculada: fecha inicio + 14 días)
  - Notas internas sobre el proceso de redacción
- **Radicación**: notaría, notario, fecha de radicación, número de radicado. Subir escritos radicados (PDF). Fecha límite de respuesta del notario (auto-calculada: fecha radicación + 15 días hábiles).
- **Respuesta del notario**: estado con 2 caminos:
  - ✅ **VoBo (aprobado)**: pasa automáticamente a sección de edictos
  - 🔄 **Devolución (correcciones)**: detalle de lo solicitado, fecha de devolución. Subir correcciones y registrar nueva fecha de radicación (ciclo puede repetirse N veces). El sistema lleva registro de todos los ciclos.
- **Autorización de edictos**: fecha de recepción, subir autorización (PDF).
- **Edictos**: medio de publicación (ej: La República), fecha de publicación, costo, cálculo automático de vencimiento (10 días hábiles excluyendo fines de semana y festivos colombianos). Subir edicto y comprobante de publicación.
- **Comprobantes entregados**: fecha de entrega a la notaría.
- **Validación DIAN/UGPP**: fecha de inicio, estado (en validación / aprobado / hallazgos DIAN / hallazgos UGPP). Detalle de hallazgos si aplica. Tiempo estimado: ~3 semanas.
- **Firma de escritura**: fecha y hora de firma, lugar. Costos notariales: derechos notariales, impuesto de registro, boleta fiscal (estos se reflejan automáticamente en la pantalla de Pagos del cliente).
- **Registro** (solo tiers Premium y Elite): fecha de salida de escritura para registro, estado (en registro / registrada), fecha de registro en folio de matrícula. Subir certificado de tradición actualizado.

### Pantalla 8 · `/app/caso/[id]/pagos`
**Nombre:** Pagos del caso (abogado)
**Propósito:** Gestión financiera completa desde el lado del abogado. Ve todo — incluyendo lo que el cliente no ve.
**Contenido:**
- **Balance completo del caso:** total facturado, recibido, pendiente, créditos aplicados
- **Registrar pago recibido:** monto, fecha, método, tipo (anticipo/excedente), con opción de marcarlo como no visible para el cliente
- **Registrar costos de terceros:** investigación de bienes, edictos, gastos notariales (estos SÍ son visibles para el cliente automáticamente)
- **Gastos operativos internos:** el abogado puede registrar gastos internos del $500k (papelería, transporte, etc.) como pagos con `visibleParaCliente: false` — para control interno sin exposición al cliente
- **Balance interno:** desglose completo que incluye los registros no visibles — útil para Paola para saber cuánto del $500k ha consumido
- **Autorizar crédito de consulta:** si el cliente tuvo una consulta previa y Paola decide autorizar el descuento, hay un CTA directo desde aquí hacia el Appointment correspondiente
- **Notas internas sobre acuerdos de pago**

### Pantalla 9 · `/app/chat`
**Nombre:** Bandeja de mensajes
**Propósito:** Central de comunicación con todos los clientes.
**Contenido:**
- Lista de conversaciones agrupadas por caso
- Ve lo que el bot de IA respondió antes de la escalación (contexto completo)
- Historial persiste al reasignar: si un abogado anterior gestionó el caso, el nuevo abogado ve todo el historial
- Indicadores de mensajes sin leer por caso

---

## Fase 8 — Comportamiento Condicional por Tier (DEC-004)

La Fase 8 (Registro en folio de matrícula) no es igual para todos los tiers:

| Tier | Comportamiento Fase 7 → Fin |
|---|---|
| **Estándar** | Al firmar la escritura, el sistema cierra el caso y envía un "Email de Finalización" al cliente. La Fase 8 no existe en el tracker. El cliente gestiona el registro en Instrumentos Públicos por su cuenta. |
| **Premium** | El caso avanza a Fase 8. El tracker continúa mostrando: "Tu escritura está siendo registrada". La abogada hace el trámite y carga el Certificado de Tradición actualizado. El caso se cierra solo cuando el registro está confirmado. |
| **Elite** | Igual que Premium. |

**En la pantalla del cliente (Zona 2, Pantalla 3):** el timeline se adapta dinámicamente al tier del caso — los clientes Estándar ven 7 fases, los clientes Premium/Elite ven 8.

---

## Portal de Transparencia Pública — Buscador de Casos

**Ubicación:** Sitio de marketing (gestionado por Germán en Payload CMS) — NO en la web app del cliente
**Acceso:** Sin autenticación — cualquier persona puede buscar
**Propósito:** Equivalente al buscador de procesos del gobierno colombiano. Permite a la familia del causante verificar que el proceso existe y en qué estado está, sin necesidad de crear cuenta ni tener acceso al caso completo.

**Funcionamiento:**
- Campo de búsqueda por nombre del causante
- Resultados muestran: ID del caso (SUC-YYYY-NNN), nombre del causante, ciudad de fallecimiento, fase actual en lenguaje humano, estado (activo/completado), mes estimado de finalización
- Resultados NO muestran: nombre del responsable, herederos, activos, montos, documentos, nombre del abogado

**Implementación técnica:**
- El sitio de marketing consume el endpoint `GET /api/public/cases/search?q={nombre}` del app (ver COLLECTIONS.md)
- Rate limit: 10 consultas por IP por minuto
- No requiere sesión ni token

**Nota para Germán:** El diseño visual del buscador y su integración en el sitio de marketing (layout, posición, estilos) es responsabilidad del área de marketing. El endpoint de API está definido y disponible.

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
- **Filtro de elegibilidad integrado en el bot (idea de Germán, 2026-04-05):** El bot conoce las dos preguntas clave y puede pre-calificar al usuario antes de que cree cuenta:
  - Si detecta que hay testamento → explica que no es el servicio indicado y qué debe hacer
  - Si detecta conflicto entre herederos → explica la ruta de mediación y ofrece agendar una reunión
  - Si el caso es elegible → redirige al registro con CTA claro

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

- [x] ~~Tiers de precio~~ — resuelto en DEC-004 (Estándar / Premium / Elite con precios y hitos)
- [x] ~~Bloqueo por Poder~~ — resuelto en DEC-002 (bloqueo estricto, Gate en Fase 3→4)
- [ ] **Pasarela de pago (DEC-005)** — RFC de Wompi (PSE + tarjeta + Nequi + webhooks + manejo de reintentos)
- [ ] **Testada vs Intestada (DEC-003)** — ¿Se pregunta el tipo de sucesión desde el intake? Afecta el checklist (testamento requerido solo en testadas). Paola debe confirmar.
- [ ] **Estructura de rutas (DEC-007)** — La ruta actual `/[locale]/(herencia)/herencia/` debe alinearse con el diseño documentado antes de implementar las 12 pantallas
- [ ] **Cargos dinámicos Elite (DEC-008)** — Arquitectura de la pantalla para que Paola genere cargos mid-proceso con cuotas variables
- [ ] **Link de seguimiento familiar (DEC-003)** — ¿Puede el responsable compartir un link de solo lectura a los demás herederos?
- [ ] Confirmar colores naranja y texto secundario con diseñador
- [ ] Chat IA (DEC-006) — modelo, alcance exacto de respuestas, límite de tokens, costo por mensaje
- [ ] Días festivos colombianos — cálculo para vencimiento de edictos (Ley Emiliani)
- [ ] Facturación electrónica — ¿necesaria en v1 o solo registro de pagos?

---

## Próximo paso

Diseño visual pantalla por pantalla con la paleta de colores definida. Empezar por las 3 pantallas que más se van a usar: `/app/caso/[id]` (mi proceso), `/app/caso/[id]/documentos`, y `/app/dashboard`.
