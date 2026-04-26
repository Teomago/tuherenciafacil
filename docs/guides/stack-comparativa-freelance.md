# Stack moderno vs. WordPress (y otros CMS): guía para clientes y colaboradores

> **Propósito:** Explicar, con honestidad técnica, por qué un producto basado en **un solo código (monorepo)** con **Next.js + Payload CMS** y servicios **serverless de uso medido** (Neon, Cloudflare R2, SMTP2GO, Vercel) puede ser **más barato de operar**, **más fácil de mantener** y **más libre** que el ecosistema típico centrado en WordPress (y que varias alternativas “todo en uno”).  
> **Visual:** La arquitectura resumida está en `docs/TECHNICAL_STACK.md` y el diagrama en `docs/design/stack-architecture.html`.

---

## 1. Qué problema resolvemos

Muchos negocios llegan a la web con una fórmula repetida:

- **WordPress** como base.
- **Constructores visuales** (p. ej. **Elementor**, **Divi**) para maquetar sin tocar código.
- **Hosting** mensual.
- **Plugins** para formularios, SEO, copias de seguridad, multilenguaje, membresías, etc.

Eso funciona para muchos casos, pero tiene costes ocultos:

| Área | Lo que suele pasar |
|------|---------------------|
| **Dinero** | Plugins “pro”, temas premium y hosting gestionado se suman; el sitio **cuesta antes** de que exista una sola funcionalidad a medida. |
| **Complejidad** | Cada plugin es **un proveedor más**, actualizaciones encadenadas y conflictos (PHP, JS del editor, caché). |
| **Libertad** | Lo que el plugin **permite**, es lo que puedes hacer; el resto es parche o plugin de terceros. |
| **Mantenimiento** | El “equipo” del sitio es en realidad **una bolsa de plugins**; depurar errores es más lento y más frágil. |

La propuesta aquí no es “odiamos WordPress”, sino: **para productos y sitios que van a crecer con lógica de negocio, datos y reglas claras**, conviene un stack donde **el código es la fuente de verdad**, versionado en Git, con **un solo runtime principal** (Node/Next) y un **CMS que vive en el mismo repositorio**.

---

## 2. Con qué se compara este stack (visión de mercado)

### 2.1 WordPress + Elementor / Divi (y similares)

- **Fortalezas:** rapidez para landing pages, ecosistema enorme, perfiles no técnicos pueden editar mucho contenido.
- **Debilidades para producto serio:** la lógica de negocio compleja (roles, estados, integraciones, colas) suele terminar en **plugins**, plantillas y *hooks* PHP difíciles de testear; la deuda técnica crece con cada “parche”.

### 2.2 CMS “SaaS” o sitios cerrados (nombre propios: Webflow, Wix, etc.)

- **Fortalezas:** experiencia visual fuerte, hosting incluido, menos preocupación por servidores.
- **Debilidades:** límites de **exportación**, modelo de precios por sitio/tráfico/funciones, y a veces **cielos rígidos** para lógica custom avanzada (o cuesta más integrarla).

### 2.3 Headless CMS puro + frontend aparte

- **Fortalezas:** API clara, el front puede ser React/Next/Vue/etc.
- **Debilidades operativas:** siguen siendo **dos codebases o dos despliegues** si no se unifica el flujo; más superficie de coordinación.

### 2.4 Esta propuesta: **Next.js + Payload CMS en un solo monorepo**

- **Next.js:** app web (marketing, app autenticada, API routes según diseño) y despliegue moderno.
- **Payload CMS:** administración, modelos de datos, hooks de negocio, acceso y API **en el mismo proyecto TypeScript** que el resto del sitio ([Payload](https://payloadcms.com/) es *code-first*: el esquema vive en código).
- **Un solo repositorio:** front, back y CMS comparten tipos (`payload-types`), convenciones y revisiones; no hay “sitio PHP” separado de “front React” que diverjan con el tiempo.

Eso es lo que en la práctica **sustituye** al combo WordPress + page builder para proyectos donde el socio busca **libertad y coste acorde al uso**, sin renunciar a un panel profesional.

---

## 3. No partimos de la página en blanco: bloques, layouts y trabajo previo

En este modelo **no se “inventa la web desde cero”** cada vez. El desarrollador define **una biblioteca de bloques** (desde piezas básicas hasta composiciones avanzadas) usando el sistema de **Blocks** de Payload: un campo que guarda una lista de objetos, cada uno con su propio esquema, combinable en cualquier orden — el mismo patrón que la documentación oficial describe para **page builders** (`Quote`, `CallToAction`, `Slider`, `Gallery`, etc.; ver *Blocks Field* en la docs de Payload).

Eso significa para el cliente:

- **Consistencia de marca:** los bloques disponibles son los que el proyecto permite; no hay mil plantillas contradictorias como en algunos entornos de solo plugins.
- **Velocidad:** nuevas páginas se arman **reutilizando piezas probadas**, no rediseñando desde cero.
- **Evolutivo:** cuando hace falta un bloque nuevo, se añade **en código**, con revisión y pruebas — no como parche opaco en producción.

En resumen: **se construye sobre una base conocida y gobernada**, no sobre un vacío técnico.

---

## 4. Payload CMS: características que importan (según la documentación oficial)

> **Fuente consultada:** documentación oficial de Payload ([payloadcms.com/docs](https://payloadcms.com/docs)).  
> En entornos de desarrollo del proyecto suele existir además un **espejo local** en `.agents/context/Payloadcms/docs/` (esa ruta puede estar en `.gitignore`; si no tienes la copia, usa la web oficial).

### 4.1 Panel de administración integrado

Payload **genera un Admin Panel** alineado con el modelo de datos, en **React** (App Router de Next.js), **tipado**, traducible a **más de 30 idiomas**, y pensado para **personalización profunda** (*white-label*, componentes propios desde etiquetas de campo hasta vistas completas). El propio producto se presenta como **“Next.js fullstack framework”**: un `Payload Config` y obtienes admin, esquema de BD, APIs y más (*What is Payload?*).

Para el cliente final **editor**, esto se traduce en: **una interfaz profesional** para gestionar contenido y datos **sin tocar repositorio**, con la forma del negocio reflejada en el panel.

### 4.2 Live Preview: edición “como en WordPress”, sin el ciclo guardar → recargar

**Live Preview** permite **renderizar la aplicación front dentro del Admin** en un *iframe*. La documentación es explícita:

- Los cambios **se reflejan en tiempo real mientras editas**.
- **No hace falta guardar** borrador ni publicar para ver el resultado (*“No need to save a draft or publish your changes”*).
- El admin comunica los cambios al front por **`window.postMessage`**; el dato que viaja **incluye cambios aún no guardados** — de ahí la experiencia fluida (*Live Preview — Overview*).

Esto es la respuesta directa al flujo antiguo de muchos CMS *headless* (“toca guardar y recargar el sitio para ver qué pasó”). **Aquí la vista previa está acoplada al documento en edición**, parecida en comodidad a lo que ofrecen constructores visuales en WordPress, pero sobre **tu** front en Next.js.

### 4.3 Constructor de contenido: Blocks + editor Lexical (richtext)

- **Blocks field:** descrito oficialmente como **“great layout builder”** para modelos de contenido flexibles: filas de bloques con distintos tipos en el orden que elija el editor (*Blocks Field*).
- **Lexical** es el editor de rich text actual (Slate queda en desuso hacia 4.0). Dentro del rich text, **`BlocksFeature`** permite incrustar **los mismos bloques reutilizables** que en un campo `blocks` normal — con validación, hooks y control de acceso (*Rich Text — Blocks*).

En la práctica, eso permite **WordPress-like** (secciones, CTAs, galerías dentro del flujo editorial) **más** estructura de datos limpia en JSON, **sin** depender de shortcodes opacos.

### 4.4 Plugins oficiales (extensión modular, no “cajón de PHP”)

Los plugins de Payload **modifican el config** (campos, hooks, vistas admin, endpoints). Casos de uso citados en la documentación incluyen: sincronización con CRM, **backend de comercio completo**, form builder, reporting, cifrado, S3/Cloudinary, etc. (*Plugins — Overview*).

**Plugins oficiales** mencionados ahí (lista viva; conviene revisar el directorio de paquetes):

Form Builder, MCP, Multi-Tenant, Nested Docs, Redirects, Search, Sentry, SEO, Stripe, Import/Export, **Ecommerce** (paquete dedicado en el ecosistema oficial).

### 4.5 SEO (plugin) — cercano a “Yoast”, integrado al admin

El **SEO plugin** añade un grupo `meta` (título, descripción, imagen por defecto), **generación asistida** con funciones propias, **vista previa** de cómo podría verse en buscadores **actualizándose al vuelo**, contadores de caracteres e indicadores — la propia doc lo compara con **Yoast SEO** (*SEO Plugin*).

### 4.6 Comercio electrónico y pagos

La documentación dedicada vive en la carpeta **`ecommerce/`** del paquete de docs de Payload (en este proyecto, el espejo local: `.agents/context/Payloadcms/docs/ecommerce/` — p. ej. `overview.mdx`, `plugin.mdx`, `payments.mdx`, `frontend.mdx`, `advanced.mdx`). En la web: [documentación Ecommerce](https://payloadcms.com/docs/ecommerce/overview).

**Ecommerce plugin** (`@payloadcms/plugin-ecommerce`):

- Añade **funcionalidad de tienda** sobre Payload: utilidades y colecciones para **productos, pedidos y pagos**; integración con pasarelas (**patrón de adaptadores de pagos**; **Stripe** soportado de forma destacada en la doc del plugin).
- Funciones previstas en la overview: **productos con variantes**, **carritos** persistidos en Payload, **pedidos y transacciones**, **direcciones** ligadas a clientes, **varias monedas**, **utilidades React** para el front.
- La doc avisa: **el plugin está en beta** y puede haber *breaking changes*.
- Transparencia útil para clientes técnicos: **envío, impuestos y suscripciones no vienen listos “out of the box”** en el plugin; se pueden implementar sobre colecciones y **hooks** propios.

**Stripe plugin** (paquete aparte, `@payloadcms/plugin-stripe`): integración bidireccional con Stripe, webhooks, proxy de API bajo **access control**; orientado también a **e-commerce o SaaS** y a contrastar con hosted commerce cuando la lógica vive en Payload (*Stripe Plugin*). En muchos proyectos de tienda, **Ecommerce + adaptador Stripe** en el plugin de ecommerce y/o **plugin Stripe** según el alcance (catálogo vs. facturación genérica).

### 4.7 Importación / exportación y datos

El **Import/Export plugin** permite exportar e importar colecciones (CSV/JSON), con vista previa y, para volúmenes grandes, **cola de trabajos** (*Jobs Queue*) del propio Payload (*Import Export Plugin*).

### 4.8 Otras capacidades útiles para argumentar diferencias con WordPress

- **REST + GraphQL + Local API** como capas de datos coherentes (*What is Payload?*, *Admin — Overview*).
- **Versionado, borradores, autosave** (módulos de documentación en `versions/`).
- **Autenticación y control de acceso** unificados con el resto de la app.
- **Búsqueda, redirects, multi-tenant**, etc., como plugins oficiales cuando el proyecto los necesita.

---

## 5. Capas técnicas (alineado al proyecto)

Concretamente, el stack documentado para **tuHerenciaFácil** agrupa:

| Capa | Rol |
|------|-----|
| **Desarrollo** | Repositorio Git, pipeline de decisiones (RFC), agentes de IA para iterar con control (ver `CURSOR.md` / `.agents/AGENTS.md`). |
| **Frontend + deploy** | **Vercel** (hosting + CDN) + **Next.js** (routing, SSR/ISR según necesidad) + **Payload** embebido en la app. |
| **Backend y tipos** | **Drizzle ORM** + **TypeScript** generando tipos coherentes con el CMS. |
| **Datos** | **Neon** (PostgreSQL serverless, *scale-to-zero* cuando aplica). |
| **Archivos** | **Cloudflare R2** vía API compatible S3: almacenamiento de media/archivos con política de costes clara. |
| **Correo** | **SMTP2GO** (transaccional; **múltiples dominios/remitentes** sin la limitación típica de “un dominio por plan barato”). |

*Nota de implementación:* el código de producción puede usar un proveedor de email concreto mientras se migra; **la línea base de documentación y el diagrama** apuntan a **SMTP2GO** como capa de correo alineada a esta estrategia.

Referencia visual: `docs/design/stack-architecture.html`.

---

## 6. Por qué es más fácil de mantener (lo que importa al programador y al cliente)

1. **Un solo lenguaje de aplicación principal (TypeScript)** en servidor y definición de modelo, frente a PHP + JS del editor + configuraciones de plugins mezcladas.
2. **Cambios auditables:** *pull requests* en lugar de “clic en producción” sin historial.
3. **Menos superficie de integración:** no hay veinte plugins actualizando el mismo `wp-content`.
4. **Escalabilidad de equipo:** un desarrollador nuevo lee el repo; no reconstruye mentalmente qué plugin metía el `functions.php` de hace tres años.

---

## 7. Economía: “pago por uso” vs. “pago por existir”

### 7.1 El problema que describes (WordPress + plugins premium)

Muchos clientes pagan **mes a mes** solo para **poder seguir construyendo o editando en condiciones mínimas** (builder Pro, hosting “WordPress optimizado”, plugins imprescindibles). Ese coste **no es el valor del producto**, es el **impuesto del tooling**.

### 7.2 Modelo con Neon + R2 + SMTP2GO + Vercel

Estos servicios suelen facturar por **consumo medido** (request, GB, correos, minutos de build, etc.):

- En **tráfico y datos bajos**, muchos proyectos se mantienen en **planes gratuitos o de coste muy bajo**.
- Cuando el negocio **crece**, el incremento de coste **sigue al uso real** (más visitas, más almacenamiento, más correo), no a un precio fijo inflado “por tener WordPress”.

**Quién paga qué (modelo freelance transparente):**

| Concepto | Típicamente |
|----------|-------------|
| **Cuentas de infraestructura** (Neon, R2, SMTP2GO, Vercel) | Las gestiona **el contratista / desarrollador** como coste operativo del estudio o se **trasladan** al cliente según lo acordado (proyecto vs. retainer). |
| **Dominios** | El cliente o el desarrollador, según contrato; suelen estar a nombre del cliente. |
| **Honorarios del desarrollador** | Pagas por **diseño, implementación, integración y soporte**: convertir la idea en software mantenible. |

La diferencia clave para tu mensaje de mercado:

> **El cliente no está financiando una pila de suscripciones solo para “empezar”.**  
> **Financia la transformación de su idea en producto**, y la infraestructura escala con el uso — con costes predecibles y revisables.

Eso conecta con **libertad financiera** para ti como profesional: puedes **absorber** proyectos pequeños con coste marginal bajo, y **subir precio o fee de operación** cuando el proyecto exige más uso o más soporte — sin estar atrapado en el catálogo de precios de un único hosting WordPress o de un constructor visual.

---

## 8. SMTP2GO en esta historia

Para un estudio con **varios clientes / dominios / remitentes**, SMTP2GO encaja cuando necesitas:

- **Varios dominios verificados** y correo transaccional (altas, recuperación, notificaciones) **sin multiplicar coste** como si cada sitio fuera un “plan básico” distinto en otro proveedor.
- Un contrato claro de **volumen** (emails/mes) en lugar de trabas arbitrarias al crecer.

*(Los precios concretos cambian; revisa el sitio oficial de SMTP2GO y el diagrama en `stack-architecture.html`, que incluye una referencia orientativa.)*

---

## 9. Resumen en una frase (para propuestas comerciales)

**WordPress + Elementor/Divi** optimiza la **edición visual rápida** con un ecosistema de extensiones; **Next.js + Payload + PostgreSQL + R2 + SMTP + Vercel** combina **panel admin y Live Preview** (edición en contexto, sin depender del ciclo guardar/recargar), **bloques reutilizables** y **plugins oficiales** (SEO, Stripe, ecommerce, etc.) sobre **propiedad del código, coste proporcional al tráfico y mantenimiento profesional** — ideal cuando el producto no es solo una web estática, sino un **sistema** con datos, roles y reglas en **un solo repositorio**.

---

## 10. Enlaces internos

- Stack técnico narrativo: `docs/TECHNICAL_STACK.md`
- Diagrama: `docs/design/stack-architecture.html`
- Índice de documentación: `docs/README.md`
- Documentación **Payload:** [payloadcms.com/docs](https://payloadcms.com/docs) — páginas relevantes para este argumento: *Live Preview*, *Admin Panel*, *Blocks Field*, *Rich Text / Lexical / Blocks*, *Plugins*, *SEO*, *Ecommerce* ([overview](https://payloadcms.com/docs/ecommerce/overview)), *Stripe*, *Import Export*. *(Opcional: espejo local bajo `.agents/context/Payloadcms/docs/`, incluida la carpeta `ecommerce/` — puede estar en `.gitignore`.)*

---

*Documento orientado a comunicación con clientes y colaboradores. No sustituye un contrato; los costes exactos dependen del proveedor, del país y del acuerdo comercial.*
