import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{
    slug?: string[]
  }>
}

export default async function DocsPage({ params }: PageProps) {
  const resolvedParams = await params
  const { slug = [] } = resolvedParams
  const rootDir = process.cwd()
  
  // Base paths to search for documentation
  const docsDir = path.join(rootDir, 'docs')
  const agentsDir = path.join(rootDir, '.agents')

  const joinedSlug = path.join(...slug)
  const hasExtension = path.extname(joinedSlug) !== ''
  
  let filePath = ''
  let ext = ''

  const possiblePaths = hasExtension 
    ? [
        path.join(docsDir, joinedSlug),
        path.join(agentsDir, joinedSlug)
      ]
    : [
        path.join(docsDir, joinedSlug + '.md'),
        path.join(agentsDir, joinedSlug + '.md')
      ]

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      filePath = p
      ext = path.extname(p)
      break
    }
  }

  if (!filePath || !fs.existsSync(filePath)) return notFound()

  const content = fs.readFileSync(filePath, 'utf8')

  if (ext === '.md') {
    const html = await marked.parse(content)
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e2e0d8] max-w-5xl mx-auto my-10">
        <nav className="mb-8 flex items-center text-[13px] font-medium border-b border-[#e2e0d8] pb-4">
          <Link href="/docs" className="text-[#5F5E5A] hover:text-[#3A8DA8] transition-colors">Docs</Link>
          {slug.length > 0 && (
            <>
              <span className="mx-2 text-[#e2e0d8]">/</span>
              <span className="text-[#002845] capitalize">{slug[slug.length - 1].replace(/-/g, ' ').replace('.md', '')}</span>
            </>
          )}
        </nav>
        <article 
          className="prose prose-slate max-w-none prose-headings:text-[#002845] prose-a:text-[#3A8DA8] prose-a:no-underline hover:prose-a:underline prose-code:bg-[#f1efe8] prose-code:text-[#444441] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#1a1a18] prose-pre:text-[#f8f7f4]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="mt-12 pt-8 border-t border-[#e2e0d8] flex justify-between items-center text-[11px] text-[#B4B2A9]">
          <Link href="/docs" className="hover:text-[#3A8DA8]">← Volver al inicio</Link>
          <span>tuHerenciaFácil Documentation</span>
        </div>
      </div>
    )
  }

  // If it's SVG, return raw content
  if (ext === '.svg') {
    return (
      <div className="flex justify-center p-8 bg-white min-h-screen">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    )
  }

  return notFound()
}
