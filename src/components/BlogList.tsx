import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { blogPosts } from '../data/blog-posts';
import { useMemo } from 'react';

function BlogList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedTag = searchParams.get('tag');

  // Get all unique tags from all posts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    blogPosts.forEach(post => {
      post.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, []);

  // Filter posts by selected tag
  const filteredPosts = useMemo(() => {
    const sorted = [...blogPosts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    if (!selectedTag) {
      return sorted;
    }
    
    return sorted.filter(post => post.tags.includes(selectedTag));
  }, [selectedTag]);

  const clearFilter = () => {
    navigate('/blog');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-8">Blog</h1>
      
      {/* Tag Browser */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {allTags.map((tag) => (
            <Link
              key={tag}
              to={`/blog?tag=${encodeURIComponent(tag)}`}
              className={`px-3 py-1 text-sm rounded-md border transition-all ${
                selectedTag === tag
                  ? 'bg-gray-600 text-white border-gray-500'
                  : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 hover:text-white'
              }`}
            >
              {tag}
            </Link>
          ))}
        </div>
        {selectedTag && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">
              Filtering by: <span className="text-white font-medium">{selectedTag}</span>
            </span>
            <button
              onClick={clearFilter}
              className="text-gray-400 hover:text-white text-sm underline transition-colors"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* Blog Posts */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No posts found with tag "{selectedTag}"</p>
            <button
              onClick={clearFilter}
              className="text-gray-400 hover:text-white underline mt-2 transition-colors"
            >
              View all posts
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article 
              key={post.id} 
              itemScope
              itemType="https://schema.org/BlogPosting"
              className="rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-all bg-gray-900/50"
            >
              <Link to={`/blog/${post.id}`}>
                <h2 itemProp="headline" className="text-2xl font-bold text-white mb-2 hover:text-gray-300 transition-colors">
                  {post.title}
                </h2>
              </Link>
              
              <time dateTime={post.date} className="text-sm text-gray-500">
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              
              <p itemProp="description" className="text-gray-400 mt-3 mb-4">
                {post.excerpt}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                    className={`px-3 py-1 text-sm rounded-md border transition-all ${
                      selectedTag === tag
                        ? 'bg-gray-600 text-white border-gray-500'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
              
              <Link 
                to={`/blog/${post.id}`}
                className="text-gray-400 hover:text-white font-medium transition-colors inline-flex items-center"
              >
                Read more →
              </Link>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export default BlogList;

