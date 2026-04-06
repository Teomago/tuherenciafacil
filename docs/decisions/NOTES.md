# Notas de Reunión — Diseño de Aplicación (ACTUALIZADO)

> Estas son notas temporales consolidadas tras la reunión del 1 de abril de 2026. Este archivo se eliminará una vez que se formalicen los RFCs correspondientes.

## 1. Portal de Transparencia (Buscador Público)
*   **Concepto:** Buscador por nombre del **Causante**.
*   **Resultados:** Datos básicos no sensibles (ID del caso, estado actual, fecha estimada). No se muestran herederos ni activos.

## 2. Embudo de Consultas y Citas (Pre-Caso)
*   **Lead IA:** El bot guía al registro gratuito.
*   **Consulta Virtual:** $70.000 COP.
*   **Consulta Presencial:** $100.000 COP.
*   **Output:** Definición de estrategia y cotización del paquete final.

## 3. Tarifas de Investigación de Bienes
Se aplicará una **tarifa plana de $150.000 COP** para el cliente por el servicio de investigación (vehículos y cuentas bancarias).
*   **Inmuebles:** Sin costo (Paola realiza la consulta directamente).
*   **Nota interna:** Paola gestiona sus propios costos por hallazgo, pero el precio final en la app es fijo.

## 4. Tiempos y Flujo Notarial
*   **Elaboración de escritos (Abogado):** 2 semanas.
*   **Revisión Notarial:** 15 días hábiles.
*   **Ciclo de revisión:**
    1. Radicación.
    2. Evaluación: VoBo para edictos (éxito) vs. Devolución para corrección (ajuste de escritos).

## 5. Tiers de Servicio (Paquetes)

### A. Estándar — $4.500.000 COP
*   $4.000.000 (Honorarios) + $500.000 (Gastos operativos base).
*   **Modelo de Pago:** Dividido en cuotas obligatorias (ej. 50% activación / 50% hito edictos).
*   **Crédito:** Si pagó cita previa, se descuenta del primer pago ($70k o $100k).
*   **Finalización:** Termina con la entrega de la escritura pública al cliente. El cliente se encarga de su propio registro en Instrumentos Públicos.

### B. Premium
*   Combina servicios de gestión y logística avanzada.
*   **Modelo de Pago:** Dividido en cuotas obligatorias (ej. 40% / 30% / 30% en hitos clave).
*   **Incluye:** Recogida de paquetería, obtención de documentos faltantes e investigación de bienes (tarifa plana $150k incluida).
*   **Logística:** Acompañamiento en reuniones (mes y medio) y entrega de la escritura registrada en el domicilio del cliente.
*   **Gestión Final:** Incluye el trámite de registro en Supernotariado y Registro (Fase 8).

### C. Elite (Personalizado / ++Plus)
*   Para casos de alta complejidad o volumen masivo de trámites.
*   **Cargos Adicionales Dinámicos:** La abogada puede agregar cobros específicos durante el proceso (ej. "Trámite en Notaría de otra ciudad").
*   **Flexibilidad:** Cada cargo adicional puede ser cobrado al 100% o dividido en N cuotas definidas por la abogada con una explicación clara para el cliente.

## 6. Modelo de Pagos y Créditos (Lógica del Sistema)
*   **Sistema de Créditos:** Todo pago por cita previa genera un "Crédito Oculto" vinculado al `MemberID`. Al generar la factura del paquete, el sistema resta automáticamente el valor pagado ($70k o $100k).
*   **Gate de Poder (Poder de Abogado):** Bloqueo sistémico. No se puede avanzar a la Fase 4 (Radicación) si no existe un documento tipo `PODER` con estado `Aprobado` (digitalizado).
*   **Estado Recibido Físico:** Nueva bandera para documentos. Indica que la abogada ya tiene el papel, pero el equipo está en proceso de digitalización.

## 7. Lógica de Finalización (Ajuste de Fase 8)
*   La **Fase 8 (Registro)** ahora es **condicional**.
*   **Estándar:** El proceso genera un "Email de Finalización" tras la firma y entrega de la escritura.
*   **Premium / Elite:** La app continúa trackeando la salida para registro, fecha confirmada y carga del Certificado de Tradición actualizado.

## 7. Herramientas Auxiliares
*   **Calculadora de Gastos:** Integrar o enlazar a la [Calculadora de la Notaría 19](https://www.notaria19bogota.com/gastos-notariales/) para que el cliente sepa cuánto dinero debe recaudar para la firma (independiente de nuestros honorarios).
