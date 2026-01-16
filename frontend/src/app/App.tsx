import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { ThemeProvider } from '../theme/ThemeContext';
import { ITRProvider } from '../contexts/ITRContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { router } from './router';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ITRProvider>
            <RouterProvider router={router} />
          </ITRProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
