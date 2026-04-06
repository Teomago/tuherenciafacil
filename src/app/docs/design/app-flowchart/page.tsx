'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function AppFlowchart() {
  const [activePhase, setActivePhase] = useState('pre')

  const phases = [
    {
      id: 'pre', label: 'Pre-pago', title: 'Pre-pago — Filtro de Elegibilidad, Consulta y Contratación',
      why: '5 pantallas que convierten un visitante en cliente activo. El filtro al inicio asegura que solo sucesiones intestadas en mutuo acuerdo avanzan. El costo de la consulta se descuenta del paquete si Paola autoriza el crédito (autorizarCredito).',
      steps: [
        {
          label: 'Paso 0 — Filtro de Elegibilidad (/app)',
          client: { actions: [
            { title: 'Filtro de Elegibilidad', how: '<b>Pregunta 1 — ¿Hay testamento?</b> Si sí → pantalla "Fuera de alcance" (solo intestadas). <br/><b>Pregunta 2 — ¿Acuerdo entre herederos?</b> Si no → pantalla de retención con oferta de consulta de mediación. <br/>Si ambas pasan → continúa al embudo.', tags: [{ t: 'read', l: 'CaseIntake' }] },
          ]},
          center: 'Gate: Solo intestadas + mutuo acuerdo (DEC-003)',
          lawyer: { actions: [
            { title: 'Creación Manual (Shadow)', how: 'Paola puede crear el caso directamente desde /admin. Si el email no existe, el sistema crea una Shadow Account e invita al cliente a activarla.', tags: [{ t: 'create', l: 'Members (Shadow)' }, { t: 'create', l: 'Cases' }] },
          ]}
        },
        {
          label: 'Paso 1 — Registro y Agendamiento (/register + /consulta)',
          client: { actions: [
            { title: 'Crea cuenta', how: 'POST `/api/members`. Rol forzado a "cliente". Redirige a `/app/consulta`.', tags: [{ t: 'create', l: 'Members' }] },
            { title: 'Agenda consulta', how: 'Elige tipo de cita: <b>consulta_virtual ($70k)</b> o <b>consulta_presencial ($100k)</b>. Selecciona fecha y hora disponible.', tags: [{ t: 'create', l: 'Appointments' }] },
          ]},
          center: '6 tipos de cita disponibles',
          lawyer: { actions: [
            { title: 'Sesión de Estrategia', how: 'Virtual o presencial. Paola evalúa el caso, define el Tier (Estándar/Premium) y decide si aplica crédito: `autorizarCredito = true` en el Appointment correspondiente.', tags: [{ t: 'update', l: 'Appointments' }] },
          ]}
        },
        {
          label: 'Paso 2 — Pago de Consulta (/consulta/pago)',
          client: { actions: [
            { title: 'Paga la cita', how: 'Paga $70k o $100k vía Wompi. El Payment queda en `tipo: consulta` vinculado al Member (sin Case aún). El crédito queda registrado pero inactivo hasta que Paola lo autorice.', tags: [{ t: 'payment', l: 'Consulta' }, { t: 'update', l: 'Appointments' }] },
          ]},
          center: 'Credit oculto: activo solo con autorizarCredito = true',
          lawyer: { actions: [
            { title: 'Autorizar Crédito', how: 'Si Paola decide aplicar el crédito: va al Appointment en /admin y activa `autorizarCredito = true`. Esto habilitará el descuento al crear el caso.', tags: [{ t: 'update', l: 'Appointments' }] },
          ]}
        },
        {
          label: 'Paso 3 — Formulario de Intake (/nueva-consulta)',
          client: { actions: [
            { title: 'Llena el formulario', how: 'Datos del causante (nombre, cédula, fecha/ciudad de fallecimiento), herederos estimados, bienes conocidos. Elige el <b>Tier: Estándar o Premium</b>. Puede guardar como borrador.', tags: [{ t: 'create', l: 'CaseIntake' }] },
          ]},
          center: 'Tier elegido aquí — afecta cuotas y Fase 8',
          lawyer: { empty: 'El cliente llena este formulario de forma independiente.' }
        },
        {
          label: 'Paso 4 — Pago del Paquete (/pago)',
          client: { actions: [
            { title: 'Paga 1ra cuota', how: 'El sistema calcula: `Valor Cuota 1 - Crédito Autorizado (si aplica)`. El cliente paga el saldo restante vía Wompi. Al confirmar: se crea el Case con `faseActual = 0`.', tags: [{ t: 'payment', l: 'Cuota 1 (Sucesión)' }, { t: 'create', l: 'Cases' }] },
          ]},
          center: 'Cuotas obligatorias: 2 (Estándar) · 3 (Premium)',
          lawyer: { actions: [
            { title: 'Toma/Adjudica caso', how: 'El caso aparece en el pool de abogados. Si fue invitación directa queda bloqueado a Paola. Botón "Tomar caso" en `/app/casos`.', tags: [{ t: 'update', l: 'Cases' }] },
          ]}
        },
      ]
    },
    {
      id: 'f0', label: 'F0 · Kick-off', title: 'Fase 0 — Inicio de Gestión Unificado',
      why: 'Confirmación de asignación. Ambas partes ven el mismo proceso en /app con vistas personalizadas por rol.',
      steps: [
        {
          label: 'Preparación',
          client: { actions: [
            { title: 'Dashboard de Proceso', how: 'URL: `/app/caso/[id]`. Ve el timeline y su abogado asignado.', tags: [{ t: 'read', l: 'Cases' }] },
          ]},
          center: 'Role-based access control in /app',
          lawyer: { actions: [
            { title: 'Panel de Gestión', how: 'Paola ve herramientas de gestión (notas internas, logs de sistema).', tags: [{ t: 'read', l: 'Cases (Admin View)' }] },
          ]}
        },
      ]
    },
    {
      id: 'f1', label: 'F1 · Reunión', title: 'Fase 1 — Formalización y Activos',
      why: 'Firma de documentos legales base y declaración formal de bienes.',
      steps: [
        {
          label: 'Carga de Documentos Base',
          client: { actions: [
            { title: 'Firma Poder y Contrato', how: 'Se firma en la cita incluida. Paola marca como "Recibido Físico" en el sistema.', tags: [] },
          ]},
          center: 'HARD GATE: Poder must be approved to reach Phase 4',
          lawyer: { actions: [
            { title: 'Registra Hechos', how: 'URL: `/app/caso/[id]/herederos`. POST `/api/heirs`. POST `/api/assets`.', tags: [{ t: 'create', l: 'Heirs' }, { t: 'create', l: 'Assets' }] },
            { title: 'Sube PDF Escaneados', how: 'Sube Poder y Contrato. Estado: "Aprobado" activa el avance legal.', tags: [{ t: 'create', l: 'Documents' }] },
          ]}
        },
      ]
    },
    {
      id: 'f2', label: 'F2 · Documentos', title: 'Fase 2 — Recolección e Investigación',
      why: 'Recolección de pruebas y validación de activos. La investigación de bienes es condicional: incluida en Premium (sin cobro adicional visible), add-on opcional de $150k en Estándar.',
      steps: [
        {
          label: 'Investigación de Bienes (condicional por Tier)',
          client: { actions: [
            { title: 'Estándar: paga investigación', how: 'URL: `/app/caso/[id]/bienes`. CTA visible con tarifa plana de <b>$150.000 COP</b> vía Wompi. Genera Payment `tipo: investigacion`.', tags: [{ t: 'payment', l: 'Investigación $150k' }] },
            { title: 'Premium: incluida sin cobro', how: 'El CTA de pago <b>no aparece</b> para clientes Premium. La investigación está incluida en el paquete — internamente Paola la registra como asset sin cargo visible.', tags: [{ t: 'read', l: 'Assets' }] },
          ]},
          center: 'Tier-conditional: $150k (Estándar) · Incluida (Premium)',
          lawyer: { actions: [
            { title: 'Registra Hallazgos', how: 'PATCH `/api/assets/:id`. Inmuebles (vía ORIP, gratis) + Vehículos/Bancos (agencia externa, tarifa plana). Sube resultados como PDF.', tags: [{ t: 'update', l: 'Assets' }] },
          ]}
        },
      ]
    },
    {
      id: 'f3', label: 'F3 · Validación', title: 'Fase 3 — Ciclo de Subsanación',
      why: 'Asegurar que todos los documentos están perfectos.',
      steps: [
        {
          label: 'Feedback Unificado',
          client: { actions: [
            { title: 'Recibe Alerta de Corrección', how: 'Email consolidado con todas las observaciones.', tags: [{ t: 'update', l: 'Documents' }] },
          ]},
          center: 'Automation: Reminder every 48h if docs pending',
          lawyer: { actions: [
            { title: 'Audita y Notifica', how: 'Presiona "Notificar Cliente" para disparar el feedback de toda la tanda.', tags: [{ t: 'trigger', l: 'Consolidated Email' }] },
          ]}
        },
      ]
    },
    {
      id: 'f4', label: 'F4 · Notaría', title: 'Fase 4 — Radicación y VoBo',
      why: 'Inicio del trámite formal ante el notario. Bloqueado si no hay Poder aprobado.',
      steps: [
        {
          label: 'Trámite Notarial',
          client: { actions: [
            { title: 'Tracking Pasivo', how: 'Ve estado "Radicado en Notaría" en su dashboard.', tags: [{ t: 'read', l: 'Cases' }] },
          ]},
          center: 'Review period (~15 business days)',
          lawyer: { actions: [
            { title: 'Gestiona Radicación', how: 'URL: `/app/caso/[id]/notaria`. Crea el NotaryProcess.', tags: [{ t: 'create', l: 'NotaryProcess' }] },
          ]}
        },
      ]
    },
    {
      id: 'f5', label: 'F5 · Edictos', title: 'Fase 5 — Cuota Final y Publicación',
      why: 'El edicto ha sido aprobado (VoBo). Hito de recaudo del saldo restante.',
      steps: [
        {
          label: 'Pago de Saldo Final',
          client: { actions: [
            { title: 'Recibe Cobro de Cuota Final', how: 'Incluye saldo de honorarios + costos de notaría estimados.', tags: [{ t: 'read', l: 'Payments' }] },
            { title: 'Paga Excedente', how: 'URL: `/app/pago-final`. Paga vía Wompi.', tags: [{ t: 'payment', l: 'Saldo Final' }] },
          ]},
          center: 'GATE: Full payment required to start Edicts',
          lawyer: { actions: [
            { title: 'Activa Edictos', how: 'Inicia publicación. La app activa el countdown visual de 10 días.', tags: [{ t: 'trigger', l: 'Edict Countdown' }] },
          ]}
        },
      ]
    },
    {
      id: 'f6', label: 'F6 · DIAN/UGPP', title: 'Fase 6 — Verificación de Deudas',
      why: 'Validación interna de la notaría (~3 semanas).',
      steps: [
        {
          label: 'Espera de Entidades',
          client: { actions: [
            { title: 'Timeline Visual', how: 'Animación de progreso de validación gubernamental.', tags: [{ t: 'read', l: 'NotaryProcess' }] },
          ]},
          center: '3 Week Legal Wait',
          lawyer: { actions: [
            { title: 'Registra Hallazgos', how: 'Si hay multas, las anota en el panel de gestión del caso.', tags: [{ t: 'update', l: 'NotaryProcess' }] },
          ]}
        },
      ]
    },
    {
      id: 'f7', label: 'F7 · Firma', title: 'Fase 7 — Firma de Escritura',
      why: 'Cierre del proceso legal principal. El comportamiento al finalizar esta fase es condicional según el Tier: Estándar cierra aquí, Premium/Elite continúan a Fase 8.',
      steps: [
        {
          label: 'Cita de Firma',
          client: { actions: [
            { title: 'Asiste y Firma', how: 'Todos los herederos firman la escritura pública en la notaría. El cliente paga los gastos notariales en ventanilla (derechos, impuesto de registro).', tags: [] },
          ]},
          center: 'Firma Presencial — comportamiento post-firma según Tier',
          lawyer: { actions: [
            { title: 'Estándar → Cierre aquí', how: 'Sube escritura firmada. El endpoint `advance-phase` detecta `tier: estandar` → cambia `status: completed`. Dispara "Email de Cierre" con instrucciones de registro para el cliente.', tags: [{ t: 'trigger', l: 'Email de Cierre (Estándar)' }, { t: 'update', l: 'Cases (completed)' }] },
            { title: 'Premium/Elite → Continúa a F8', how: 'Sube escritura firmada. El endpoint detecta `tier: premium` o `elite` → avanza a `faseActual: 8`. No cierra el caso todavía — Paola gestiona el registro en Instrumentos Públicos.', tags: [{ t: 'update', l: 'Cases (fase 8)' }] },
          ]}
        },
      ]
    },
    {
      id: 'f8', label: 'F8 · Registro', title: 'Fase 8 — Gestión Premium de Registro',
      why: 'Solo para planes Premium y Elite. Gestión de Supernotariado y Registro.',
      steps: [
        {
          label: 'Supernotariado',
          client: { actions: [
            { title: 'Recibe en Domicilio', how: 'Mensajería entrega la EP registrada (Premium/Elite).', tags: [] },
          ]},
          center: 'Premium Concierge',
          lawyer: { actions: [
            { title: 'Gestión de Folio', how: 'Trackea el registro y sube el certificado final.', tags: [{ t: 'update', l: 'NotaryProcess' }] },
          ]}
        },
      ]
    }
  ]

  const activePhaseData = phases.find(p => p.id === activePhase)

  const getTagColor = (t: string) => {
    switch (t) {
      case 'create': return 'bg-[#EAF3DE] text-[#27500A]'
      case 'update': return 'bg-[#E6F1FB] text-[#0C447C]'
      case 'read': return 'bg-[#f1efe8] text-[#444441]'
      case 'trigger': return 'bg-[#FFF4EC] text-[#CC6010]'
      case 'payment': return 'bg-[#FAECE7] text-[#712B13]'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrefix = (t: string) => t.toUpperCase()

  return (
    <div className="max-w-[960px] mx-auto py-5 px-5 font-sans min-h-screen">
      <Link href="/docs" className="text-[#3A8DA8] text-[13px] hover:underline mb-4 inline-block">← Volver al inicio</Link>
      
      <h1 className="text-[20px] font-medium text-[#002845] mb-1 mt-4">tuHerenciaFácil — Diagrama de flujo completo</h1>
      <p className="text-[13px] text-[#5F5E5A] mb-5">Arquitectura unificada en /app con Sistema de Cuotas, Créditos y Gate de Poder Legal</p>

      <div className="flex flex-wrap gap-2 mb-5 p-3 bg-white rounded-lg border border-[#e2e0d8]">
        <div className="flex items-center gap-[5px] text-[11px] text-[#5F5E5A]"><div className="w-[10px] h-[10px] rounded-[3px] bg-[#EAF3DE]"></div>CREATE — crea dato nuevo</div>
        <div className="flex items-center gap-[5px] text-[11px] text-[#5F5E5A]"><div className="w-[10px] h-[10px] rounded-[3px] bg-[#E6F1FB]"></div>UPDATE — modifica dato</div>
        <div className="flex items-center gap-[5px] text-[11px] text-[#5F5E5A]"><div className="w-[10px] h-[10px] rounded-[3px] bg-[#f1efe8]"></div>READ — lee dato</div>
        <div className="flex items-center gap-[5px] text-[11px] text-[#5F5E5A]"><div className="w-[10px] h-[10px] rounded-[3px] bg-[#FFF4EC]"></div>TRIGGER — dispara acción</div>
        <div className="flex items-center gap-[5px] text-[11px] text-[#5F5E5A]"><div className="w-[10px] h-[10px] rounded-[3px] bg-[#FAECE7]"></div>PAYMENT — transacción</div>
      </div>

      <div className="flex gap-1 flex-wrap mb-5 sticky top-0 bg-[#f8f7f4] py-2 z-10">
        {phases.map((p) => (
          <button 
            key={p.id}
            onClick={() => setActivePhase(p.id)}
            className={`px-3.5 py-[7px] text-[12px] border rounded-md cursor-pointer transition-all duration-150 ${activePhase === p.id ? 'bg-[#3A8DA8] text-white border-[#3A8DA8]' : 'border-[#d3d1c7] bg-white text-[#5F5E5A] hover:bg-[#EBF5FA] hover:text-[#3A8DA8] hover:border-[#3A8DA8]'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-300">
        {activePhaseData && (
          <>
            <div className="text-[18px] font-medium text-[#002845] mb-1.5">{activePhaseData.title}</div>
            <div className="text-[13px] text-[#5F5E5A] mb-5 leading-relaxed p-3 bg-[#EDF5FB] rounded-lg border-l-[3px] border-[#3A8DA8]">
              {activePhaseData.why}
            </div>

            {activePhaseData.steps.map((step, idx) => (
              <div key={idx}>
                {idx > 0 && <div className="border-t border-dashed border-[#e2e0d8] my-4"></div>}
                {step.label && <div className="text-[11px] font-medium text-[#3A8DA8] mb-2 uppercase tracking-[.4px]">{step.label}</div>}
                
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_90px_1fr] gap-0 mb-4">
                  {/* Client Lane */}
                  <div className="flex flex-col">
                    <div className="text-[11px] font-medium uppercase tracking-[.5px] py-2 px-2.5 text-center bg-[#EEEDFE] text-[#3C3489] rounded-t-md sm:rounded-tl-md sm:rounded-tr-none">Cliente</div>
                    <div className="p-2.5 min-h-[60px] bg-white border border-[#e2e0d8] sm:border-r-0 sm:rounded-bl-md rounded-b-md sm:rounded-br-none h-full">
                      {(step.client as any).empty ? (
                        <div className="text-[11px] text-[#B4B2A9] text-center py-5 px-2 italic">{(step.client as any).empty}</div>
                      ) : (
                        (step.client as any).actions?.map((a: any, i: number) => (
                          <div key={i} className="bg-[#fafaf8] border border-[#e2e0d8] rounded-md p-2.5 mb-2 last:mb-0">
                            <div className="text-[13px] font-medium text-[#002845] mb-1">{a.title}</div>
                            <div className="text-[11px] text-[#5F5E5A] leading-relaxed" dangerouslySetInnerHTML={{ __html: a.how }} />
                            {a.tags && a.tags.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {a.tags.map((tag: any, ti: number) => (
                                  <span key={ti} className={`inline-block text-[9px] px-1.5 py-0.5 rounded-[3px] font-semibold tracking-[.3px] ${getTagColor(tag.t)}`}>
                                    {getPrefix(tag.t)}: {tag.l}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Center Lane */}
                  <div className="hidden sm:flex flex-col">
                    <div className="text-[11px] font-medium uppercase tracking-[.5px] py-2 px-2.5 text-center bg-[#f1efe8] text-[#5F5E5A]">Datos</div>
                    <div className="flex items-center justify-center text-center text-[11px] text-[#888780] py-2.5 px-1.5 leading-relaxed bg-white border border-[#e2e0d8] h-full" dangerouslySetInnerHTML={{ __html: step.center }} />
                  </div>

                  {/* Lawyer Lane */}
                  <div className="flex flex-col">
                    <div className="text-[11px] font-medium uppercase tracking-[.5px] py-2 px-2.5 text-center bg-[#E1F5EE] text-[#085041] rounded-t-md sm:rounded-t-none sm:rounded-tr-md mt-2 sm:mt-0">Abogado</div>
                    <div className="p-2.5 min-h-[60px] bg-white border border-[#e2e0d8] sm:border-l-0 sm:rounded-br-md rounded-b-md sm:rounded-bl-none h-full">
                      {(step.lawyer as any).empty ? (
                        <div className="text-[11px] text-[#B4B2A9] text-center py-5 px-2 italic">{(step.lawyer as any).empty}</div>
                      ) : (
                        (step.lawyer as any).actions?.map((a: any, i: number) => (
                          <div key={i} className="bg-[#fafaf8] border border-[#e2e0d8] rounded-md p-2.5 mb-2 last:mb-0">
                            <div className="text-[13px] font-medium text-[#002845] mb-1">{a.title}</div>
                            <div className="text-[11px] text-[#5F5E5A] leading-relaxed" dangerouslySetInnerHTML={{ __html: a.how }} />
                            {a.tags && a.tags.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {a.tags.map((tag: any, ti: number) => (
                                  <span key={ti} className={`inline-block text-[9px] px-1.5 py-0.5 rounded-[3px] font-semibold tracking-[.3px] ${getTagColor(tag.t)}`}>
                                    {getPrefix(tag.t)}: {tag.l}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
