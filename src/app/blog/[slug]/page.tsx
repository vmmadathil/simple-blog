import { promises as fs } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import type { Metadata } from 'next'

// Import specific Next.js types
import type { ResolvingMetadata } from 'next'

// Define props types using Next.js internal type patterns
type PageProps = {
  params: Promise<{ slug: string }> | undefined
  searchParams?: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  props: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = props.params ? (await props.params).slug : notFound()
  const post = await getPost(slug)
  
  return {
    title: `${post.title} | Visakh Madathil`,
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
  } catch (e) {
    notFound()
  }
}

export default async function BlogPost(props: PageProps) {
  const slug = props.params ? (await props.params).slug : notFound()
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