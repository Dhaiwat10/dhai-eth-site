import { useEffect } from 'react';
import type { BlogPost } from '../types/blog';

const SITE_URL = 'https://dhai.eth.limo';

interface StructuredDataProps {
  type: 'person' | 'blog' | 'article';
  article?: BlogPost;
}

function StructuredData({ type, article }: StructuredDataProps) {
  useEffect(() => {
    // Remove existing structured data script
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    let jsonLd: object;

    if (type === 'person') {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Dhaiwat Pandya',
        url: SITE_URL,
        sameAs: [
          'https://x.com/dhaiwat10',
          'https://github.com/dhaiwat10',
          'https://farcaster.xyz/dhai.eth',
        ],
        jobTitle: 'Ethereum Developer',
        description: 'Ethereum Developer. Relentlessly Curious.',
      };
    } else if (type === 'blog') {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'dhai.eth Blog',
        url: `${SITE_URL}#/blog`,
        description: 'Blog posts by Dhaiwat Pandya about Ethereum development and other topics.',
        author: {
          '@type': 'Person',
          name: 'Dhaiwat Pandya',
        },
      };
    } else if (type === 'article' && article) {
      const articleUrl = `${SITE_URL}#/blog/${article.id}`;
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.excerpt,
        url: articleUrl,
        datePublished: article.date,
        dateModified: article.date,
        author: {
          '@type': 'Person',
          name: 'Dhaiwat Pandya',
          url: SITE_URL,
        },
        publisher: {
          '@type': 'Person',
          name: 'Dhaiwat Pandya',
        },
        ...(article.tags && article.tags.length > 0 && {
          keywords: article.tags.join(', '),
        }),
      };
    } else {
      return;
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, article]);

  return null;
}

export default StructuredData;

