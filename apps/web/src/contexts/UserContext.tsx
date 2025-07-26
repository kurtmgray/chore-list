import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  id: number;
  first_name: string;
  avatar: string;
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchUser: (userId: number) => void;
  // Add available users for switching
  availableUsers: User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  // For SLC: hardcode Kurt and Kaya
  const availableUsers: User[] = [
    { id: 1, first_name: 'Kurt', avatar: '🚵🏼‍♂️' },
    { id: 2, first_name: 'Kaya', avatar: '💅' },
  ];

  // Default to Kurt
  const [currentUser, setCurrentUser] = useState<User | null>(
    availableUsers[0]
  );

  const switchUser = (userId: number) => {
    const user = availableUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUser,
        availableUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
