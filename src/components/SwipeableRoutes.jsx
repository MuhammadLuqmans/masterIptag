// SwipeableRoutes.jsx

import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
// Dovrai installare una libreria come 'react-swipeable' o 'react-use-gesture'

const routePaths = [
  // Definisci l'ordine sequenziale delle rotte protette
  '/feedback/:activityId',
  '/share/:activityId',
  '/wheel/:activityId',
];

// Funzione per ottenere la prossima o precedente rotta
const getNextRoute = (currentPath, direction) => {
  const baseRoutes = routePaths.map(path => path.split('/:')[0]); // Rimuove :activityId
  const currentBase = currentPath.split('/:')[0];
  const currentIndex = baseRoutes.indexOf(currentBase);

  if (currentIndex === -1) return null;

  let newIndex = currentIndex;
  if (direction === 'Left') { // Swipe a sinistra -> prossima pagina
    newIndex = (currentIndex + 1) % routePaths.length;
  } else if (direction === 'Right') { // Swipe a destra -> pagina precedente
    newIndex = (currentIndex - 1 + routePaths.length) % routePaths.length;
  }

  // Preleva l'activityId dalla rotta attuale
  const match = currentPath.match(/\/(\w+)$/);
  const activityId = match ? match[1] : '';

  if (newIndex !== currentIndex) {
    return routePaths[newIndex].replace(':activityId', activityId);
  }
  return null;
};

const SwipeableRoutes = ({ isAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const nextRoute = getNextRoute(location.pathname, 'Left');
      if (nextRoute) {
        navigate(nextRoute);
      }
    },
    onSwipedRight: () => {
      const prevRoute = getNextRoute(location.pathname, 'Right');
      if (prevRoute) {
        navigate(prevRoute);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true, // Abilita anche per desktop
  });

  return (
    <div {...handlers} style={{ minHeight: '100vh', width: '100%' }}>
      <Routes location={location}>
        {/* Le tue rotte protette */}
        <Route
          path="/feedback/:activityId"
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Feedback /></ProtectedRoute>}
        />
        <Route
          path="/share/:activityId"
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Share /></ProtectedRoute>}
        />
        <Route
          path="/wheel/:activityId"
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Wheel /></ProtectedRoute>}
        />
      </Routes>
    </div>
  );
};

export default SwipeableRoutes;