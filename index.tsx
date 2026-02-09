import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global Error Listener for non-React errors
window.addEventListener('error', (event) => {
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; background: #fee2e2; color: #991b1b; height: 100vh;">
      <h1>Erro Crítico (Global)</h1>
      <p>${event.message}</p>
      <pre>${event.filename}: ${event.lineno}</pre>
    </div>
  `;
});

window.addEventListener('unhandledrejection', (event) => {
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; background: #fee2e2; color: #991b1b; height: 100vh;">
      <h1>Erro de Promessa Não Tratada</h1>
      <p>${event.reason}</p>
    </div>
  `;
});

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#fee2e2', color: '#991b1b', height: '100vh' }}>
          <h1>Algo deu errado na renderização.</h1>
          <p>{this.state.error?.message}</p>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);