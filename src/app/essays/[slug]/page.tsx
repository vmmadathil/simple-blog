import { promises as fs } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Comments from '@/components/Comments'
import ClientMarkdown from '@/components/ClientMarkdown'

type PageProps = {
  params: Promise<{ slug: string }> | undefined
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | undefined
}

function formatTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .map(word => {
      if (word.toLowerCase() === 'ai') return 'AI';
      if (word.toLowerCase() === 'rag') return 'RAG';
      if (word.toLowerCase() === 'llms') return 'LLMs';
      if (word.toLowerCase() === 'llm') return 'LLM';
      return word;
    })
    .join(' ')
}

export async function generateMetadata(
  props: PageProps
): Promise<Metadata> {
  if (!props.params) notFound()
  const { slug } = await props.params
  const titleSlug = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '')
  const title = formatTitle(titleSlug)

  return {
    title: `${title} | Visakh Madathil`,
  }
}

async function getEssay(slug: string) {
  const essaysDirectory = path.join(process.cwd(), 'essays')
  try {
    const fullPath = path.join(essaysDirectory, `${slug}.md`)
    const content = await fs.readFile(fullPath, 'utf8')
    return {
      title: slug.split('-').join(' '),
      content
    }
  } catch {
    notFound()
  }
}

export default async function Essay(props: PageProps) {
  if (!props.params) notFound()
  const { slug } = await props.params
  const essay = await getEssay(slug)

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <article>
        <div className="prose prose-green max-w-none">
          <ClientMarkdown content={essay.content} />
        </div>
      </article>
      <div className="my-12 border-t border-gray-200"></div>
      <Comments title={essay.title} />
    </main>
  )
}
