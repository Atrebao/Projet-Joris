import React from 'react';

const ScrollingText = () => {
  return (
    <div className="w-full bg-gradient-to-r from-primary/80 to-primary overflow-hidden p-2 sm:p-3">
      <div className="relative flex whitespace-nowrap">
        {/* Texte principal */}
        <div className="animate-scroll-left flex items-center space-x-4">
          {Array(5)
            .fill("Le streaming à moindre coût c'est chez nous")
            .map((text, index) => (
              <React.Fragment key={index}>
                <span className="text-white font-medium text-sm sm:text-lg">
                  {text}
                </span>
                <span className="text-white/30 px-2 sm:px-4">•</span>
              </React.Fragment>
            ))}
        </div>

        {/* Clone pour un défilement sans interruption */}
        <div className="animate-scroll-left flex items-center space-x-4 absolute left-full">
          {Array(5)
            .fill("Le streaming à moindre coût c'est chez nous")
            .map((text, index) => (
              <React.Fragment key={`clone-${index}`}>
                <span className="text-white font-medium text-sm sm:text-lg">
                  {text}
                </span>
                <span className="text-white/30 px-2 sm:px-4">•</span>
              </React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};

// Ajoutez les styles dans le fichier CSS global ou tailwind.config.js
const styles = `
  @keyframes scroll-left {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  .animate-scroll-left {
    animation: scroll-left 15s linear infinite;
  }
`;

// Composant pour injecter les styles d'animation
const StyleTag = () => (
  <style>{styles}</style>
);

const ScrollingTextWithStyles = () => (
  <>
    <StyleTag />
    <ScrollingText />
  </>
);

export default ScrollingTextWithStyles;
