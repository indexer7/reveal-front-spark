import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enable mock service worker in development
if (import.meta.env.DEV) {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({
      onUnhandledRequest: 'bypass',
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
