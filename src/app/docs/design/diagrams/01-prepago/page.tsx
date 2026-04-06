'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DiagramNav() {
  const pathname = usePathname()

  const links = [
    { href: '/docs/design/diagrams/01-prepago', label: 'Pre-pago (5)' },
    { href: '/docs/design/diagrams/02-cliente', label: 'Cliente (7+chat)' },
    { href: '/docs/design/diagrams/03-abogado', label: 'Abogado (9+chat)' },
    { href: '/docs/design/diagrams/04-mapping', label: '21 → 14 page.tsx' },
    { href: '/docs/design/diagrams/05-stack', label: 'Stack Architecture' },
    { href: '/docs/design/app-flowchart', label: 'Flujo completo' },
    { href: '/docs/design/collections-by-phase', label: 'Colecciones × fase' },
    { href: '/docs', label: 'Inicio' },
  ]

  return (
    <div className="flex gap-1 flex-wrap mb-6">
      {links.map(l => {
        const isActive = pathname === l.href
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3.5 py-[7px] text-[12px] border rounded-md transition-all duration-150 ${
              isActive
                ? 'bg-[#002845] text-white border-[#002845]'
                : 'border-[#d3d1c7] bg-white text-[#5F5E5A] hover:bg-[#EBF5FA] hover:text-[#3A8DA8] hover:border-[#3A8DA8]'
            }`}
          >
            {l.label}
          </Link>
        )
      })}
    </div>
  )
}

export default function Diagram01() {
  return (
    <div className="max-w-[760px] mx-auto py-5 px-5 font-sans min-h-screen">
      <div className="mb-6">
        <div className="text-[15px] font-medium text-[#002845] mb-4">tu<span className="text-[#FF8C3C]">Herencia</span>Fácil</div>
        <h1 className="text-[20px] font-medium text-[#002845] mb-1">Pre-pago — 5 pantallas</h1>
        <p className="text-[13px] text-[#5F5E5A]">Filtro de elegibilidad → consulta → pago de consulta → intake → pago del paquete → caso creado</p>
      </div>

      <DiagramNav />

      <div className="bg-white rounded-xl border border-[#e2e0d8] p-6 overflow-x-auto">
        <svg width="680" height="530" viewBox="0 0 680 530" xmlns="http://www.w3.org/2000/svg" style={{fontFamily: 'system-ui, -apple-system, sans-serif', display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto'}}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
          </defs>

          {/* Title */}
          <text x="340" y="26" textAnchor="middle" fontSize="16" fontWeight="500" fill="#1a1a18">Pre-pago — 5 pantallas</text>
          <text x="340" y="44" textAnchor="middle" fontSize="12" fill="#5F5E5A">Filtro de elegibilidad + consulta + activación del paquete</text>

          {/* Zone border */}
          <rect x="40" y="58" width="600" height="452" rx="16" fill="none" stroke="#B4B2A9" strokeWidth="0.5" strokeDasharray="5 3"/>
          <text x="340" y="76" textAnchor="middle" fontSize="12" fill="#5F5E5A">Zona autenticada, sin caso pagado</text>

          {/* ── SCREEN 1: /app — eligibility filter ── */}
          <rect x="170" y="86" width="340" height="52" rx="8" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
          <text x="340" y="107" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#0C447C">/app</text>
          <text x="340" y="126" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#185FA5">Bienvenida + Filtro de Elegibilidad</text>

          {/* Exit: testamento → right */}
          <line x1="510" y1="100" x2="548" y2="88" stroke="#E24B4A" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="4 2"/>
          <rect x="548" y="74" width="92" height="34" rx="6" fill="#FCEBEB" stroke="#E24B4A" strokeWidth="0.5"/>
          <text x="594" y="88" textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="500" fill="#A32D2D">✗ testamento</text>
          <text x="594" y="101" textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#A32D2D">Fuera de alcance</text>

          {/* Exit: conflicto → right */}
          <line x1="510" y1="122" x2="548" y2="126" stroke="#CC6010" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="4 2"/>
          <rect x="548" y="112" width="92" height="34" rx="6" fill="#FFF4EC" stroke="#CC6010" strokeWidth="0.5"/>
          <text x="594" y="126" textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="500" fill="#CC6010">✗ conflicto</text>
          <text x="594" y="139" textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#CC6010">Oferta mediación</text>

          {/* Arrow down: /app → /consulta */}
          <line x1="340" y1="138" x2="340" y2="168" stroke="#5F5E5A" strokeWidth="1.5" markerEnd="url(#arrow)"/>
          <text x="352" y="156" fontSize="10" fill="#5F5E5A">✓ pasa</text>

          {/* ── SCREEN 2: /consulta ── */}
          <rect x="170" y="168" width="340" height="52" rx="8" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
          <text x="340" y="189" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#0C447C">/consulta</text>
          <text x="340" y="208" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#185FA5">Agendar cita · 6 tipos · $70k virtual / $100k presencial</text>

          {/* Arrow down */}
          <line x1="340" y1="220" x2="340" y2="250" stroke="#5F5E5A" strokeWidth="1.5" markerEnd="url(#arrow)"/>

          {/* ── SCREEN 3: /consulta/pago ── */}
          <rect x="170" y="250" width="340" height="52" rx="8" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
          <text x="340" y="271" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#712B13">/consulta/pago</text>
          <text x="340" y="290" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#993C1D">Wompi · crédito queda pendiente de autorizarCredito</text>

          {/* Arrow down */}
          <line x1="340" y1="302" x2="340" y2="332" stroke="#5F5E5A" strokeWidth="1.5" markerEnd="url(#arrow)"/>

          {/* ── SCREEN 4: /nueva-consulta ── */}
          <rect x="170" y="332" width="340" height="52" rx="8" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
          <text x="340" y="353" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#0C447C">/nueva-consulta</text>
          <text x="340" y="372" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#185FA5">Intake: causante · herederos · bienes · elegir Tier</text>

          {/* Arrow down */}
          <line x1="340" y1="384" x2="340" y2="414" stroke="#5F5E5A" strokeWidth="1.5" markerEnd="url(#arrow)"/>

          {/* ── SCREEN 5: /pago ── */}
          <rect x="170" y="414" width="340" height="52" rx="8" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
          <text x="340" y="435" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#712B13">/pago</text>
          <text x="340" y="454" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#993C1D">Cuota 1 − crédito autorizado → Wompi</text>

          {/* Payment wall */}
          <line x1="80" y1="474" x2="600" y2="474" stroke="#E24B4A" strokeWidth="1.5" strokeDasharray="8 4"/>
          <rect x="272" y="462" width="136" height="24" rx="12" fill="#FCEBEB" stroke="#E24B4A" strokeWidth="0.5"/>
          <text x="340" y="478" textAnchor="middle" dominantBaseline="central" fill="#A32D2D" fontSize="11" fontWeight="500">Muro de pago</text>

          {/* Arrow down to case created */}
          <line x1="340" y1="466" x2="340" y2="493" stroke="#5F5E5A" strokeWidth="1.5" markerEnd="url(#arrow)"/>

          {/* Case created */}
          <rect x="200" y="493" width="280" height="40" rx="8" fill="#EAF3DE" stroke="#3B6D11" strokeWidth="0.5"/>
          <text x="340" y="507" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fill="#27500A">Caso creado — SUC-YYYY-NNN</text>
          <text x="340" y="524" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#3B6D11">faseActual: 0 → redirige a /app/dashboard</text>
        </svg>
      </div>

      <div className="mt-6 text-[11px] text-[#B4B2A9] text-center">
        tuHerenciaFácil — Documentación interna
      </div>
    </div>
  )
}
