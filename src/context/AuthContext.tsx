import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, AvatarChoice } from '../types';
import { apiSignup, apiLogin, apiLogout, apiGetMe, apiUpdateProfile, apiGetUsers } from '../utils/api';
import { getDisplayName } from '../utils/gameLogic';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'firstName' | 'lastName' | 'nickname' | 'avatar' | 'theme'>>) => void;
  displayName: string;
  allUsers: User[];
  refreshUsers: () => void;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  nickname?: string;
  avatar: AvatarChoice;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUsers = useCallback(async () => {
    try {
      const users = await apiGetUsers();
      setAllUsers(users);
    } catch {
      // Fall back to empty if server unreachable
      setAllUsers([]);
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      const result = await apiGetMe();
      if (result.user) {
        setUser(result.user);
      }
      setIsLoading(false);
    }
    restoreSession();
    refreshUsers();
  }, [refreshUsers]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    if (result.user) {
      setUser(result.user);
      refreshUsers();
      return { success: true };
    }
    return { success: false, error: result.error };
  }, [refreshUsers]);

  const signup = useCallback(async (data: SignupData) => {
    const result = await apiSignup({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      nickname: data.nickname,
      avatar: data.avatar,
    });
    if (result.user) {
      setUser(result.user);
      refreshUsers();
      return { success: true };
    }
    return { success: false, error: result.error };
  }, [refreshUsers]);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<User, 'firstName' | 'lastName' | 'nickname' | 'avatar' | 'theme'>>) => {
    if (!user) return;
    const result = await apiUpdateProfile(user.id, updates);
    if (result.user) {
      setUser(result.user);
      refreshUsers();
    }
  }, [user, refreshUsers]);

  const displayName = user
    ? getDisplayName(user.firstName, user.lastName, user.nickname)
    : '';

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      updateProfile,
      displayName,
      allUsers,
      refreshUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
