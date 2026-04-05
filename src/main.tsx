import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Redirect bare paths (e.g. /blog/my-post) to hash routes (/#/blog/my-post)
// so the HashRouter can handle them. Without this, bare paths just show Home.
const { pathname, search } = window.location;
if (pathname !== '/' && !window.location.hash) {
  window.location.replace('/#' + pathname + search);
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
