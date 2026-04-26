# Documentación del Proyecto — tuHerenciaFácil

Bienvenido al centro de documentación de **tuHerenciaFácil**. Este espacio sirve como el "Archivo Vivo" del proyecto, donde se consolidan tanto las intenciones de diseño como los resultados técnicos finales.

## Propósito de este espacio

1.  **Alineación del Equipo**: Asegurar que todos los miembros (abogados, diseñadores y desarrolladores) tengan la misma visión del proceso legal y técnico.
2.  **Transparencia Técnica**: Documentar las decisiones arquitectónicas, esquemas de base de datos y flujos de usuario.
3.  **Historial de Evolución**: Servir como registro de cómo el proceso manual de sucesiones se transforma en una experiencia digital eficiente.

## Estructura de la Documentación

-   **`/design`**: Contiene los planos de la aplicación.
    -   `COLLECTIONS.md`: Definición técnica de las bases de datos (Payload CMS).
    -   `SCREEN_MAP.md`: Mapa detallado de todas las pantallas y flujos por rol.
-   **`/brand`**: Guía de estilo, paleta de colores y activos visuales.
-   **`/decisions`**: Registro de decisiones de producto, RFCs y minutas de reuniones.
-   **`/guides`**: Manuales operativos para el equipo.
    -   `elite-manual.md`: Guía paso a paso para gestionar casos Elite desde el panel `/admin`.
    -   `stack-comparativa-freelance.md`: Comparativa WordPress/builders vs stack Next+Payload y modelo de costes (freelance / cliente).
-   **`.agents` (Interno)**: Instrucciones y contextos específicos para los agentes de IA que asisten en el desarrollo.

## Cómo usar esta documentación

Esta documentación se renderiza automáticamente en la ruta `/docs` de la aplicación web. Cualquier cambio realizado en los archivos `.md` del repositorio se reflejará en tiempo real después de un despliegue exitoso en Vercel.

## Ciclo de vida de esta carpeta

Los archivos `.md` de esta carpeta **permanecen en el repositorio indefinidamente** — son documentación técnica del equipo, valiosa tanto durante el diseño como después. No se eliminan.

Lo que sí se retira cuando el producto esté en producción y el equipo ya no lo necesite es la **ruta `/docs` del app de Next.js** (los archivos `src/app/docs/`). Esto la convierte en documentación interna del repo (visible para desarrolladores en GitHub) sin exponerla públicamente en la web.

**Regla:** Los `.md` en `/docs` son permanentes. Los `.tsx` en `src/app/docs/` son temporales.

---
*Última actualización: 2026-04-06*
