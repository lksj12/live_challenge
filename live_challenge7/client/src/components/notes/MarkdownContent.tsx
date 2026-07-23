import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  source: string;
  compact?: boolean;
}

export function MarkdownContent({
  source,
  compact = false,
}: MarkdownContentProps) {
  if (source.trim() === '') {
    return <p className="markdown-empty">내용 없음</p>;
  }

  return (
    <div className={`markdown-content${compact ? ' is-compact' : ''}`}>
      <ReactMarkdown
        skipHtml
        components={{
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
