import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blog-posts';

function Home() {
  const latestPosts = [...blogPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div>
      <section className="mb-16">
        <h1 className="text-5xl font-bold text-white mb-4">dhai.eth</h1>
        <h2 className="text-3xl text-gray-300 mb-6">Dhaiwat Pandya</h2>
        <p className="text-xl text-gray-400 max-w-2xl">
          Ethereum Developer. Relentlessly Curious.
        </p>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Latest Posts</h3>
          <Link 
            to="/blog"
            className="text-gray-400 hover:text-white font-medium transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post) => (
            <article 
              key={post.id}
              className="rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-all bg-gray-900/50"
            >
              <Link to={`/blog/${post.id}`}>
                <h4 className="text-xl font-bold text-white mb-2 hover:text-gray-300 transition-colors">
                  {post.title}
                </h4>
              </Link>
              
              <time className="text-sm text-gray-500">
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              
              <p className="text-gray-400 mt-3 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              
              <Link 
                to={`/blog/${post.id}`}
                className="text-gray-400 hover:text-white font-medium text-sm transition-colors inline-flex items-center"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;

