import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import LottieAnimation from "@/components/LottieAnimation";
import qrCodeAnimation from "@/assets/lottie_emojis/qr_code.json";
import nfcAnimation from "@/assets/lottie_emojis/nfc.json";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { clearAllCookies } from "../utils/cookies";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex justify-center mb-4">
            {" "}
            {/* Aggiunto mb-4 per spazio */}
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.5041 46.1737L25.4107 10.0126C27.2552 6.66245 32.7448 6.66245 34.5893 10.0126L54.496 46.1737C56.1108 49.107 53.6495 52.5 49.9067 52.5H10.0933C6.35055 52.5 3.88927 49.107 5.5041 46.1737Z"
                stroke="#FF0054"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M30 22.5V32.5"
                stroke="#FF0054"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M30 42.5488V42.5"
                stroke="#FF0054"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-inter font-semibold">
            Accesso non valido
          </h1>
        </div>
        <div className="mt-6">
          <p className="text-muted-foreground text-gray-500 font-inter text-md">
            Per poter lasciare una recensione devi recarti nel locale e
            inquadrare il <strong>QR Code</strong> o avvicinare il dispositivo
            al tag <strong>NFC</strong>.
          </p>

          {/* Sezione avviso coin */}
          <div className="mt-6 bg-yellow-100 border border-yellow-300 rounded-lg p-2 flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 11000 11000"
              fillRule="evenodd"
              clipRule="evenodd"
            >
              <g>
                <path
                  fill="#FF0054"
                  d="M5500 2466c-808,0 -1574,318 -2146,888 -571,571 -888,1338 -888,2146 0,808 318,1575 888,2146 572,571 1338,888 2146,888 808,0 1575,-317 2146,-888 570,-571 888,-1338 888,-2146 0,-808 -318,-1575 -888,-2146 -571,-570 -1338,-888 -2146,-888zm855 3490c-156,-41 -311,-89 -463,-143 112,-131 217,-270 314,-417 98,-147 181,-297 249,-451 68,-154 116,-312 146,-474 29,-162 33,-326 12,-491 -18,-149 -72,-286 -161,-412 -89,-125 -199,-221 -329,-287 -170,-85 -348,-130 -534,-135 -186,-5 -370,18 -553,68 -184,51 -360,121 -530,212 -170,91 -322,187 -455,288 -249,192 -270,402 -198,664l129 472 743 2718c28,91 85,167 169,227 84,60 176,75 277,44 45,-14 88,-36 128,-64 40,-29 73,-63 99,-102 25,-39 43,-83 53,-130 9,-48 8,-96 -4,-146l-124 -457 -121 -467 117 -101c231,91 473,173 725,246 252,73 505,129 759,170 51,9 99,4 145,-16 46,-20 86,-47 121,-84 35,-36 63,-76 84,-121 20,-45 31,-90 30,-136 -2,-111 -36,-197 -103,-260 -67,-62 -152,-102 -253,-120 -159,-22 -316,-53 -472,-95zm-574 -889c-121,-53 -253,-128 -359,-150 -34,-7 -66,5 -87,33 -53,73 -109,152 -169,232 -150,201 -261,393 -300,-5 -11,-110 -12,-235 -14,-333 0,-42 -30,-77 -72,-84 -72,-11 -164,-26 -243,-47 -326,-88 -110,-190 60,-279 359,-190 275,-75 333,-461 6,-40 11,-76 18,-114 32,-194 113,-194 227,-71 80,85 165,190 216,256 24,32 62,46 101,37 180,-41 414,-136 548,-39 62,98 -137,330 -237,431 -24,24 -31,57 -20,89 36,101 112,221 168,334 119,243 77,281 -170,171z"
                />
                <path
                  fill="#FDC91D"
                  d="M5500 2256c896,0 1707,364 2293,951 587,586 951,1397 951,2293 0,896 -364,1707 -951,2293 -586,587 -1397,951 -2293,951 -896,0 -1707,-364 -2293,-951 -587,-586 -951,-1397 -951,-2293 0,-896 364,-1707 951,-2293 586,-587 1397,-951 2293,-951zm2634 610c-674,-674 -1606,-1091 -2634,-1091 -1028,0 -1960,417 -2634,1091 -674,674 -1091,1606 -1091,2634 0,1028 417,1960 1091,2634 674,674 1606,1091 2634,1091 1028,0 1960,-417 2634,-1091 674,-674 1091,-1606 1091,-2634 0,-1028 -417,-1960 -1091,-2634z"
                />
              </g>
            </svg>
            <p className="text-yellow-800 font-inter text-[13px] font-medium text-left">
              Le coin possono essere usate solo nel locale
            </p>
          </div>
        </div>
        <div className="flex justify-center mt-6 w-full">
          <Button
            variant={"default"}
            onClick={async () => {
              try {
                // Clear all cookies before navigating to login
                clearAllCookies();
                await signOut(auth);
              } catch (e) {
                // no-op: even if signOut fails, push user to login
              } finally {
                navigate("/login");
              }
            }}
            className={
              "bg-[#19171A] text-white font-inter w-full h-[50px] rounded-lg"
            }
          >
            Torna al login
            <ArrowRight className="w-5 h-5 " />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
