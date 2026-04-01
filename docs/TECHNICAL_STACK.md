# Stack Tecnológico — tuHerenciaFácil

Este documento detalla la arquitectura de la plataforma, diseñada para alta disponibilidad, escalabilidad "scale-to-zero" y automatización con IA.

## Capa de Desarrollo (Automation)
- **Claude Code**: Agente de IA para ingeniería y refactorización.
- **Antigravity**: Sistema de automatización de tareas y orquestación.
- **RFC Pipeline**: Proceso de diseño técnico previo a la implementación.

## Frontend & Deploy
- **Next.js 16.2.1**: Framework principal para SSR y routing.
- **Vercel**: Hosting y red de distribución de contenidos (CDN).
- **Payload CMS 3.80**: Motor de administración, API y gestión de contenidos.

## Backend & Tipado
- **Drizzle ORM**: Gestión de migraciones y consultas seguras a la base de datos.
- **TypeScript**: Tipado estático end-to-end sincronizado con `payload-types`.

## Capa de Datos (Serverless)
- **Neon PostgreSQL**: Base de datos relacional serverless con capacidad de escalar a cero.
- **Cloudflare R2**: Almacenamiento de archivos compatible con S3 sin costos de transferencia (egress).

## Capa de Comunicación
- **SMTP2GO**: Servicio de email transaccional (Dominios ilimitados).

---
*Para ver el diagrama visual de esta arquitectura, consulte `/docs/design/stack-architecture`.*
