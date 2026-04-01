'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DiagramNav() {
  const pathname = usePathname()
  
  const links = [
    { href: '/docs/design/diagrams/01-prepago', label: 'Pre-pago (3)' },
    { href: '/docs/design/diagrams/02-cliente', label: 'Cliente (7+chat)' },
    { href: '/docs/design/diagrams/03-abogado', label: 'Abogado (9+chat)' },
    { href: '/docs/design/diagrams/04-mapping', label: '19 → 12 page.tsx' },
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
        <h1 className="text-[20px] font-medium text-[#002845] mb-1">Pre-pago — 3 pantallas</h1>
        <p className="text-[13px] text-[#5F5E5A]">Flujo lineal: bienvenida → formulario → pago → caso creado</p>
      </div>

      <DiagramNav />

      <div className="bg-white rounded-xl border border-[#e2e0d8] p-6 overflow-x-auto">
        <svg width="680" height="320" viewBox="0 0 680 320" xmlns="http://www.w3.org/2000/svg" style={{fontFamily: 'system-ui, -apple-system, sans-serif', display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto'}}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
          </defs>

          <text x="340" y="28" textAnchor="middle" fontSize="16" fontWeight="500" fill="#1a1a18">Pre-pago — 3 pantallas</text>
          <text x="340" y="46" textAnchor="middle" fontSize="12" fill="#5F5E5A">Accesibles sin caso activo</text>

          <rect x="40" y="66" width="600" height="234" rx="16" fill="none" stroke="#B4B2A9" strokeWidth="0.5" strokeDasharray="5 3"/>
          <text x="340" y="88" textAnchor="middle" fontSize="12" fill="#5F5E5A">Zona autenticada, sin caso pagado</text>

          <rect x="80" y="106" width="160" height="56" rx="8" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
          <text x="160" y="128" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#0C447C">/app</text>
          <text x="160" y="148" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#185FA5">Bienvenida</text>

          <line x1="240" y1="134" x2="280" y2="134" stroke="#5F5E5A" strokeWidth="1.5" markerEnd="url(#arrow)"/>

          <rect x="280" y="106" width="180" height="56" rx="8" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
          <text x="370" y="128" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#0C447C">/nueva-consulta</text>
          <text x="370" y="148" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#185FA5">Formulario de intake</text>

          <line x1="460" y1="134" x2="500" y2="134" stroke="#5F5E5A" strokeWidth="1.5" markerEnd="url(#arrow)"/>

          <rect x="500" y="106" width="120" height="56" rx="8" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
          <text x="560" y="128" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#712B13">/pago</text>
          <text x="560" y="148" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#993C1D">Pasarela</text>

          <line x1="560" y1="162" x2="560" y2="206" stroke="#5F5E5A" strokeWidth="1.5" markerEnd="url(#arrow)"/>

          <line x1="80" y1="196" x2="640" y2="196" stroke="#E24B4A" strokeWidth="2" strokeDasharray="8 4"/>
          <rect x="290" y="184" width="100" height="24" rx="12" fill="#FCEBEB" stroke="#E24B4A" strokeWidth="0.5"/>
          <text x="340" y="200" textAnchor="middle" dominantBaseline="central" fill="#A32D2D" fontSize="11" fontWeight="500">Muro de pago</text>

          <rect x="460" y="216" width="200" height="56" rx="8" fill="#EAF3DE" stroke="#3B6D11" strokeWidth="0.5"/>
          <text x="560" y="236" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#27500A">Caso creado</text>
          <text x="560" y="256" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3B6D11">SUC-2024-XXX</text>

          <line x1="460" y1="244" x2="330" y2="244" stroke="#5F5E5A" strokeWidth="0.5" strokeDasharray="4 3" markerEnd="url(#arrow)"/>
          <text x="395" y="236" textAnchor="middle" fontSize="12" fill="#5F5E5A">Redirige a</text>

          <rect x="120" y="216" width="210" height="56" rx="8" fill="#EAF3DE" stroke="#3B6D11" strokeWidth="0.5"/>
          <text x="225" y="236" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#27500A">/app/dashboard</text>
          <text x="225" y="256" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3B6D11">Con caso activo</text>
        </svg>
      </div>

      <div className="mt-6 text-[11px] text-[#B4B2A9] text-center">
        tuHerenciaFácil — Documentación interna
      </div>
    </div>
  )
}
