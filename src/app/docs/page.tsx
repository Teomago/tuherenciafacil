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
          desc="El qué, cómo y por qué de cada pantalla. Incluye el nuevo embudo de consultas, tarifas de investigación planas ($150k), y hitos de pago por Tier."
        />

        <Card
          href="/docs/design/SCREEN_MAP"
          title="Mapa de pantallas"
          badge={<BadgeMd />}
          desc="21 pantallas + Portal de Transparencia. Definición completa: contenido, roles, seguridad y modelo de datos. Incluye filtro de elegibilidad, flujo de consulta y comportamiento condicional de Fase 8 por Tier."
        />

        <Card 
          href="/docs/decisions/NOTES"
          title="Notas de Negocio y Tiers"
          badge={<BadgeMd />}
          desc="Consolidado de la reunión del 1 de abril: Tiers (Estándar, Premium, Elite), tarifas de consulta (70k/100k) y automatización de comunicación notarial."
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
          desc="11 colecciones definidas con campos, relaciones, access control, hooks, y endpoints custom. Incluye Appointments, CaseIntake, sistema de créditos y política de transparencia de pagos."
        />
        
        <Card
          href="/docs/design/diagrams/01-prepago"
          title="Diagrama: Pre-pago (5 pantallas)"
          badge={<BadgeHtml />}
          desc="Filtro de elegibilidad → consulta → pago de consulta → intake → pago del paquete → caso creado."
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
          title="Diagrama: 21 pantallas → 14 page.tsx"
          badge={<BadgeHtml />}
          desc="Mapeo de pantallas a archivos reales de Next.js con renderizado condicional por rol. Incluye consulta/ y consulta/pago/ del nuevo flujo pre-pago."
        />
      </div>

      <div className="mb-7">
        <div className="text-[13px] font-medium uppercase tracking-wide text-[#3A8DA8] mb-3">Guías operativas</div>
        <Card
          href="/docs/guides/elite-manual"
          title="Manual Elite — Gestión de casos avanzados"
          badge={<BadgeMd />}
          desc="Guía paso a paso para Paola: crear caso Elite, configurar plan de pagos personalizado, aplicar crédito de consulta y gestionar Fase 8 desde /admin."
        />
        <Card
          href="/docs/decisions/DEC-004-tiers-de-servicio"
          title="Tiers de servicio — Estándar, Premium, Elite"
          badge={<BadgeMd />}
          desc="Precios, modelos de pago, qué incluye cada tier, sistema de créditos por consulta previa, y scope de v1 vs backlog."
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
