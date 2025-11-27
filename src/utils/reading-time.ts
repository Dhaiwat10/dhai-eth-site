/**
 * Calculate reading time in minutes from markdown content
 * @param markdown - Raw markdown content
 * @returns Reading time in minutes (minimum 1)
 */
export function calculateReadingTime(markdown: string): number {
  // Extract code blocks and count them separately
  const codeBlockRegex = /```[\s\S]*?```/g;
  const codeBlocks = markdown.match(codeBlockRegex) || [];

  // Remove code blocks from content for separate processing
  let contentWithoutCodeBlocks = markdown.replace(codeBlockRegex, '');

  // Strip markdown syntax from remaining content
  contentWithoutCodeBlocks = contentWithoutCodeBlocks
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove inline code (backticks)
    .replace(/`[^`]*`/g, '')
    // Remove images
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
    // Remove links but keep link text
    .replace(/\[([^\]]*)\]\([^\)]*\)/g, '$1')
    // Remove bold/italic markers
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove heading markers
    .replace(/^#+\s+/gm, '')
    // Remove list markers (unordered)
    .replace(/^\s*[-*+]\s+/gm, '')
    // Remove list markers (ordered)
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove blockquote markers
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^(---|\*\*\*|___)\s*$/gm, '');

  // Count words in regular text
  const regularWords = contentWithoutCodeBlocks
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  // Count words in code blocks
  const codeContent = codeBlocks.join(' ');
  const codeWords = codeContent
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  // Calculate total words with 50% weight for code
  const totalWords = regularWords + (codeWords * 0.5);

  // Calculate reading time at 200 words per minute
  const minutes = Math.ceil(totalWords / 200);

  // Return minimum 1 minute
  return Math.max(1, minutes);
}
