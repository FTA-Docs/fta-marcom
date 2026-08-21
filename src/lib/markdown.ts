import { createMarkdownProcessor } from '@astrojs/markdown-remark';

/**
 * Renders CMS-authored markdown strings (e.g. FAQ answers in content/faqs.json)
 * to HTML at build time. Content files are .md imports wherever possible; this
 * exists for copy that lives inside JSON, which Astro can't import as markdown.
 */
const processor = await createMarkdownProcessor({});

export async function renderMarkdown(source: string): Promise<string> {
  const { code } = await processor.render(source ?? '');
  return code;
}
