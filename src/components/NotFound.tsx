import { Link } from 'react-router-dom';
import PageTransition from './PageTransition';

function NotFound() {
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-7xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">
          This page doesn't exist on the decentralized web… or anywhere else.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-700 hover:border-gray-600 transition-all font-medium"
        >
          ← Back to Home
        </Link>
      </div>
    </PageTransition>
  );
}

export default NotFound;
