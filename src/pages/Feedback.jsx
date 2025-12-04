// src/Feedback.js
import React, { useState, useEffect, useCallback } from "react";
import { auth, db } from "../firebase";
import { getCookie, setCookie } from "../utils/cookies";
import { onAuthStateChanged } from "firebase/auth";
import {
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import NavigationHeader from "../components/NavigationHeader.jsx";

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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { color } from "framer-motion";

// Componente: Visualizzazione dello stato (Modal Content)
const StatusDisplay = ({ status, navigateToWheel, setStatus }) => {
  const { type, message } = status;
  const navigate = useNavigate();

  const isLoading = type === "loading";
  const isSuccess = type === "success";
  const isError = type === "error";

  return (
    <div
      className="flex flex-col items-center justify-center w-full"
      key={type}
    >
      <DialogHeader className="flex flex-col items-center p-0 w-full">
        {/* Emoji/Header */}
        {!isLoading && (
          <div className="w-24 h-20 flex items-center justify-center mb-1">
            <div className="text-black text-7xl leading-[3.5rem]">
              {isSuccess ? "🎉" : "⚠️"}
            </div>
          </div>
        )}

        {/* Title */}
        <DialogTitle className="text-xl font-medium text-zinc-900 text-center">
          {isLoading
            ? "Invio in corso…"
            : isSuccess
            ? "Grazie per il tuo Feedback"
            : "Qualcosa è andato storto…"}
        </DialogTitle>

        {/* Sub message / coin row */}
        {!isLoading && (
          <div className="mt-1 flex items-center justify-center gap-2">
            {isSuccess ? (
              <>
                <span className="text-base font-light text-zinc-900">
                  Hai ottenuto
                </span>
                <span className="inline-flex items-center gap-1">
                  <img src="/coin.svg" alt="coin" className="w-6 h-6" />
                  <span className="text-zinc-900 text-base font-medium">
                    +1
                  </span>
                </span>
              </>
            ) : (
              <span className="text-base font-light text-zinc-900 text-center">
                {message || "Riprova tra qualche minuto"}
              </span>
            )}
          </div>
        )}
      </DialogHeader>

      {/* Loader */}
      {isLoading && (
        <div className="mt-6 mb-4 w-full">
          <Progress value={status.progress} className="w-full h-2" />
        </div>
      )}

      {/* Buttons */}
      {!isLoading && (
        <div className="w-full flex flex-col items-center gap-3 mt-6">
          {" "}
          {/* Aumentato mt-3 a mt-6 */}
          {/* Primary */}
          <Button
            className="w-72 h-12 bg-zinc-900 text-white rounded-lg"
            onClick={() => {
              if (isSuccess) {
                navigate(`/share`);
              } else {
                setStatus({ visible: false });
              }
            }}
          >
            {isSuccess ? "Vai alle Recensioni" : "Riprova"}
          </Button>
          {/* Outline */}
          <Button
            variant="outline"
            className="w-72 h-12 rounded-lg border border-zinc-900 text-zinc-900"
            onClick={() => {
              if (isSuccess) {
                navigateToWheel();
              } else {
                navigate(`/feedback`);
              }
            }}
          >
            {isSuccess ? "Gira la ruota" : "Torna indietro"}
          </Button>
        </div>
      )}
    </div>
  );
};

// Componente: Modal per lo stato di Feedback
const FeedbackStatusModal = ({ status, setStatus, navigateToWheel }) => (
  <Dialog
    open={status.visible}
    onOpenChange={(open) => !open && setStatus({ visible: false })}
  >
    <DialogContent
      className="w-[calc(100%-32px)] max-w-[440px] p-6 sm:p-8 rounded-2xl shadow-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" // Cambiato da bottom-4 a top-1/2 con transform
      style={{ backgroundColor: "#ffffff", color: "#131313" }}
    >
      <StatusDisplay
        status={status}
        navigateToWheel={navigateToWheel}
        setStatus={setStatus}
      />
    </DialogContent>
  </Dialog>
);

// Componente Emoji con animazione a onda
const AnimatedEmoji = ({
  emoji,
  isSelected,
  onClick,
  disabled,
  isAnimating,
}) => {
  return (
    <button
      type="button"
      className={`flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-[1.05]
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
      `}
      style={{
        width: "clamp(50px, 14vw, 60px)",
        height: "clamp(50px, 14vw, 60px)",
        border:
          isAnimating || isSelected
            ? `3px solid ${emoji.color}`
            : "3px solid transparent",
        borderRadius: "50%",
        transform: isAnimating
          ? "translateY(-10px) scale(1.1)"
          : isSelected
          ? "scale(1.1)"
          : "scale(1)",
        filter: isAnimating || isSelected ? "none" : "grayscale(100%)",
        transition: "all 0.3s ease-in-out",
      }}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Valutazione ${emoji.value} stelle: ${emoji.label}`}
    >
      <span
        className="flex items-center justify-center leading-none transition-all duration-300"
        style={{
          fontSize: "clamp(35px, 10vw, 42px)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {emoji.icon}
      </span>
    </button>
  );
};

function Feedback() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastFeedbackDate, setLastFeedbackDate] = useState(null);
  const [feedbackCountThisMonth, setFeedbackCountThisMonth] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [canSubmitFeedbackState, setCanSubmitFeedbackState] = useState(true);
  const [status, setStatus] = useState({
    visible: false,
    type: "",
    message: "",
    withButton: false,
    progress: 0,
  });
  const [sendAnonymously, setSendAnonymously] = useState(false);
  const [businessLogoUrl, setBusinessLogoUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [activityData, setActivityData] = useState(null);
  const [animatingEmojiIndex, setAnimatingEmojiIndex] = useState(-1);

  const navigate = useNavigate();

  const activityId = getCookie("placeId");

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const response = await fetch(
          `/api/get-activity/${activityId}?t=${Date.now()}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.activity) {
            setActivityData(data.activity);
            setBusinessName(data.activity.name);

            const logoUrl = data.activity.logoUrl
              ? `/logos/${data.activity.logoUrl}`
              : "/logos/default.png";
            setBusinessLogoUrl(logoUrl);

            setCookie(
              "activityName",
              encodeURIComponent(data.activity.name),
              86400
            );
            setCookie(
              "activityLogo",
              encodeURIComponent(data.activity.logoUrl),
              86400
            );
            setCookie("placeId", activityId);
          }
        } else {
          navigate("/invalid-business", { replace: true });
        }
      } catch (error) {
        const savedName = getCookie("activityName");
        if (savedName) {
          setBusinessName(decodeURIComponent(savedName));
        } else {
          setBusinessName(
            import.meta.env.VITE_APP_BUSINESS_NAME || "Nome Attività"
          );
        }
      }
    };

    const savedName = getCookie("activityName");
    const savedPlaceId = getCookie("placeId");
    const savedLogo = getCookie("activityLogo");

    if (savedName && savedPlaceId === activityId) {
      setBusinessName(decodeURIComponent(savedName));
      if (savedLogo) {
        setBusinessLogoUrl(`/logos/${decodeURIComponent(savedLogo)}`);
      } else {
        setBusinessLogoUrl("/logos/default.png");
      }
    } else {
      fetchActivityData();
    }
  }, [activityId, navigate]);

  useEffect(() => {
    let unsubscribeUserDoc = null;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const nameFromEmail = user.email.split("@")[0];
        setUserName(nameFromEmail);
        setUserId(user.uid);

        try {
          const userDocRef = doc(db, "users", user.uid);
          unsubscribeUserDoc = onSnapshot(userDocRef, (docSnapshot) => {
            // Just ensure user document exists
          });

          // Fetch per-activity feedback status from server
          const fetchFeedbackStatus = async () => {
            try {
              const response = await fetch(
                `/api/feedback-status/${activityId}`,
                {
                  credentials: "include",
                }
              );
              if (response.ok) {
                const data = await response.json();
                setFeedbackCountThisMonth(data.feedbackCount);
                setLastFeedbackDate(
                  data.lastFeedbackDate ? new Date(data.lastFeedbackDate) : null
                );
                setCanSubmitFeedbackState(data.canSubmit);
              }
            } catch (error) {
              // Error fetching feedback status
            }
          };

          await fetchFeedbackStatus();

          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              email: user.email,
              displayName: user.displayName || user.email.split("@")[0],
              createdAt: serverTimestamp(),
            });
          }

          setUserDataLoaded(true);

          startWaveAnimation();
        } catch (error) {
          setStatus({
            visible: true,
            type: "error",
            message:
              "Non siamo riusciti a caricare i tuoi dati. Controlla la tua connessione e riprova.",
          });
          setUserDataLoaded(true);
        }
      } else {
        try {
          if (typeof unsubscribeUserDoc === "function") unsubscribeUserDoc();
        } catch (_) {}
        setUserDataLoaded(false);
        navigate("/invalid-business", { replace: true });
      }
    });

    return () => {
      unsubscribe();
      if (typeof unsubscribeUserDoc === "function") {
        unsubscribeUserDoc();
      }
    };
  }, [activityId]);

  // Funzione per avviare l'animazione a onda
  const startWaveAnimation = useCallback(() => {
    let currentIndex = 0;
    const totalEmojis = 5;

    const animateNext = () => {
      if (currentIndex < totalEmojis) {
        setAnimatingEmojiIndex(currentIndex);
        currentIndex++;
        setTimeout(animateNext, 300); // 300ms tra un'emoji e l'altra
      } else {
        // Fine animazione, reset dopo un breve delay
        setTimeout(() => {
          setAnimatingEmojiIndex(-1);
        }, 200);
      }
    };

    // Inizia l'animazione dopo un breve delay
    setTimeout(animateNext, 500);
  }, []);

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch("/api/csrf-token");
      if (!response.ok)
        throw new Error("Impossibile recuperare il token CSRF.");
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    } catch (error) {
      setStatus({
        visible: true,
        type: "error",
        message:
          "Errore di sicurezza: non riusciamo a proteggere l'invio. Riprova più tardi.",
      });
    }
  };

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  const canSubmitFeedback = useCallback(() => {
    return canSubmitFeedbackState;
  }, [canSubmitFeedbackState]);

  useEffect(() => {
    let interval;

    if (lastFeedbackDate && !canSubmitFeedback()) {
      const calculateTimeRemaining = () => {
        const now = new Date();
        const lastDate = new Date(lastFeedbackDate);
        const nextAvailableDate = new Date(lastDate);
        nextAvailableDate.setDate(lastDate.getDate() + 7);

        const difference = nextAvailableDate - now;

        if (difference <= 0) {
          setTimeRemaining(null);
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      };

      calculateTimeRemaining();
      interval = setInterval(calculateTimeRemaining, 1000);
    } else {
      setTimeRemaining(null);
    }

    return () => clearInterval(interval);
  }, [lastFeedbackDate, canSubmitFeedback]);

  // Emoji statiche
  const emojis = [
    { value: 1, label: "Molto insoddisfatto", icon: "😡", color: "#e53935" },
    { value: 2, label: "Insoddisfatto", icon: "😢", color: "#1e88e5" },
    { value: 3, label: "Neutro", icon: "😐", color: "#757575" },
    { value: 4, label: "Soddisfatto", icon: "😊", color: "#43a047" },
    { value: 5, label: "Molto soddisfatto", icon: "😍", color: "#e91e63" },
  ];

  const isSubmitDisabled = useCallback(() => {
    if (!userDataLoaded || !canSubmitFeedback() || isSubmitting) return true;
    if (rating === 0) return true;
    if (rating <= 3 && comment.trim() === "") return true;
    return false;
  }, [userDataLoaded, canSubmitFeedback, isSubmitting, rating, comment]);

  const getPlaceholder = () => {
    if (rating > 0 && rating <= 3)
      return "Ci dispiace! Cosa possiamo migliorare? (obbligatorio)";
    if (rating >= 4) return "Vuoi raccontarci cosa ti è piaciuto? (opzionale)";
    return "Vuoi lasciare due righe per aiutarci a migliorare?";
  };

  const formatTimeRemaining = () => {
    if (!timeRemaining) return "";

    const { days, hours, minutes, seconds } = timeRemaining;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    if (days > 0) return `${days}g ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${formattedSeconds}s`;
    return `${minutes}m ${formattedSeconds}s`;
  };

  const getButtonText = () => {
    if (!userDataLoaded) return "Caricamento...";
    if (feedbackCountThisMonth >= 4) return "Limite mensile raggiunto (4/4)";
    if (!canSubmitFeedback() && timeRemaining)
      return `Attendi ${formatTimeRemaining()}`;
    if (isSubmitting) return "Invio...";
    return "Invia Feedback";
  };

  const handleSubmit = async (anonymous = false) => {
    if (isSubmitDisabled()) return;
    setIsSubmitting(true);
    setStatus({ visible: true, type: "loading", message: "", progress: 0 });

    try {
      // Simulazione progresso
      for (let i = 1; i <= 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setStatus((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }

      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          activityId,
          rating,
          comment: comment.trim(),
          sendAnonymously: anonymous,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            "Si è verificato un errore inaspettato durante l'invio."
        );
      }

      setStatus((prev) => ({ ...prev, progress: 100 }));
      await new Promise((resolve) => setTimeout(resolve, 300));

      setStatus({
        visible: true,
        type: "success",
        message: "Il tuo feedback è stato inviato!",
        withButton: true,
        progress: 100,
      });
      setRating(0);
      setComment("");
    } catch (error) {
      setStatus({
        visible: true,
        type: "error",
        message: `Ci dispiace, ma non siamo riusciti a inviare il tuo feedback. Riprova più tardi!`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex flex-col h-screen max-w-lg mx-auto bg-white text-black overflow-hidden"
      style={{ padding: "0 24px" }}
    >
      {/* Header di Navigazione più compatto */}
      <div className="flex-none pt-2" style={{ height: "60px" }}>
        <NavigationHeader currentPage="feedback" />
      </div>

      {/* Contenuto Principale - Centrato verticalmente con margini */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-full flex flex-col items-start pt-6 relative">
          {/* Logo trasparente dietro i testi */}
          {businessLogoUrl && (
            <img
              src={businessLogoUrl}
              alt="Logo attività"
              className="pointer-events-none select-none absolute top-6 right-0 opacity-15"
              style={{ width: 140, height: 140, objectFit: "contain" }}
            />
          )}

          {/* Titoli e Sottotitoli */}
          <h1
            className="w-full text-left font-semibold leading-normal mb-0"
            style={{
              fontSize: "26px",
              color: "#19171A",
              lineHeight: "1.4",
            }}
          >
            Ciao {userName}!
          </h1>
          <h2
            className="w-full text-left font-semibold leading-normal mt-0 mb-[6px]"
            style={{
              fontSize: "26px",
              color: "#737373",
              lineHeight: "1.4",
            }}
          >
            Come è stata la tua esperienza da{" "}
            <span style={{ color: "#737373" }}>{businessName + "?"}</span>
          </h2>
          <p
            className="w-full text-left font-light leading-normal mt-0 mb-8"
            style={{
              fontSize: "16px",
              color: "#737373",
              lineHeight: "1.4",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Unisciti a chi ha già condiviso la sua esperienza, la tua opinione
            conta molto!
          </p>

          {/* Emoji Rating - Versione migliorata con animazione a onda */}
          <div className="flex justify-between w-full">
            {emojis.map((emoji, index) => (
              <AnimatedEmoji
                key={emoji.value}
                emoji={emoji}
                isSelected={rating === emoji.value}
                onClick={() => {
                  if (canSubmitFeedback()) {
                    setRating(emoji.value);
                  }
                }}
                disabled={!canSubmitFeedback()}
                isAnimating={animatingEmojiIndex === index}
              />
            ))}
          </div>
          {/* Textarea per il commento */}
          <div className="w-full rounded-lg background-color mt-8">
            <Textarea
              className="w-full min-h-[100px] border-none bg-grey p-4 text-left resize-y outline-none"
              style={{
                fontSize: "15px",
                fontWeight: "300",
                fontFamily: "Inter, sans-serif",
                lineHeight: "1.4",
                backgroundColor: "#EDEDED",
              }}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={!canSubmitFeedback()}
              aria-label="Commento feedback"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Footer con Bottone di Invio - Con margini e altezza fissa */}
      <div className="flex-none pb-10 bg-white">
        <div className="flex w-full flex-col">
          <Button
            className="w-full rounded-lg font-medium transition-colors duration-200"
            style={{
              height: "50px",
              padding: "20px 24px",
              fontSize: isSubmitDisabled() ? "14px" : "16px",
              backgroundColor: isSubmitDisabled() ? "#e0e0e0" : "#131313",
              color: isSubmitDisabled() ? "#aaa" : "#FDFBFE",
              cursor: isSubmitDisabled() ? "not-allowed" : "pointer",
              lineHeight: "1.4",
              fontFamily: "Inter, sans-serif",
            }}
            onClick={() => handleSubmit(false)}
            disabled={isSubmitDisabled()}
            aria-label={getButtonText()}
          >
            {getButtonText()}
          </Button>

          {/* Linea piccola centrale */}
          <div className="w-full flex justify-center my-2">
            <div
              className="bg-gray-300 rounded-full"
              style={{ width: 40, height: 3 }}
            />
          </div>

          {/* Bottone Invia Anonimamente */}
          <Button
            type="button"
            className="w-full flex items-center justify-center gap-2"
            style={{
              height: "50px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              color: isSubmitDisabled() ? "#aaa" : "#19171A",
              cursor: isSubmitDisabled() ? "not-allowed" : "pointer",
            }}
            onClick={() => handleSubmit(true)}
            disabled={isSubmitDisabled()}
          >
            <span className="inline-flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                focusable="false"
              >
                <title>incognito</title>
                <path
                  fill="currentColor"
                  d="M17.06 13C15.2 13 13.64 14.33 13.24 16.1C12.29 15.69 11.42 15.8 10.76 16.09C10.35 14.31 8.79 13 6.94 13C4.77 13 3 14.79 3 17C3 19.21 4.77 21 6.94 21C9 21 10.68 19.38 10.84 17.32C11.18 17.08 12.07 16.63 13.16 17.34C13.34 19.39 15 21 17.06 21C19.23 21 21 19.21 21 17C21 14.79 19.23 13 17.06 13M6.94 19.86C5.38 19.86 4.13 18.58 4.13 17S5.39 14.14 6.94 14.14C8.5 14.14 9.75 15.42 9.75 17S8.5 19.86 6.94 19.86M17.06 19.86C15.5 19.86 14.25 18.58 14.25 17S15.5 14.14 17.06 14.14C18.62 14.14 19.88 15.42 19.88 17S18.61 19.86 17.06 19.86M22 10.5H2V12H22V10.5M15.53 2.63C15.31 2.14 14.75 1.88 14.22 2.05L12 2.79L9.77 2.05L9.72 2.04C9.19 1.89 8.63 2.17 8.43 2.68L6 9H18L15.56 2.68L15.53 2.63Z"
                />
              </svg>
              <span>Invia Feedback in incognito</span>
            </span>
          </Button>
        </div>
      </div>

      {/* Modal di Stato */}
      <FeedbackStatusModal
        status={status}
        setStatus={setStatus}
        navigateToWheel={() => {
          setStatus({ visible: false });
          navigate(`/wheel`);
        }}
      />
    </div>
  );
}

export default Feedback;
