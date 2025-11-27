import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { blogPosts } from '../data/blog-posts';
import { useMemo, useState } from 'react';
import PageTransition from './PageTransition';

function BlogList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedTag = searchParams.get('tag');
  const [searchQuery, setSearchQuery] = useState('');

  // Get all unique tags from all posts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    blogPosts.forEach(post => {
      post.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, []);

  // Filter posts by selected tag and search query
  const filteredPosts = useMemo(() => {
    let posts = [...blogPosts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    if (selectedTag) {
      posts = posts.filter(post => post.tags.includes(selectedTag));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.excerpt.toLowerCase().includes(query)
      );
    }
    
    return posts;
  }, [selectedTag, searchQuery]);

  const clearFilter = () => {
    navigate('/blog');
    setSearchQuery('');
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-8">Blog</h1>
      
      {/* Search and Filter Controls */}
      <div className="mb-8 space-y-6">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>

        {/* Tag Browser */}
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
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
          
          {(selectedTag || searchQuery) && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-gray-400 text-sm">
                {selectedTag && searchQuery ? (
                  <>Filtering by tag <span className="text-white font-medium">{selectedTag}</span> and search <span className="text-white font-medium">"{searchQuery}"</span></>
                ) : selectedTag ? (
                  <>Filtering by tag <span className="text-white font-medium">{selectedTag}</span></>
                ) : (
                  <>Searching for <span className="text-white font-medium">"{searchQuery}"</span></>
                )}
              </span>
              <button
                onClick={clearFilter}
                className="text-gray-400 hover:text-white text-sm underline transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Blog Posts */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 border border-gray-800 rounded-lg bg-gray-900/30">
            <p className="text-gray-400 text-lg mb-2">No posts found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
            <button
              onClick={clearFilter}
              className="text-gray-400 hover:text-white underline mt-4 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredPosts.map((post, index) => (
            <article
              key={post.id}
              style={{ animationDelay: `${index * 0.05}s` }}
              itemScope
              itemType="https://schema.org/BlogPosting"
              className="animate-slide-up rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-all bg-gray-900/50"
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
                })} • {post.readingTime} min read
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
    </PageTransition>
  );
}

export default BlogList;

