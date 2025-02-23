import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-serif text-green-700 mb-6">
          Hi, I'm Visakh.
        </h1>
        
        <p className="text-gray-600 mb-12 leading-relaxed">
          I'm interested in making reliable AI systems that work in the real world.
          Here you'll find my thoughts on technology, books I'm reading, and things I'm learning.
        </p>

        <div className="relative h-96 mb-2">
          <Image
            src="/images/untitled.jpg" 
            alt="Untitled by Matthew Wong"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 700px"
            priority
          />
        </div>
        
        <p className="text-sm text-gray-500 italic text-center">
          Untitled by Matthew Wong
        </p>
      </main>
    </div>
  )
}