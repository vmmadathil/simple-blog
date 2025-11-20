import ReactMarkdown from 'react-markdown'
import MermaidDiagram from './MermaidDiagram'

export default function ClientMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match?.[1]
          
          if (language === 'mermaid' && !inline) {
            return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />
          }
          
          return (
            <code className={className} {...props}>
              {children}
            </code>
          )
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}