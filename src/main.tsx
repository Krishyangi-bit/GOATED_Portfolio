import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/bangers/400.css';
import '@fontsource/anton/400.css';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/caveat';
import './styles/tokens.css';
import './styles/base.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
