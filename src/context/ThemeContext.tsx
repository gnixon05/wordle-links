/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { ThemePreference } from '../types';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  theme: ThemePreference;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, updateProfile } = useAuth();

  const theme: ThemePreference = user?.theme ?? 'light';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next: ThemePreference = theme === 'light' ? 'dark' : 'light';
    updateProfile({ theme: next });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
