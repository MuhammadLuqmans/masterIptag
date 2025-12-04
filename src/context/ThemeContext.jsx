import React from 'react';

const ThemeContext = React.createContext();

export const ThemeProvider = ({ children }) => {
  // Non fa più nulla, solo un provider vuoto
  return (
    <ThemeContext.Provider value={{}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return React.useContext(ThemeContext);
};