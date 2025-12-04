import React, { createContext, useContext, useState } from 'react';

const SwipeDirectionContext = createContext();

export const useSwipeDirection = () => {
  const context = useContext(SwipeDirectionContext);
  if (!context) {
    throw new Error('useSwipeDirection must be used within a SwipeDirectionProvider');
  }
  return context;
};

export const SwipeDirectionProvider = ({ children }) => {
  const [direction, setDirection] = useState('forward'); // default

  return (
    <SwipeDirectionContext.Provider value={{ direction, setDirection }}>
      {children}
    </SwipeDirectionContext.Provider>
  );
};