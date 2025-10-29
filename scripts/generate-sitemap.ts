import { writeFileSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const SITE_URL = 'https://dhai.eth.limo';

interface BlogPost {
  id: string;
  date: string;
}

/**
 * Parse front matter from markdown file
 */
function parseFrontMatter(content: string): { data: Record<string, any>; body: string } {
  const FRONT_MATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
  const match = content.match(FRONT_MATTER_REGEX);
  
  if (!match) {
    return { data: {}, body: content.trim() };
  }

  const frontMatterBlock = match[1];
  const data: Record<string, any> = {};
  
  const lines = frontMatterBlock.split(/\r?\n/);
  let currentKey: string | null = null;
  const arrayFields = ['tags'];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('-')) {
      if (!currentKey || !arrayFields.includes(currentKey)) continue;
      const value = line.replace(/^-+\s*/, '').trim().replace(/^["']|["']$/g, '');
      if (!Array.isArray(data[currentKey])) {
        data[currentKey] = [];
      }
      data[currentKey].push(value);
      continue;
    }

    const [key, ...rest] = line.split(':');
    const valuePart = rest.join(':').trim().replace(/^["']|["']$/g, '');
    const valueKey = key.trim();

    if (arrayFields.includes(valueKey)) {
      currentKey = valueKey;
      data[valueKey] = valuePart ? [valuePart] : [];
    } else {
      currentKey = valueKey;
      data[valueKey] = valuePart;
    }
  }

  return { data, body: content.slice(match[0].length).trim() };
}

/**
 * Load blog posts from markdown files
 */
function loadBlogPosts(): BlogPost[] {
  const postsDir = join(process.cwd(), 'src', 'posts');
  const files = readdirSync(postsDir).filter((f) => f.endsWith('.md'));
  
  return files.map((file) => {
    const content = readFileSync(join(postsDir, file), 'utf-8');
    const { data } = parseFrontMatter(content);
    const id = data.id || file.replace(/\.md$/, '');
    const date = data.date || new Date().toISOString().split('T')[0];
    
    return { id, date };
  });
}

/**
 * Generate sitemap.xml for SEO
 * Note: Since the site uses HashRouter, URLs use hash fragments
 */
function generateSitemap() {
  const baseUrl = SITE_URL;
  const currentDate = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '#/blog', priority: '0.9', changefreq: 'weekly' },
  ];

  // Blog posts
  const blogPosts = loadBlogPosts();
  const blogUrls = blogPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((post) => ({
      url: `#/blog/${post.id}`,
      lastmod: new Date(post.date).toISOString().split('T')[0],
      priority: '0.8',
      changefreq: 'monthly' as const,
    }));

  // Generate XML
  const urls = [
    ...staticPages.map((page) => ({
      ...page,
      lastmod: currentDate,
      changefreq: page.changefreq as 'weekly' | 'monthly',
    })),
    ...blogUrls,
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${baseUrl}${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  // Write to public directory (will be copied to dist during build)
  const publicPath = join(process.cwd(), 'public', 'sitemap.xml');
  writeFileSync(publicPath, sitemap, 'utf-8');

  console.log(`✅ Generated sitemap.xml with ${urls.length} URLs`);
  console.log(`   Location: ${publicPath}`);
}

generateSitemap();

