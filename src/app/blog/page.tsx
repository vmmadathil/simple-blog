import { promises as fs } from 'fs'
import path from 'path'
import Link from 'next/link'
import { execSync } from 'child_process'

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

  function getGitDate(filePath: string): string {
    try {
      // Check if git is available and we're in a git repo
      execSync('git rev-parse --git-dir', { stdio: 'ignore' })
      
      // Get the date of the first commit for this file
      const gitDate = execSync(
        `git log --follow --format=%ai --reverse "${filePath}" | head -1`, 
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      ).trim()
      
      if (gitDate) {
        return new Date(gitDate).toISOString().split('T')[0]
      }
    } catch (error) {
      console.warn(`Could not get git date for ${filePath}`)
    }
    
    // Fallback to current date
    return new Date().toISOString().split('T')[0]
  }
  
  async function getPosts() {
    const postsDirectory = path.join(process.cwd(), 'posts')
    const filenames = await fs.readdir(postsDirectory)
    
    const posts = await Promise.all(
      filenames.map(async (filename) => {
        const filePath = path.join(postsDirectory, filename)
        const stats = await fs.stat(filePath)
        const slug = filename.replace('.md', '')
        
        return {
          slug,
          title: formatTitle(slug),
          date: getGitDate(slug)
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