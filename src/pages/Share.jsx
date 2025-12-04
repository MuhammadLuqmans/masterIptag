import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCookie, setCookie } from "../utils/cookies";
import { Star, User, ChevronLeft, ChevronRight } from "lucide-react";
import { FaTripadvisor } from "react-icons/fa";
import NavigationHeader from "../components/NavigationHeader";
import { useNavigate } from "react-router-dom";

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? "fill-red-500 text-red-500"
              : "fill-gray-300 text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const truncateText = (text, maxLength = 120) => {
    if (!text) return "Nessun commento";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatName = (fullName) => {
    if (!fullName) return "Anonimo";

    if (fullName.includes(".") && fullName.split(" ").length === 2) {
      return fullName;
    }

    const nameParts = fullName.trim().split(" ");

    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase() + ".";
    } else {
      const firstName = nameParts[0];
      const lastNameInitial = nameParts[nameParts.length - 1]
        .charAt(0)
        .toUpperCase();
      return `${firstName} ${lastNameInitial}.`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="flex-none w-full bg-neutral-100 rounded-2xl p-5 snap-center"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {review.name ? (
            formatName(review.name).charAt(0).toUpperCase()
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-black text-base font-bold truncate">
            {formatName(review.name)}
          </p>
          <StarRating rating={review.stars} />
        </div>
      </div>

      <svg
        width="20"
        height="20"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-3"
      >
        <path
          d="M15 13.125L15 7.5L11.25 7.5C11.25 5.43281 12.9309 3.75 15 3.75L15 1.875C11.8983 1.875 9.375 4.39828 9.375 7.5L9.375 13.125L15 13.125Z"
          fill="#EB4335"
        />
        <path
          d="M5.625 13.125L5.625 7.5L1.875 7.5C1.875 5.43281 3.55594 3.75 5.625 3.75V1.875C2.52328 1.875 0 4.39828 0 7.5L0 13.125L5.625 13.125Z"
          fill="#EB4335"
        />
      </svg>

      <p className="text-sm leading-relaxed">{truncateText(review.text)}</p>
    </motion.div>
  );
};

function Share() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollerRef = useRef(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [businessLogoUrl, setBusinessLogoUrl] = useState("");
  const [businessName, setBusinessName] = useState("");

  const activityId = getCookie("placeId");
  const navigate = useNavigate();
  const defaultReviews = [
    {
      name: "Michele L.",
      text: "The quick brown fox jumps over the lazy dog.",
      stars: 5,
    },
  ];

  const handleShare = () => {
    window.open(
      `https://search.google.com/local/writereview?placeid=${activityId}`,
      "_blank"
    );
  };

  const nextSlide = () => {
    const total = (reviews.length ? reviews : defaultReviews).length;
    setCurrentSlide((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    const total = (reviews.length ? reviews : defaultReviews).length;
    setCurrentSlide((prev) => (prev - 1 + total) % total);
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usa direttamente l'activityId come parametro per l'API
      if (!activityId) {
        throw new Error("Activity ID mancante");
      }

      // Cambia il parametro da placeId a activityId
      const response = await fetch(
        `/api/google-reviews?activityId=${activityId}`
      );
      if (!response.ok)
        throw new Error(`Errore HTTP! Status: ${response.status}`);

      const data = await response.json();
      if (data.reviews && data.reviews.length > 0) {
        const formattedReviews = data.reviews.map((review) => ({
          name: review.authorTitle || review.name || "Anonimo",
          text: review.text || "",
          reviewerPhotoUrl: review.authorPhotoUrl,
          stars: review.rating || 5,
        }));
        setReviews(formattedReviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      setError("Impossibile caricare le recensioni");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const response = await fetch(`/api/get-activity/${activityId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.activity) {
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
              encodeURIComponent(data.activity.logoUrl || ""),
              86400
            );
            setCookie("activityId", activityId, 86400);
          }
        }
      } catch (error) {
        handleFallbackData();
      }
    };

    const handleFallbackData = () => {
      const savedName = getCookie("activityName");
      const savedLogo = getCookie("activityLogo");

      if (savedName) {
        setBusinessName(decodeURIComponent(savedName));
      }

      if (savedLogo) {
        setBusinessLogoUrl(`/logos/${decodeURIComponent(savedLogo)}`);
      }
    };

    const savedName = getCookie("activityName");
    const savedActivityId = getCookie("activityId");
    const savedLogo = getCookie("activityLogo");

    if (savedName && savedActivityId === activityId && savedLogo) {
      setBusinessName(decodeURIComponent(savedName));
      setBusinessLogoUrl(`/logos/${decodeURIComponent(savedLogo)}`);
    } else {
      fetchActivityData();
    }
  }, [activityId]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = scroller.querySelectorAll("[data-card]");
    const target = cards[currentSlide];
    if (target) {
      scroller.scrollTo({
        left: target.offsetLeft - 16,
        behavior: "smooth",
      });
    }
  }, [currentSlide]);

  const items = reviews.length ? reviews : defaultReviews;
  const total = items.length;

  useEffect(() => {
    if (!total) return;
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % total);
    }, 3500);
    return () => clearInterval(id);
  }, [total]);

  useEffect(() => {
    if (!total) return;
    if (currentSlide >= total) setCurrentSlide(0);
  }, [total]);

  const handleNavigate = () => {
    navigate(`/wheel`);
  };

  return (
    <div
      className="flex flex-col h-screen max-w-lg mx-auto bg-white text-black overflow-hidden"
      style={{ padding: "0 24px" }}
    >
      {/* Header di Navigazione più compatto */}
      <div className="flex-none pt-2" style={{ height: "60px" }}>
        <NavigationHeader currentPage="share" />
      </div>

      {/* Contenuto Principale - Centrato verticalmente con la stessa struttura di Feedback */}
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

          {/* Titoli e Sottotitoli - Stesso stile di Feedback */}
          <h1
            className="w-full text-left font-semibold leading-normal mb-0"
            style={{
              fontSize: "26px",
              color: "#19171A",
              lineHeight: "1.4",
            }}
          >
            Vuoi aiutare ancora di più <br />
            {businessName}?
          </h1>
          <h2
            className="w-full text-left font-semibold leading-normal mt-0 mb-[20px]"
            style={{
              fontSize: "20px",
              color: "#737373",
              lineHeight: "1.4",
            }}
          >
            Condividi la tua esperienza su Google!
          </h2>

          {/* Review Carousel */}
          <div className="relative mb-8 w-full">
            <style>{`
              #reviews-scroller::-webkit-scrollbar { display: none; }
              #reviews-scroller { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-full h-36 bg-neutral-100 rounded-2xl flex items-center justify-center">
                  <p className="text-gray-500">
                    Caricamento recensioni in corso...
                  </p>
                </div>
              </div>
            ) : (
              <div
                id="reviews-scroller"
                ref={scrollerRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory"
                style={{ scrollBehavior: "smooth" }}
              >
                {items.map((review, index) => (
                  <div
                    key={index}
                    className="snap-start w-full flex-shrink-0"
                    data-card
                  >
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
            )}

            {!loading && (error || reviews.length === 0) && (
              <p className="text-center text-gray-400 text-xs mt-2"></p>
            )}
          </div>
        </div>
      </div>

      {/* Footer con Bottoni - Stessa struttura di Feedback */}
      <div className="flex-none pb-10 bg-white">
        <div className="flex w-full flex-col">
          <button
            onClick={handleShare}
            className="w-full h-[50px] bg-zinc-900 rounded-xl flex items-center justify-center gap-2 active:bg-zinc-800 transition-colors"
            style={{
              padding: "20px 24px",
              fontSize: "16px",
              fontWeight: "500",
              fontFamily: "Inter, sans-serif",
              lineHeight: "1.4",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-5 h-5"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.84-6.84C35.7 2.77 30.24 0 24 0 14.64 0 6.54 5.4 2.46 13.26l7.98 6.2C12.08 13.62 17.6 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.1 24.5c0-1.62-.15-3.18-.42-4.68H24v9.04h12.4c-.54 2.8-2.12 5.18-4.52 6.8l7.02 5.44C43.9 36.34 46.1 30.84 46.1 24.5z"
              />
              <path
                fill="#FBBC05"
                d="M10.44 28.46a14.48 14.48 0 0 1-.76-4.46c0-1.54.26-3.04.76-4.46l-7.98-6.2A23.93 23.93 0 0 0 0 24c0 3.82.92 7.44 2.46 10.66l7.98-6.2z"
              />
              <path
                fill="#4285F4"
                d="M24 48c6.24 0 11.48-2.06 15.3-5.62l-7.02-5.44c-2.06 1.38-4.7 2.18-8.28 2.18-6.4 0-11.92-4.12-13.56-9.72l-7.98 6.2C6.54 42.6 14.64 48 24 48z"
              />
            </svg>
            <span className="text-white text-sm font-medium">
              Condividi su Google
            </span>
          </button>

          {/* Linea piccola centrale (come Feedback) */}
          <div className="w-full flex justify-center my-2">
            <div
              className="bg-gray-300 rounded-full"
              style={{ width: 40, height: 3 }}
            />
          </div>

          <button
            type="button"
            className="w-full h-[50px] bg-white border border-black rounded-xl flex items-center justify-center gap-2 active:bg-gray-50 transition-colors"
            onClick={handleNavigate}
            style={{
              padding: "20px 24px",
              fontSize: "16px",
              fontWeight: "500",
              fontFamily: "Inter, sans-serif",
              lineHeight: "1.4",
            }}
          >
            <span className="inline-flex items-center gap-1">
              <img src="/coin.svg" alt="coin" className="w-7 h-7" />
            </span>
            <span className="text-sm font-medium text-black">
              Usa subito il tuo ReviuCoin
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Share;
