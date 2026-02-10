import { promises as fs } from 'fs'
import path from 'path'
import Link from 'next/link'

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

  async function getEssays() {
    const essaysDirectory = path.join(process.cwd(), 'essays')
    let filenames: string[]
    try {
      filenames = await fs.readdir(essaysDirectory)
    } catch {
      return []
    }

    const essays = await Promise.all(
      filenames.map(async (filename) => {
        const filePath = path.join(essaysDirectory, filename)
        const stats = await fs.stat(filePath)
        const slug = filename.replace('.md', '')

        const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/)
        const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]

        const titleSlug = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '')

        return {
          slug,
          title: formatTitle(titleSlug),
          date,
        }
      })
    )

    return essays.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  export default async function Essays() {
    const essays = await getEssays()

    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-serif text-gray-900 mb-8">Essays</h1>
        <div className="space-y-4">
          {essays.map((essay) => (
            <div key={essay.slug} className="group flex justify-between items-center">
              <Link
                href={`/essays/${essay.slug}`}
                className="text-lg font-serif text-gray-900 hover:text-green-700 transition-colors border-b border-gray-200 hover:border-green-700"
              >
                {essay.title}
              </Link>
              <span className="text-sm text-gray-500">{essay.date}</span>
            </div>
          ))}
        </div>
      </main>
    )
  }
