import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';
import './index.css';
import './i18n/config'; // Initialize i18n

async function initializeApp() {
  console.log('🚀 StarOil starting up...');
  
  // Check root element
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('❌ FATAL: Root element not found!');
    return;
  }
  console.log('✅ Root element found');
  
  // Initialize MSW if mock mode is enabled
  const isMockEnabled = localStorage.getItem('MOCK_MODE') === 'true';
  if (isMockEnabled) {
    try {
      const { worker } = await import('./mocks/browser');
      console.log('🎭 Starting Mock Service Worker...');
      await worker.start({
        onUnhandledRequest: 'warn',
      });
      console.log('✅ MSW initialized - using mock data');
    } catch (error) {
      console.error('❌ MSW initialization failed:', error);
    }
  } else {
    console.log('ℹ️  Mock mode disabled - using real API');
  }

  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </React.StrictMode>
    );
    console.log('✅ React app mounted successfully');
  } catch (error) {
    console.error('❌ React rendering failed:', error);
  }
}

initializeApp().catch((error) => {
  console.error('❌ App initialization error:', error);
});
