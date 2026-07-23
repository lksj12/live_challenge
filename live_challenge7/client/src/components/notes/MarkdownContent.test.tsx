import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MarkdownContent } from './MarkdownContent';

describe('MarkdownContent', () => {
  it('Markdown 문법을 React 요소로 렌더링한다', () => {
    const html = renderToStaticMarkup(
      <MarkdownContent source={'## 제목\n\n**강조**'} />,
    );

    expect(html).toContain('<h2>제목</h2>');
    expect(html).toContain('<strong>강조</strong>');
  });

  it('원본 HTML은 실행 가능한 요소로 렌더링하지 않는다', () => {
    const html = renderToStaticMarkup(
      <MarkdownContent
        source={'<script>alert("xss")</script>\n\n안전한 문단'}
      />,
    );

    expect(html).not.toContain('<script>');
    expect(html).toContain('안전한 문단');
  });
});
