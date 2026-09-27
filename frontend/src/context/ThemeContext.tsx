import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme = 'dark' | 'black' | 'white';
export type AppWallpaper = 'slate' | 'wood' | 'carbon' | 'studio' | 'solid';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  tagline: string;
  iconName: 'moon' | 'circle' | 'sun';
}

export interface WallpaperOption {
  id: AppWallpaper;
  name: string;
  tagline: string;
  previewUrl?: string;
  colorHint: string;
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

export const WALLPAPER_OPTIONS: WallpaperOption[] = [
  {
    id: 'slate',
    name: 'Aurora Slate',
    tagline: 'Tinted dark slate with ambient emerald lighting',
    previewUrl: '/wallpapers/dark-slate.jpg',
    colorHint: '#133e38',
  },
  {
    id: 'wood',
    name: 'Walnut Wood',
    tagline: 'Authentic Chess.com luxury dark wood grain',
    previewUrl: '/wallpapers/walnut-wood.jpg',
    colorHint: '#3e2718',
  },
  {
    id: 'carbon',
    name: 'Carbon OLED',
    tagline: 'Pitch black carbon weave with cyber emerald vignette',
    previewUrl: '/wallpapers/carbon-oled.jpg',
    colorHint: '#00291f',
  },
  {
    id: 'studio',
    name: 'Light Studio',
    tagline: 'Bright clean ambient gradient for light mode',
    previewUrl: '/wallpapers/light-studio.jpg',
    colorHint: '#d1fae5',
  },
  {
    id: 'solid',
    name: 'Minimal Solid',
    tagline: 'Flat clean solid color without background image',
    colorHint: '#262421',
  },
];

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  wallpaper: AppWallpaper;
  setWallpaper: (wallpaper: AppWallpaper) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
  wallpaper: 'slate',
  setWallpaper: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('chess_theme');
    if (saved === 'black' || saved === 'white' || saved === 'dark') {
      return saved;
    }
    return 'dark';
  });

  const [wallpaper, setWallpaperState] = useState<AppWallpaper>(() => {
    const savedWp = localStorage.getItem('chess_wallpaper') as AppWallpaper;
    if (savedWp && ['slate', 'wood', 'carbon', 'studio', 'solid'].includes(savedWp)) {
      return savedWp;
    }
    // Default wallpaper according to initial theme
    const savedTheme = localStorage.getItem('chess_theme');
    if (savedTheme === 'black') return 'carbon';
    if (savedTheme === 'white') return 'studio';
    return 'slate';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('chess_theme', newTheme);

    // Adapt wallpaper to match the new theme aesthetic
    if (newTheme === 'white') {
      if (wallpaper !== 'solid') {
        setWallpaper('studio');
      }
    } else if (newTheme === 'black') {
      if (wallpaper === 'studio' || wallpaper === 'slate') {
        setWallpaper('carbon');
      }
    } else if (newTheme === 'dark') {
      if (wallpaper === 'studio' || wallpaper === 'carbon') {
        setWallpaper('slate');
      }
    }
  };

  const setWallpaper = (newWallpaper: AppWallpaper) => {
    setWallpaperState(newWallpaper);
    localStorage.setItem('chess_wallpaper', newWallpaper);
  };

  const toggleTheme = () => {
    const next: AppTheme = theme === 'dark' ? 'black' : theme === 'black' ? 'white' : 'dark';
    setTheme(next);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-wallpaper', wallpaper);
    document.body.setAttribute('data-wallpaper', wallpaper);
  }, [wallpaper]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, wallpaper, setWallpaper }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
