// src/Login.js
import React, { useState, useEffect } from "react";
import { auth, provider, signInWithPopup } from "../firebase";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { setCookie } from "../utils/cookies";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/Login.css";
import "../styles/App.css";

function Login() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);
  const [sessionValid, setSessionValid] = useState(false);
  const [returnPath, setReturnPath] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { activityId } = useParams();

  // Store placeId from URL parameter and redirect to clean URL
  useEffect(() => {
    if (activityId) {
      // Store placeId in cookie when user arrives at login page
      setCookie("placeId", activityId);
      
      // Redirect to clean /login URL without placeId visible
      navigate("/login", { replace: true });
    }

    // Check if user came from Terms or Privacy page
    if (location.state?.returnPath) {
      setReturnPath(location.state.returnPath);
    }
  }, [activityId, location.state, navigate]);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch("/api/csrf-token");
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (err) {
        setLoginError(true);
      }
    };

    fetchCsrfToken();

    if (loginError) {
      const timer = setTimeout(() => setLoginError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  // Piccolo helper che verifica lato server la validità della sessione
  const waitForValidSession = async (maxTries = 5, delayMs = 300) => {
    for (let i = 0; i < maxTries; i++) {
      try {
        const res = await fetch("/api/session");
        if (res.status === 200) {
          const data = await res.json();
          if (data?.valid) {
            setSessionValid(true);
            return true;
          }
        }
      } catch (_) {}
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return false;
  };

  // If already authenticated, validate placeId and redirect
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && sessionValid) {
        // Get placeId from cookie or URL parameter
        const placeId = activityId || getCookie("placeId");

        if (placeId) {
          // Validate placeId exists in database
          try {
            const response = await fetch(`/api/validate-place/${placeId}`);
            if (response.ok) {
              // PlaceId is valid, redirect to feedback page
              navigate(`/feedback`, { replace: true });
            } else {
              // PlaceId doesn't exist, redirect to fallback page
              navigate("/invalid-business", { replace: true });
            }
          } catch (error) {
            navigate("/invalid-business", { replace: true });
          }
        } else {
          // No placeId, redirect to fallback
          navigate("/invalid-business", { replace: true });
        }
      }
    });
    return () => unsub();
  }, [sessionValid, activityId, navigate]);

  // Helper to get cookie value
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const handleLogin = async () => {
    if (isLoggingIn || !csrfToken) return;

    setIsLoggingIn(true);
    setLoginError(false);

    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      /**
       * TOR: Gestisco il login anche lato server per maggiore sicurezza.
       */
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ idToken: token }),
      });

      if (!res.ok) throw new Error("Login API failed");

      // Attendi che il cookie di sessione sia riconosciuto dal server
      const ok = await waitForValidSession();
      if (!ok) {
        throw new Error("Sessione non ancora valida lato server");
      }

      // After successful login, validate placeId and redirect
      const placeId = activityId || getCookie("placeId");

      if (placeId) {
        // Validate placeId exists in database
        try {
          const response = await fetch(`/api/validate-place/${placeId}`);
          if (response.ok) {
            // PlaceId is valid, redirect to feedback page
            navigate(`/feedback`);
          } else {
            // PlaceId doesn't exist, redirect to fallback page
            navigate("/invalid-business");
          }
        } catch (error) {
          navigate("/invalid-business");
        }
      } else {
        // No placeId, redirect to fallback
        navigate("/invalid-business");
      }
    } catch (err) {
      setLoginError(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const renderSet = (count = 6) =>
    [...Array(count)].map((_, i) => <div key={i} className="rectangle" />);

  const Row = ({ className }) => (
    <div className={`row ${className}`}>
      {renderSet(6)}
      {renderSet(6)}
    </div>
  );

  return (
    <div className="app-container">
      <div className="top-container">
        <div className="animated-rows">
          <Row className="row-1" />
          <Row className="row-2" />
          <Row className="row-3" />
          <Row className="row-4" />
        </div>
      </div>

      <div className="logo-overlay">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="180"
          height="180"
          viewBox="0 0 11000 11000"
          fill="none"
          style={{ transform: "rotate(-12deg)" }}
        >
          <path
            fill="#FF0054"
            d="M10193 3972c13,22 19,42 18,62 -1,19 -3,41 -6,65 -19,99 -46,197 -82,295 -14,45 -41,77 -81,96 -39,18 -81,22 -124,11 -43,-9 -74,-34 -96,-77 -21,-43 -25,-86 -11,-129 36,-98 63,-196 82,-294 10,-47 37,-80 81,-98 45,-18 86,-21 124,-9 19,3 37,13 55,28 17,16 31,33 40,50zm-7594 790c-39,-79 -92,-163 -117,-234 -8,-22 -3,-45 14,-62 69,-71 209,-233 165,-301 -94,-68 -257,-2 -383,27 -27,6 -54,-4 -71,-26 -35,-46 -95,-119 -150,-179 -80,-86 -137,-86 -160,50 -4,26 -8,52 -12,79 -41,271 19,190 -233,322 -119,63 -270,135 -42,196 56,15 120,25 170,33 29,5 50,29 51,58 1,69 2,157 10,234 27,277 104,143 209,3 42,-56 81,-111 118,-162 15,-20 38,-28 61,-23 74,15 167,67 251,105 173,76 202,50 119,-120zm4468 1591c77,-96 218,-112 315,-35 96,77 112,218 35,315 -240,300 -545,544 -894,713 -338,162 -715,253 -1111,253 -388,0 -756,-87 -1088,-242 -343,-161 -644,-395 -884,-683 -79,-95 -66,-236 29,-316 95,-79 236,-66 315,29 198,238 447,431 730,564 271,127 576,198 898,198 330,0 641,-75 917,-208 288,-139 540,-341 738,-588zm870 -179c-103,-94 -178,-202 -224,-322 -45,-120 -72,-246 -79,-377 -7,-131 0,-265 23,-402 22,-137 49,-270 81,-399 24,-87 47,-174 71,-262 23,-87 50,-173 81,-259 22,-70 60,-124 112,-161 53,-37 117,-49 192,-35 30,4 60,16 88,37 28,20 52,45 72,73 19,29 32,60 39,94 8,34 7,68 -3,100 -20,61 -45,141 -75,240 -29,99 -59,202 -88,310 -29,108 -53,213 -71,316 -18,102 -25,188 -21,257 0,49 5,98 16,149 11,51 28,99 52,146 24,46 56,86 94,120 39,34 87,56 142,68 65,14 123,12 174,-6 51,-18 97,-47 137,-85 40,-39 75,-87 105,-143 30,-57 56,-118 77,-184 51,-159 84,-324 99,-495 15,-171 17,-347 7,-526 -2,-70 20,-131 66,-182 46,-51 105,-80 178,-89 69,-7 130,14 184,65 53,50 81,109 84,178 6,108 6,214 2,320 -4,106 -12,212 -23,319 -8,85 -19,171 -31,257 -12,86 -31,168 -55,248 -21,75 -47,149 -77,222 -30,72 -66,141 -109,207 -44,66 -93,126 -148,180 -55,53 -118,98 -189,134 -79,41 -162,70 -249,88 -88,18 -175,22 -261,12 -86,-10 -170,-33 -251,-67 -81,-34 -155,-83 -222,-146zm-552 -854c-8,61 -35,109 -80,144 -45,35 -97,51 -157,49 -30,-2 -57,-10 -82,-25 -24,-14 -45,-33 -64,-56 -18,-23 -32,-49 -39,-77 -8,-28 -11,-55 -8,-83 26,-175 52,-350 78,-525 26,-174 51,-350 75,-527 9,-61 36,-109 81,-145 44,-35 97,-50 156,-45 28,1 55,9 80,24 26,14 47,33 65,55 17,22 30,47 38,75 8,28 10,55 7,83 -25,177 -50,353 -75,528 -24,174 -49,349 -75,525zm-3 -1487c-59,-7 -106,-34 -141,-81 -35,-47 -51,-99 -49,-157 4,-29 13,-57 27,-82 15,-26 34,-47 55,-63 22,-17 47,-30 74,-39 27,-9 54,-12 82,-9 61,7 109,34 144,81 35,47 50,100 45,160 -1,30 -9,57 -24,81 -14,25 -33,45 -54,62 -22,16 -47,29 -75,38 -28,9 -56,12 -84,9zm-473 634c-97,248 -199,492 -304,731 -106,240 -227,474 -364,702 -94,157 -163,325 -406,352 -270,30 -405,-192 -501,-375 -58,-117 -113,-239 -165,-368 -52,-128 -101,-259 -147,-392 -46,-134 -89,-267 -128,-402 -39,-134 -76,-265 -110,-394 -18,-69 -9,-133 27,-193 36,-60 87,-99 154,-118 33,-11 67,-15 101,-9 35,5 66,16 94,32 29,17 54,40 76,67 22,28 37,57 44,88 29,114 62,228 96,344 34,115 70,227 107,337 37,109 74,214 110,316 37,101 73,194 108,280 23,55 41,95 54,121 13,26 25,39 39,38 13,-1 28,-16 44,-46 17,-29 40,-72 69,-129 92,-174 180,-353 265,-534 85,-182 166,-379 244,-592 25,-68 66,-119 123,-153 57,-34 122,-41 196,-21 30,7 59,22 86,43 27,22 50,48 67,79 17,31 28,64 33,98 4,35 0,67 -12,98zm-4749 1724l87 320c8,34 9,68 2,102 -7,33 -19,63 -37,91 -18,27 -41,51 -69,71 -28,20 -58,35 -90,45 -70,21 -135,11 -193,-31 -59,-42 -98,-95 -118,-158l-520 -1901 -90 -330c-50,-184 -36,-330 139,-464 93,-71 199,-138 317,-202 119,-63 243,-113 371,-148 128,-35 257,-51 387,-48 130,3 254,35 373,94 92,47 168,114 231,202 62,87 99,183 112,287 15,116 12,230 -8,344 -21,113 -55,224 -103,331 -47,108 -105,213 -173,315 -69,103 -142,200 -220,292 106,38 214,71 323,100 110,29 220,51 330,66 72,13 131,41 177,84 47,44 71,105 73,182 0,32 -7,64 -22,95 -14,32 -33,60 -58,85 -24,26 -53,45 -85,59 -32,13 -66,17 -101,11 -178,-29 -354,-68 -531,-119 -176,-51 -345,-108 -507,-172l-82 70 85 327zm1521 -1267c-3,-207 91,-360 274,-394 186,-36 327,76 390,268l-664 126zm1061 571c26,-35 44,-83 33,-141 -19,-99 -106,-161 -204,-142 -47,9 -73,26 -101,55 -77,84 -171,141 -293,164 -197,37 -356,-41 -438,-233l873 -165c116,-22 190,-123 166,-251 -61,-322 -371,-704 -890,-606 -452,85 -699,511 -615,954l1 6c90,476 497,738 964,650 226,-43 389,-149 504,-291z"
          />
        </svg>
      </div>

      <div className="bottom-container">
        <div className="login-section">
          <h2 className="text-dark">
            La tua opinione, il loro progresso,{" "}
            <span className="text-grey" style={{ color: "#FF0054" }}>
              la tua ricompensa.
            </span>
          </h2>

          <button
            className="google-login-btn"
            onClick={handleLogin}
            disabled={isLoggingIn || !csrfToken}
            style={
              loginError
                ? {
                    backgroundColor: "#ffebee",
                    color: "#c62828",
                    border: "1px solid #c62828",
                  }
                : {}
            }
            aria-label="Continua con Google"
          >
            <img
              src="https://www.svgrepo.com/show/303108/google-icon-logo.svg"
              alt="Google logo"
              className="google-logo"
            />
            {isLoggingIn
              ? "Accesso in corso..."
              : loginError
              ? "Errore nel login. Riprova!"
              : !csrfToken
              ? "Preparazione..."
              : "Continua con Google"}
          </button>

          <p className="legal-text">
            Facendo clic su continua, accetti i nostri{" "}
            <a
              href="/terms"
              className="legal-link"
              onClick={(e) => {
                e.preventDefault();
                navigate("/terms", { state: { placeId: activityId } });
              }}
            >
              Termini di servizio
            </a>{" "}
            e la nostra{" "}
            <a
              href="/privacy"
              className="legal-link"
              onClick={(e) => {
                e.preventDefault();
                navigate("/privacy", { state: { placeId: activityId } });
              }}
            >
              Informativa sulla privacy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
