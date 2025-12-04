import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../utils/cookies";

/**
 * Component to validate if a placeId exists in the database
 * Redirects to /invalid-business if the placeId doesn't exist
 */
const ValidatePlaceId = ({ children }) => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validatePlaceId = async () => {
      const placeId = getCookie("placeId");

      if (!placeId) {
        navigate("/invalid-business", { replace: true });
        return;
      }

      try {
        const response = await fetch(`/api/get-activity/${placeId}`);

        if (response.ok) {
          setIsValid(true);
        } else {
          // PlaceId doesn't exist, redirect to invalid business page
          navigate("/invalid-business", { replace: true });
        }
      } catch (error) {
        navigate("/invalid-business", { replace: true });
      } finally {
        setIsValidating(false);
      }
    };

    validatePlaceId();
  }, [navigate]);

  if (isValidating) {
    return (
      <div className="spinner-overlay" role="status" aria-label="Validazione">
        <div className="spinner"></div>
      </div>
    );
  }

  return isValid ? children : null;
};

export default ValidatePlaceId;
