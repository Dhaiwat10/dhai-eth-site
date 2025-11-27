import { useParams, Link, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { blogPosts } from '../data/blog-posts';
import CodeBlock from './CodeBlock';
import SEO from './SEO';
import StructuredData from './StructuredData';
import PageTransition from './PageTransition';

function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const publishedDate = new Date(post.date).toISOString();

  return (
    <PageTransition>
      <article className="max-w-4xl mx-auto">
      <SEO
        title={post.title}
        description={post.excerpt}
        type="article"
        publishedTime={publishedDate}
        modifiedTime={publishedDate}
        tags={post.tags}
      />
      <StructuredData type="article" article={post} />
      
      <Link 
        to="/blog" 
        className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
      >
        ← Back to Blog
      </Link>
      
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          {post.title}
        </h1>
        
        <time dateTime={publishedDate} className="text-gray-500">
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} • {post.readingTime} min read
        </time>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to={`/blog?tag=${encodeURIComponent(tag)}`}
              className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-md border border-gray-700 hover:bg-gray-700 hover:text-white transition-all"
            >
              {tag}
            </Link>
          ))}
        </div>
      </header>

      <div className="prose prose-lg max-w-none break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              
              return !inline && language ? (
                <CodeBlock language={language}>
                  {String(children).replace(/\n$/, '')}
                </CodeBlock>
              ) : (
                <code className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-700" {...props}>
                  {children}
                </code>
              );
            },
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold text-white mt-8 mb-4">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-bold text-white mt-6 mb-3">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-bold text-white mt-4 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-300 mb-4 leading-relaxed">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-2 text-gray-300">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-300">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="ml-4">
                {children}
              </li>
            ),
            a: ({ href, children }) => (
              <a 
                href={href}
                className="text-gray-300 hover:text-white underline underline-offset-4 decoration-gray-600 hover:decoration-white transition-colors break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-400 my-4">
                {children}
              </blockquote>
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
    </PageTransition>
  );
}

export default BlogPost;

