import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, AuthResponse } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (authResponse: AuthResponse) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to load user from localStorage on mount
    try {
      const storedUser = localStorage.getItem("bookbridge_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (authResponse: AuthResponse) => {
    localStorage.setItem("bookbridge_token", authResponse.token);
    localStorage.setItem("bookbridge_user", JSON.stringify(authResponse.user));
    setUser(authResponse.user);
  };

  const logout = () => {
    localStorage.removeItem("bookbridge_token");
    localStorage.removeItem("bookbridge_user");
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem("bookbridge_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
