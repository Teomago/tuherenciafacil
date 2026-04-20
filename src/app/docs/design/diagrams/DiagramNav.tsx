'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DiagramNav() {
  const pathname = usePathname()

  const links = [
    { href: '/docs/design/diagrams/01-prepago', label: 'Pre-pago (5)' },
    { href: '/docs/design/diagrams/02-cliente', label: 'Cliente (7+chat)' },
    { href: '/docs/design/diagrams/03-abogado', label: 'Abogado (9+chat)' },
    { href: '/docs/design/diagrams/04-mapping', label: '21 → 14 page.tsx' },
    { href: '/docs/design/diagrams/05-stack', label: 'Stack Architecture' },
    { href: '/docs/design/app-flowchart', label: 'Flujo completo' },
    { href: '/docs/design/collections-by-phase', label: 'Colecciones × fase' },
    { href: '/docs', label: 'Inicio' },
  ]

  return (
    <div className="flex gap-1 flex-wrap mb-6">
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3.5 py-[7px] text-[12px] border rounded-md transition-all duration-150 ${
              isActive
                ? 'bg-[#002845] text-white border-[#002845]'
                : 'border-[#d3d1c7] bg-white text-[#5F5E5A] hover:bg-[#EBF5FA] hover:text-[#3A8DA8] hover:border-[#3A8DA8]'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </div>
  )
}
