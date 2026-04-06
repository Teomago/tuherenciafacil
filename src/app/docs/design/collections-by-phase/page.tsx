'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function CollectionsByPhase() {
  const [activePhase, setActivePhase] = useState('pre')

  const data = [
    {
      id: 'pre', label: 'Pre-pago', title: 'Pre-pago — Filtro de elegibilidad, consulta y pago',
      desc: '5 pantallas: filtro de elegibilidad (/app), agendamiento (/consulta), pago de consulta (/consulta/pago), formulario de intake (/nueva-consulta), pago del paquete (/pago). Al pagar el paquete se crea el caso.',
      collections: [
        { name: 'Members', active: true, ops: ['create'], header: '#EEEDFE', headerText: '#3C3489', details: [{ who: 'client', text: 'Crea su cuenta con: email, password, nombre, cédula, teléfono, ciudad. Role se fuerza a "cliente".' }, { who: 'server', text: 'Hook afterCreate envía email de verificación vía SMTP2GO.' }], triggers: ['Email de verificación de cuenta'] },
        { name: 'Appointments', active: true, ops: ['create', 'update'], header: '#FFF4EC', headerText: '#CC6010', details: [{ who: 'client', text: 'Crea cita (tipo: consulta_virtual o consulta_presencial), elige fecha y hora. El Appointment queda en status: scheduled.' }, { who: 'lawyer', text: 'Al realizar la sesión: puede marcar autorizarCredito = true para habilitar el descuento del costo de la consulta al contratar el paquete.' }], triggers: ['Si autorizarCredito = true → Payment tipo creditoConsulta se aplica al crear el Case'] },
        { name: 'CaseIntake', active: true, ops: ['create', 'update'], header: '#E6F1FB', headerText: '#0C447C', details: [{ who: 'client', text: 'Llena formulario de intake: datos del causante, herederos estimados, bienes conocidos, elige Tier (estandar/premium). Puede guardar como borrador (status: draft) o enviar (status: submitted).' }], triggers: [] },
        { name: 'Cases', active: true, ops: ['create'], header: '#E1F5EE', headerText: '#085041', details: [{ who: 'webhook', text: 'El webhook de Wompi confirma pago del paquete → crea Case con datos copiados del CaseIntake. ID: SUC-YYYY-NNN. faseActual = 0. tier = elegido. abogadoAsignado = null.' }, { who: 'server', text: 'Si había crédito autorizado (autorizarCredito = true en Appointment): crea Payment tipo creditoConsulta con monto negativo y lo vincula al caso.' }], triggers: ['Email al cliente: confirmación de pago y caso creado', 'Email a abogados: nuevo caso en pool'] },
        { name: 'Payments', active: true, ops: ['create'], header: '#FAECE7', headerText: '#712B13', details: [{ who: 'webhook', text: 'Payment tipo "cuota" con monto, wompiTransactionId y fecha. Si hay crédito: también crea Payment tipo "creditoConsulta" con monto negativo.' }], triggers: [] },
        { name: 'Heirs', active: false, ops: [], details: [], triggers: [] },
        { name: 'Assets', active: false, ops: [], details: [], triggers: [] },
        { name: 'DocumentChecklist', active: false, ops: [], details: [], triggers: [] },
        { name: 'Documents', active: false, ops: [], details: [], triggers: [] },
        { name: 'NotaryProcess', active: false, ops: [], details: [], triggers: [] },
        { name: 'ChatMessages', active: false, ops: [], details: [], triggers: [] },
      ]
    },
    {
      id: 'f0', label: 'F0 · Asignación', title: 'Fase 0 — Asignación del caso al abogado',
      desc: 'El caso está en el pool. Un abogado lo toma. El cliente espera.',
      collections: [
        { name: 'Members', active: true, ops: ['read'], header: '#EEEDFE', headerText: '#3C3489', details: [{ who: 'client', text: 'Lee su perfil para el dashboard.' }, { who: 'lawyer', text: 'Lee datos del cliente asociado al caso.' }], triggers: [] },
        { name: 'Cases', active: true, ops: ['read', 'update'], header: '#E1F5EE', headerText: '#085041', details: [{ who: 'lawyer', text: 'Lee casos donde abogadoAsignado = null (pool). Botón "Tomar caso" → PATCH abogadoAsignado = member.id.' }, { who: 'client', text: 'Lee su caso: ve "Esperando asignación de abogado".' }], triggers: ['Email al cliente: abogado asignado con nombre y datos'] },
        { name: 'CaseIntake', active: false, ops: [], details: [], triggers: [] },
        { name: 'Appointments', active: false, ops: [], details: [], triggers: [] },
        { name: 'Payments', active: false, ops: [], details: [], triggers: [] },
        { name: 'Heirs', active: false, ops: [], details: [], triggers: [] },
        { name: 'Assets', active: false, ops: [], details: [], triggers: [] },
        { name: 'DocumentChecklist', active: false, ops: [], details: [], triggers: [] },
        { name: 'Documents', active: false, ops: [], details: [], triggers: [] },
        { name: 'NotaryProcess', active: false, ops: [], details: [], triggers: [] },
        { name: 'ChatMessages', active: true, ops: ['create'], header: '#E6F1FB', headerText: '#0C447C', details: [{ who: 'client', text: 'Puede usar el chat IA dentro de la app mientras espera.' }], triggers: [] },
      ]
    },
    {
      id: 'f1', label: 'F1 · Reunión', title: 'Fase 1 — Reunión inicial, contrato y anticipo',
      desc: 'Reunión presencial. Se firma contrato + poder, se declaran bienes y herederos formalmente, se cobra anticipo. El abogado registra todo en la app.',
      collections: [
        { name: 'Members', active: true, ops: ['read'], header: '#EEEDFE', headerText: '#3C3489', details: [{ who: 'client', text: 'Ve datos de su abogado asignado.' }], triggers: [] },
        { name: 'Cases', active: true, ops: ['update'], header: '#E1F5EE', headerText: '#085041', details: [{ who: 'lawyer', text: 'Registra datos de la reunión: fecha, lugar, notas. Marca checkboxes: contrato firmado ✓, poder firmado ✓. Al final avanza faseActual de 1 → 2.' }], triggers: ['Email al cliente: lista de documentos requeridos (al avanzar a fase 2)'] },
        { name: 'Heirs', active: true, ops: ['create'], header: '#E6F1FB', headerText: '#0C447C', details: [{ who: 'lawyer', text: 'Registra cada heredero formal: nombre, cédula, parentesco. Marca representación si aplica.' }, { who: 'client', text: 'También puede agregar herederos desde su panel.' }], triggers: [] },
        { name: 'Assets', active: true, ops: ['create'], header: '#E6F1FB', headerText: '#0C447C', details: [{ who: 'lawyer', text: 'Registra cada bien declarado: tipo (inmueble/vehículo/financiero), descripción, ubicación.' }], triggers: [] },
        { name: 'Documents', active: true, ops: ['create'], header: '#EAF3DE', headerText: '#27500A', details: [{ who: 'lawyer', text: 'Sube PDFs escaneados del contrato firmado y del poder de representación → R2.' }], triggers: [] },
        { name: 'Payments', active: true, ops: ['create'], header: '#FAECE7', headerText: '#712B13', details: [{ who: 'lawyer', text: 'Registra el anticipo recibido: monto, método (transferencia/efectivo/Nequi), fecha.' }], triggers: [] },
        { name: 'DocumentChecklist', active: true, ops: ['create'], header: '#FFF4EC', headerText: '#CC6010', details: [{ who: 'server', text: 'Hook de Cases al avanzar a fase 2: auto-genera el checklist. 2 docs del causante + 2 × N herederos + 1-2 × N bienes.' }], triggers: ['Checklist auto-generado basado en herederos y bienes registrados'] },
        { name: 'CaseIntake', active: false, ops: [], details: [], triggers: [] },
        { name: 'Appointments', active: false, ops: [], details: [], triggers: [] },
        { name: 'NotaryProcess', active: false, ops: [], details: [], triggers: [] },
        { name: 'ChatMessages', active: true, ops: ['create'], header: '#E6F1FB', headerText: '#0C447C', details: [{ who: 'client', text: 'Coordina fecha/lugar de reunión con el abogado por chat.' }, { who: 'lawyer', text: 'Responde al cliente para coordinar.' }], triggers: [] },
      ]
    },
    {
      id: 'f2', label: 'F2 · Documentos', title: 'Fase 2 — Recolección de documentos',
      desc: 'El cliente sube los documentos del checklist. El abogado espera y opcionalmente solicita investigación de bienes.',
      collections: [
        { name: 'DocumentChecklist', active: true, ops: ['read', 'update'], header: '#E6F1FB', headerText: '#0C447C', details: [{ who: 'client', text: 'Lee el checklist con las 3 secciones: causante, por heredero, por bien. Ve estado de cada item.' }, { who: 'server', text: 'Cuando se sube un documento, el item vinculado cambia status a "uploaded".' }], triggers: [] },
        { name: 'Documents', active: true, ops: ['create'], header: '#EAF3DE', headerText: '#27500A', details: [{ who: 'client', text: 'Sube PDFs/imágenes para cada item del checklist. Archivos van a R2. Max 10MB.' }], triggers: ['Email al abogado: "N documentos nuevos en caso X"'] },
        { name: 'Assets', active: true, ops: ['create', 'update'], header: '#E6F1FB', headerText: '#0C447C', details: [{ who: 'lawyer', text: 'Solicita investigación de bienes ($150k). Estado: solicitada → en proceso → recibida. Sube resultado como PDF. También puede agregar bienes encontrados en consulta gubernamental.' }], triggers: [] },
        { name: 'Heirs', active: true, ops: ['create'], header: '#E6F1FB', headerText: '#0C447C', details: [{ who: 'client', text: 'Puede agregar herederos que falten desde su panel.' }], triggers: ['Si se agrega heredero en fase 2+: auto-genera items nuevos en DocumentChecklist'] },
        { name: 'Cases', active: true, ops: ['read'], header: '#f1efe8', headerText: '#5F5E5A', details: [{ who: 'client', text: 'Lee progreso general del caso en el dashboard.' }, { who: 'lawyer', text: 'Ve badge de alerta "docs subidos" en la central de casos.' }], triggers: [] },
        { name: 'Members', active: false, ops: [], details: [], triggers: [] },
        { name: 'CaseIntake', active: false, ops: [], details: [], triggers: [] },
        { name: 'Appointments', active: false, ops: [], details: [], triggers: [] },
        { name: 'Payments', active: false, ops: [], details: [], triggers: [] },
        { name: 'NotaryProcess', active: false, ops: [], details: [], triggers: [] },
        { name: 'ChatMessages', active: false, ops: [], details: [], triggers: [] },
      ]
    },
    {
      id: 'f3', label: 'F3 · Validación', title: 'Fase 3 — Validación de documentos y subsanación',
      desc: 'El abogado revisa cada documento: aprueba, rechaza con nota, o solicita adicionales. Ciclo se repite hasta que todo esté aprobado.',
      collections: [
        { name: 'Documents', active: true, ops: ['read', 'update', 'create'], header: '#E6F1FB', headerText: '#0C447C', details: [{ who: 'lawyer', text: 'Abre cada PDF con signed URL (TTL: 1h). Aprueba o rechaza con nota visible para el cliente.' }, { who: 'client', text: 'Ve estado de cada documento. Si rechazado: lee nota del abogado. Sube versión corregida (nuevo Document vinculado como previousVersion).' }], triggers: ['Email al cliente: "documento X aprobado"', 'Email al cliente: "documento X requiere corrección"', 'Email al abogado: "documento corregido en caso X"'] },
        { name: 'DocumentChecklist', active: true, ops: ['update', 'create'], header: '#E6F1FB', headerText: '#0C447C', details: [{ who: 'lawyer', text: 'Actualiza status de cada item: approved / rejected + reviewNote. Puede crear items nuevos si necesita documentos adicionales.' }], triggers: [] },
        { name: 'Assets', active: true, ops: ['update'], header: '#E6F1FB', headerText: '#0C447C', details: [{ who: 'lawyer', text: 'Si encuentra hipotecas/embargos en los documentos revisados, registra hallazgosJuridicos en el bien correspondiente.' }], triggers: [] },
        { name: 'Cases', active: true, ops: ['update'], header: '#E1F5EE', headerText: '#085041', details: [{ who: 'lawyer', text: 'Cuando TODOS los items del checklist están en "approved": botón "Avanzar a fase 4". Server valida que no hay pendientes antes de aceptar.' }], triggers: ['Email al cliente: "todos los documentos en orden, avanzamos a notaría"'] },
        { name: 'Members', active: false, ops: [], details: [], triggers: [] },
        { name: 'CaseIntake', active: false, ops: [], details: [], triggers: [] },
        { name: 'Appointments', active: false, ops: [], details: [], triggers: [] },
        { name: 'Heirs', active: false, ops: [], details: [], triggers: [] },
        { name: 'Payments', active: false, ops: [], details: [], triggers: [] },
        { name: 'NotaryProcess', active: false, ops: [], details: [], triggers: [] },
        { name: 'ChatMessages', active: false, ops: [], details: [], triggers: [] },
      ]
    },
    {
      id: 'f4', label: 'F4 · Notaría', title: 'Fase 4 — Escritos y radicación ante notaría',
      desc: 'El abogado elabora escritos (offline), los radica, y espera respuesta del notario. Se crea el NotaryProcess.',
      collections: [
        { name: 'NotaryProcess', active: true, ops: ['create', 'update'], header: '#EAF3DE', headerText: '#27500A', details: [{ who: 'lawyer', text: 'CREA el registro: notaría, notario, fecha de radicación, número de radicado. Luego ACTUALIZA con respuesta del notario (aprobado / requiere documentos / correcciones).' }], triggers: [] },
        { name: 'Documents', active: true, ops: ['create'], header: '#EAF3DE', headerText: '#27500A', details: [{ who: 'lawyer', text: 'Sube escritos radicados (PDF). Si notario aprueba: sube autorización de edictos (PDF). Marcados como visibility: "internal".' }], triggers: [] },
        { name: 'Cases', active: true, ops: ['read', 'update'], header: '#E1F5EE', headerText: '#085041', details: [{ who: 'client', text: 'Lee: timeline dice "Tus documentos están en la notaría".' }, { who: 'lawyer', text: 'Cuando autorización recibida → avanza a fase 5.' }], triggers: ['Email al cliente: "edictos autorizados, avanzamos"'] },
        { name: 'Members', active: false, ops: [], details: [], triggers: [] },
        { name: 'CaseIntake', active: false, ops: [], details: [], triggers: [] },
        { name: 'Appointments', active: false, ops: [], details: [], triggers: [] },
        { name: 'Heirs', active: false, ops: [], details: [], triggers: [] },
        { name: 'Assets', active: false, ops: [], details: [], triggers: [] },
        { name: 'DocumentChecklist', active: false, ops: [], details: [], triggers: [] },
        { name: 'Payments', active: false, ops: [], details: [], triggers: [] },
        { name: 'ChatMessages', active: false, ops: [], details: [], triggers: [] },
      ]
    },
    {
      id: 'f5', label: 'F5 · Edictos', title: 'Fase 5 — Publicación de edictos y plazo legal',
      desc: 'Se publican edictos en periódico/radio. 10 días hábiles de espera legal. El sistema calcula automáticamente la fecha de vencimiento.',
      collections: [
        { name: 'NotaryProcess', active: true, ops: ['update'], header: '#E6F1FB', headerText: '#0C447C', details: [{ who: 'lawyer', text: 'Registra: medio de publicación, fecha, costo. El hook calcula fechaVencimiento = fecha + 10 días hábiles (excl. fines de semana + festivos CO). Después marca comprobantesEntregados = true con fecha.' }], triggers: ['Hook: cálculo automático de fecha de vencimiento con festivos colombianos'] },
        { name: 'Documents', active: true, ops: ['create'], header: '#EAF3DE', headerText: '#27500A', details: [{ who: 'lawyer', text: 'Sube: edicto firmado (PDF) y comprobante de pago de publicación (PDF).' }], triggers: [] },
        { name: 'Cases', active: true, ops: ['read', 'update'], header: '#E1F5EE', headerText: '#085041', details: [{ who: 'client', text: 'Lee: countdown de días hábiles restantes en el timeline.' }, { who: 'lawyer', text: 'Cuando comprobantes entregados → avanza a fase 6.' }], triggers: ['Email al cliente: "edictos completados, siguiente paso: validación"'] },
        { name: 'Members', active: false, ops: [], details: [], triggers: [] },
        { name: 'CaseIntake', active: false, ops: [], details: [], triggers: [] },
        { name: 'Appointments', active: false, ops: [], details: [], triggers: [] },
        { name: 'Heirs', active: false, ops: [], details: [], triggers: [] },
        { name: 'Assets', active: false, ops: [], details: [], triggers: [] },
        { name: 'DocumentChecklist', active: false, ops: [], details: [], triggers: [] },
        { name: 'Payments', active: false, ops: [], details: [], triggers: [] },
        { name: 'ChatMessages', active: false, ops: [], details: [], triggers: [] },
      ]
    },
    {
      id: 'f6', label: 'F6 · DIAN/UGPP', title: 'Fase 6 — Validación DIAN / UGPP',
      desc: 'La notaría consulta internamente con DIAN y UGPP. ~3 semanas de espera. Si hay hallazgos, el abogado los gestiona.',
      collections: [
        { name: 'NotaryProcess', active: true, ops: ['update'], header: '#E6F1FB', headerText: '#0C447C', details: [{ who: 'lawyer', text: 'Actualiza dian.status y ugpp.status: pendiente → en_validación → aprobado (o hallazgos). Si hay hallazgos: documenta en textarea y gestiona resolución offline.' }], triggers: [] },
        { name: 'Cases', active: true, ops: ['read', 'update'], header: '#E1F5EE', headerText: '#085041', details: [{ who: 'client', text: 'Lee: timeline dice "Verificando con entidades del gobierno" + tiempo estimado.' }, { who: 'lawyer', text: 'Cuando ambos status = aprobado → avanza a fase 7.' }], triggers: ['Email al cliente: "todo aprobado, próximo paso: firma"'] },
        { name: 'Members', active: false, ops: [], details: [], triggers: [] },
        { name: 'CaseIntake', active: false, ops: [], details: [], triggers: [] },
        { name: 'Appointments', active: false, ops: [], details: [], triggers: [] },
        { name: 'Heirs', active: false, ops: [], details: [], triggers: [] },
        { name: 'Assets', active: false, ops: [], details: [], triggers: [] },
        { name: 'DocumentChecklist', active: false, ops: [], details: [], triggers: [] },
        { name: 'Documents', active: false, ops: [], details: [], triggers: [] },
        { name: 'Payments', active: false, ops: [], details: [], triggers: [] },
        { name: 'ChatMessages', active: false, ops: [], details: [], triggers: [] },
      ]
    },
    {
      id: 'f7', label: 'F7 · Firma', title: 'Fase 7 — Firma de escritura pública',
      desc: 'Todos los herederos firman en la notaría. El cliente paga gastos notariales + excedente. El abogado registra costos y sube la escritura.',
      collections: [
        { name: 'NotaryProcess', active: true, ops: ['update'], header: '#E6F1FB', headerText: '#0C447C', details: [{ who: 'lawyer', text: 'Registra: fecha/hora/lugar de firma. Costos notariales: derechos, impuesto de registro, boleta fiscal.' }], triggers: [] },
        { name: 'Documents', active: true, ops: ['create'], header: '#EAF3DE', headerText: '#27500A', details: [{ who: 'lawyer', text: 'Sube escritura pública de sucesión firmada (PDF). Marcada visibility: "client" para que el cliente la pueda descargar.' }], triggers: [] },
        { name: 'Payments', active: true, ops: ['create'], header: '#FAECE7', headerText: '#712B13', details: [{ who: 'lawyer', text: 'Crea Payments por cada concepto notarial (derechos, impuesto, boleta). Registra excedente de honorarios recibido.' }, { who: 'client', text: 'Si pasarela integrada: paga excedente online vía Wompi.' }], triggers: ['Email al cliente: "costos notariales definidos + desglose"'] },
        { name: 'Cases', active: true, ops: ['update'], header: '#E1F5EE', headerText: '#085041', details: [{ who: 'client', text: 'Lee: fecha de firma, costos, lugar en el timeline.' }, { who: 'lawyer', text: 'Cuando escritura subida + pagos registrados → avanza a fase 8.' }], triggers: ['Email al cliente: "escritura firmada, último paso: registro"'] },
        { name: 'Members', active: false, ops: [], details: [], triggers: [] },
        { name: 'CaseIntake', active: false, ops: [], details: [], triggers: [] },
        { name: 'Appointments', active: false, ops: [], details: [], triggers: [] },
        { name: 'Heirs', active: false, ops: [], details: [], triggers: [] },
        { name: 'Assets', active: false, ops: [], details: [], triggers: [] },
        { name: 'DocumentChecklist', active: false, ops: [], details: [], triggers: [] },
        { name: 'ChatMessages', active: false, ops: [], details: [], triggers: [] },
      ]
    },
    {
      id: 'f8', label: 'F8 · Registro', title: 'Fase 8 — Registro y cierre del caso',
      desc: 'La escritura se registra en instrumentos públicos (~1 mes). Al confirmar registro, el caso se cierra oficialmente.',
      collections: [
        { name: 'NotaryProcess', active: true, ops: ['update'], header: '#E6F1FB', headerText: '#0C447C', details: [{ who: 'lawyer', text: 'Registra fecha de salida para registro. Actualiza status: en_registro → registrado con fecha de registro en folio de matrícula.' }], triggers: [] },
        { name: 'Documents', active: true, ops: ['create'], header: '#EAF3DE', headerText: '#27500A', details: [{ who: 'lawyer', text: 'Sube certificado de tradición actualizado con nuevos propietarios (PDF). Visibility: "client".' }, { who: 'client', text: 'Descarga documentos finales: escritura pública + certificado de tradición (signed URLs).' }], triggers: [] },
        { name: 'Cases', active: true, ops: ['update'], header: '#E1F5EE', headerText: '#085041', details: [{ who: 'lawyer', text: 'Botón "Marcar como completado" → status = "completed". Se registra fechaCompletado. Genera métricas: duración total, documentos procesados.' }], triggers: ['Email al cliente: "¡Sucesión completada! Bienes registrados a su nombre"', 'Email al abogado: "caso cerrado + resumen de métricas"'] },
        { name: 'Members', active: false, ops: [], details: [], triggers: [] },
        { name: 'CaseIntake', active: false, ops: [], details: [], triggers: [] },
        { name: 'Appointments', active: false, ops: [], details: [], triggers: [] },
        { name: 'Heirs', active: false, ops: [], details: [], triggers: [] },
        { name: 'Assets', active: false, ops: [], details: [], triggers: [] },
        { name: 'DocumentChecklist', active: false, ops: [], details: [], triggers: [] },
        { name: 'Payments', active: false, ops: [], details: [], triggers: [] },
        { name: 'ChatMessages', active: false, ops: [], details: [], triggers: [] },
      ]
    }
  ]

  const activePhaseData = data.find(p => p.id === activePhase)

  const opLabel: Record<string, string> = { create: 'CREATE', read: 'READ', update: 'UPDATE', trigger: 'TRIGGER' }
  const opClass: Record<string, string> = {
    create: 'bg-[#EAF3DE] text-[#27500A]',
    read: 'bg-[#f1efe8] text-[#444441]',
    update: 'bg-[#E6F1FB] text-[#0C447C]',
    trigger: 'bg-[#FFF4EC] text-[#CC6010]'
  }
  
  const whoLabel: Record<string, string> = { client: 'Cliente', lawyer: 'Abogado', server: 'Server', webhook: 'Webhook' }
  const whoClass: Record<string, string> = {
    client: 'bg-[#EEEDFE] text-[#3C3489]',
    lawyer: 'bg-[#E1F5EE] text-[#085041]',
    server: 'bg-[#F1EFE8] text-[#444441]',
    webhook: 'bg-[#FAECE7] text-[#712B13]'
  }

  return (
    <div className="max-w-[960px] mx-auto py-5 px-5 font-sans min-h-screen">
      <Link href="/docs" className="text-[#3A8DA8] text-[13px] hover:underline mb-4 inline-block">← Volver al inicio</Link>
      
      <h1 className="text-[20px] font-medium text-[#002845] mb-1 mt-4">Colecciones de Payload × Fases del proceso</h1>
      <p className="text-[13px] text-[#5F5E5A] mb-5">Qué colección se toca en cada fase, con qué operación, y por quién</p>

      <div className="flex flex-wrap gap-2.5 mb-5 py-3 px-4 bg-white rounded-lg border border-[#e2e0d8]">
        <div className="flex items-center gap-[5px] text-[11px] text-[#444441]"><div className="w-[12px] h-[12px] rounded-[3px] border border-black/10 bg-[#EAF3DE]"></div>CREATE</div>
        <div className="flex items-center gap-[5px] text-[11px] text-[#444441]"><div className="w-[12px] h-[12px] rounded-[3px] border border-black/10 bg-[#E6F1FB]"></div>UPDATE</div>
        <div className="flex items-center gap-[5px] text-[11px] text-[#444441]"><div className="w-[12px] h-[12px] rounded-[3px] border border-black/10 bg-[#f1efe8]"></div>READ</div>
        <div className="flex items-center gap-[5px] text-[11px] text-[#444441]"><div className="w-[12px] h-[12px] rounded-[3px] border border-black/10 bg-[#FFF4EC]"></div>TRIGGER</div>
        <div className="flex items-center gap-[5px] text-[11px] text-[#444441]"><div className="w-[12px] h-[12px] rounded-[3px] border border-black/10 bg-[#EEEDFE]"></div>Cliente</div>
        <div className="flex items-center gap-[5px] text-[11px] text-[#444441]"><div className="w-[12px] h-[12px] rounded-[3px] border border-black/10 bg-[#E1F5EE]"></div>Abogado</div>
        <div className="flex items-center gap-[5px] text-[11px] text-[#444441]"><div className="w-[12px] h-[12px] rounded-[3px] border border-black/10 bg-[#F1EFE8]"></div>Server</div>
        <div className="flex items-center gap-[5px] text-[11px] text-[#444441]"><div className="w-[12px] h-[12px] rounded-[3px] border border-black/10 bg-[#FAECE7]"></div>Webhook</div>
      </div>

      <div className="flex gap-1 flex-wrap mb-5 sticky top-0 bg-[#f8f7f4] py-2 z-10">
        {data.map((p) => (
          <button 
            key={p.id}
            onClick={() => setActivePhase(p.id)}
            className={`px-3.5 py-[7px] text-[12px] border rounded-md cursor-pointer transition-all duration-150 whitespace-nowrap ${activePhase === p.id ? 'bg-[#002845] text-white border-[#002845]' : 'border-[#d3d1c7] bg-white text-[#5F5E5A] hover:bg-[#EBF5FA] hover:text-[#3A8DA8] hover:border-[#3A8DA8]'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-300">
        {activePhaseData && (
          <div>
            <div className="mb-5">
              <div className="text-[18px] font-medium text-[#002845] mb-1.5">{activePhaseData.title}</div>
              <div className="text-[13px] text-[#5F5E5A] leading-relaxed py-3 px-4 bg-[#EDF5FB] rounded-lg border-l-[3px] border-[#3A8DA8]">
                {activePhaseData.desc}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {activePhaseData.collections.filter(c => c.active).map((c, i) => (
                <div key={i} className="rounded-[10px] border border-[#e2e0d8] bg-white overflow-hidden shadow-sm">
                  <div className="py-2.5 px-3.5 flex items-center justify-between" style={{ backgroundColor: c.header }}>
                    <span className="text-[14px] font-medium" style={{ color: c.headerText }}>{c.name}</span>
                    <div className="flex gap-1">
                      {c.ops?.map(o => (
                        <span key={o} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-[3px] tracking-[.3px] ${opClass[o]}`}>
                          {opLabel[o]}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {((c.details && c.details.length > 0) || (c.triggers && c.triggers.length > 0)) && (
                    <div className="py-2.5 px-3.5 border-t border-[#e2e0d8]">
                      {c.details?.map((d, di) => (
                        <div key={di} className="text-[11px] text-[#5F5E5A] leading-relaxed mb-1.5 last:mb-0">
                          <span className={`inline-block text-[9px] px-1.5 py-[1px] rounded-[3px] font-medium mr-1 ${whoClass[d.who]}`}>
                            {whoLabel[d.who]}
                          </span>
                          {d.text}
                        </div>
                      ))}

                      {c.triggers && c.triggers.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#e2e0d8]">
                          {c.triggers.map((t, ti) => (
                            <div key={ti} className="text-[11px] text-[#5F5E5A] py-1 flex items-start gap-1.5 leading-relaxed">
                              <span className="text-[#FF8C3C] font-semibold shrink-0 mt-[1px]">→</span>
                              {t}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {activePhaseData.collections.some(c => !c.active) && (
              <div className="bg-white rounded-[10px] border border-[#e2e0d8] py-4 px-5 mt-6 shadow-sm">
                <div className="text-[14px] font-medium text-[#002845] mb-3">No se tocan en esta fase</div>
                <div className="flex flex-wrap gap-1.5">
                  {activePhaseData.collections.filter(c => !c.active).map(c => (
                    <span key={c.name} className="text-[12px] text-[#B4B2A9] bg-[#f8f7f4] px-2.5 py-1 rounded-md">
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-[10px] border border-[#e2e0d8] py-4 px-5 mt-4 shadow-sm overflow-x-auto">
              <div className="text-[14px] font-medium text-[#002845] mb-3">Resumen de operaciones en esta fase</div>
              <table className="w-full text-[12px] text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-2 px-2.5 bg-[#f8f7f4] text-[#5F5E5A] font-medium border-b border-[#e2e0d8]">Colección</th>
                    <th className="py-2 px-2.5 bg-[#f8f7f4] text-[#5F5E5A] font-medium border-b border-[#e2e0d8]">Operaciones</th>
                    <th className="py-2 px-2.5 bg-[#f8f7f4] text-[#5F5E5A] font-medium border-b border-[#e2e0d8]">Quién actúa</th>
                  </tr>
                </thead>
                <tbody>
                  {activePhaseData.collections.filter(c => c.active).map(c => {
                    const whos = Array.from(new Set(c.details?.map(d => d.who) || []));
                    return (
                      <tr key={c.name} className="border-b border-[#f1efe8] last:border-0">
                        <td className="py-2 px-2.5 font-medium text-[#444441]">{c.name}</td>
                        <td className="py-2 px-2.5">
                          {c.ops?.map(o => (
                            <span key={o} className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-[3px] tracking-[.3px] mr-1 mb-1 ${opClass[o]}`}>
                              {opLabel[o]}
                            </span>
                          ))}
                        </td>
                        <td className="py-2 px-2.5">
                          {whos.map(w => (
                            <span key={w} className={`inline-block text-[9px] px-1.5 py-[1px] rounded-[3px] font-medium mr-1 mb-1 ${whoClass[w]}`}>
                              {whoLabel[w]}
                            </span>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
