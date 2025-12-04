import React from 'react';
import Lottie from 'react-lottie-player';

const LottieAnimation = ({ 
  animationData, 
  width = 100, 
  height = 100, 
  loop = true, 
  autoplay = true,
  className = "",
  style = {},
  speed = 1,
  onComplete = null
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`} style={style}>
      <Lottie
        animationData={animationData}
        play={autoplay}
        loop={loop}
        speed={speed}
        style={{ width: width, height: height }}
      />
    </div>
  );
};

export default LottieAnimation;
