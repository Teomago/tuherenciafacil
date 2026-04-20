'use client'

import React from 'react'
import { DiagramNav } from '../DiagramNav'

export default function Diagram05() {
  return (
    <div className="max-w-[760px] mx-auto py-5 px-5 font-sans min-h-screen">
      <div className="mb-6">
        <div className="text-[15px] font-medium text-[#002845] mb-4">tu<span className="text-[#FF8C3C]">Herencia</span>Fácil</div>
        <h1 className="text-[20px] font-medium text-[#002845] mb-1">Stack Architecture</h1>
        <p className="text-[13px] text-[#5F5E5A]">Arquitectura de la plataforma diseñada para alta disponibilidad, escalabilidad y automatización</p>
      </div>

      <DiagramNav />

      <div className="bg-white rounded-xl border border-[#e2e0d8] p-6 overflow-x-auto">
        <svg width="680" height="620" viewBox="0 0 680 620" xmlns="http://www.w3.org/2000/svg" style={{fontFamily: 'system-ui, -apple-system, sans-serif', display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto'}}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
          </defs>

          {/* DEV LAYER */}
          <g>
            <rect x="30" y="20" width="140" height="580" rx="16" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5" strokeDasharray="5 3"/>
            <text x="100" y="44" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#3C3489">Desarrollo</text>
          </g>
          <g>
            <rect x="46" y="60" width="108" height="48" rx="8" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
            <text x="100" y="80" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#3C3489">Claude Code</text>
            <text x="100" y="98" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">agente IA</text>
          </g>
          <g>
            <rect x="46" y="122" width="108" height="48" rx="8" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
            <text x="100" y="142" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#3C3489">Antigravity</text>
            <text x="100" y="160" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#534AB7">automatización</text>
          </g>
          <g>
            <rect x="46" y="184" width="108" height="48" rx="8" fill="#F1EFE8" stroke="#5F5E5A" strokeWidth="0.5"/>
            <text x="100" y="204" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#444441">RFC</text>
            <text x="100" y="222" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5F5E5A">planificación</text>
          </g>
          <g>
            <rect x="46" y="246" width="108" height="48" rx="8" fill="#F1EFE8" stroke="#5F5E5A" strokeWidth="0.5"/>
            <text x="100" y="266" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#444441">GitHub</text>
            <text x="100" y="284" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#5F5E5A">repositorio</text>
          </g>

          <line x1="154" y1="270" x2="192" y2="270" stroke="#73726c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)"/>
          <text x="173" y="263" textAnchor="middle" fontSize="12" fill="#73726c">push</text>

          {/* FRONTEND LAYER */}
          <g>
            <rect x="186" y="20" width="464" height="160" rx="16" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
            <text x="206" y="44" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#0C447C">Frontend + deploy</text>
          </g>
          <g>
            <rect x="202" y="58" width="130" height="56" rx="8" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
            <text x="267" y="78" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#0C447C">Vercel</text>
            <text x="267" y="98" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#185FA5">hosting + CDN</text>
          </g>
          <g>
            <rect x="348" y="58" width="130" height="56" rx="8" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
            <text x="413" y="78" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#0C447C">Next.js 16</text>
            <text x="413" y="98" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#185FA5">SSR + routing</text>
          </g>
          <g>
            <rect x="494" y="58" width="140" height="56" rx="8" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
            <text x="564" y="78" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#0C447C">Payload CMS</text>
            <text x="564" y="98" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#185FA5">admin + API</text>
          </g>
          <line x1="332" y1="86" x2="348" y2="86" stroke="#73726c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)"/>
          <line x1="478" y1="86" x2="494" y2="86" stroke="#73726c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)"/>

          <line x1="418" y1="180" x2="418" y2="216" stroke="#73726c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)"/>
          <line x1="408" y1="216" x2="408" y2="180" stroke="#73726c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)"/>
          <text x="442" y="202" textAnchor="start" fontSize="12" fill="#73726c">queries</text>

          {/* BACKEND LAYER */}
          <g>
            <rect x="186" y="220" width="464" height="120" rx="16" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
            <text x="206" y="244" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#085041">Backend — ORM + tipos</text>
          </g>
          <g>
            <rect x="202" y="258" width="180" height="56" rx="8" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
            <text x="292" y="278" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#085041">Drizzle ORM</text>
            <text x="292" y="298" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">migraciones + queries</text>
          </g>
          <g>
            <rect x="398" y="258" width="236" height="56" rx="8" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
            <text x="516" y="278" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#085041">TypeScript + payload-types</text>
            <text x="516" y="298" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#0F6E56">tipado end-to-end</text>
          </g>

          <line x1="418" y1="340" x2="418" y2="376" stroke="#73726c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)"/>
          <line x1="408" y1="376" x2="408" y2="340" stroke="#73726c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)"/>

          {/* DATA LAYER */}
          <g>
            <rect x="186" y="380" width="220" height="120" rx="16" fill="#EAF3DE" stroke="#3B6D11" strokeWidth="0.5"/>
            <text x="206" y="404" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#27500A">Base de datos</text>
          </g>
          <g>
            <rect x="202" y="418" width="188" height="56" rx="8" fill="#EAF3DE" stroke="#3B6D11" strokeWidth="0.5"/>
            <text x="296" y="438" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#27500A">Neon PostgreSQL</text>
            <text x="296" y="458" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3B6D11">serverless + scale-to-zero</text>
          </g>

          {/* STORAGE LAYER */}
          <g>
            <rect x="420" y="380" width="230" height="120" rx="16" fill="#FAEEDA" stroke="#854F0B" strokeWidth="0.5"/>
            <text x="440" y="404" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#633806">Almacenamiento</text>
          </g>
          <g>
            <rect x="436" y="418" width="198" height="56" rx="8" fill="#FAEEDA" stroke="#854F0B" strokeWidth="0.5"/>
            <text x="535" y="438" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#633806">Cloudflare R2</text>
            <text x="535" y="458" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#854F0B">S3-compat · sin egress</text>
          </g>

          <line x1="296" y1="500" x2="296" y2="536" stroke="#73726c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)"/>
          <line x1="535" y1="500" x2="535" y2="536" stroke="#73726c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)"/>

          {/* EMAIL LAYER */}
          <g>
            <rect x="186" y="540" width="464" height="60" rx="16" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
            <text x="206" y="562" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#712B13">Email transaccional</text>
          </g>
          <g>
            <rect x="202" y="556" width="432" height="28" rx="6" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
            <text x="418" y="570" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#712B13">SMTP2GO — dominios ilimitados · $10 USD/mes</text>
          </g>
        </svg>
      </div>

      <div className="mt-6 text-[11px] text-[#B4B2A9] text-center">
        tuHerenciaFácil — Documentación interna
      </div>
    </div>
  )
}
