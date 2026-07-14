import { marked } from 'marked';
import { markedSmartypants } from 'marked-smartypants';
import markedKatex from 'marked-katex-extension';
import hljs from 'highlight.js';

marked.use(markedSmartypants());
marked.use(markedKatex());

const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[char] as string));

const COPY_ICON = `<svg class="icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const CHECK_ICON = `<svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

// Code blocks are highlighted once here, at parse time, using our own
// design tokens (see .hljs-* rules in index.css). This means highlighting
// never has to re-run in the browser on theme toggle — it's already correct
// in both themes because the tokens themselves flip with the `dark` class.
marked.use({
    breaks: true,
    gfm: true,
    renderer: {
        code(token) {
            if (token.lang === 'mermaid') {
                return `<pre class="mermaid">${token.text}</pre>`;
            }

            const requestedLang = (token.lang || '').trim().split(/\s+/)[0].toLowerCase();
            const language = requestedLang && hljs.getLanguage(requestedLang) ? requestedLang : 'plaintext';
            const highlighted = hljs.highlight(token.text, { language }).value;
            const label = language === 'plaintext' ? 'text' : language;

            return `<div class="code-exhibit" data-lang="${label}">
  <div class="code-exhibit-header">
    <span class="code-exhibit-lang"><span class="exhibit-dot" aria-hidden="true"></span>${escapeHtml(label)}</span>
    <button type="button" class="copy-btn" data-copy aria-label="Copy code">
      ${COPY_ICON}${CHECK_ICON}
      <span class="copy-btn-label">Copy</span>
    </button>
  </div>
  <pre><code class="hljs language-${language}">${highlighted}</code></pre>
</div>`;
        }
    }
});

export { marked };
