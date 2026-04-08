import Link from 'next/link'

export const metadata = {
  title: 'tuHerenciaFácil — Sistema de diseño visual',
}

const examples = [
  {
    href: '/design-examples/dashboard.html',
    title: 'Dashboard (tema claro)',
    desc: 'Vista principal del cliente con resumen del caso, tarjetas de estado (Documentos, Pagos, Herederos) y tabla de actividad reciente. Muestra el lenguaje visual base: cards con sombra azul, botones pill, tipografía Inter.',
    tag: 'Light',
    tagColor: 'bg-[#EBF5FA] text-[#2A6880]',
    dotColor: '#F9FAFB',
    dotBorder: '#e2e0d8',
  },
  {
    href: '/design-examples/dashboard-dark.html',
    title: 'Dashboard (tema oscuro)',
    desc: 'La misma vista del dashboard en modo oscuro. Muestra las superficies #00121F / #001A2B, cómo los estados de badge cambian para fondos oscuros, y el contraste de texto.',
    tag: 'Dark',
    tagColor: 'bg-[#002845] text-[#5BB8D4]',
    dotColor: '#001A2B',
    dotBorder: '#002845',
  },
  {
    href: '/design-examples/phase-timeline.html',
    title: 'Mi proceso — Las 8 fases',
    desc: 'La pantalla central del cliente: el rastreador de fases estilo "order tracking". Muestra los 4 estados de fase (Completada, En progreso, Por venir, Bloqueada), la barra de progreso gradiente, y la tarjeta de próximo paso. Referencia para RFC-006.',
    tag: 'Core screen',
    tagColor: 'bg-[#FFF4EC] text-[#CC6010]',
    dotColor: '#FF8C3C',
    dotBorder: '#FF8C3C',
  },
  {
    href: '/design-examples/documents.html',
    title: 'Mis documentos — Checklist',
    desc: 'La pantalla de expediente documental con los 4 estados posibles por documento: Aprobado (verde), En revisión (azul), Corrección solicitada (naranja, con nota del abogado y botón de re-subida), y Pendiente (zona de drag & drop). Referencia para RFC-007.',
    tag: 'Core screen',
    tagColor: 'bg-[#FFF4EC] text-[#CC6010]',
    dotColor: '#3A8DA8',
    dotBorder: '#3A8DA8',
  },
]

export default function DesignExampleIndex() {
  return (
    <div className="max-w-[700px] mx-auto py-10 px-5 font-sans">
      <Link href="/docs" className="text-[#3A8DA8] text-[13px] hover:underline mb-6 inline-block">
        ← Volver a Docs
      </Link>

      <h1 className="text-2xl font-medium text-[#002845] mb-1">
        Sistema de diseño visual
      </h1>
      <p className="text-sm text-[#5F5E5A] mb-2">
        Híbrido Stripe-Revolut-Wise — referencia visual para Paola y Germán
      </p>
      <p className="text-xs text-[#B4B2A9] mb-8">
        Los ejemplos abren en la misma pestaña con navegación lateral idéntica a la que tendrá la app.
        Usa el botón "← Volver a Docs" dentro de cada ejemplo para regresar.
      </p>

      {/* Design system token summary */}
      <div className="bg-white border border-[#e2e0d8] rounded-[14px] p-5 mb-8">
        <div className="text-[12px] font-semibold uppercase tracking-wide text-[#3A8DA8] mb-4">Paleta y tokens</div>
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md flex-shrink-0" style={{ background: '#002845' }}></span>
            <span className="text-[#5F5E5A]">Azul Corporativo <code className="text-[#002845] font-mono">#002845</code></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md flex-shrink-0" style={{ background: '#3A8DA8' }}></span>
            <span className="text-[#5F5E5A]">Azul Tecnológico <code className="text-[#002845] font-mono">#3A8DA8</code></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md flex-shrink-0" style={{ background: '#FF8C3C' }}></span>
            <span className="text-[#5F5E5A]">Naranja Acento <code className="text-[#002845] font-mono">#FF8C3C</code></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md border border-[#e2e0d8] flex-shrink-0" style={{ background: '#F9FAFB' }}></span>
            <span className="text-[#5F5E5A]">Superficie <code className="text-[#002845] font-mono">#F9FAFB</code></span>
          </div>
        </div>
        <div className="border-t border-[#e2e0d8] mt-4 pt-4 grid grid-cols-3 gap-3 text-[11px] text-[#5F5E5A]">
          <div><span className="font-semibold block mb-0.5">Botones</span>Pill 9999px + scale(1.05) hover</div>
          <div><span className="font-semibold block mb-0.5">Cards</span>radius 20px + sombra azul tintada</div>
          <div><span className="font-semibold block mb-0.5">Tipografía</span>Inter 500 tracking -2px (títulos)</div>
        </div>
      </div>

      {/* Example cards */}
      <div className="text-[13px] font-medium uppercase tracking-wide text-[#3A8DA8] mb-3">
        Ejemplos interactivos
      </div>

      <div className="space-y-2.5">
        {examples.map((ex) => (
          <a
            key={ex.href}
            href={ex.href}
            className="block bg-white border border-[#e2e0d8] rounded-[12px] p-5 hover:border-[#3A8DA8] hover:bg-[#EBF5FA] transition-all duration-150 group"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 border"
                  style={{ background: ex.dotColor, borderColor: ex.dotBorder }}
                />
                <span className="text-[15px] font-medium text-[#002845] group-hover:text-[#002845]">
                  {ex.title}
                </span>
              </div>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded flex-shrink-0 ${ex.tagColor}`}>
                {ex.tag}
              </span>
            </div>
            <p className="text-xs text-[#5F5E5A] leading-relaxed pl-[22px]">{ex.desc}</p>
            <p className="text-[11px] text-[#3A8DA8] font-medium mt-3 pl-[22px] opacity-0 group-hover:opacity-100 transition-opacity">
              Abrir ejemplo →
            </p>
          </a>
        ))}
      </div>

      <div className="mt-8 pt-5 border-t border-[#e2e0d8] text-[11px] text-[#B4B2A9]">
        <p>La barra lateral izquierda en los ejemplos simula el layout que tendrá la app real.</p>
        <p className="mt-1">Los ítems del menú sin ruta son placeholders para las secciones aún por construir.</p>
      </div>
    </div>
  )
}
