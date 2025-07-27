import { createRouter, RouterProvider } from '@tanstack/react-router';
import { TRPCProvider } from './providers/TRPCProvider';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { UserProvider } from './contexts/UserContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { routeTree } from './routeTree.gen';
import './App.css';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <TRPCProvider>
        <WorkspaceProvider>
          <UserProvider>
            <RouterProvider router={router} />
          </UserProvider>
        </WorkspaceProvider>
      </TRPCProvider>
    </ErrorBoundary>
  );
}

export default App;
