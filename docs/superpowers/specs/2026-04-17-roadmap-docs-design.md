# Design: /docs/roadmap — Roadmap visual del proyecto

**Fecha:** 2026-04-17  
**Audiencia:** Germán (marketing), Paola (abogada)  
**Propósito:** Mostrar el avance de 15 días de desarrollo en lenguaje humano — qué está hecho, qué está en progreso, qué falta.

---

## Qué se construye

### 1. Nueva página `/docs/roadmap`

Archivo: `src/app/docs/roadmap/page.tsx`

Página standalone dentro del layout `/docs` existente. Sin dependencias nuevas — Tailwind CSS v4 y los componentes/colores del sistema ya definido.

**Estructura de la página:**

```
[Encabezado: tuHerenciaFácil — Estado del proyecto]
[Nota de contexto — párrafo pequeño, gris, tono directo]
[8 tarjetas de capa — vertical stack]
[Footer — igual al de /docs/page.tsx]
```

---

### 2. Link en el índice `/docs`

Archivo: `src/app/docs/page.tsx`

Se agrega una nueva sección "Estado del proyecto" **arriba de todo**, antes de "Sistema de diseño visual". Contiene una sola `<Card>` que enlaza a `/docs/roadmap`.

---

## Contenido

### Nota de contexto (inicio de página)

Párrafo pequeño, tipografía gris (`text-[#5F5E5A]`), tono directo:

> *"Los últimos 15 días de desarrollo fueron construidos en gran parte manualmente. Las plataformas de IA que usamos presentaron interrupciones frecuentes, lo que ralentizó el avance — una IA puede modificar decenas de archivos en minutos; hacerlo a mano toma mucho más. Aun así, la base estructural de la plataforma está prácticamente completa."*

---

### Las 8 capas del roadmap

| # | Nombre | Estado | Descripción | Lista |
|---|--------|--------|-------------|-------|
| 1 | Infraestructura y plataforma | ✅ Completo | La plataforma base sobre la que todo corre | Migración completa, base de datos (Neon), almacenamiento de archivos (Cloudflare R2), deploy automático en Vercel |
| 2 | Diseño visual y branding | ✅ Completo | La identidad visual de tuHerenciaFácil | Paleta de colores, tipografía, componentes de interfaz, sistema de diseño |
| 3 | Cuentas y acceso | ✅ Completo | Quién puede entrar y con qué permisos | Registro de clientes y abogados, inicio de sesión, recuperación de contraseña, códigos de invitación, control de acceso por rol |
| 4 | Base de datos del proceso sucesoral | 🔄 En progreso | La estructura que guarda toda la información de un caso | Casos, Citas, Formulario de apertura, Herederos, Bienes |
| 5 | Flujo para el cliente (antes de contratar) | ⏳ Próximo | Las pantallas que ve el cliente al llegar por primera vez | Bienvenida, filtro de elegibilidad, agenda tu consulta, selección de paquete, pago |
| 6 | Panel del cliente (después de contratar) | ⏳ Próximo | El espacio del cliente para seguir su caso | Mi caso (8 fases), documentos, herederos, bienes, pagos, mensajes |
| 7 | Panel del abogado | ⏳ Próximo | Las herramientas de Paola para gestionar casos | Central de casos, gestión por caso, revisión de documentos, registro notarial, mensajes |
| 8 | Pagos en línea | ⏳ Próximo | La integración con la pasarela de pago colombiana | Pago de consulta, pago de paquete, Wompi, registro de transacciones |

---

## Diseño visual

### Tarjeta de capa — estructura

```
┌────────────────────────────────────────────────────┐
│  [Nº]  Nombre de la capa          [Badge de estado]│
│  Descripción en una frase en lenguaje humano       │
│  · Ítem 1                                          │
│  · Ítem 2                                          │
│  · Ítem 3                                          │
└────────────────────────────────────────────────────┘
```

### Badges de estado

| Estado | Color fondo | Color texto | Etiqueta |
|--------|-------------|-------------|----------|
| Completo | `#D1FAE5` (verde claro) | `#065F46` | Completo |
| En progreso | `#FFF4EC` (naranja sistema) | `#CC6010` | En progreso |
| Próximo | `#F3F3F1` (gris neutro) | `#5F5E5A` | Próximo |

### Paleta base (sistema existente)

- Fondo: `#f8f7f4` (del body del layout)
- Texto principal: `#002845`
- Texto secundario: `#5F5E5A`
- Borde de tarjeta: `#e2e0d8`
- Acento hover: `#EBF5FA` / borde `#3A8DA8`
- Naranja: `#FF8C3C`

Las tarjetas de capas **completas** usan el mismo estilo que las `<Card>` del índice. Las **en progreso** tienen borde izquierdo naranja (`border-l-4 border-[#FF8C3C]`). Las **próximas** tienen fondo `#F3F3F1` y borde punteado.

---

## Archivos a crear o modificar

| Archivo | Acción |
|---------|--------|
| `src/app/docs/roadmap/page.tsx` | CREAR — página del roadmap |
| `src/app/docs/page.tsx` | MODIFICAR — agregar card al índice |

No se crean layouts, componentes compartidos, ni rutas adicionales. Todo el código de la página roadmap es autocontenido en `page.tsx`.

---

## Fuera de alcance

- Animaciones o transiciones
- Fechas estimadas por capa
- Porcentajes de avance
- Actualización dinámica del estado (hardcoded por ahora)
- Versión móvil especial (Tailwind responsive básico es suficiente)
