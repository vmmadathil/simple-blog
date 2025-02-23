import { promises as fs } from 'fs'
import path from 'path'
import Link from 'next/link'

type Post = {
  slug: string
  title: string
  date: string
}

async function getPosts() {
  const postsDirectory = path.join(process.cwd(), 'posts')
  const filenames = await fs.readdir(postsDirectory)
  
  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(postsDirectory, filename)
      const stats = await fs.stat(filePath)
      return {
        slug: filename.replace('.md', ''),
        title: filename.replace('.md', '').split('-').join(' '),
        date: stats.mtime.toISOString().split('T')[0]
      }
    })
  )
  
  return posts.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()))
}

export default async function Blog() {
  const posts = await getPosts()
  
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-serif text-gray-900 mb-8">Blog Posts</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.slug} className="group flex justify-between items-center">
            <Link 
              href={`/blog/${post.slug}`}
              className="text-lg font-serif text-gray-900 hover:text-green-700 transition-colors border-b border-gray-400 hover:border-green-700"
            >
              {post.title}
            </Link>
            <span className="text-sm text-gray-500">{post.date}</span>
          </div>
        ))}
      </div>
    </main>
  )
}