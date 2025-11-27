import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://dhai.eth.limo';
const SITE_NAME = 'dhai.eth';
const DEFAULT_DESCRIPTION = 'Ethereum Developer. Relentlessly Curious.';
const DEFAULT_TITLE = 'dhai.eth | Dhaiwat Pandya';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  author?: string;
}

function SEO({
  title,
  description,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  tags,
  author = 'Dhaiwat Pandya',
}: SEOProps) {
  const location = useLocation();

  // Get full URL - handle hash router
  const fullUrl = `${SITE_URL}${location.pathname === '/' ? '' : `#${location.pathname}`}`;

  // Use defaults if not provided
  const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageImage = image || `${SITE_URL}/vite.svg`;

  useEffect(() => {
    // Update title
    document.title = pageTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', pageDescription);
    updateMetaTag('author', author);
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    updateMetaTag('theme-color', '#111827'); // dark-900

    // Dynamic OG Image
    // Using a simple service to generate text-based OG images if no specific image is provided
    const dynamicImage = image || `https://placehold.co/1200x630/111827/FFF?text=${encodeURIComponent(title || SITE_NAME)}&font=roboto`;

    // Open Graph tags
    updateMetaTag('og:title', pageTitle, 'property');
    updateMetaTag('og:description', pageDescription, 'property');
    updateMetaTag('og:image', dynamicImage, 'property');
    updateMetaTag('og:url', fullUrl, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', SITE_NAME, 'property');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', pageTitle);
    updateMetaTag('twitter:description', pageDescription);
    updateMetaTag('twitter:image', dynamicImage);
    updateMetaTag('twitter:creator', '@dhaiwat10');
    updateMetaTag('twitter:site', '@dhaiwat10');

    // Clean up old article tags if switching away from article type
    const existingArticleTags = document.querySelectorAll('meta[property^="article:"]');

    // Article-specific tags
    if (type === 'article') {
      if (publishedTime) {
        updateMetaTag('article:published_time', publishedTime, 'property');
      }
      if (modifiedTime) {
        updateMetaTag('article:modified_time', modifiedTime, 'property');
      }
      if (author) {
        updateMetaTag('article:author', author, 'property');
      }
      if (tags && tags.length > 0) {
        tags.forEach((tag, index) => {
          updateMetaTag(`article:tag:${index}`, tag, 'property');
        });
      }
    } else {
      // Remove article tags if not an article
      existingArticleTags.forEach((tag) => {
        if (!tag.getAttribute('property')?.startsWith('article:tag:')) {
          tag.remove();
        }
      });
    }

    // Clean up old article tag indices
    const articleTagIndices = document.querySelectorAll('meta[property^="article:tag:"]');
    if (type !== 'article' || !tags || tags.length === 0) {
      articleTagIndices.forEach((tag) => tag.remove());
    } else {
      // Remove old tag indices that are no longer needed
      articleTagIndices.forEach((tag) => {
        const index = parseInt(tag.getAttribute('property')?.replace('article:tag:', '') || '0');
        if (index >= (tags.length || 0)) {
          tag.remove();
        }
      });
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Language
    const html = document.documentElement;
    if (!html.hasAttribute('lang')) {
      html.setAttribute('lang', 'en');
    }
  }, [pageTitle, pageDescription, pageImage, type, fullUrl, publishedTime, modifiedTime, tags, author]);

  return null;
}

export default SEO;

