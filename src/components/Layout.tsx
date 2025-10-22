import { Link, Outlet, useLocation } from 'react-router-dom';

function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black transition-colors">
      <nav className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="text-xl font-bold text-white hover:text-gray-300 transition-colors"
            >
              dhai.eth
            </Link>
            
            <div className="flex items-center gap-6">
              <Link 
                to="/"
                className={`font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/blog"
                className={`font-medium transition-colors ${
                  location.pathname.startsWith('/blog')
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Blog
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-black border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Dhaiwat Pandya. Hosted on IPFS.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;

