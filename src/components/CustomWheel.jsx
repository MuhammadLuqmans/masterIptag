import React, { useRef, useEffect, useState } from "react";

const CustomWheel = ({
  segments,
  prizeNumber,
  mustSpin,
  onSpinComplete,
  winningSegmentText = null,
  outerBorderColor = "#FFFFFF",
  outerBorderWidth = 4,
  innerRadius = 6,
  innerBorderColor = "#FFFFFF",
  innerBorderWidth = 20,
  radiusLineColor = "#ffffff",
  radiusLineWidth = 4,
  backgroundColor = "#89EBD8",
  textColor = "#131313",
  fontSize = 18,
  fontWeight = "bold",
  spinDuration = 0.8,
  pointerProps = {},
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [pixelRatio, setPixelRatio] = useState(1);

  // Canvas più grande per alta risoluzione ma stesso display size
  const baseCanvasSize = 800; // Aumentato da 500 a 800 per alta risoluzione
  const displaySize = 500; // Mantenuto lo stesso size di visualizzazione

  useEffect(() => {
    // Rileva il pixel ratio del dispositivo
    const detectPixelRatio = () => {
      const ratio =
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      setPixelRatio(ratio);
    };

    detectPixelRatio();
    window.addEventListener("resize", detectPixelRatio);

    return () => window.removeEventListener("resize", detectPixelRatio);
  }, []);

  useEffect(() => {
    drawWheel();
  }, [segments, rotation, pixelRatio]);

  const isSpinningRef = useRef(false);

  useEffect(() => {
    if (mustSpin && !isSpinningRef.current) {
      isSpinningRef.current = true;
      setIsSpinning(true);

      // Prioritize prizeNumber if it's a valid index
      if (
        typeof prizeNumber === "number" &&
        prizeNumber >= 0 &&
        prizeNumber < segments.length
      ) {
        spinToSegment(prizeNumber);
      } else if (winningSegmentText) {
        // Fallback to text matching if prizeNumber is invalid (legacy behavior)
        const actualIndex = segments.findIndex(
          (s) => s.option === winningSegmentText
        );
        if (actualIndex !== -1) {
          spinToSegment(actualIndex);
        } else {
          // Last resort fallback
          spinToSegment(0);
        }
      } else {
        // If no text and invalid number, just spin to 0
        spinToSegment(0);
      }
    }
  }, [mustSpin, prizeNumber, winningSegmentText, segments]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas || segments.length === 0) return;

    const ctx = canvas.getContext("2d");

    // Calcola dimensioni canvas considerando pixel ratio
    const backingStoreSize = baseCanvasSize * pixelRatio;

    // Imposta dimensioni reali canvas (alta risoluzione)
    canvas.width = backingStoreSize;
    canvas.height = backingStoreSize;

    // Scala il canvas per display (mantiene stessa dimensione visiva)
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;

    // Scala il contesto per alta risoluzione
    ctx.scale(pixelRatio, pixelRatio);

    const scaleToDisplay = baseCanvasSize / displaySize;
    const centerX = baseCanvasSize / 2;
    const centerY = baseCanvasSize / 2;
    const radius =
      baseCanvasSize / 2 -
      outerBorderWidth * scaleToDisplay -
      10 * scaleToDisplay;

    ctx.clearRect(0, 0, baseCanvasSize, baseCanvasSize);
    ctx.save();

    // Apply rotation from center
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    const numSegments = segments.length;
    const anglePerSegment = (2 * Math.PI) / numSegments;

    // Start from top (12 o'clock = -90 degrees = -PI/2)
    segments.forEach((segment, index) => {
      const startAngle = index * anglePerSegment - Math.PI / 2;
      const endAngle = startAngle + anglePerSegment;
      const midAngle = startAngle + anglePerSegment / 2;

      // Draw segment background
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.style?.backgroundColor || backgroundColor;
      ctx.fill();

      // Draw separator line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + radius * Math.cos(startAngle),
        centerY + radius * Math.sin(startAngle)
      );
      ctx.strokeStyle = radiusLineColor;
      ctx.lineWidth = radiusLineWidth * scaleToDisplay;
      ctx.stroke();

      // Draw text
      ctx.save();
      const textRadius = radius * 0.68;
      const textX = centerX + textRadius * Math.cos(midAngle);
      const textY = centerY + textRadius * Math.sin(midAngle);

      ctx.translate(textX, textY);

      // Rotate text 90 degrees from perpendicular (horizontal to the segment)
      const textAngle = midAngle;
      ctx.rotate(textAngle);

      // Font size scalato per alta risoluzione
      const scaledFontSize = fontSize * scaleToDisplay;

      ctx.fillStyle = segment.style?.textColor || textColor;
      ctx.font = `${fontWeight} ${scaledFontSize}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Migliora la qualità del rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.fillText(segment.option || "", 0, 0);

      // Debug: Draw index
      ctx.font = `12px sans-serif`;
      ctx.fillText(`(#${index})`, 0, 20);

      ctx.restore();
    });

    // Draw outer border circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = outerBorderColor;
    ctx.lineWidth = outerBorderWidth * scaleToDisplay;
    ctx.stroke();

    // Draw inner center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius * 8 * scaleToDisplay, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = innerBorderColor;
    ctx.lineWidth = innerBorderWidth * scaleToDisplay;
    ctx.stroke();

    ctx.restore();
  };

  const spinToSegment = (targetIndex) => {
    if (isSpinning) return;

    setIsSpinning(true);

    const numSegments = segments.length;
    const degreesPerSegment = 360 / numSegments;

    // Calculate the angle offset for this segment
    // Segment 0 should be at the top when rotation = 0
    // We want to rotate so the target segment's CENTER is at the top (where the pointer is)
    const targetSegmentAngle = targetIndex * degreesPerSegment;

    // We need to rotate by the negative of the segment's position to bring it to top
    // Plus half a segment to center it
    const targetRotation = -(targetSegmentAngle + degreesPerSegment / 2);

    // Add full spins for effect
    const numberOfSpins = 5 + Math.floor(Math.random() * 3);
    const totalDegrees = targetRotation - numberOfSpins * 360;

    // Animate
    const startTime = Date.now();
    const duration = 4000; // 4 seconds for a nice smooth spin
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRotation =
        startRotation + (totalDegrees - startRotation) * eased;

      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const finalRotation = currentRotation % 360;
        setRotation(finalRotation);
        setRotation(finalRotation);
        setIsSpinning(false);
        isSpinningRef.current = false;
        setTimeout(() => onSpinComplete?.(), 100);
      }
    };

    requestAnimationFrame(animate);
  };

  // Reset ref when not spinning (e.g. if unmounted or reset externally)
  useEffect(() => {
    if (!mustSpin) {
      isSpinningRef.current = false;
      setIsSpinning(false);
    }
  }, [mustSpin]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ width: displaySize, height: displaySize }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          // Migliora la qualità su dispositivi ad alta densità di pixel
          imageRendering: "auto",
        }}
      />

      {pointerProps.src && (
        <img
          src={pointerProps.src}
          alt="pointer"
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: pointerProps.style?.width || 26,
            height: pointerProps.style?.height || 26,
            zIndex: 10,
            ...pointerProps.style,
          }}
        />
      )}
    </div>
  );
};

export default CustomWheel;
