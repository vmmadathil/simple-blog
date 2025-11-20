import ReactMarkdown from 'react-markdown'
import MermaidDiagram from './MermaidDiagram'

export default function ClientMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match?.[1]
          
          if (language === 'mermaid') {
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