import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="border-b border-gray-200">
      <div className="max-w-2xl mx-auto px-6">  {/* Removed py-6 */}
        <div className="flex items-center justify-between h-16"> {/* Added fixed height and centered items */}
          <Link href="/" className="text-3xl font-serif text-green-700 hover:text-green-800">
            VM
          </Link>
          <div className="flex" style={{ gap: '.5rem' }}>
            <Link href="/essays" className="text-gray-600 hover:text-green-700">
              Essays
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-green-700">
              Blog
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}