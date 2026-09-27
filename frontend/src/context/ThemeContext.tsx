import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme = 'dark' | 'black' | 'white';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  tagline: string;
  iconName: 'moon' | 'circle' | 'sun';
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'dark',
    name: 'Dark Theme',
    tagline: 'Chess.com Slate / Charcoal',
    iconName: 'moon',
  },
  {
    id: 'black',
    name: 'Black Theme',
    tagline: 'True OLED Pitch Black',
    iconName: 'circle',
  },
  {
    id: 'white',
    name: 'White Theme',
    tagline: 'Clean Crisp Light',
    iconName: 'sun',
  },
];

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('chess_theme');
    if (saved === 'black' || saved === 'white' || saved === 'dark') {
      return saved;
    }
    return 'dark';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('chess_theme', newTheme);
  };

  const toggleTheme = () => {
    setThemeState((current) => {
      const next: AppTheme = current === 'dark' ? 'black' : current === 'black' ? 'white' : 'dark';
      localStorage.setItem('chess_theme', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
