# DEC-004 — Tiers de Servicio y Modelo de Pagos

**Fecha:** 2026-04-01
**Participantes:** Mateo, Paola, Germán
**Estado:** Aprobada

## Contexto
Se definieron los tres niveles de servicio que ofrece tuHerenciaFácil, sus precios, modelos de cobro, y qué está incluido en cada uno. Esta decisión afecta la colección `Cases` (campo `tier`), la colección `Payments` (tipos y cuotas), el flujo de Fase 8, y la lógica del Sistema de Créditos por consulta previa.

## Tiers

### A. Estándar — $4.500.000 COP
- **Composición:** $4.000.000 (Honorarios) + $500.000 (Gastos operativos base)
- **Gastos operativos:** Los $500.000 cubren los costos operativos del proceso (papelería, desplazamientos, gestiones menores). Se presentan al cliente como una sola línea — NO se desglosan. Esto evita expectativas de devolución si no se usa el 100%.
- **Modelo de pago:** 2 cuotas obligatorias — 50% al activar el caso + 50% al hito de edictos (Fase 5)
- **Crédito:** Si el cliente pagó una consulta previa Y Paola autorizó el crédito (`autorizarCredito: true`), se descuenta del primer pago
- **Qué incluye:** Elaboración de escritos, gestión del proceso notarial, acompañamiento hasta la firma de la escritura pública
- **Qué NO incluye:** Recogida de paquetería, investigación de bienes (servicio adicional $150k), gestión de registro en Supernotariado/Registro
- **Investigación de bienes:** Servicio adicional opcional — $150.000 COP tarifa plana. Se ofrece como add-on en la pantalla de Bienes del cliente con CTA claro. Si se solicita, genera un Payment de `tipo: 'investigacion'` visible para el cliente.
- **Finalización:** Termina con la entrega de la escritura pública al cliente. El cliente gestiona por su cuenta el registro en Instrumentos Públicos
- **Fase 8:** No activa. El sistema genera un "Email de Finalización" tras la firma y entrega

### B. Premium
- **Modelo de pago:** 3 cuotas obligatorias — 40% / 30% / 30% en hitos clave del proceso
- **Crédito:** Aplica igual que en Estándar (con autorización de Paola)
- **Qué incluye todo lo del Estándar más:**
  - Recogida de paquetería y documentos del cliente
  - Obtención de documentos faltantes
  - **Investigación de bienes INCLUIDA** (tarifa plana $150.000 COP — no genera cobro adicional al cliente, está dentro del paquete). En la pantalla de Pagos del cliente NO aparece como cargo separado.
  - Acompañamiento presencial en reuniones durante ~mes y medio
  - Entrega de la escritura **ya registrada** en el domicilio del cliente
  - Trámite de registro en Supernotariado y Registro (Fase 8 activa)
- **Finalización:** Termina cuando la escritura está registrada en el folio de matrícula inmobiliaria y el certificado de tradición actualizado está cargado en el sistema
- **Fase 8:** Activa. El sistema trackea salida para registro, fecha confirmada, y carga del Certificado de Tradición actualizado

### C. Elite — Personalizado ⏸ BACKLOG (no se implementa en v1)
- **Casos:** Alta complejidad o volumen masivo de trámites (múltiples notarías, múltiples ciudades)
- **Modelo de pago:** Definido caso a caso por la abogada, con cuotas y hitos personalizados
- **Cargos adicionales dinámicos:** La abogada puede agregar cobros específicos durante el proceso con etiqueta personalizada y opción de dividir en N cuotas. Requiere arquitectura de pagos diferente (ver DEC-008 — también en backlog).
- **Fase 8:** Activa (igual que Premium)
- **Razón del backlog:** El equipo inicia operaciones solo con tiers Estándar y Premium. Elite se activa cuando la demanda lo justifique. Todo el código de v1 debe estar diseñado para que Elite pueda activarse sin refactorización mayor.

## Sistema de Créditos por Consulta Previa

Todo pago por consulta (virtual $70.000 o presencial $100.000) genera un **"Crédito Oculto"** vinculado al `MemberID`.

**Lógica:**
1. El pago de la consulta crea un `Payment` de `tipo: 'consulta'` vinculado al `Member` (no al `Case` — el caso no existe aún)
2. Al crear el primer `Case`, el sistema busca pagos de `tipo: 'consulta'` sin `caseId` asignado para ese `Member`
3. Si los encuentra, crea automáticamente un `Payment` de `tipo: 'creditoConsulta'` con monto negativo que descuenta del total del paquete
4. Vincula el pago de consulta original al caso (campo `caseId` en el Payment)
5. El cliente ve en su pantalla de pagos: *"Crédito aplicado por consulta previa: -$70.000"*

**Nota:** Si el cliente tuvo múltiples consultas antes de abrir el caso, se acumulan todos los créditos.

## Impacto en colecciones

- `Cases`: campo `tier: select ['estandar', 'premium', 'elite']` — el valor `'elite'` existe en el schema desde v1 para no requerir migración al activarse
- `Payments`: nuevo tipo `'consulta'`, `'creditoConsulta'`; los tipos de cargos custom (Elite) se definen en el schema pero la UI para crearlos no se construye en v1
- Endpoint `advance-phase`: Fase 8 → completed es condicional según `Case.tier`
- `Members`: campo `creditoAcumulado` calculado a partir de pagos `tipo: 'consulta'` sin caso asignado

## Scope de v1

| Feature | v1 | Backlog |
|---|---|---|
| Tier Estándar | ✅ | |
| Tier Premium | ✅ | |
| Tier Elite | | ⏸ |
| Cargos dinámicos mid-proceso | | ⏸ DEC-008 |
| Sistema de Créditos Ocultos | ✅ | |

## Siguiente paso
Implementar campo `tier` en `Cases`, actualizar `Payments` con nuevos tipos, y ajustar lógica del endpoint `advance-phase` para Fase 8 condicional.
