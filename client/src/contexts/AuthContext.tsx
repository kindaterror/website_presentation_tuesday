// FIXED AuthContext.tsx - With Refresh Persistence
// --- SECTION: Imports ---
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loginUser, registerUser, logoutUser } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// --- SECTION: Interface Definitions ---
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  gradeLevel?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: User }>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    gradeLevel?: string;
    securityQuestion?: string;
    securityAnswer?: string;
  }) => Promise<{ user: User }>;
  logout: () => void;
}

// --- SECTION: Context Creation ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- SECTION: AuthProvider Component ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authFailed, setAuthFailed] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // ✅ NEW: Track initialization
  const queryClient = useQueryClient();

  // ✅ FIXED: Better token management
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem("token");
  };

  // ✅ IMPROVED: Authentication query with better error handling
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        throw new Error("No token found");
      }
      
      console.log("🔍 Checking authentication with token...");
      
      const response = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        console.log("❌ Auth check failed:", response.status);
        if (response.status === 401) {
          localStorage.removeItem("token");
          setAuthFailed(true);
        }
        throw new Error(`Auth failed: ${response.status}`);
      }
      
      const userData = await response.json();
      console.log("✅ Auth check successful:", userData.user?.email);
      setAuthFailed(false);
      return userData;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!getToken() && !authFailed, // ✅ FIXED: Better token check
  });

  // ✅ FIXED: User state management with initialization tracking
  useEffect(() => {
    if (data?.user) {
      console.log("👤 Setting user from data:", data.user.email);
      setUser(data.user);
      setIsInitializing(false);
    } else if (error || authFailed) {
      console.log("🚫 Clearing user due to error/auth failure");
      setUser(null);
      setIsInitializing(false);
    } else if (!getToken()) {
      // ✅ NEW: Handle case where there's no token at all
      console.log("🔑 No token found, user not authenticated");
      setUser(null);
      setIsInitializing(false);
    }
  }, [data, error, authFailed]);

  // ✅ NEW: Handle initial app load
  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.log("🔄 No token on app init, marking as not authenticated");
      setIsInitializing(false);
      setUser(null);
    }
    // If token exists, the query will handle authentication check
  }, []);

  // ✅ IMPROVED: Auth functions with better error handling
  const login = async (email: string, password: string) => {
    try {
      console.log("🔐 Attempting login for:", email);
      const response = await loginUser(email, password);
      setUser(response.user);
      setAuthFailed(false);
      setIsInitializing(false);
      
      // Refetch user data to sync
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      console.log("✅ Login successful:", response.user.email);
      return { user: response.user };
    } catch (error) {
      console.error("❌ Login failed:", error);
      setAuthFailed(true);
      throw error;
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    gradeLevel?: string;
    securityQuestion?: string;
    securityAnswer?: string;
  }) => {
    try {
      console.log("📝 Attempting registration for:", userData.email);
      const response = await registerUser(userData);
      setUser(response.user);
      setAuthFailed(false);
      setIsInitializing(false);
      
      // Refetch user data to sync
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      console.log("✅ Registration successful:", response.user.email);
      return { user: response.user };
    } catch (error) {
      console.error("❌ Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("🚪 Logging out user");
    logoutUser();
    localStorage.removeItem("token");
    setUser(null);
    setAuthFailed(false);
    setIsInitializing(false);
    queryClient.clear();
  };

  // ✅ FIXED: Proper loading state calculation
  const loading = isInitializing || (isLoading && !!getToken() && !authFailed);

  console.log("🔄 AuthProvider state:", {
    hasUser: !!user,
    loading,
    isInitializing,
    hasToken: !!getToken(),
    authFailed,
    isLoading
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --- SECTION: useAuth Hook ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}