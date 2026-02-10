import { promises as fs } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import type { Metadata } from 'next'
import Comments from '@/components/Comments'
import ClientMarkdown from '@/components/ClientMarkdown'

type PageProps = {
  params: Promise<{ slug: string }> | undefined
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | undefined
}

function formatTitle(slug: string): string {
  // Convert hyphenated-title to Title With Spaces
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .map(word => {
      // Convert specific acronyms to uppercase
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
  //const post = await getPost(slug)
  const titleSlug = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '')
  const post = formatTitle(titleSlug)
 
  return {
    title: `${post} | Visakh Madathil`,
  }
}

async function getPost(slug: string) {
  const postsDirectory = path.join(process.cwd(), 'posts')
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const content = await fs.readFile(fullPath, 'utf8')
    return {
      title: slug.split('-').join(' '),
      content
    }
  } catch {
    notFound()
  }
}

export default async function BlogPost(props: PageProps) {
  if (!props.params) notFound()
  const { slug } = await props.params
  const post = await getPost(slug)
 
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <article>
        <div className="prose prose-green max-w-none">
          <ClientMarkdown content={post.content} />
        </div>
      </article>
      <div className="my-12 border-t border-gray-200"></div>
      <Comments title={post.title} />
    </main>
  )
}

