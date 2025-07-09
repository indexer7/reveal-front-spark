import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enable mock API in development
if (import.meta.env.DEV) {
  import('./mocks/mockApi').then(({ enableMockApi }) => {
    enableMockApi();
  });
}

createRoot(document.getElementById("root")!).render(<App />);
