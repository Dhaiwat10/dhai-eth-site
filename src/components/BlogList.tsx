import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blog-posts';

function BlogList() {
  const sortedPosts = [...blogPosts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-8">Blog</h1>
      
      <div className="space-y-6">
        {sortedPosts.map((post) => (
          <article 
            key={post.id} 
            className="rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-all bg-gray-900/50"
          >
            <Link to={`/blog/${post.id}`}>
              <h2 className="text-2xl font-bold text-white mb-2 hover:text-gray-300 transition-colors">
                {post.title}
              </h2>
            </Link>
            
            <time className="text-sm text-gray-500">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            
            <p className="text-gray-400 mt-3 mb-4">
              {post.excerpt}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-md border border-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <Link 
              to={`/blog/${post.id}`}
              className="text-gray-400 hover:text-white font-medium transition-colors inline-flex items-center"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

export default BlogList;

