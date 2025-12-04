import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "../firebase";
import { auth } from "../firebase";
import { useTheme } from "../context/ThemeContext.jsx";
import { useSwipeDirection } from "../components/SwipeDirectionContext"; // Importa il context
import { clearAllCookies } from "../utils/cookies";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import ProgressBar from "./ProgressBarComponent.jsx";

function NavigationHeader({ currentPage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { setDirection } = useSwipeDirection(); // Usa il context
  const pages = ["feedback", "share", "wheel"];

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = pages.indexOf(currentPage);
    return idx >= 0 ? idx : 0;
  });

  const getThemeColor = useCallback(
    (colorPath, fallback = "") => {
      if (!theme || !colorPath) return fallback;
      const [colorName, shade = "DEFAULT"] = colorPath.split("-");
      return theme[colorName]?.[shade] || theme[colorName]?.DEFAULT || fallback;
    },
    [theme]
  );

  useEffect(() => {
    const pageName = location.pathname.replace("/", "");
    const idx = pages.indexOf(pageName);
    if (idx !== -1 && idx !== currentIndex) {
      setCurrentIndex(idx);
    }
  }, [location.pathname]);

  const handleNavigate = (target) => {
    let newIndex;
    let navigationDirection;

    if (typeof target === "string") {
      if (target === "right") {
        newIndex = currentIndex + 1;
        navigationDirection = "forward"; // Vai alla pagina successiva
      } else {
        newIndex = currentIndex - 1;
        navigationDirection = "backward"; // Torna alla pagina precedente
      }
    } else {
      newIndex = target;
      navigationDirection = newIndex > currentIndex ? "forward" : "backward";
    }

    if (newIndex >= 0 && newIndex < pages.length) {
      // Imposta la direzione per l'animazione PRIMA di navigare
      setDirection(navigationDirection);
      setCurrentIndex(newIndex);
      navigate(`/${pages[newIndex]}`);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // Clear all application cookies before logout
      clearAllCookies();

      await fetch("/api/logout", { method: "POST" });
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      alert("Si è verificato un errore durante il logout. Riprova.");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const isFirstPage = currentIndex === 0;
  const isLastPage = currentIndex === pages.length - 1;
  const dotDisabledColor = getThemeColor("background-DEFAULT", "#ff005531");
  const leftArrowColor = isFirstPage
    ? dotDisabledColor
    : getThemeColor("text-DEFAULT", "#FF0054");
  const rightArrowColor = isLastPage
    ? dotDisabledColor
    : getThemeColor("text-DEFAULT", "#FF0054");
  const arrowSize = 24;

  return (
    <>
      <header
        className="fixed top-0 left-0 w-full z-50 transition-colors duration-300"
        style={{
          backgroundColor: getThemeColor("background-DEFAULT", "transparent"),
          height: "80px",
        }}
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full max-w-lg mx-auto h-full px-4">
          {/* Colonna Sinistra */}
          <div className="flex justify-start">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => !isFirstPage && handleNavigate("left")}
              aria-label="Indietro"
              disabled={isFirstPage}
              className="w-20 h-20 p-0 rounded-full hover:bg-gray-100/20 transition-colors duration-200 flex items-center justify-center"
            >
              <ChevronLeft
                className="w-full h-full"
                style={{
                  color: leftArrowColor,
                  width: arrowSize,
                  height: arrowSize,
                }}
              />
            </Button>
          </div>

          {/* Colonna Centro */}
          <div className="flex flex-col items-center justify-center">
            <div
              className="text-sm font-semibold mb-2 whitespace-nowrap"
              style={{ color: getThemeColor("text-DEFAULT", "#FF0054") }}
            >
              {currentIndex === 0
                ? "Iniziamo!"
                : currentIndex === 1
                ? "Ci sei quasi!"
                : "Hai raggiunto il traguardo!"}
            </div>

            <ProgressBar
              currentStep={currentIndex}
              totalSteps={pages.length}
              onStepChange={handleNavigate}
              getThemeColor={getThemeColor}
            />
          </div>

          {/* Colonna Destra */}
          <div className="flex justify-end">
            {isLastPage ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLogoutConfirm(true)}
                aria-label="Logout"
                className="w-20 h-20 p-0 rounded-full hover:bg-gray-100/20 transition-colors duration-200 flex items-center justify-center"
              >
                <LogOut
                  className="h-12 w-12"
                  style={{ color: getThemeColor("error-500", "#ea2327") }}
                />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => !isLastPage && handleNavigate("right")}
                aria-label="Avanti"
                disabled={isLastPage}
                className="w-20 h-20 p-0 rounded-full hover:bg-gray-100/20 transition-colors duration-200 flex items-center justify-center"
              >
                <ChevronRight
                  className="w-full h-full"
                  style={{
                    color: rightArrowColor,
                    width: arrowSize,
                    height: arrowSize,
                  }}
                />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Modal di conferma Logout */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="max-w-xs md:max-w-sm rounded-xl p-6 bg-white shadow-xl border-none">
          <AlertDialogHeader className="text-center">
            <div class="text-black text-7xl leading-[3.5rem]">😔</div>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              Sei sicuro di voler uscire?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              La tua sessione corrente verrà terminata. Dovrai effettuare
              nuovamente l'accesso per continuare.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-3 mt-4 w-full">
            <AlertDialogCancel
              disabled={isLoggingOut}
              className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium border-none py-3 rounded-lg mt-0"
            >
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex-1 text-white font-medium py-3 rounded-lg border-none mt-0"
              style={{
                backgroundColor: getThemeColor("error-500", "#ea2327"),
                color: "white",
              }}
            >
              {isLoggingOut ? "Uscita in corso..." : "Esci"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default NavigationHeader;
