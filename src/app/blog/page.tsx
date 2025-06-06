import { promises as fs } from 'fs'
import path from 'path'
import Link from 'next/link'

function formatTitle(slug: string): string {
    // Convert hyphenated-title to Title With Spaces
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .map(word => {
        // Convert specific acronyms to uppercase
        if (word.toLowerCase() === 'ai') return 'AI';
        if (word.toLowerCase() === 'rag') return 'RAG';
        return word;
      })
      .join(' ')
  }


  
  async function getPosts() {
    const postsDirectory = path.join(process.cwd(), 'posts')
    const filenames = await fs.readdir(postsDirectory)
    
    const posts = await Promise.all(
      filenames.map(async (filename) => {
        const filePath = path.join(postsDirectory, filename)
        const stats = await fs.stat(filePath)
        const slug = filename.replace('.md', '')
        
        // Extract date from filename (YYYY-MM-DD-file-name.md)
        const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/)
        const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]
        
        // Remove date from slug for title formatting
        const titleSlug = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '')
        
        return {
          slug,
          title: formatTitle(titleSlug),
          date,
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
                className="text-lg font-serif text-gray-900 hover:text-green-700 transition-colors border-b border-gray-200 hover:border-green-700"
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