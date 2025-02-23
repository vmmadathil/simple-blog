import { promises as fs } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

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

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <article>
        <h1 className="text-3xl font-serif text-gray-900 mb-8">{post.title}</h1>
        <div className="prose prose-green max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </main>
  )
}
