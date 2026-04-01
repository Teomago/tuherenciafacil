import '@/styles/index.css'
import DocsGate from './DocsGate'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  // We force light theme and a specific background for the docs section
  return (
    <html lang="es" className="light" style={{ colorScheme: 'light' }}>
      <body className="antialiased bg-[#f8f7f4] text-[#1a1a18] selection:bg-[#EBF5FA] selection:text-[#3A8DA8]">
        <DocsGate>
          {children}
        </DocsGate>
      </body>
    </html>
  )
}
