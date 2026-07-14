import { RefObject, useEffect } from 'react';
import mermaid from 'mermaid';

/**
 * Runtime behavior for sanitized markdown content: click-to-copy on code
 * exhibits and mermaid diagram rendering. Syntax highlighting itself is
 * NOT handled here — it's baked into the HTML at parse time (see
 * lib/marked.ts) so it never needs to re-run on theme toggle.
 *
 * Shared by BlogPost and MarkdownPage, which both render sanitized
 * marked() output into a ref'd container.
 */
export function useContentEnhancements(
  contentRef: RefObject<HTMLElement>,
  htmlContent: string,
  theme: 'light' | 'dark',
) {
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    const handleClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest('[data-copy]') as HTMLButtonElement | null;
      if (!button || !root.contains(button)) return;

      const code = button.closest('.code-exhibit')?.querySelector('code')?.textContent ?? '';
      navigator.clipboard.writeText(code);

      const label = button.querySelector('.copy-btn-label');
      button.dataset.copied = 'true';
      if (label) label.textContent = 'Copied';

      window.setTimeout(() => {
        delete button.dataset.copied;
        if (label) label.textContent = 'Copy';
      }, 1600);
    };

    root.addEventListener('click', handleClick);
    return () => root.removeEventListener('click', handleClick);
  }, [contentRef, htmlContent]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    const diagrams = Array.from(root.querySelectorAll<HTMLElement>('.mermaid'));
    if (!diagrams.length) return;

    // Re-running mermaid on theme change requires the original diagram
    // source: mermaid replaces node content with rendered SVG, so a second
    // run needs its own text back before it can redraw in the new theme.
    diagrams.forEach((node) => {
      if (node.dataset.mermaidSource === undefined) {
        node.dataset.mermaidSource = node.textContent ?? '';
      } else {
        node.removeAttribute('data-processed');
        node.innerHTML = node.dataset.mermaidSource;
      }
    });

    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });

    mermaid.run({ nodes: diagrams }).catch((err) => {
      console.error('[mermaid] render failed:', err);
    });
  }, [contentRef, htmlContent, theme]);
}
