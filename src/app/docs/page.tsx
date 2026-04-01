import Link from 'next/link'

export const metadata = {
  title: 'tuHerenciaFácil — Documentación interna',
}

function Card({ href, title, desc, badge }: { href?: string, title: string, desc: string, badge?: React.ReactNode }) {
  const inner = (
    <>
      <div className="text-[15px] font-medium text-[#002845] mb-1 flex items-center gap-2">
        {title}
        {badge}
      </div>
      <div className="text-xs text-[#5F5E5A] leading-relaxed">
        {desc}
      </div>
    </>
  )

  if (!href) {
    return (
      <div className="block bg-white border border-[#e2e0d8] rounded-[10px] py-4 px-5 mb-2.5 cursor-default">
        {inner}
      </div>
    )
  }

  return (
    <Link 
      href={href} 
      className="block bg-white border border-[#e2e0d8] rounded-[10px] py-4 px-5 mb-2.5 hover:border-[#3A8DA8] hover:bg-[#EBF5FA] transition-all duration-150 group"
    >
      {inner}
    </Link>
  )
}

function BadgeHtml() {
  return <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-[#EBF5FA] text-[#2A6880]">React / Tailwind</span>
}

function BadgeMd() {
  return <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-[#EAF3DE] text-[#27500A]">Markdown</span>
}

export default function DocsIndex() {
  return (
    <div className="max-w-[700px] mx-auto py-10 px-5 font-sans">
      <h1 className="text-2xl font-medium text-[#002845] mb-1">
        tu<span className="text-[#FF8C3C]">Herencia</span>Fácil
      </h1>
      <p className="text-sm text-[#5F5E5A] mb-8">Documentación interna del producto — uso exclusivo del equipo</p>

      <div className="mb-7">
        <div className="text-[13px] font-medium uppercase tracking-wide text-[#3A8DA8] mb-3">Diseño de la aplicación</div>
        
        <Card 
          href="/docs/design/app-flowchart"
          title="Diagrama de flujo completo"
          badge={<BadgeHtml />}
          desc="El qué, cómo y por qué de cada pantalla. Swim lanes cliente ↔ abogado, fase por fase. Incluye endpoints, datos que se crean, y triggers de cada acción."
        />

        <Card 
          href="/docs/design/SCREEN_MAP"
          title="Mapa de pantallas"
          badge={<BadgeMd />}
          desc="19 pantallas + 1 widget de chat público. Definición completa de cada pantalla: contenido, funcionalidad, roles, seguridad, modelo de datos."
        />

        <Card 
          href="/docs/design/collections-by-phase"
          title="Colecciones por fase"
          badge={<BadgeHtml />}
          desc="Qué colección de Payload se toca en cada fase, con qué operación (CREATE/READ/UPDATE), quién actúa (cliente/abogado/server), y qué triggers se disparan."
        />

        <Card 
          href="/docs/design/COLLECTIONS"
          title="Colecciones de Payload CMS"
          badge={<BadgeMd />}
          desc="10 colecciones definidas con campos, relaciones, access control, hooks, y endpoints custom. Listo para implementar."
        />
        
        <Card 
          href="/docs/design/diagrams/01-prepago"
          title="Diagrama: Pre-pago (3 pantallas)"
          badge={<BadgeHtml />}
          desc="Flujo de bienvenida → formulario → pago → caso creado."
        />

        <Card 
          href="/docs/design/diagrams/02-cliente"
          title="Diagrama: Cliente (7 pantallas + chat)"
          badge={<BadgeHtml />}
          desc="Dashboard, casos, vista del caso, herederos, bienes, documentos, pagos, chat."
        />

        <Card 
          href="/docs/design/diagrams/03-abogado"
          title="Diagrama: Abogado (9 pantallas + chat)"
          badge={<BadgeHtml />}
          desc="Dashboard, central de casos, gestión, herederos, bienes, documentos, notaría, pagos, chat."
        />

        <Card 
          href="/docs/design/diagrams/05-stack"
          title="Stack Architecture"
          badge={<BadgeHtml />}
          desc="Arquitectura de la plataforma: Next.js, Payload, Drizzle, Neon, Cloudflare R2 y automatización con IA."
        />

        <Card 
          href="/docs/design/diagrams/04-mapping"
          title="Diagrama: 19 pantallas → 12 page.tsx"
          badge={<BadgeHtml />}
          desc="Mapeo de pantallas a archivos reales de Next.js con renderizado condicional por rol."
        />
      </div>

      <div className="mb-7">
        <div className="text-[13px] font-medium uppercase tracking-wide text-[#3A8DA8] mb-3">Marca</div>
        <Card 
          href="/docs/brand/README"
          title="Paleta de colores y assets"
          badge={<BadgeMd />}
          desc="Guía de marca, colores principales, y recursos visuales. (Pendiente: logo y tipografía)."
        />
      </div>

      <div className="mb-7">
        <div className="text-[13px] font-medium uppercase tracking-wide text-[#3A8DA8] mb-3">Decisiones</div>
        <Card 
          href="/docs/decisions/README"
          title="Registro de Decisiones (RFCs)"
          badge={<BadgeMd />}
          desc="Historial de decisiones arquitectónicas y de negocio. Incluye la guía sobre cómo crear un nuevo RFC."
        />
      </div>

      <div className="mt-10 pt-5 border-t border-[#e2e0d8] text-[11px] text-[#B4B2A9]">
        tuHerenciaFácil — Documento interno. Última actualización: {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}.
      </div>
    </div>
  )
}
