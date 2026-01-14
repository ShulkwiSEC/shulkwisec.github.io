import { marked } from 'marked';
import { markedSmartypants } from 'marked-smartypants';
import markedKatex from 'marked-katex-extension';

marked.use(markedSmartypants());
marked.use(markedKatex());

marked.use({
    breaks: true,
    gfm: true,
    renderer: {
        code(token) {
            if (token.lang === 'mermaid') {
                return `<pre class="mermaid">${token.text}</pre>`;
            }
            return false;
        }
    }
});

export { marked };
