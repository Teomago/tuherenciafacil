'use client'

import React from 'react'
import { DiagramNav } from '../01-prepago/page'

export default function Diagram03() {
  return (
    <div className="max-w-[760px] mx-auto py-5 px-5 font-sans min-h-screen">
      <div className="mb-6">
        <div className="text-[15px] font-medium text-[#002845] mb-4">tu<span className="text-[#FF8C3C]">Herencia</span>Fácil</div>
        <h1 className="text-[20px] font-medium text-[#002845] mb-1">Abogado — 9 pantallas + chat</h1>
        <p className="text-[13px] text-[#5F5E5A]">Dashboard, central de casos, pool sin asignar, gestión, tabs, notaría (exclusiva), bandeja de mensajes</p>
      </div>

      <DiagramNav />

      <div className="bg-white rounded-xl border border-[#e2e0d8] p-6 overflow-x-auto">
        <svg width="680" height="840" viewBox="0 0 680 840" xmlns="http://www.w3.org/2000/svg" style={{fontFamily: 'system-ui, -apple-system, sans-serif', display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto'}}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
          </defs>

          <text x="340" y="28" textAnchor="middle" fontSize="16" fontWeight="500" fill="#1a1a18">Abogado — 9 pantallas + chat</text>
          <text x="340" y="46" textAnchor="middle" fontSize="12" fill="#5F5E5A">Panel profesional</text>

          <rect x="40" y="62" width="600" height="760" rx="20" fill="none" stroke="#5DCAA5" strokeWidth="0.5" strokeDasharray="5 3"/>

          <rect x="80" y="82" width="240" height="90" rx="8" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="200" y="104" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#085041">1 · /app/dashboard</text>
          <text x="200" y="126" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Casos activos · completados</text>
          <text x="200" y="142" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Ingresos · alertas del día</text>
          <text x="200" y="158" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Acciones pendientes hoy</text>

          <line x1="320" y1="127" x2="360" y2="127" stroke="#5F5E5A" strokeWidth="1.5" markerEnd="url(#arrow)"/>

          <rect x="360" y="82" width="240" height="90" rx="8" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="480" y="104" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#085041">2 · /app/casos</text>
          <text x="480" y="126" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Orden: necesita mi atención</text>
          <text x="480" y="142" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Filtros: fase, estado, fecha</text>
          <text x="480" y="158" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Badges de alerta por caso</text>

          <rect x="80" y="192" width="240" height="56" rx="8" fill="#FAEEDA" stroke="#854F0B" strokeWidth="0.5"/>
          <text x="200" y="212" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#633806">Pool sin asignar</text>
          <text x="200" y="232" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#854F0B">Sección superior en /casos</text>

          <line x1="320" y1="220" x2="360" y2="148" stroke="#5F5E5A" strokeWidth="0.5" strokeDasharray="4 3" markerEnd="url(#arrow)"/>

          <line x1="480" y1="172" x2="480" y2="270" stroke="#5F5E5A" strokeWidth="1.5" markerEnd="url(#arrow)"/>
          <text x="498" y="224" textAnchor="start" fontSize="12" fill="#5F5E5A">Click en caso</text>

          <rect x="180" y="270" width="420" height="90" rx="10" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="390" y="294" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#085041">3 · /app/caso/[id] — Gestión del caso</text>
          <text x="390" y="316" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Avanzar fase · notas internas y al cliente</text>
          <text x="390" y="334" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Registrar gestiones offline · historial de cambios</text>

          <text x="390" y="378" textAnchor="middle" fontSize="12" fill="#5F5E5A">Tabs de navegación dentro del caso</text>

          <line x1="260" y1="360" x2="160" y2="400" stroke="#5F5E5A" strokeWidth="0.5" markerEnd="url(#arrow)"/>
          <line x1="340" y1="360" x2="310" y2="400" stroke="#5F5E5A" strokeWidth="0.5" markerEnd="url(#arrow)"/>
          <line x1="450" y1="360" x2="450" y2="400" stroke="#5F5E5A" strokeWidth="0.5" markerEnd="url(#arrow)"/>
          <line x1="540" y1="360" x2="570" y2="400" stroke="#5F5E5A" strokeWidth="0.5" markerEnd="url(#arrow)"/>

          <rect x="80" y="400" width="140" height="110" rx="8" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="150" y="422" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#085041">4 · Herederos</text>
          <text x="150" y="446" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Editar datos</text>
          <text x="150" y="462" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Representación</text>
          <text x="150" y="478" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Notas internas</text>

          <rect x="238" y="400" width="140" height="110" rx="8" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="308" y="422" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#085041">5 · Bienes</text>
          <text x="308" y="446" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Investigación</text>
          <text x="308" y="462" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Hallazgos</text>
          <text x="308" y="478" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Distribución %</text>

          <rect x="396" y="400" width="110" height="110" rx="8" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="451" y="422" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#085041">6 · Docs</text>
          <text x="451" y="446" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Aprobar</text>
          <text x="451" y="462" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Rechazar</text>
          <text x="451" y="478" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Subir propios</text>

          <rect x="524" y="400" width="96" height="110" rx="8" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
          <text x="572" y="422" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#712B13">8 · Pagos</text>
          <text x="572" y="446" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#993C1D">Registrar</text>
          <text x="572" y="462" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#993C1D">Costos</text>
          <text x="572" y="478" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#993C1D">Balance</text>

          <line x1="451" y1="510" x2="451" y2="542" stroke="#5F5E5A" strokeWidth="1.5" markerEnd="url(#arrow)"/>

          <rect x="140" y="542" width="420" height="90" rx="10" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
          <text x="350" y="566" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#712B13">7 · /app/caso/[id]/notaria — EXCLUSIVA</text>
          <text x="350" y="588" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#993C1D">Radicación · edictos (fecha, medio, plazo)</text>
          <text x="350" y="606" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#993C1D">DIAN / UGPP · firma · costos notariales</text>

          <rect x="454" y="550" width="90" height="20" rx="4" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
          <text x="499" y="564" textAnchor="middle" dominantBaseline="central" fill="#712B13" fontSize="10" fontWeight="500">Solo abogado</text>

          <rect x="80" y="662" width="520" height="56" rx="10" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
          <text x="340" y="682" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#085041">9 · /app/chat — Bandeja de mensajes</text>
          <text x="340" y="702" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">Todos los casos · historial del bot · persiste al reasignar</text>

          <rect x="80" y="738" width="520" height="66" rx="8" fill="#F1EFE8" stroke="#5F5E5A" strokeWidth="0.5"/>
          <text x="340" y="760" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#444441">Notificaciones por email (5 triggers)</text>
          <text x="340" y="782" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5F5E5A">Docs subidos · caso sin movimiento · plazo vence · msg del cliente · nuevo caso en pool</text>
        </svg>
      </div>

      <div className="mt-6 text-[11px] text-[#B4B2A9] text-center">
        tuHerenciaFácil — Documentación interna
      </div>
    </div>
  )
}
