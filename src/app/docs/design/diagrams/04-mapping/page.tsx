'use client'

import React from 'react'
import { DiagramNav } from '../DiagramNav'

export default function Diagram04() {
  return (
    <div className="max-w-[760px] mx-auto py-5 px-5 font-sans min-h-screen">
      <div className="mb-6">
        <div className="text-[15px] font-medium text-[#002845] mb-4">tu<span className="text-[#FF8C3C]">Herencia</span>Fácil</div>
        <h1 className="text-[20px] font-medium text-[#002845] mb-1">21 pantallas → 14 page.tsx</h1>
        <p className="text-[13px] text-[#5F5E5A]">Renderizado condicional por member.role — qué ve cada rol en cada archivo Next.js</p>
      </div>

      <DiagramNav />

      <div className="bg-white rounded-xl border border-[#e2e0d8] p-6 overflow-x-auto">
        <svg width="680" height="792" viewBox="0 0 680 792" xmlns="http://www.w3.org/2000/svg" style={{fontFamily: 'system-ui, -apple-system, sans-serif', display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto'}}>

          <text x="340" y="28" textAnchor="middle" fontSize="16" fontWeight="500" fill="#1a1a18">21 pantallas → 14 page.tsx</text>
          <text x="340" y="46" textAnchor="middle" fontSize="12" fill="#5F5E5A">Renderizado condicional por member.role</text>

          {/* Header row */}
          <rect x="40" y="64" width="290" height="28" rx="4" fill="#F1EFE8" stroke="#5F5E5A" strokeWidth="0.5"/>
          <text x="185" y="82" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fill="#444441">Archivo (page.tsx)</text>
          <rect x="350" y="64" width="140" height="28" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="420" y="82" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fill="#3C3489">Cliente ve</text>
          <rect x="510" y="64" width="130" height="28" rx="4" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="575" y="82" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fill="#085041">Abogado ve</text>

          {/* Row 1: /app */}
          <rect x="40" y="104" width="290" height="36" rx="4" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
          <text x="185" y="126" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0C447C">(app)/page.tsx</text>
          <rect x="350" y="104" width="140" height="36" rx="4" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
          <text x="420" y="126" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0C447C">Bienvenida + Filtro</text>
          <rect x="510" y="104" width="130" height="36" rx="4" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
          <text x="575" y="126" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0C447C">Bienvenida</text>

          {/* Row 2: /consulta — NEW */}
          <rect x="40" y="150" width="290" height="36" rx="4" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
          <text x="185" y="172" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0C447C">(app)/consulta/page.tsx</text>
          <rect x="350" y="150" width="140" height="36" rx="4" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
          <text x="420" y="172" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0C447C">Agendar cita</text>
          <rect x="510" y="150" width="130" height="36" rx="4" fill="#F1EFE8" stroke="#5F5E5A" strokeWidth="0.5"/>
          <text x="575" y="172" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5F5E5A">—</text>

          {/* Row 3: /consulta/pago — NEW */}
          <rect x="40" y="196" width="290" height="36" rx="4" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
          <text x="185" y="218" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#712B13">(app)/consulta/pago/page.tsx</text>
          <rect x="350" y="196" width="140" height="36" rx="4" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
          <text x="420" y="218" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#712B13">Pagar consulta</text>
          <rect x="510" y="196" width="130" height="36" rx="4" fill="#F1EFE8" stroke="#5F5E5A" strokeWidth="0.5"/>
          <text x="575" y="218" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5F5E5A">—</text>

          {/* Row 4: /nueva-consulta */}
          <rect x="40" y="242" width="290" height="36" rx="4" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
          <text x="185" y="264" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0C447C">(app)/nueva-consulta/page.tsx</text>
          <rect x="350" y="242" width="140" height="36" rx="4" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
          <text x="420" y="264" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0C447C">Formulario intake</text>
          <rect x="510" y="242" width="130" height="36" rx="4" fill="#F1EFE8" stroke="#5F5E5A" strokeWidth="0.5"/>
          <text x="575" y="264" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5F5E5A">—</text>

          {/* Row 5: /pago */}
          <rect x="40" y="288" width="290" height="36" rx="4" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
          <text x="185" y="310" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#712B13">(app)/pago/page.tsx</text>
          <rect x="350" y="288" width="140" height="36" rx="4" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
          <text x="420" y="310" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#712B13">Pasarela paquete</text>
          <rect x="510" y="288" width="130" height="36" rx="4" fill="#F1EFE8" stroke="#5F5E5A" strokeWidth="0.5"/>
          <text x="575" y="310" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5F5E5A">—</text>

          {/* Row 6: /dashboard */}
          <rect x="40" y="338" width="290" height="36" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="185" y="360" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489">(app)/dashboard/page.tsx</text>
          <rect x="350" y="338" width="140" height="36" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="420" y="360" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489">Mi resumen</text>
          <rect x="510" y="338" width="130" height="36" rx="4" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="575" y="360" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#085041">Métricas</text>

          {/* Row 7: /casos */}
          <rect x="40" y="384" width="290" height="36" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="185" y="406" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489">(app)/casos/page.tsx</text>
          <rect x="350" y="384" width="140" height="36" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="420" y="406" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489">Mis casos</text>
          <rect x="510" y="384" width="130" height="36" rx="4" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="575" y="406" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#085041">Central + pool</text>

          {/* Row 8: /caso/[id] */}
          <rect x="40" y="430" width="290" height="36" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="185" y="452" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489">(app)/caso/[id]/page.tsx</text>
          <rect x="350" y="430" width="140" height="36" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="420" y="452" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489">Mi proceso</text>
          <rect x="510" y="430" width="130" height="36" rx="4" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="575" y="452" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#085041">Gestión</text>

          {/* Row 9: /herederos */}
          <rect x="40" y="476" width="290" height="36" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="185" y="498" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489">(app)/caso/[id]/herederos/page.tsx</text>
          <rect x="350" y="476" width="140" height="36" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="420" y="498" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489">Ver + agregar</text>
          <rect x="510" y="476" width="130" height="36" rx="4" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="575" y="498" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#085041">Editar todo</text>

          {/* Row 10: /bienes */}
          <rect x="40" y="522" width="290" height="36" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="185" y="544" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489">(app)/caso/[id]/bienes/page.tsx</text>
          <rect x="350" y="522" width="140" height="36" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="420" y="544" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489">Ver lista</text>
          <rect x="510" y="522" width="130" height="36" rx="4" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="575" y="544" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#085041">Investigar, %</text>

          {/* Row 11: /documentos */}
          <rect x="40" y="568" width="290" height="36" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="185" y="590" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489">(app)/caso/[id]/documentos/page.tsx</text>
          <rect x="350" y="568" width="140" height="36" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="420" y="590" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489">Subir</text>
          <rect x="510" y="568" width="130" height="36" rx="4" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="575" y="590" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#085041">Aprobar/rechazar</text>

          {/* Row 12: /notaria */}
          <rect x="40" y="614" width="290" height="36" rx="4" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
          <text x="185" y="636" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#712B13">(app)/caso/[id]/notaria/page.tsx</text>
          <rect x="350" y="614" width="140" height="36" rx="4" fill="#F1EFE8" stroke="#5F5E5A" strokeWidth="0.5"/>
          <text x="420" y="636" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5F5E5A">403 — bloqueado</text>
          <rect x="510" y="614" width="130" height="36" rx="4" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
          <text x="575" y="636" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#712B13">Control total</text>

          {/* Row 13: /pagos */}
          <rect x="40" y="660" width="290" height="36" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="185" y="682" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489">(app)/caso/[id]/pagos/page.tsx</text>
          <rect x="350" y="660" width="140" height="36" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="420" y="682" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489">Ver historial</text>
          <rect x="510" y="660" width="130" height="36" rx="4" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="575" y="682" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#085041">Registrar</text>

          {/* Row 14: /chat */}
          <rect x="40" y="706" width="290" height="36" rx="4" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="185" y="728" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#085041">(app)/chat/page.tsx</text>
          <rect x="350" y="706" width="140" height="36" rx="4" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="420" y="728" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#085041">IA + escalar</text>
          <rect x="510" y="706" width="130" height="36" rx="4" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="575" y="728" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#085041">Bandeja</text>

          <text x="340" y="772" textAnchor="middle" fontSize="12" fill="#5F5E5A">14 archivos page.tsx · renderizado condicional por member.role</text>
        </svg>
      </div>

      <div className="mt-6 text-[11px] text-[#B4B2A9] text-center">
        tuHerenciaFácil — Documentación interna
      </div>
    </div>
  )
}
