import { useState, useEffect } from 'react';

export const Asterix = ({ className = '', size = 150, animated = true }) => {
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (animated) {
      const interval = setInterval(() => {
        setBounce(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [animated]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`gaulois-character asterix ${animated ? 'animated' : ''} ${bounce ? 'bounce' : ''} ${className}`}
      style={{ transform: bounce && animated ? 'translateY(-10px)' : 'translateY(0)' }}
    >
      {/* Corps */}
      <ellipse cx="100" cy="145" rx="35" ry="40" fill="#3B82F6" />
      
      {/* Ceinture */}
      <rect x="65" y="130" width="70" height="12" fill="#8B4513" rx="3" />
      <circle cx="100" cy="136" r="6" fill="#FFD700" />
      
      {/* Cape */}
      <path
        d="M65 110 Q40 140 50 180 L70 160 Q65 130 75 115 Z"
        fill="#DC2626"
        className="cape"
      />
      <path
        d="M135 110 Q160 140 150 180 L130 160 Q135 130 125 115 Z"
        fill="#DC2626"
        className="cape"
      />
      
      {/* Bras gauche */}
      <ellipse cx="60" cy="125" rx="12" ry="20" fill="#FDBF6F" />
      {/* Main gauche avec épée */}
      <ellipse cx="55" cy="145" rx="8" ry="8" fill="#FDBF6F" />
      <rect x="45" y="120" width="6" height="35" fill="#9CA3AF" rx="2" />
      <rect x="40" y="115" width="16" height="8" fill="#FFD700" rx="2" />
      
      {/* Bras droit */}
      <ellipse cx="140" cy="125" rx="12" ry="20" fill="#FDBF6F" />
      <ellipse cx="145" cy="145" rx="8" ry="8" fill="#FDBF6F" />
      
      {/* Tête */}
      <circle cx="100" cy="70" r="40" fill="#FDBF6F" />
      
      {/* Casque ailé */}
      <ellipse cx="100" cy="45" rx="35" ry="20" fill="#4A5568" />
      <ellipse cx="100" cy="42" rx="30" ry="15" fill="#718096" />
      {/* Ailes du casque */}
      <path
        d="M60 40 Q40 20 35 45 Q45 35 60 45 Z"
        fill="#FFFFFF"
        className="wing wing-left"
      />
      <path
        d="M140 40 Q160 20 165 45 Q155 35 140 45 Z"
        fill="#FFFFFF"
        className="wing wing-right"
      />
      
      {/* Cheveux/Moustache blonds */}
      <path
        d="M65 55 Q60 40 70 45 Q65 50 70 55"
        fill="#F59E0B"
      />
      <path
        d="M135 55 Q140 40 130 45 Q135 50 130 55"
        fill="#F59E0B"
      />
      {/* Grande moustache */}
      <path
        d="M70 80 Q50 75 45 85 Q55 80 70 82 Z"
        fill="#F59E0B"
        className="moustache"
      />
      <path
        d="M130 80 Q150 75 155 85 Q145 80 130 82 Z"
        fill="#F59E0B"
        className="moustache"
      />
      
      {/* Yeux */}
      <ellipse cx="85" cy="65" rx="8" ry="10" fill="#FFFFFF" />
      <ellipse cx="115" cy="65" rx="8" ry="10" fill="#FFFFFF" />
      <circle cx="87" cy="67" r="4" fill="#1F2937" />
      <circle cx="117" cy="67" r="4" fill="#1F2937" />
      <circle cx="88" cy="66" r="1.5" fill="#FFFFFF" />
      <circle cx="118" cy="66" r="1.5" fill="#FFFFFF" />
      
      {/* Nez */}
      <ellipse cx="100" cy="75" rx="6" ry="8" fill="#F5A623" />
      
      {/* Sourire */}
      <path
        d="M85 90 Q100 100 115 90"
        fill="none"
        stroke="#1F2937"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Jambes */}
      <rect x="80" y="175" width="15" height="20" fill="#FDBF6F" rx="5" />
      <rect x="105" y="175" width="15" height="20" fill="#FDBF6F" rx="5" />
      
      {/* Sandales */}
      <ellipse cx="87" cy="195" rx="12" ry="5" fill="#8B4513" />
      <ellipse cx="112" cy="195" rx="12" ry="5" fill="#8B4513" />
    </svg>
  );
};

export const Obelix = ({ className = '', size = 180, animated = true }) => {
  const [wiggle, setWiggle] = useState(false);

  useEffect(() => {
    if (animated) {
      const interval = setInterval(() => {
        setWiggle(prev => !prev);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [animated]);

  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 220 240"
      className={`gaulois-character obelix ${animated ? 'animated' : ''} ${className}`}
      style={{ transform: wiggle && animated ? 'rotate(-2deg)' : 'rotate(2deg)' }}
    >
      {/* Corps large */}
      <ellipse cx="110" cy="155" rx="60" ry="65" fill="#FFFFFF" />
      
      {/* Rayures bleues du pantalon */}
      <path d="M55 140 L55 200" stroke="#3B82F6" strokeWidth="8" />
      <path d="M75 130 L75 210" stroke="#3B82F6" strokeWidth="8" />
      <path d="M95 125 L95 215" stroke="#3B82F6" strokeWidth="8" />
      <path d="M115 125 L115 215" stroke="#3B82F6" strokeWidth="8" />
      <path d="M135 130 L135 210" stroke="#3B82F6" strokeWidth="8" />
      <path d="M155 140 L155 200" stroke="#3B82F6" strokeWidth="8" />
      
      {/* Ceinture */}
      <rect x="50" y="115" width="120" height="18" fill="#8B4513" rx="5" />
      <circle cx="110" cy="124" r="8" fill="#FFD700" />
      
      {/* Tresses rousses */}
      <path
        d="M50 70 Q30 90 35 120 Q40 100 50 85"
        fill="#D97706"
        className="tresse tresse-left"
      />
      <path
        d="M170 70 Q190 90 185 120 Q180 100 170 85"
        fill="#D97706"
        className="tresse tresse-right"
      />
      
      {/* Bras gauche (tenant le menhir) */}
      <ellipse cx="40" cy="130" rx="18" ry="30" fill="#FDBF6F" />
      <ellipse cx="30" cy="100" rx="12" ry="12" fill="#FDBF6F" />
      
      {/* Bras droit */}
      <ellipse cx="180" cy="130" rx="18" ry="30" fill="#FDBF6F" />
      <ellipse cx="190" cy="155" rx="12" ry="12" fill="#FDBF6F" />
      
      {/* Menhir */}
      <ellipse 
        cx="25" 
        cy="60" 
        rx="20" 
        ry="50" 
        fill="#6B7280"
        className="menhir"
      />
      <ellipse cx="25" cy="60" rx="15" ry="45" fill="#9CA3AF" />
      
      {/* Tête */}
      <circle cx="110" cy="55" r="45" fill="#FDBF6F" />
      
      {/* Casque */}
      <ellipse cx="110" cy="25" rx="40" ry="22" fill="#4A5568" />
      <ellipse cx="110" cy="22" rx="35" ry="18" fill="#718096" />
      {/* Petites ailes */}
      <path
        d="M70 20 Q55 5 50 25 Q60 18 70 25 Z"
        fill="#FFFFFF"
        className="wing wing-left"
      />
      <path
        d="M150 20 Q165 5 170 25 Q160 18 150 25 Z"
        fill="#FFFFFF"
        className="wing wing-right"
      />
      
      {/* Cheveux roux */}
      <circle cx="75" cy="45" r="8" fill="#D97706" />
      <circle cx="145" cy="45" r="8" fill="#D97706" />
      
      {/* Yeux */}
      <ellipse cx="95" cy="50" rx="10" ry="12" fill="#FFFFFF" />
      <ellipse cx="125" cy="50" rx="10" ry="12" fill="#FFFFFF" />
      <circle cx="97" cy="52" r="5" fill="#1F2937" />
      <circle cx="127" cy="52" r="5" fill="#1F2937" />
      <circle cx="98" cy="51" r="2" fill="#FFFFFF" />
      <circle cx="128" cy="51" r="2" fill="#FFFFFF" />
      
      {/* Gros nez rouge */}
      <ellipse cx="110" cy="65" rx="12" ry="14" fill="#EF4444" />
      <ellipse cx="108" cy="62" rx="4" ry="5" fill="#F87171" />
      
      {/* Moustache rousse */}
      <path
        d="M75 78 Q50 70 40 82 Q55 75 75 80 Z"
        fill="#D97706"
        className="moustache"
      />
      <path
        d="M145 78 Q170 70 180 82 Q165 75 145 80 Z"
        fill="#D97706"
        className="moustache"
      />
      
      {/* Sourire */}
      <path
        d="M90 88 Q110 100 130 88"
        fill="none"
        stroke="#1F2937"
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Jambes */}
      <rect x="75" y="210" width="25" height="25" fill="#FDBF6F" rx="8" />
      <rect x="120" y="210" width="25" height="25" fill="#FDBF6F" rx="8" />
      
      {/* Sandales */}
      <ellipse cx="87" cy="235" rx="18" ry="6" fill="#8B4513" />
      <ellipse cx="132" cy="235" rx="18" ry="6" fill="#8B4513" />
    </svg>
  );
};

// Idéfix (petit chien)
export const Idefix = ({ className = '', size = 60, animated = true }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={`gaulois-character idefix ${animated ? 'animated' : ''} ${className}`}
    >
      {/* Corps */}
      <ellipse cx="40" cy="50" rx="20" ry="15" fill="#FFFFFF" />
      
      {/* Queue */}
      <path
        d="M60 50 Q75 40 70 55 Q65 45 60 52"
        fill="#FFFFFF"
        className="tail"
      />
      
      {/* Pattes */}
      <rect x="25" y="60" width="8" height="12" fill="#FFFFFF" rx="3" />
      <rect x="47" y="60" width="8" height="12" fill="#FFFFFF" rx="3" />
      
      {/* Tête */}
      <circle cx="25" cy="40" r="18" fill="#FFFFFF" />
      
      {/* Oreilles */}
      <ellipse cx="12" cy="28" rx="8" ry="12" fill="#1F2937" />
      <ellipse cx="38" cy="28" rx="8" ry="12" fill="#1F2937" />
      
      {/* Yeux */}
      <circle cx="20" cy="38" r="5" fill="#1F2937" />
      <circle cx="32" cy="38" r="5" fill="#1F2937" />
      <circle cx="21" cy="37" r="2" fill="#FFFFFF" />
      <circle cx="33" cy="37" r="2" fill="#FFFFFF" />
      
      {/* Nez */}
      <ellipse cx="25" cy="48" rx="5" ry="4" fill="#1F2937" />
      <ellipse cx="24" cy="47" rx="2" ry="1.5" fill="#4B5563" />
      
      {/* Langue */}
      <ellipse cx="25" cy="55" rx="4" ry="5" fill="#F87171" className="tongue" />
    </svg>
  );
};

export const Cauldron = ({ className = '', size = 100, animated = true }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={`gaulois-character cauldron ${animated ? 'animated' : ''} ${className}`}
    >
      {/* Pieds */}
      <ellipse cx="30" cy="110" rx="10" ry="8" fill="#1F2937" />
      <ellipse cx="90" cy="110" rx="10" ry="8" fill="#1F2937" />
      
      {/* Corps du chaudron */}
      <ellipse cx="60" cy="85" rx="45" ry="30" fill="#1F2937" />
      <ellipse cx="60" cy="80" rx="40" ry="25" fill="#374151" />
      
      {/* Potion */}
      <ellipse cx="60" cy="70" rx="35" ry="18" fill="#22C55E" className="potion" />
      <ellipse cx="55" cy="68" rx="10" ry="5" fill="#4ADE80" />
      
      {/* Bulles */}
      <circle cx="45" cy="65" r="5" fill="#86EFAC" className="bubble bubble-1" />
      <circle cx="70" cy="60" r="4" fill="#86EFAC" className="bubble bubble-2" />
      <circle cx="55" cy="55" r="6" fill="#86EFAC" className="bubble bubble-3" />
      <circle cx="75" cy="68" r="3" fill="#86EFAC" className="bubble bubble-4" />
      
      {/* Vapeur */}
      <path
        d="M40 50 Q35 30 45 20"
        fill="none"
        stroke="#86EFAC"
        strokeWidth="4"
        strokeLinecap="round"
        className="steam steam-1"
        opacity="0.6"
      />
      <path
        d="M60 45 Q65 25 55 10"
        fill="none"
        stroke="#86EFAC"
        strokeWidth="4"
        strokeLinecap="round"
        className="steam steam-2"
        opacity="0.6"
      />
      <path
        d="M80 50 Q85 30 75 15"
        fill="none"
        stroke="#86EFAC"
        strokeWidth="4"
        strokeLinecap="round"
        className="steam steam-3"
        opacity="0.6"
      />
      
      {/* Anses */}
      <path
        d="M20 70 Q5 70 10 85 Q15 75 20 80"
        fill="none"
        stroke="#1F2937"
        strokeWidth="6"
      />
      <path
        d="M100 70 Q115 70 110 85 Q105 75 100 80"
        fill="none"
        stroke="#1F2937"
        strokeWidth="6"
      />
    </svg>
  );
};

export const GauloisScene = ({ className = '' }) => {
  return (
    <div className={`gaulois-scene ${className}`}>
      <div className="scene-characters">
        <Asterix size={140} />
        <Cauldron size={90} />
        <Obelix size={170} />
      </div>
      <Idefix size={50} className="idefix-running" />
    </div>
  );
};

export default GauloisScene;


