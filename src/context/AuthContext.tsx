import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, AvatarChoice } from '../types';
import {
  getUsers,
  saveUser,
  getUserByEmail,
  getUserById,
  getCurrentUserId,
  setCurrentUserId,
  hashPassword,
  verifyPassword,
} from '../utils/storage';
import { getDisplayName } from '../utils/gameLogic';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (data: SignupData) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'firstName' | 'lastName' | 'nickname' | 'avatar'>>) => void;
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

  const refreshUsers = useCallback(() => {
    setAllUsers(getUsers());
  }, []);

  useEffect(() => {
    const savedId = getCurrentUserId();
    if (savedId) {
      const savedUser = getUserById(savedId);
      if (savedUser) {
        setUser(savedUser);
      }
    }
    refreshUsers();
  }, [refreshUsers]);

  const login = useCallback((email: string, password: string) => {
    const found = getUserByEmail(email);
    if (!found) {
      return { success: false, error: 'No account found with that email.' };
    }
    if (!verifyPassword(password, found.passwordHash)) {
      return { success: false, error: 'Incorrect password.' };
    }
    setUser(found);
    setCurrentUserId(found.id);
    return { success: true };
  }, []);

  const signup = useCallback((data: SignupData) => {
    const existing = getUserByEmail(data.email);
    if (existing) {
      return { success: false, error: 'An account with that email already exists.' };
    }

    const newUser: User = {
      id: uuidv4(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash: hashPassword(data.password),
      nickname: data.nickname || undefined,
      avatar: data.avatar,
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);
    setUser(newUser);
    setCurrentUserId(newUser.id);
    refreshUsers();
    return { success: true };
  }, [refreshUsers]);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentUserId(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<Pick<User, 'firstName' | 'lastName' | 'nickname' | 'avatar'>>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    saveUser(updated);
    setUser(updated);
    refreshUsers();
  }, [user, refreshUsers]);

  const displayName = user
    ? getDisplayName(user.firstName, user.lastName, user.nickname)
    : '';

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
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
