import React from "react";
import { motion } from "framer-motion";

function ProgressBar({ currentStep, totalSteps, onStepChange, getThemeColor }) {
  const railHeight = 10;
  const dotSize = 14; // più grandi
  const dotVisualSize = dotSize;

  const fillPercent = Math.max(
    0,
    Math.min(100, (currentStep / (totalSteps - 1)) * 100)
  );
  const bgColor = "#E5E7EB";
  const fillColor = "#FF0054";

  return (
    <div className="relative" style={{ minWidth: "200px", height: railHeight }}>
      {/* barra di sfondo */}
      <div
        className="absolute w-full h-full rounded-full"
        style={{ backgroundColor: bgColor, top: 0 }}
      />
      {/* barra riempita */}
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{
          backgroundColor: fillColor,
          width: `${fillPercent}%`,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        initial={false} // Previene animazioni indesiderate al mount
      />

      {/* dot */}
      {Array.from({ length: totalSteps }).map((_, i) => {
        const leftPct = (i / (totalSteps - 1)) * 100;
        const isReachable = i <= currentStep;
        return (
          <button
            key={`dot-${i}`}
            onClick={() => isReachable && onStepChange(i)}
            disabled={!isReachable}
            aria-label={
              i === currentStep
                ? `Step ${i + 1}, attuale`
                : isReachable
                ? `Vai allo step ${i + 1}`
                : `Step ${i + 1} non ancora disponibile`
            }
            aria-current={i === currentStep ? "step" : undefined}
            style={{
              position: "absolute",
              left: `${leftPct}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: dotVisualSize,
              height: dotVisualSize,
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: isReachable ? "pointer" : "default",
            }}
          >
            <motion.span
              className="block rounded-full transition-all duration-200"
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: isReachable
                  ? fillColor
                  : getThemeColor("background-DEFAULT", "#d1d1d6"),
              }}
              whileHover={isReachable ? { scale: 1.2 } : {}}
              whileTap={isReachable ? { scale: 0.9 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            />
          </button>
        );
      })}
    </div>
  );
}

export default ProgressBar;