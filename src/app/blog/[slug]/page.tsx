import { promises as fs } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import type { Metadata } from 'next'

type PageProps = {
  params: Promise<{ slug: string }> | undefined
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | undefined
}

export async function generateMetadata(
  props: PageProps
): Promise<Metadata> {
  if (!props.params) notFound()
  const { slug } = await props.params
  const post = await getPost(slug)
 
  return {
    title: `${post.title} | Your Name`,
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
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </main>
  )
}