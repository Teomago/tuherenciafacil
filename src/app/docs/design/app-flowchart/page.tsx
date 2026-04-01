'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function AppFlowchart() {
  const [activePhase, setActivePhase] = useState('pre')

  const phases = [
    {
      id: 'pre', label: 'Pre-pago', title: 'Pre-pago — Del visitante al caso creado',
      why: 'Todo antes del muro de pago. El cliente se registra, llena el intake, y paga para crear el caso. El abogado no interviene todavía.',
      steps: [
        {
          label: 'Paso 1 — Descubrimiento y Registro (Gratis)',
          client: { actions: [
            { title: 'Visita la landing y crea cuenta', how: 'Navega a tuherenciafacil.com. Se registra sin costo para acceder a herramientas básicas. POST /api/members.', tags: [{ t: 'create', l: 'Member (role: cliente)' }] },
            { title: 'Usa el chat IA básico', how: 'Dentro de la app, puede usar el chat para preguntas generales. El bot responde, pero con límites estrictos. Constantemente sugiere "Para iniciar tu proceso real y hablar con un abogado, adquiere un paquete."', tags: [{ t: 'read', l: 'API IA (limitada)' }] },
          ]},
          center: 'Zona "Freemium" — enganche del cliente',
          lawyer: { empty: 'No interviene todavía' }
        },
        {
          label: 'Paso 2 — Selección de paquete y Pago',
          client: { actions: [
            { title: 'Llena formulario de intake', how: 'Pantalla /app/nueva-consulta. Inputs: datos del causante, herederos, bienes. El sistema guarda el borrador.', tags: [{ t: 'create', l: 'Consultation (draft)' }] },
            { title: 'Elige paquete y paga', how: 'Pantalla /app/pago. Basado en la complejidad (o si tienen los papeles listos vs. necesitan ayuda total), elige un paquete. Paga vía Wompi. Al confirmar pago exitoso: se crea el Case real y se asigna a la fase de pool.', tags: [{ t: 'payment', l: 'Wompi → paquete adquirido' }, { t: 'create', l: 'Case (SUC-YYYY-NNN)' }, { t: 'trigger', l: 'Email confirmación al cliente' }] },
          ]},
          center: 'MURO DE PAGO — Wompi webhook → Caso creado',
          lawyer: { actions: [
            { title: 'Recibe notificación de nuevo caso', how: 'Email: "Nuevo caso disponible en el pool — SUC-2024-XXX". En /app/casos, sección "Sin asignar".', tags: [{ t: 'read', l: 'Cases in pool' }] },
          ]}
        },
      ]
    },
    {
      id: 'f0', label: 'F0 · Asignación', title: 'Fase 0 — Asignación del caso al abogado',
      why: 'El caso existe pero nadie lo atiende. Un abogado debe tomarlo del pool para que el proceso arranque. Mientras no haya abogado, el cliente solo puede esperar y chatear.',
      steps: [
        {
          label: 'Asignación',
          client: { actions: [
            { title: 'Ve su dashboard con caso en espera', how: 'Pantalla /app/dashboard. Tarjeta del caso: "Esperando asignación de abogado". Barra de progreso en 0%. No puede hacer acciones sobre el caso todavía. Puede usar el chat IA dentro de la app.', tags: [{ t: 'read', l: 'Case.faseActual = 0, abogadoAsignado = null' }] },
          ]},
          center: 'Caso en pool → abogado lo toma',
          lawyer: { actions: [
            { title: 'Ve caso en pool sin asignar', how: 'Pantalla /app/casos, sección superior "Sin asignar". Cada caso muestra: causante, herederos estimados, bienes, fecha de pago, complejidad estimada.', tags: [{ t: 'read', l: 'Cases where abogadoAsignado = null' }] },
            { title: 'Toma el caso', how: 'Botón "Tomar caso" → PATCH /api/cases/:id con body { abogadoAsignado: member.id }. El caso desaparece del pool y aparece en "Mis casos". Se habilita el chat directo con el cliente.', tags: [{ t: 'update', l: 'Case.abogadoAsignado = member.id' }, { t: 'trigger', l: 'Email al cliente: abogado asignado, nombre y datos' }, { t: 'trigger', l: 'Chat: canal "abogado" se activa para el cliente' }] },
          ]}
        },
      ]
    },
    {
      id: 'f1', label: 'F1 · Reunión', title: 'Fase 1 — Reunión inicial, contrato y anticipo',
      why: 'Primera interacción real entre abogado y cliente (presencial). Se firma contrato + poder, se declaran bienes formalmente, y se cobra el anticipo. Todo pasa offline — la app solo documenta los resultados.',
      steps: [
        {
          label: 'Coordinación y reunión',
          client: { actions: [
            { title: 'Recibe email de abogado asignado', how: 'Email automático con nombre, teléfono y datos del abogado. En el dashboard, el caso ahora muestra "Abogado: Dra. Paola Rodríguez".', tags: [{ t: 'read', l: 'Case.abogadoAsignado → Member' }] },
            { title: 'Coordina reunión por chat', how: 'En /app/chat, canal "Abogado". Acuerda fecha, hora y lugar de la reunión presencial.', tags: [{ t: 'create', l: 'ChatMessages[]' }] },
            { title: 'Asiste a reunión (offline)', how: 'Presencial. Firma contrato de servicios. Firma poder de representación. Declara bienes. Paga anticipo (transferencia/efectivo/Nequi).', tags: [] },
          ]},
          center: '← Reunión presencial → Chat para coordinar',
          lawyer: { actions: [
            { title: 'Coordina por chat', how: 'Responde al cliente en /app/chat. Define fecha y lugar de la reunión.', tags: [{ t: 'create', l: 'ChatMessages[]' }] },
            { title: 'Registra reunión en el sistema', how: 'Pantalla /app/caso/[id]. Form: fecha de reunión (date), lugar (input), notas (textarea). Checkboxes: ☑ Contrato firmado, ☑ Poder firmado. Upload de PDFs escaneados de contrato y poder a R2 vía POST /api/documents.', tags: [{ t: 'update', l: 'Case.reunion (fecha, lugar)' }, { t: 'create', l: 'Documents[] (contrato.pdf, poder.pdf → R2)' }] },
            { title: 'Registra bienes declarados', how: 'Pantalla /app/caso/[id]/bienes. Por cada bien: select tipo (inmueble/vehículo/financiero/otro), input descripción, input ubicación. Botón "+ Agregar bien" para repetir. POST /api/assets por cada bien.', tags: [{ t: 'create', l: 'Assets[] (tipo, descripción, ubicación)' }] },
            { title: 'Registra herederos formales', how: 'Pantalla /app/caso/[id]/herederos. El intake tenía un número estimado — ahora se registran con datos reales. Por cada heredero: nombre completo, cédula, parentesco (select), teléfono, email. Si hay representación: checkbox "Heredero por representación" + select heredero original. POST /api/heirs.', tags: [{ t: 'create', l: 'Heirs[] (nombre, cédula, parentesco, representación)' }] },
            { title: 'Registra anticipo', how: 'Pantalla /app/caso/[id]/pagos. Form: monto (number), método (select: transferencia/efectivo/Nequi), fecha (date). POST /api/payments.', tags: [{ t: 'create', l: 'Payment (tipo: anticipo, monto, método)' }] },
            { title: 'Avanza a fase 2', how: 'Botón "Avanzar a fase 2" con modal de confirmación. PATCH /api/cases/:id con { faseActual: 2 }. Hook post-update: genera automáticamente el checklist de documentos basado en herederos y bienes registrados.', tags: [{ t: 'update', l: 'Case.faseActual = 2' }, { t: 'create', l: 'DocumentChecklist[] (auto-generado)' }, { t: 'trigger', l: 'Email al cliente: lista de documentos requeridos' }] },
          ]}
        },
      ]
    },
    {
      id: 'f2', label: 'F2 · Documentos', title: 'Fase 2 — Recolección de documentos',
      why: 'El cliente sube los documentos que el checklist requiere. El checklist se generó automáticamente: 2 docs del causante + 2 docs × N herederos + 1-2 docs × N bienes. El abogado espera y opcionalmente solicita investigación de bienes.',
      steps: [
        {
          label: 'Cliente sube, abogado espera',
          client: { actions: [
            { title: 'Ve checklist auto-generado', how: 'Pantalla /app/caso/[id]/documentos. GET /api/document-checklist?case=:id retorna la lista organizada en 3 secciones: Del causante, Por heredero, Por bien. Cada item con status "Pendiente" y botón de upload.', tags: [{ t: 'read', l: 'DocumentChecklist[] (auto-generado en F1)' }] },
            { title: 'Sube documentos uno por uno', how: 'Click en zona de upload o drag & drop. Acepta PDF/JPG/PNG, max 10MB. POST /api/documents con { checklistItem: id, file: ... }. File va a R2 vía @payloadcms/storage-s3. El checklist item cambia status de "Pendiente" a "En revisión". Badge verde aparece al lado del item.', tags: [{ t: 'create', l: 'Document (file → R2, status: uploaded)' }, { t: 'update', l: 'ChecklistItem.status = uploaded' }, { t: 'trigger', l: 'Email al abogado: "N documentos nuevos en caso XXX"' }] },
            { title: 'Completa datos de herederos', how: 'Si no lo hizo el abogado en F1, el cliente puede agregar herederos en /app/caso/[id]/herederos. Form igual que el del abogado pero sin campos de notas internas.', tags: [{ t: 'create', l: 'Heirs[] (si faltan)' }] },
          ]},
          center: 'Archivos van a R2 — checklist se actualiza en DB',
          lawyer: { actions: [
            { title: 'Ve notificación de docs subidos', how: 'En /app/dashboard: acción pendiente "Revisar 3 documentos nuevos — caso Vélez". En /app/casos: badge naranja "3 docs" al lado del caso. Email con detalle.', tags: [{ t: 'read', l: 'Documents where status = uploaded' }] },
            { title: 'Solicita investigación de bienes (opcional)', how: 'Pantalla /app/caso/[id]/bienes. Botón "Solicitar investigación de bienes". Form: costo (number, default $150.000), fecha de solicitud (date). Status: Solicitada → En proceso → Recibida. Cuando se recibe: upload del resultado (PDF a R2). POST /api/asset-investigations.', tags: [{ t: 'create', l: 'AssetInvestigation (costo, fecha, status)' }, { t: 'create', l: 'Document (resultado investigación → R2)' }] },
            { title: 'Consulta inmuebles en app del gobierno', how: 'Offline. Usa la cédula del causante para consultar bienes en el aplicativo gubernamental. Registra hallazgos en /app/caso/[id]/bienes — puede agregar bienes que el cliente no declaró.', tags: [{ t: 'create', l: 'Assets[] (bienes encontrados en investigación)' }] },
          ]}
        },
      ]
    },
    {
      id: 'f3', label: 'F3 · Validación', title: 'Fase 3 — Validación de documentos y subsanación',
      why: 'El abogado revisa cada documento. Si hay errores (nombre mal escrito en registro civil, hipoteca activa en certificado de tradición, etc.) rechaza con nota visible para el cliente, quien debe corregir y resubir. Este ciclo se repite hasta que todo esté aprobado.',
      steps: [
        {
          label: 'Ciclo de revisión (se repite hasta completar)',
          client: { actions: [
            { title: 'Ve estado actualizado de documentos', how: 'Pantalla /app/caso/[id]/documentos. Cada documento ahora tiene badge de estado: Aprobado, Requiere corrección (con nota), o En revisión.', tags: [{ t: 'read', l: 'Documents[].status + reviewNote' }] },
            { title: 'Lee nota del abogado', how: 'Click en documento rechazado → expande nota con instrucciones. Ej: "El registro civil de nacimiento de Juan tiene el segundo apellido del padre incorrecto. Solicitar corrección en la registraduría."', tags: [{ t: 'read', l: 'Document.reviewNote' }] },
            { title: 'Corrige y resube', how: 'El cliente gestiona la corrección offline (va a la registraduría, solicita nuevo documento). Luego sube la versión corregida: click en botón "Resubir" del documento → upload nuevo archivo. PATCH /api/documents/:id con nuevo file. Status vuelve a "En revisión". El archivo anterior se mantiene como historial.', tags: [{ t: 'update', l: 'Document (nuevo file → R2, status: uploaded)' }, { t: 'trigger', l: 'Email al abogado: "documento corregido en caso XXX"' }] },
          ]},
          center: 'Ciclo: revisar → rechazar/aprobar → corregir → resubir',
          lawyer: { actions: [
            { title: 'Abre documento para revisar', how: 'Pantalla /app/caso/[id]/documentos. Click en "Ver" → abre PDF en nueva pestaña. URL firmada de R2 que expira en 1 hora. GET /api/documents/:id/url genera signed URL.', tags: [{ t: 'read', l: 'Document file (signed URL → R2, TTL: 1h)' }] },
            { title: 'Aprueba documento', how: 'Botón "Aprobar" (verde) → PATCH /api/documents/:id con { status: "approved" }. Badge cambia a verde en ambas vistas (cliente y abogado).', tags: [{ t: 'update', l: 'Document.status = approved' }] },
            { title: 'Rechaza con nota', how: 'Botón "Rechazar" (rojo) → abre modal con textarea para nota. PATCH /api/documents/:id con { status: "rejected", reviewNote: "..." }. La nota es visible para el cliente.', tags: [{ t: 'update', l: 'Document.status = rejected + reviewNote' }] },
            { title: 'Solicita documento adicional', how: 'Botón "Solicitar adicional" → form: nombre del documento, descripción, a quién pertenece (causante/heredero/bien). POST /api/document-checklist crea nuevo item en el checklist con status "Pendiente".', tags: [{ t: 'create', l: 'ChecklistItem (nuevo requerimiento)' }] },
            { title: 'Envía feedback consolidado', how: 'Una vez que termina de revisar TODOS los documentos de esa tanda, presiona un botón "Notificar al cliente". Esto envía un ÚNICO email consolidado con el resumen de los documentos aprobados y las notas exactas de los que requieren corrección.', tags: [{ t: 'trigger', l: 'Email consolidado al cliente: Resumen de revisión documental' }] },
            { title: 'Registra hallazgos jurídicos', how: 'Si encuentra hipotecas, embargos, etc. en los documentos revisados → los registra en /app/caso/[id]/bienes como hallazgos. Textarea: "Apartamento tiene hipoteca activa con Davivienda — requiere paz y salvo."', tags: [{ t: 'update', l: 'Asset.hallazgosJuridicos' }] },
            { title: 'Todo aprobado → avanza a fase 4', how: 'Cuando todos los items del checklist tienen status "approved": se habilita el botón "Avanzar a fase 4". Validación server-side: PATCH /api/cases/:id verifica que no hay docs pendientes antes de aceptar el cambio de fase.', tags: [{ t: 'update', l: 'Case.faseActual = 4' }, { t: 'trigger', l: 'Email al cliente: "todos los documentos en orden, avanzamos a notaría"' }] },
          ]}
        },
      ]
    },
    {
      id: 'f4', label: 'F4 · Notaría', title: 'Fase 4 — Elaboración de escritos y radicación ante notaría',
      why: 'El abogado prepara los escritos legales (offline) y los radica en la notaría. El notario revisa y puede pedir correcciones o documentos adicionales. Si todo está bien, autoriza los edictos. El cliente solo ve que su caso avanzó — los detalles internos viven en /notaria.',
      steps: [
        {
          label: 'Radicación y respuesta del notario',
          client: { actions: [
            { title: 'Ve actualización en timeline', how: 'Pantalla /app/caso/[id]. Timeline actualizado: "Tus documentos están en la notaría — en revisión". No hay acción requerida del cliente. Puede ver datos de la notaría asignada (nombre, dirección).', tags: [{ t: 'read', l: 'Case.faseActual = 4' }] },
          ]},
          center: 'Trabajo del abogado en la notaría (offline + registro en app)',
          lawyer: { actions: [
            { title: 'Elabora escritos (offline)', how: 'Fuera de la app. Prepara los documentos legales formales para la notaría. Este trabajo no se registra en la app — solo el resultado.', tags: [] },
            { title: 'Registra radicación', how: 'Pantalla /app/caso/[id]/notaria. Form: Notaría, Notario, Fecha de radicación, Número de radicado. Upload de escritos radicados (PDF → R2). POST /api/notary-process.', tags: [{ t: 'create', l: 'NotaryProcess (notaría, notario, radicación)' }, { t: 'create', l: 'Documents[] (escritos → R2)' }] },
            { title: 'Registra respuesta del notario', how: 'Select con opciones: Aprobado sin observaciones, Requiere documentos adicionales, Requiere correcciones, Pendiente de revisión. Si aprobado: upload de autorización de edictos (PDF → R2). PATCH /api/notary-process/:id.', tags: [{ t: 'update', l: 'NotaryProcess.response' }, { t: 'create', l: 'Document (autorización edictos → R2)' }] },
            { title: 'Avanza a fase 5', how: 'Solo habilitado cuando response = "aprobado" y autorización está subida. Botón "Avanzar a fase 5" → PATCH /api/cases/:id.', tags: [{ t: 'update', l: 'Case.faseActual = 5' }, { t: 'trigger', l: 'Email al cliente: "edictos autorizados, avanzamos"' }] },
          ]}
        },
      ]
    },
    {
      id: 'f5', label: 'F5 · Edictos', title: 'Fase 5 — Publicación de edictos y plazo legal',
      why: 'Los edictos se publican en periódico y radio (offline). Hay un plazo legal de 10 días hábiles donde cualquier persona puede presentar derecho sobre la herencia. El sistema calcula automáticamente la fecha de vencimiento excluyendo fines de semana y festivos colombianos.',
      steps: [
        {
          label: 'Publicación y espera del plazo',
          client: { actions: [
            { title: 'Ve countdown de edictos', how: 'Pantalla /app/caso/[id]. Timeline: "Publicación oficial en curso". Muestra: Fecha de publicación, Días hábiles restantes, Fecha estimada de vencimiento. El countdown se calcula server-side con función que excluye sábados, domingos y festivos colombianos.', tags: [{ t: 'read', l: 'NotaryProcess.edicts (fechas calculadas)' }] },
          ]},
          center: '10 días hábiles — plazo legal obligatorio',
          lawyer: { actions: [
            { title: 'Publica edictos (offline)', how: 'Va a La República (periódico + radio) con la autorización. Paga la publicación. Los edictos salen al día siguiente.', tags: [] },
            { title: 'Registra publicación', how: 'Pantalla /app/caso/[id]/notaria. Form: Medio de publicación, Fecha de publicación, Costo de publicación. El sistema calcula automáticamente fechaVencimiento. Upload: edicto firmado (PDF), comprobante de pago (PDF).', tags: [{ t: 'update', l: 'NotaryProcess.edicts (fecha, medio, costo, vencimiento)' }, { t: 'create', l: 'Documents[] (edicto, comprobante → R2)' }] },
            { title: 'Recoge comprobantes (offline)', how: 'Cuando el plazo vence: va a recoger comprobantes físicos de publicación y los lleva a la notaría (~3 horas entre ambos lugares). Registra fecha de entrega en la app.', tags: [{ t: 'update', l: 'NotaryProcess.edicts.delivered = true + fecha' }] },
            { title: 'Avanza a fase 6', how: 'Solo habilitado cuando delivered = true. Botón "Avanzar a fase 6".', tags: [{ t: 'update', l: 'Case.faseActual = 6' }, { t: 'trigger', l: 'Email al cliente: "edictos completados, siguiente paso: validación"' }] },
          ]}
        },
      ]
    },
    {
      id: 'f6', label: 'F6 · DIAN/UGPP', title: 'Fase 6 — Validación DIAN / UGPP por la notaría',
      why: 'La notaría consulta internamente con la DIAN y la UGPP para verificar que el causante no tiene deudas pendientes (declaraciones de renta, multas, aportes). Esto toma ~3 semanas. Ni el cliente ni el abogado pueden acelerar este paso.',
      steps: [
        {
          label: 'Espera de validación (~3 semanas)',
          client: { actions: [
            { title: 'Ve estado de validación', how: 'Pantalla /app/caso/[id]. Timeline: "Verificando con entidades del gobierno". Muestra: Fecha de inicio, Tiempo estimado, Estado. Nota explicativa: "La notaría consulta con DIAN y UGPP que no haya deudas pendientes del causante."', tags: [{ t: 'read', l: 'NotaryProcess.dianStatus + ugppStatus' }] },
          ]},
          center: '~3 semanas — proceso interno de la notaría',
          lawyer: { actions: [
            { title: 'Registra inicio de validación', how: 'Pantalla /app/caso/[id]/notaria. La fecha de entrega de comprobantes de edictos marca automáticamente el inicio de esta fase.', tags: [{ t: 'update', l: 'NotaryProcess.dianStatus = pending' }, { t: 'update', l: 'NotaryProcess.ugppStatus = pending' }] },
            { title: 'Registra hallazgos (si aplica)', how: 'Si DIAN o UGPP reportan deudas, multas o pendientes: Select de estado: Hallazgos DIAN / Hallazgos UGPP, Textarea: detalle del hallazgo. El abogado gestiona la resolución offline y actualiza cuando se resuelve.', tags: [{ t: 'update', l: 'NotaryProcess.dian/ugpp (hallazgos, resolución)' }] },
            { title: 'Avanza a fase 7', how: 'Solo habilitado cuando ambos status = "approved". Botón "Avanzar a fase 7".', tags: [{ t: 'update', l: 'Case.faseActual = 7' }, { t: 'trigger', l: 'Email al cliente: "todo aprobado, próximo paso: firma de escritura"' }] },
          ]}
        },
      ]
    },
    {
      id: 'f7', label: 'F7 · Firma', title: 'Fase 7 — Firma de escritura pública de sucesión',
      why: 'El momento clave del proceso. Todos los herederos firman la escritura en la notaría. El cliente paga los gastos notariales directamente en la notaría + el excedente de honorarios al abogado. El abogado coordina la fecha y registra todo.',
      steps: [
        {
          label: 'Coordinación, firma y pagos',
          client: { actions: [
            { title: 'Ve fecha de firma y costos', how: 'Pantalla /app/caso/[id]. Timeline: "Firma de escritura". Datos: Fecha, Lugar. En /app/caso/[id]/pagos: desglose de costos notariales + saldo pendiente de honorarios.', tags: [{ t: 'read', l: 'NotaryProcess.signing' }, { t: 'read', l: 'Payments[] (costos + saldo)' }] },
            { title: 'Asiste a firmar (offline)', how: 'Todos los herederos con cédula original en la notaría. Verifican que nombres, datos y distribución estén correctos. Firman. Pagan gastos notariales directamente en ventanilla de la notaría.', tags: [] },
            { title: 'Paga excedente de honorarios', how: 'Si pasarela integrada: botón "Pagar saldo" en /app/caso/[id]/pagos → flujo Wompi. Si offline: transferencia/efectivo/Nequi directamente al abogado.', tags: [{ t: 'payment', l: 'Excedente honorarios (Wompi o registro manual)' }] },
          ]},
          center: '← Firma presencial en notaría → Pagos notariales + honorarios',
          lawyer: { actions: [
            { title: 'Registra fecha de firma', how: 'Pantalla /app/caso/[id]/notaria. Form: fecha (date), hora (time), lugar (input, pre-llenado con datos de la notaría del caso).', tags: [{ t: 'update', l: 'NotaryProcess.signing (fecha, hora, lugar)' }] },
            { title: 'Registra costos notariales', how: 'En /app/caso/[id]/notaria. Inputs: Derechos notariales, Impuesto de registro, Boleta fiscal. Total se calcula automáticamente. POST /api/payments con tipo "notarial" por cada concepto. Estos valores se reflejan automáticamente en /app/caso/[id]/pagos del cliente.', tags: [{ t: 'create', l: 'Payments[] (tipo: notarial, desglose)' }, { t: 'trigger', l: 'Email al cliente: "costos notariales definidos + desglose"' }] },
            { title: 'Sube escritura firmada', how: 'Upload de escritura pública de sucesión escaneada (PDF → R2). POST /api/documents con { visibility: "client" } para que el cliente pueda verla y descargarla.', tags: [{ t: 'create', l: 'Document (escritura pública → R2, visible: true)' }] },
            { title: 'Registra excedente recibido', how: 'POST /api/payments con tipo "excedente", monto, fecha, método.', tags: [{ t: 'create', l: 'Payment (tipo: excedente)' }] },
            { title: 'Avanza a fase 8', how: 'Cuando escritura subida + pagos registrados → botón "Avanzar a fase 8".', tags: [{ t: 'update', l: 'Case.faseActual = 8' }, { t: 'trigger', l: 'Email al cliente: "escritura firmada, último paso: registro"' }] },
          ]}
        },
      ]
    },
    {
      id: 'f8', label: 'F8 · Registro', title: 'Fase 8 — Registro en folio de matrícula inmobiliaria',
      why: 'La escritura sale de la notaría y va a la oficina de instrumentos públicos para registro. ~2 semanas para salir, ~1 mes para quedar registrada en el folio de matrícula. Cuando se confirma, el caso se cierra oficialmente.',
      steps: [
        {
          label: 'Registro y cierre del caso',
          client: { actions: [
            { title: 'Ve estado de registro', how: 'Pantalla /app/caso/[id]. Timeline: "Registrando a tu nombre". Muestra fecha estimada de registro.', tags: [{ t: 'read', l: 'NotaryProcess.registration' }] },
            { title: 'Recibe notificación de cierre', how: 'Email: "¡Felicidades! Su sucesión ha sido completada. Los bienes están registrados a nombre de los herederos." En el dashboard, el caso muestra ✓ Completado con fecha.', tags: [{ t: 'read', l: 'Case.status = completed' }] },
            { title: 'Descarga documentos finales', how: 'En /app/caso/[id]/documentos: escritura pública de sucesión y certificado de tradición actualizado disponibles para descarga (signed URLs de R2, regeneradas en cada click).', tags: [{ t: 'read', l: 'Documents[] (finales, signed URLs)' }] },
          ]},
          center: '~1 mes — registro en instrumentos públicos → CASO CERRADO',
          lawyer: { actions: [
            { title: 'Registra salida de escritura', how: 'Pantalla /app/caso/[id]/notaria. Fecha de salida para registro (date). Status: "En registro".', tags: [{ t: 'update', l: 'NotaryProcess.registration.status = in_progress' }] },
            { title: 'Registra fecha de registro', how: 'Cuando la oficina confirma que quedó registrada: fecha de registro en folio de matrícula (date). Status: "Registrada".', tags: [{ t: 'update', l: 'NotaryProcess.registration.status = completed + fecha' }] },
            { title: 'Sube certificado de tradición actualizado', how: 'Upload del certificado de tradición que ya muestra los nuevos propietarios (PDF → R2). Marcado como visible para el cliente.', tags: [{ t: 'create', l: 'Document (cert. tradición actualizado → R2, visible: true)' }] },
            { title: 'Cierra el caso', how: 'Botón "Marcar como completado" → modal de confirmación → PATCH /api/cases/:id con { status: "completed" }. El caso se mueve de "activos" a "completados" en el dashboard. Se generan métricas: duración total, número de documentos procesados, etc.', tags: [{ t: 'update', l: 'Case.status = completed' }, { t: 'trigger', l: 'Email al cliente: caso completado + resumen' }, { t: 'trigger', l: 'Email al abogado: caso cerrado + métricas' }] },
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
      <p className="text-[13px] text-[#5F5E5A] mb-5">Qué hace cada pantalla, cómo lo hace, y dónde encaja en el proceso</p>

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
