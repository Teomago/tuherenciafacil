'use client'

import React from 'react'
import { DiagramNav } from '../DiagramNav'

export default function Diagram02() {
  return (
    <div className="max-w-[760px] mx-auto py-5 px-5 font-sans min-h-screen">
      <div className="mb-6">
        <div className="text-[15px] font-medium text-[#002845] mb-4">tu<span className="text-[#FF8C3C]">Herencia</span>Fácil</div>
        <h1 className="text-[20px] font-medium text-[#002845] mb-1">Cliente — 7 pantallas + chat</h1>
        <p className="text-[13px] text-[#5F5E5A]">Dashboard, casos, mi proceso, tabs (herederos, bienes, documentos, pagos), chat con 3 canales</p>
      </div>

      <DiagramNav />

      <div className="bg-white rounded-xl border border-[#e2e0d8] p-6 overflow-x-auto">
        <svg width="680" height="740" viewBox="0 0 680 740" xmlns="http://www.w3.org/2000/svg" style={{fontFamily: 'system-ui, -apple-system, sans-serif', display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto'}}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
          </defs>

          <text x="340" y="28" textAnchor="middle" fontSize="16" fontWeight="500" fill="#1a1a18">Cliente — 7 pantallas + chat</text>
          <text x="340" y="46" textAnchor="middle" fontSize="12" fill="#5F5E5A">Post-pago, zona autenticada</text>

          <rect x="40" y="62" width="600" height="660" rx="20" fill="none" stroke="#AFA9EC" strokeWidth="0.5" strokeDasharray="5 3"/>

          <rect x="80" y="82" width="220" height="70" rx="8" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="190" y="104" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#3C3489">1 · /app/dashboard</text>
          <text x="190" y="124" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">1 caso → resumen directo</text>
          <text x="190" y="140" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">N casos → tarjetas</text>

          <rect x="340" y="82" width="260" height="70" rx="8" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="470" y="104" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#3C3489">2 · /app/casos</text>
          <text x="470" y="124" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Lista de mis casos</text>
          <text x="470" y="140" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Progreso, fase, último cambio</text>

          <line x1="300" y1="117" x2="340" y2="117" stroke="#5F5E5A" strokeWidth="1.5" markerEnd="url(#arrow)"/>

          <line x1="340" y1="152" x2="340" y2="182" stroke="#5F5E5A" strokeWidth="1.5" markerEnd="url(#arrow)"/>
          <text x="358" y="170" textAnchor="start" fontSize="12" fill="#5F5E5A">Click en un caso</text>

          <rect x="80" y="182" width="520" height="90" rx="10" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="340" y="206" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#3C3489">3 · /app/caso/[id] — Mi proceso</text>
          <text x="340" y="228" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Timeline visual con fases en lenguaje humano</text>
          <text x="340" y="246" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Tarjetas resumen: herederos · bienes · documentos · pagos</text>

          <text x="340" y="290" textAnchor="middle" fontSize="12" fill="#5F5E5A">Click en tarjeta → abre sección con tabs de navegación</text>

          <line x1="170" y1="272" x2="130" y2="310" stroke="#5F5E5A" strokeWidth="0.5" markerEnd="url(#arrow)"/>
          <line x1="290" y1="272" x2="290" y2="310" stroke="#5F5E5A" strokeWidth="0.5" markerEnd="url(#arrow)"/>
          <line x1="410" y1="272" x2="440" y2="310" stroke="#5F5E5A" strokeWidth="0.5" markerEnd="url(#arrow)"/>
          <line x1="530" y1="272" x2="570" y2="310" stroke="#5F5E5A" strokeWidth="0.5" markerEnd="url(#arrow)"/>

          <rect x="60" y="310" width="140" height="130" rx="8" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="130" y="332" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#3C3489">4 · Herederos</text>
          <text x="130" y="358" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Agregar personas</text>
          <text x="130" y="374" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Ver parentesco</text>
          <text x="130" y="390" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Representación</text>
          <text x="130" y="406" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Estado de docs</text>

          <rect x="218" y="310" width="140" height="130" rx="8" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="288" y="332" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#3C3489">5 · Bienes</text>
          <text x="288" y="358" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Lista de activos</text>
          <text x="288" y="374" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Tipo y ubicación</text>
          <text x="288" y="390" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Distribución %</text>
          <text x="288" y="406" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Estado de docs</text>

          <rect x="376" y="310" width="140" height="130" rx="8" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="446" y="332" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#3C3489">6 · Documentos</text>
          <text x="446" y="358" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Del causante</text>
          <text x="446" y="374" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Por heredero</text>
          <text x="446" y="390" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Por bien</text>
          <text x="446" y="406" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">Subir + estados</text>

          <rect x="534" y="310" width="106" height="130" rx="8" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
          <text x="587" y="332" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#712B13">7 · Pagos</text>
          <text x="587" y="358" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#993C1D">Historial</text>
          <text x="587" y="374" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#993C1D">Saldo pendiente</text>
          <text x="587" y="390" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#993C1D">Costos notariales</text>
          <text x="587" y="406" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#993C1D">Pagar en línea</text>

          <line x1="200" y1="332" x2="218" y2="332" stroke="#5F5E5A" strokeWidth="0.5" strokeDasharray="3 2"/>
          <line x1="358" y1="332" x2="376" y2="332" stroke="#5F5E5A" strokeWidth="0.5" strokeDasharray="3 2"/>
          <line x1="516" y1="332" x2="534" y2="332" stroke="#5F5E5A" strokeWidth="0.5" strokeDasharray="3 2"/>

          <rect x="154" y="322" width="34" height="18" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="171" y="334" textAnchor="middle" dominantBaseline="central" fill="#3C3489" fontSize="10" fontWeight="500">tabs</text>
          <rect x="312" y="322" width="34" height="18" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="329" y="334" textAnchor="middle" dominantBaseline="central" fill="#3C3489" fontSize="10" fontWeight="500">tabs</text>
          <rect x="470" y="322" width="34" height="18" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
          <text x="487" y="334" textAnchor="middle" dominantBaseline="central" fill="#3C3489" fontSize="10" fontWeight="500">tabs</text>

          <rect x="80" y="490" width="520" height="110" rx="10" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="340" y="514" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#085041">8 · /app/chat — Centro de mensajes</text>
          <text x="340" y="536" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Accesible desde cualquier pantalla (nav global)</text>

          <rect x="104" y="556" width="130" height="32" rx="6" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="169" y="576" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fill="#085041">Bot IA</text>
          <rect x="255" y="556" width="130" height="32" rx="6" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="320" y="576" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fill="#085041">Abogado</text>
          <rect x="406" y="556" width="130" height="32" rx="6" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="471" y="576" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fill="#085041">Soporte</text>

          <rect x="80" y="632" width="520" height="70" rx="8" fill="#F1EFE8" stroke="#5F5E5A" strokeWidth="0.5"/>
          <text x="340" y="656" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#444441">Notificaciones por email (5 triggers)</text>
          <text x="340" y="678" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5F5E5A">Doc aprobado/rechazado · caso avanzó · costos definidos · msg del abogado · caso completado</text>
        </svg>
      </div>

      <div className="mt-6 text-[11px] text-[#B4B2A9] text-center">
        tuHerenciaFácil — Documentación interna
      </div>
    </div>
  )
}
