import DOMPurify from "dompurify";

/** Sanitize rich HTML before it ever reaches the DOM (SRD Section 13). */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ["p", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a", "br", "blockquote", "h1", "h2", "h3", "code", "pre", "span"],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}

export function RichText({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
      data-testid="rich-text"
    />
  );
}