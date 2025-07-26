import { createContext, useContext, type ReactNode } from 'react';

interface WorkspaceContextType {
  workspaceId: number;
  // Future: Add workspace switching functionality
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  // For SLC: hardcode to workspace 1 (Kurt & Kaya household)
  const workspaceId = 1;
  
  return (
    <WorkspaceContext.Provider value={{ workspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}