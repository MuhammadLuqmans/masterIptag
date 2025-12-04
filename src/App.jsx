import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useSwipeable } from "react-swipeable";
// Importa il Context di direzione
import {
  SwipeDirectionProvider,
  useSwipeDirection,
} from "./components/SwipeDirectionContext";

// Importa Framer Motion
import { AnimatePresence, motion } from "framer-motion";

// ... (Importa i componenti delle pagine e i context/componenti) ...
import Login from "./pages/Login.jsx";
import Feedback from "./pages/Feedback.jsx";
import Share from "./pages/Share.jsx";
import Wheel from "./pages/Wheel.jsx";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ProtectedRoute from "./components/ProtectedRoute";
import ValidatePlaceId from "./components/ValidatePlaceId";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { enableNetwork, disableNetwork } from "firebase/firestore";
import { clearAllCookies } from "./utils/cookies";

const SWIPE_ROUTES_ORDER = [
  "/feedback", // 0
  "/share", // 1
  "/wheel", // 2
];

const NAVIGATION_DEBOUNCE_MS = 500;

// --- Componente interno che gestisce la logica di navigazione ---
// Questo componente ha accesso a useSwipeDirection, useNavigate e useLocation
function AppLogic() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  // Ottieni la funzione per impostare la direzione dello swipe
  const { setDirection } = useSwipeDirection();

  // -----------------------------------------------------------
  // 1. Logica di Autenticazione (Invariata)
  // -----------------------------------------------------------
  useEffect(() => {
    // ... (Logica di autenticazione omessa per brevità) ...
    const handleStorageChange = (e) => {
      if (e.key === "authState") {
        const newAuthState = JSON.parse(e.newValue);
        setIsAuthenticated(newAuthState.isAuthenticated);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const loggedIn = !!user;
      setIsAuthenticated(loggedIn);
      try {
        if (loggedIn) {
          // Riabilita la rete Firestore quando l'utente è autenticato
          await enableNetwork(db);
        } else {
          // Disabilita la rete per chiudere eventuali stream pendenti
          await disableNetwork(db);
        }
      } catch (e) {
        // Non bloccare il flusso se fallisce
      }
      setLoading(false);
    });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      unsubscribe();
    };
  }, []);

  // -----------------------------------------------------------
  // 1.b Watcher scadenza cookie di sessione (client-side)
  // Alla scadenza del cookie "session" esegue logout e redirect a NotFound
  // -----------------------------------------------------------
  useEffect(() => {
    let expiredHandled = false;

    const handleExpiry = async () => {
      if (expiredHandled) return;
      expiredHandled = true;
      try {
        // Clear all application cookies on session expiry
        clearAllCookies();
        // Disabilita la rete Firestore per chiudere subito gli stream
        try {
          await disableNetwork(db);
        } catch (_) {}
        // Effettua il logout client di Firebase per disattivare i listener auth
        await signOut(auth);
        // Avvisa il server di pulire la sessione
        try {
          await fetch("/api/logout", { method: "POST" });
        } catch (_) {}
        // Poi naviga alla pagina di fallback non protetta
        navigate("/expired", { replace: true });
      } catch (err) {
        // Error during logout after session expiry
      } finally {
        setIsAuthenticated(false);
      }
    };

    // Piccolo periodo di grazia dopo l'autenticazione per permettere al cookie di essere settato
    const authStartTime = Date.now();

    const checkSessionCookie = () => {
      // 2s di grace dopo che l'utente risulta autenticato
      if (isAuthenticated && Date.now() - authStartTime < 2000) return;
      // Verifica lato server la validità della sessione
      if (!isAuthenticated) return;
      fetch("/api/session")
        .then((res) => {
          if (res.status === 200) return res.json();
          throw new Error("invalid");
        })
        .then((data) => {
          if (!data?.valid) handleExpiry();
        })
        .catch(() => handleExpiry());
    };

    // Controllo periodico e su focus/visibilità
    const intervalId = setInterval(checkSessionCookie, 5000);
    const onFocus = () => checkSessionCookie();
    const onVisibility = () =>
      document.visibilityState === "visible" && checkSessionCookie();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    // Primo check immediato
    checkSessionCookie();

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isAuthenticated, navigate]);

  // -----------------------------------------------------------
  // 2. Gestione Transizione Spinner (Invariata)
  // -----------------------------------------------------------
  useEffect(() => {
    setIsChangingPage(true);
    const timer = setTimeout(() => {
      setIsChangingPage(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [location]);

  // -----------------------------------------------------------
  // 3. Logica di Gestione dello Swipe (FIX: Aggiunta setDirection)
  // -----------------------------------------------------------
  const handleSwipeNavigation = (direction) => {
    if (
      isNavigating ||
      !isAuthenticated ||
      !SWIPE_ROUTES_ORDER.some((route) => location.pathname.startsWith(route))
    ) {
      return;
    }

    const currentBaseRoute = location.pathname;

    const currentIndex = SWIPE_ROUTES_ORDER.indexOf(currentBaseRoute);

    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    let swipeDir = ""; // Variabile per tracciare la direzione nel contesto

    // SWIPE a DESTRA (da sinistra a destra) -> Torna indietro (Indice -1)
    if (direction === "Right") {
      newIndex =
        (currentIndex - 1 + SWIPE_ROUTES_ORDER.length) %
        SWIPE_ROUTES_ORDER.length;
      swipeDir = "backward";
    }
    // SWIPE a SINISTRA (da destra a sinistra) -> Vai avanti (Indice +1)
    else if (direction === "Left") {
      newIndex = (currentIndex + 1) % SWIPE_ROUTES_ORDER.length;
      swipeDir = "forward";
    }

    if (newIndex !== currentIndex) {
      // 1. BLOCCO IMMEDIATO
      setIsNavigating(true);

      // 2. IMPOSTA LA DIREZIONE PRIMA DELLA NAVIGAZIONE
      setDirection(swipeDir);

      const newBaseRoute = SWIPE_ROUTES_ORDER[newIndex];
      navigate(newBaseRoute);

      // 3. SBLOCCO DOPO DEBOUNCE
      setTimeout(() => {
        setIsNavigating(false);
      }, NAVIGATION_DEBOUNCE_MS);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipeNavigation("Left"),
    onSwipedRight: () => handleSwipeNavigation("Right"),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  if (loading) {
    return (
      <div className="spinner-overlay" role="status" aria-label="Caricamento">
        <div className="spinner"></div>
      </div>
    );
  }

  // Il componente di animazione sarà un wrapper qui
  return (
    <div
      {...swipeHandlers}
      style={{ minHeight: "100vh", width: "100%", overflowX: "hidden" }}
    >
      {isChangingPage && (
        <div
          className="spinner-overlay"
          role="status"
          aria-label="Cambio pagina"
        >
          <div className="spinner"></div>
        </div>
      )}
      <AnimatedContent isAuthenticated={isAuthenticated} />
    </div>
  );
}

// --- Componente per gestire l'animazione di Framer Motion ---
function AnimatedContent({ isAuthenticated }) {
  const location = useLocation();
  const { direction } = useSwipeDirection(); // Legge la direzione

  // Varianti dinamiche basate sulla direzione
  const variants = {
    // La pagina uscirà nella direzione opposta a quella in cui è entrata
    // o entrerà dalla direzione opposta a quella da cui uscirà la precedente.
    enter: (dir) => ({
      x: dir === "forward" ? "100%" : "-100%",
      opacity: 0,
      transition: { duration: 0.4 },
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
    exit: (dir) => ({
      x: dir === "forward" ? "-100%" : "100%",
      opacity: 0,
      transition: { duration: 0.4 },
    }),
  };

  return (
    <AnimatePresence
      initial={false}
      custom={direction} // Passa la direzione come prop custom
      mode="wait"
    >
      {/* key={location.pathname} forza l'uscita/entrata ad ogni cambio di rotta */}
      <motion.div
        key={location.pathname.split("/").slice(0, 2).join("/")} // Usa la base del path come chiave
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        style={{ position: "absolute", width: "100%", top: 0, left: 0 }}
      >
        <Routes location={location}>
          {/* Rotte NON-Swipeable (Lasciate qui, anche se non animate) */}
          <Route path="/invalid-business" element={<NotFound />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/:activityId" element={<Login />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          {/* Rotte Swipeable (Protette) */}
          <Route
            path="/feedback"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ValidatePlaceId>
                  <ThemeProvider>
                    <Feedback />
                  </ThemeProvider>
                </ValidatePlaceId>
              </ProtectedRoute>
            }
          />
          <Route
            path="/share"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ValidatePlaceId>
                  <ThemeProvider>
                    <Share />
                  </ThemeProvider>
                </ValidatePlaceId>
              </ProtectedRoute>
            }
          />
          <Route
            path="/wheel"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ValidatePlaceId>
                  <ThemeProvider>
                    <Wheel />
                  </ThemeProvider>
                </ValidatePlaceId>
              </ProtectedRoute>
            }
          />

          {/* Rotte di Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="*"
            element={
              isAuthenticated ? <NotFound /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

// --- Componente Wrapper Finale ---
function App() {
  return (
    <ThemeProvider>
      <SwipeDirectionProvider>
        <AppLogic />
      </SwipeDirectionProvider>
    </ThemeProvider>
  );
}

export default App;
