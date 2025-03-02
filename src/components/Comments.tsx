'use client'

import React from 'react'
import { DiscussionEmbed } from 'disqus-react'
import { usePathname } from 'next/navigation'

export default function Comments({ title }: { title: string }) {
  const pathname = usePathname()
  
  return (
    <div className="mt-10 pt-10 border-t border-gray-200">
      <h2 className="text-xl font-serif text-gray-900 mb-4">Comments</h2>
      <DiscussionEmbed
        shortname="visakhmadathil" 
        config={{
          url: `https://visakhmadathil.com${pathname}`,
          identifier: pathname,
          title: title,
        }}
      />
    </div>
  )
}