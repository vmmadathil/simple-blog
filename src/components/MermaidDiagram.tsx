'use client'
import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mermaid.initialize({
      theme: 'neutral',
      themeVariables: {
        primaryColor: '#f3f4f6',
        primaryTextColor: '#374151',
        primaryBorderColor: '#d1d5db',
        lineColor: '#6b7280',
        sectionBkgColor: '#f9fafb',
        altSectionBkgColor: '#ffffff',
        gridColor: '#e5e7eb',
        textColor: '#374151',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif'
      },
      flowchart: {
        htmlLabels: true,
        curve: 'linear'
      }
    })

    if (ref.current) {
      const element = ref.current
      element.innerHTML = chart
      mermaid.init(undefined, element)
    }
  }, [chart])

  return (
    <div className="my-8 p-6 bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto">
      <div ref={ref} className="flex justify-center" />
    </div>
  )
}