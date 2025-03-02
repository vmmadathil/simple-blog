import ReactMarkdown from 'react-markdown'

export default function ClientMarkdown({ content }: { content: string }) {
  return <ReactMarkdown>{content}</ReactMarkdown>
}