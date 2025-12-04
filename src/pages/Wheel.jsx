import React, { useState, useEffect } from "react";
import CustomWheel from "../components/CustomWheel.jsx";
import { getCookie } from "../utils/cookies";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import NavigationHeader from "../components/NavigationHeader.jsx";
import LottieAnimation from "../components/LottieAnimation.jsx";
import {
  query,
  collection,
  where,
  limit,
  onSnapshot,
  doc,
} from "firebase/firestore";

// Import Lottie animations
import coinAnimation from "../assets/lottie_emojis/coin.json";
import successAnimation from "../assets/lottie_emojis/success_check.json";
import errorAnimation from "../assets/lottie_emojis/error_cross.json";
import frownAnimation from "../assets/lottie_emojis/frown.json";
import heartEyesAnimation from "../assets/lottie_emojis/heart-eyes.json";
import warmSmileAnimation from "../assets/lottie_emojis/warm-smile.json";
import neutralFaceAnimation from "../assets/lottie_emojis/neutral-face.json";
import rageAnimation from "../assets/lottie_emojis/rage.json";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CloudCog, Loader2 } from "lucide-react";

// Componente per la visualizzazione dello stato (stili statici)
const StatusDisplay = ({ status, navigate }) => {
  const { type, message, withButton, prize } = status;

  const content = {
    win: {
      title: "Hai Vinto!",
      message: `Congratulazioni, hai vinto!`,
      animation: true,
      emoji: "🎉",
      button: (
        <Button
          onClick={() => status.hide()}
          className="w-full mt-4 h-12 font-semibold text-base px-6 rounded-lg"
          style={{ backgroundColor: "#131313", color: "#FDFBFE" }}
        >
          Continua
        </Button>
      ),
    },
    lose: {
      title: "Ritenta, sarai più fortunato!",
      message: "Non è andata bene questa volta, ma puoi riprovare!",
      animation: true,
      emoji: "😔",
      button: (
        <Button
          onClick={() => {
            status.hide();
            navigate(`/share`);
          }}
          className="w-full mt-4 h-12 font-semibold text-base px-6 rounded-lg"
          style={{ backgroundColor: "#131313", color: "#FDFBFE" }}
        >
          Ottieni 1 coin per riprovare
        </Button>
      ),
    },
    // Modifica la sezione "error" in StatusDisplay per avere due varianti:
    error: {
      title: "Ops...",
      message: message || "Si è verificato un errore inaspettato. Riprova.",
      animation: true,
      emoji: "⚠️",
      button: (
        <Button
          onClick={() => status.hide()}
          className="w-full mt-4 h-12 font-semibold text-base px-6 rounded-lg"
          style={{ backgroundColor: "#b91c1c", color: "#FDFBFE" }}
        >
          Chiudi
        </Button>
      ),
    },
    noCoins: {
      title: "Monete insufficienti",
      message: "Non hai monete sufficienti per girare la ruota!",
      animation: true,
      emoji: "💰",
      button: (
        <Button
          onClick={() => {
            status.hide();
            navigate(`/feedback`);
          }}
          className="w-full mt-4 h-12 font-semibold text-base px-6 rounded-lg"
          style={{ backgroundColor: "#131313", color: "#FDFBFE" }}
        >
          Ottieni 1 coin per riprovare
        </Button>
      ),
    },
  };

  const currentStatus = content[type] || {};

  return (
    <motion.div
      key={type}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", damping: 15, stiffness: 100 }}
      className="text-center w-full"
    >
      <DialogHeader className="flex flex-col items-center p-0 w-full">
        {/* Emoji/Header - stile come in Feedback */}
        {currentStatus.animation && (
          <div className="w-24 h-20 flex items-center justify-center mb-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, times: [0, 0.7, 1] }}
              className="text-black text-7xl leading-[3.5rem]"
            >
              {currentStatus.emoji}
            </motion.div>
          </div>
        )}

        {/* Title - stile come in Feedback */}
        <DialogTitle
          className="text-xl font-medium text-center"
          style={{ color: "#19171A" }}
        >
          {currentStatus.title}
        </DialogTitle>

        {/* Message - stile come "Grazie per aver ottenuto" in Feedback */}
        <div className="mt-1 flex items-center justify-center">
          <span
            className="text-base font-light text-center"
            style={{ color: "#19171A" }}
          >
            {currentStatus.message}
          </span>
        </div>
      </DialogHeader>

      {/* Sezione monete per la vittoria - stile come "Hai ricevuto +1" in Feedback */}
      {type === "win" && prize && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="flex items-center justify-center gap-2 mt-4"
        >
          <span className="text-lg font-medium" style={{ color: "#19171A" }}>
            Hai vinto: {prize}
          </span>
        </motion.div>
      )}

      {withButton && (
        <DialogFooter className="flex justify-center mt-6 w-full">
          <div className="w-full flex flex-col items-center gap-3">
            {/* Primary Button */}
            {currentStatus.button}

            {/* Secondary Button per win e lose */}
            {(type === "win" || type === "lose") && (
              <Button
                variant="outline"
                className="w-full h-12 rounded-lg border border-zinc-900 text-zinc-900"
                onClick={() => {
                  status.hide();
                  if (type === "win") {
                    navigate(`/share`);
                  } else {
                    navigate(`/wheel`);
                  }
                }}
              >
                {type === "win" ? "Condividi" : "Gira di nuovo"}
              </Button>
            )}
          </div>
        </DialogFooter>
      )}
    </motion.div>
  );
};

const WheelStatusModal = ({ status, navigate }) => (
  <Dialog open={status.visible} onOpenChange={(open) => !open && status.hide()}>
    <DialogContent
      className="w-[calc(100%-32px)] max-w-[440px] p-6 sm:p-8 rounded-2xl shadow-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ backgroundColor: "#ffffff", color: "#131313" }}
    >
      <AnimatePresence>
        {status.visible && (
          <StatusDisplay status={status} navigate={navigate} />
        )}
      </AnimatePresence>
    </DialogContent>
  </Dialog>
);

const generateSegmentColors = (isWin) => {
  const winColors = ["#ff0054"];

  const loseColors = ["#ffd8e5", "#ffb1ca"];

  return isWin ? winColors : loseColors;
};

function WheelPage() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [coins, setCoins] = useState(0);
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [wheelData, setWheelData] = useState([]);
  const [csrfToken, setCsrfToken] = useState("");
  const [status, setStatus] = useState({
    visible: false,
    type: "",
    message: "",
    withButton: false,
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [isReloadingWheel, setIsReloadingWheel] = useState(false);
  const navigate = useNavigate();

  const activityId = getCookie("placeId");
  // Pointer SVG (triangolo) per react-custom-roulette
  const pointerSrc =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polygon points="12,24 24,0 0,0" fill="%231A1A1A"/></svg>';
  // Larghezza responsive basata su viewport (non dipende dai container)
  const [containerWidth, setContainerWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 384
  );
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 700
  );
  useEffect(() => {
    const update = () => {
      setContainerWidth(window.innerWidth || 384);
      setViewportHeight(window.innerHeight || 700);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Dimensionamento responsivo: mantiene stessa posizione ma con risoluzione maggiore
  const baseWheelSize = 500;
  const MAX_DIAMETER = 600;
  const desiredDiameter = Math.min(
    Math.max(containerWidth * 1.6, 650),
    MAX_DIAMETER
  );
  const scaleFactor = desiredDiameter / baseWheelSize;

  const createRippleEffect = (button, x, y) => {
    const rect = button.getBoundingClientRect();

    const circle = document.createElement("span");
    circle.style.position = "absolute";
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    circle.style.width = "0px";
    circle.style.height = "0px";
    circle.style.borderRadius = "50%";
    circle.style.background =
      "radial-gradient(circle, rgba(50, 50, 50, 0.9) 0%, rgba(30, 30, 30, 0.8) 50%, rgba(0, 0, 0, 0.7) 100%)";
    circle.style.transform = "translate(-50%, -50%)";
    circle.style.pointerEvents = "none";
    circle.style.transition =
      "width 3s cubic-bezier(0.4, 0, 0.2, 1), height 3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out";
    circle.style.boxShadow =
      "0 0 20px rgba(0, 0, 0, 0.6), 0 0 40px rgba(50, 50, 50, 0.5)";
    circle.style.zIndex = "10";

    button.appendChild(circle);

    // Animazione espansione
    requestAnimationFrame(() => {
      const size = Math.max(rect.width, rect.height) * 2.5;
      circle.style.width = `${size}px`;
      circle.style.height = `${size}px`;
    });

    // Rimuovi il cerchio quando rilasci
    const removeCircle = () => {
      circle.style.opacity = "0";
      setTimeout(() => circle.remove(), 500);
      button.removeEventListener("mouseup", removeCircle);
      button.removeEventListener("mouseleave", removeCircle);
      button.removeEventListener("touchend", removeCircle);
      button.removeEventListener("touchcancel", removeCircle);
    };

    button.addEventListener("mouseup", removeCircle);
    button.addEventListener("mouseleave", removeCircle);
    button.addEventListener("touchend", removeCircle);
    button.addEventListener("touchcancel", removeCircle);
  };

  const showStatus = (type, message = "", withButton = false, prize = "") => {
    setStatus({
      visible: true,
      type,
      message,
      withButton,
      prize,
      hide: () => setStatus({ visible: false }),
    });
  };

  const fetchWheelData = async () => {
    if (isReloadingWheel) return;

    setIsReloadingWheel(true);
    try {
      const response = await fetch(
        `/api/wheel-data?placeId=${encodeURIComponent(activityId)}`,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Errore nel caricamento dei dati della ruota.");
      }
      const data = await response.json();
      const transformedData = transformWheelData(data);
      setWheelData(transformedData);
    } catch (error) {
      // Error updating wheel data
    } finally {
      setIsReloadingWheel(false);
    }
  };

  const transformWheelData = (apiData) => {
    const normalized = Array.isArray(apiData) ? [...apiData] : [];

    if (normalized.length === 0) {
      for (let i = 0; i < 12; i++) {
        normalized.push({ option: "RIPROVA", isWin: false });
      }
    }

    return normalized.map((item, index) => {
      const isWin = !!item.isWin;
      const colors = generateSegmentColors(isWin);

      return {
        option: String(item.option || "RIPROVA"),
        isWin: isWin,
        style: {
          backgroundColor: colors[index % colors.length],
          textColor: "#131313",
        },
      };
    });
  };

  // Colori di fallback (grigi) nel caso data sia vuoto
  const getWheelColors = () => {
    if (wheelData.length === 0) {
      return Array(12).fill("#89EBD8");
    }
    return wheelData.map(() => "#89EBD8");
  };

  useEffect(() => {
    fetchWheelData();
  }, [activityId, csrfToken]);

  // Autenticazione: memorizza userId
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      }
      setIsLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId || !activityId || !db) return;

    const coinsQuery = query(
      collection(db, "userActivitiesCoins"),
      where("userId", "==", userId),
      where("activityId", "==", activityId),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      coinsQuery,
      (snapshot) => {
        if (snapshot.empty) {
          setCoins(0);
          setIsLoading(false);
          return;
        }
        const coinsData = snapshot.docs[0].data();
        setCoins(coinsData.coins ?? 0);
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, activityId, db]);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("/api/csrf-token");
        if (!response.ok)
          throw new Error("Impossibile recuperare il token CSRF.");
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        showStatus("error", "Errore di sicurezza. Riprova più tardi.");
      }
    };
    fetchCsrfToken();
  }, []);

  const handleSpinClick = async () => {
    if (mustSpin || coins <= 0 || isLoading || wheelData.length === 0) {
      if (coins <= 0) showStatus("noCoins", "", true);
      return;
    }
    setIsLoading(true);

    try {
      const placeId = activityId;
      const response = await fetch("/api/spin-wheel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ placeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showStatus("error", errorData.error || "Errore durante il giro.");
        return;
      }

      const result = await response.json();

      if (result.success) {
        setSpinResult(result);
        setMustSpin(true);
        setPrizeNumber(result.prizeNumber);
      } else {
        showStatus("error", "Errore durante il giro della ruota.");
      }
    } catch (error) {
      showStatus("error", "Errore di connessione durante il giro.");
    }
    setIsLoading(false);
  };

  const handleSpinComplete = () => {
    setMustSpin(false);

    if (!spinResult) {
      showStatus("error", "Errore nel determinare il risultato.");
      return;
    }

    if (spinResult.isWin) {
      fetchWheelData();
      showStatus("win", "", true, spinResult.prize);
    } else {
      showStatus("lose", "", true, spinResult.prize);
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Caricamento...";
    if (mustSpin) return "Girando...";
    if (coins <= 0) return "Monete insufficienti";
    return "Gira per";
  };

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
      {/* Header di navigazione */}
      <NavigationHeader currentPage="wheel" />

      {/* Contenitore principale flessibile con margini di 24px */}
      <div className="flex flex-col flex-1 items-center justify-start px-6 pt-32 overflow-auto">
        {/* Titolo - 30px e margini */}
        <div className="text-center w-full">
          <h1 className="text-[30px] font-semibold text-black mb-6">
            Vinci fantastici Premi!
          </h1>
        </div>

        {/* Info top e pill coin - allineate ai lati senza spazio al centro */}
        <div className="w-full max-w-md flex items-center justify-between mb-2">
          {/* Colonna sinistra - testo allineato a sinistra */}
          <div className="text-left">
            <p className="text-sm text-black">Ti rimangono per giocare:</p>
            <p className="text-xs text-neutral-500">1 ReviuCoin = 1 Giro</p>
          </div>

          {/* Colonna destra - pill coin senza sfondo, solo bordo */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border"
            style={{ borderColor: "#FF0054", borderWidth: "1px" }}
          >
            <span className="inline-flex items-center gap-1">
              <img src="/coin.svg" alt="coin" className="w-7 h-6" />
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: "#FF0054" }}
            >
              {coins} {coins === 1 ? "coin" : "coins"}
            </span>
          </div>
        </div>

        {/* Wheel fixed overlay - STESSA POSIZIONE MA RISOLUZIONE MAGGIORE */}
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: "75vh",
              transform: "translateY(-50%)",
              width: baseWheelSize,
              height: baseWheelSize,
            }}
          >
            {wheelData.length === 0 ? (
              <div
                className="w-full h-full grid place-items-center"
                style={{
                  backgroundColor: "#F3F4F6",
                  borderRadius: baseWheelSize / 2,
                }}
              >
                <LottieAnimation
                  animationData={coinAnimation}
                  width={80}
                  height={80}
                  loop={true}
                  speed={1.5}
                />
                <p
                  className="mt-4 text-sm font-medium"
                  style={{ color: "#737373" }}
                >
                  Caricamento ruota...
                </p>
              </div>
            ) : (
              <div
                className="relative w-full h-full grid place-items-center"
                style={{
                  userSelect: "none",
                  transform: `scale(${scaleFactor})`,
                  transformOrigin: "center",
                }}
              >
                <CustomWheel
                  segments={wheelData}
                  mustSpin={mustSpin}
                  prizeNumber={prizeNumber}
                  winningSegmentText={spinResult?.prize}
                  onSpinComplete={handleSpinComplete}
                  outerBorderColor="#FFFFFF"
                  outerBorderWidth={4}
                  innerRadius={6}
                  innerBorderColor="#FFFFFF"
                  innerBorderWidth={20}
                  radiusLineColor="#ffffff"
                  radiusLineWidth={4}
                  backgroundColor="#89EBD8"
                  textColor="#131313"
                  fontSize={18}
                  fontWeight="bold"
                  spinDuration={0.8}
                  pointerProps={{
                    src: pointerSrc,
                    style: {
                      width: 26,
                      height: 26,
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      transform: "translate(-50%, -10px)",
                    },
                  }}
                />
                {/* Bottone centrale come overlay cliccabile */}
                <Button
                  className="absolute z-50 overflow-hidden pointer-events-auto"
                  style={{
                    width: "15%",
                    height: "15%",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: 9999,
                    backgroundColor: "#131313",
                    color: "#FDFBFE",
                    fontSize: 22,
                    fontWeight: 600,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                    opacity:
                      mustSpin ||
                      coins <= 0 ||
                      isLoading ||
                      wheelData.length === 0
                        ? 0.6
                        : 1,
                  }}
                  onMouseDown={(e) => {
                    if (
                      mustSpin ||
                      coins <= 0 ||
                      isLoading ||
                      wheelData.length === 0
                    )
                      return;
                    const button = e.currentTarget;
                    const rect = button.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    createRippleEffect(button, x, y);
                  }}
                  onTouchStart={(e) => {
                    if (mustSpin || isLoading || wheelData.length === 0) return;
                    const button = e.currentTarget;
                    const rect = button.getBoundingClientRect();
                    const touch = e.touches[0];
                    const x = touch.clientX - rect.left;
                    const y = touch.clientY - rect.top;
                    createRippleEffect(button, x, y);
                  }}
                  onClick={handleSpinClick}
                  disabled={mustSpin || isLoading || wheelData.length === 0}
                >
                  Gira
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Pulsante per girare la ruota - rimosso (sostituito con pulsante centrale) */}
      </div>

      <WheelStatusModal status={status} navigate={navigate} />
    </div>
  );
}

export default WheelPage;
