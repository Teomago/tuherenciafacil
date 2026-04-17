import Link from 'next/link'

export const metadata = {
  title: 'tuHerenciaFácil — Estado del proyecto',
}

type LayerStatus = 'complete' | 'progress' | 'upcoming'

interface Layer {
  number: number
  name: string
  status: LayerStatus
  description: string
  items: string[]
}

const layers: Layer[] = [
  {
    number: 1,
    name: 'Infraestructura y plataforma',
    status: 'complete',
    description: 'La plataforma base sobre la que todo corre.',
    items: [
      'Migración completa de la plataforma anterior',
      'Base de datos (Neon / PostgreSQL)',
      'Almacenamiento de archivos (Cloudflare R2)',
      'Deploy automático en Vercel',
    ],
  },
  {
    number: 2,
    name: 'Diseño visual y branding',
    status: 'complete',
    description: 'La identidad visual de tuHerenciaFácil.',
    items: [
      'Paleta de colores y tipografía',
      'Componentes de interfaz',
      'Sistema de diseño documentado',
    ],
  },
  {
    number: 3,
    name: 'Cuentas y acceso',
    status: 'complete',
    description: 'Quién puede entrar y con qué permisos.',
    items: [
      'Registro de clientes y abogados',
      'Inicio de sesión y recuperación de contraseña',
      'Códigos de invitación',
      'Control de acceso por rol (cliente / abogado)',
    ],
  },
  {
    number: 4,
    name: 'Base de datos del proceso sucesoral',
    status: 'progress',
    description: 'La estructura que guarda toda la información de un caso.',
    items: ['Casos', 'Citas', 'Formulario de apertura', 'Herederos', 'Bienes'],
  },
  {
    number: 5,
    name: 'Flujo para el cliente (antes de contratar)',
    status: 'upcoming',
    description: 'Las pantallas que ve el cliente al llegar por primera vez.',
    items: [
      'Bienvenida y filtro de elegibilidad',
      'Agenda tu consulta',
      'Selección de paquete',
      'Pago',
    ],
  },
  {
    number: 6,
    name: 'Panel del cliente (después de contratar)',
    status: 'upcoming',
    description: 'El espacio del cliente para seguir su caso paso a paso.',
    items: [
      'Mi caso (8 fases del proceso notarial)',
      'Documentos',
      'Herederos',
      'Bienes',
      'Pagos',
      'Mensajes',
    ],
  },
  {
    number: 7,
    name: 'Panel del abogado',
    status: 'upcoming',
    description: 'Las herramientas de Paola para gestionar los casos.',
    items: [
      'Central de casos',
      'Gestión por caso',
      'Revisión de documentos',
      'Registro notarial',
      'Mensajes',
    ],
  },
  {
    number: 8,
    name: 'Pagos en línea',
    status: 'upcoming',
    description: 'La integración con la pasarela de pago colombiana.',
    items: [
      'Pago de consulta',
      'Pago de paquete (Estándar / Premium / Elite)',
      'Wompi',
      'Registro de transacciones',
    ],
  },
]

const statusConfig: Record<
  LayerStatus,
  { label: string; badgeBg: string; badgeText: string; borderClass: string; cardBg: string }
> = {
  complete: {
    label: 'Completo',
    badgeBg: '#D1FAE5',
    badgeText: '#065F46',
    borderClass: 'border-[#e2e0d8]',
    cardBg: 'bg-white',
  },
  progress: {
    label: 'En progreso',
    badgeBg: '#FFF4EC',
    badgeText: '#CC6010',
    borderClass: 'border-[#FF8C3C] border-l-4',
    cardBg: 'bg-white',
  },
  upcoming: {
    label: 'Próximo',
    badgeBg: '#F3F3F1',
    badgeText: '#5F5E5A',
    borderClass: 'border-[#e2e0d8] border-dashed',
    cardBg: 'bg-[#F8F7F4]',
  },
}

function LayerCard({ layer }: { layer: Layer }) {
  const config = statusConfig[layer.status]
  return (
    <div className={`${config.cardBg} border ${config.borderClass} rounded-[10px] py-4 px-5 mb-3`}>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-[#B4B2A9]">{layer.number}</span>
          <span className="text-[15px] font-medium text-[#002845]">{layer.name}</span>
        </div>
        <span
          className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded"
          style={{ backgroundColor: config.badgeBg, color: config.badgeText }}
        >
          {config.label}
        </span>
      </div>
      <p className="text-xs text-[#5F5E5A] leading-relaxed mb-2 ml-5">{layer.description}</p>
      <ul className="ml-5 space-y-0.5">
        {layer.items.map((item) => (
          <li key={item} className="text-xs text-[#5F5E5A] flex items-center gap-1.5">
            <span className="text-[#B4B2A9]">·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function RoadmapPage() {
  return (
    <div className="max-w-[700px] mx-auto py-10 px-5 font-sans">
      <div className="mb-1">
        <Link href="/docs" className="text-xs text-[#3A8DA8] hover:underline">
          ← Documentación
        </Link>
      </div>
      <h1 className="text-2xl font-medium text-[#002845] mt-3 mb-1">Estado del proyecto</h1>
      <p className="text-sm text-[#5F5E5A] mb-6">
        Qué está hecho, qué está en progreso y qué falta.
      </p>

      <div className="bg-[#F3F3F1] border border-[#e2e0d8] rounded-[10px] px-5 py-4 mb-8 text-xs text-[#5F5E5A] leading-relaxed">
        Los últimos 15 días de desarrollo fueron construidos en gran parte manualmente. Las
        plataformas de IA que usamos presentaron interrupciones frecuentes, lo que ralentizó el
        avance — una IA puede modificar decenas de archivos en minutos; hacerlo a mano toma mucho
        más. Aun así, la base estructural de la plataforma está prácticamente completa.
      </div>

      <div className="text-[13px] font-medium uppercase tracking-wide text-[#3A8DA8] mb-4">
        Capas del sistema
      </div>

      {layers.map((layer) => (
        <LayerCard key={layer.number} layer={layer} />
      ))}

      <div className="mt-10 pt-5 border-t border-[#e2e0d8] text-[11px] text-[#B4B2A9]">
        tuHerenciaFácil — Documento interno. Última actualización:{' '}
        {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}.
      </div>
    </div>
  )
}
