import { useRef, useState, useEffect } from 'react';

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      console.log('Audio prêt à jouer');
      setAudioReady(true);
    };

    const handleError = (e) => {
      console.error('Erreur audio:', e);
      setError('Fichier audio introuvable');
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (soundOn) {
      audio.pause();
      setSoundOn(false);
    } else {
      audio.volume = 0.5;
      audio.currentTime = 0;
      audio.play()
        .then(() => {
          setSoundOn(true);
          setError(null);
        })
        .catch(err => {
          console.error('Erreur lecture:', err);
          setError('Cliquez pour activer');
        });
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/background.mp3"
        loop
        preload="auto"
      />
      
      {/* Bouton musique */}
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: soundOn 
            ? 'linear-gradient(135deg, #2d7d2d 0%, #1a4d1a 100%)' 
            : error 
              ? 'linear-gradient(135deg, #ff6600 0%, #cc4400 100%)'
              : 'linear-gradient(135deg, #c9302c 0%, #8b0000 100%)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '25px',
          fontFamily: 'Comic Sans MS, cursive',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 9999,
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          border: '3px solid #ffd700',
          animation: soundOn ? 'none' : 'pulse 2s infinite',
          userSelect: 'none'
        }}
        onClick={toggleMusic}
      >
        {soundOn ? '🔊 Musique ON' : error ? `⚠️ ${error}` : '🎵 Musique !'}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </>
  );
};

export default MusicPlayer;

