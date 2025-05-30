import React, { createContext, useState, useMemo, ReactNode } from 'react';
import { ThemeProvider, createTheme, Theme, PaletteMode } from '@mui/material/styles';

interface ColorModeContextType {
  toggleColorMode: (mode?: PaletteMode) => void;
  mode: PaletteMode;
}

export const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
  mode: 'light',
});

interface ColorModeProviderProps {
  children: ReactNode;
}

export const ColorModeProvider: React.FC<ColorModeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>('light');

  const colorMode = useMemo(() => ({
    toggleColorMode: (newMode?: PaletteMode) => {
      setMode(newMode || (prevMode => (prevMode === 'light' ? 'dark' : 'light')));
    },
    mode,
  }), [mode]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      // You can customize your theme colors here
      primary: {
        main: '#5048E5',
      },
      secondary: {
        main: '#10B981',
      },
      background: {
        default: mode === 'light' ? '#F9FAFC' : '#111927',
        paper: mode === 'light' ? '#FFFFFF' : '#1F2937',
      },
    },
  }), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};