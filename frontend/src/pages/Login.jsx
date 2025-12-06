import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, ArrowRight, AlertCircle, ArrowLeft, Volume2, VolumeX } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) {
      audio.pause();
      setMusicOn(false);
    } else {
      audio.volume = 0.5;
      audio.play().then(() => setMusicOn(true)).catch(() => {});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Audio element */}
      <audio ref={audioRef} src="/audio/background.mp3" loop preload="auto" />

      {/* Bouton musique en haut à gauche */}
      <button 
        onClick={toggleMusic}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          background: musicOn ? '#2d7d2d' : '#c9302c',
          border: '2px solid #ffd700',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
          transition: 'all 0.3s ease'
        }}
        title={musicOn ? 'Couper la musique' : 'Jouer la musique'}
      >
        {musicOn ? <Volume2 size={20} color="white" /> : <VolumeX size={20} color="white" />}
      </button>

      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Image Astérix à gauche */}
      <img 
        src="/images/asterix.png" 
        alt="Astérix"
        style={{
          position: 'fixed',
          bottom: '50px',
          left: '50px',
          width: '120px',
          height: 'auto',
          zIndex: 10,
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
          animation: 'bounce 2s ease-in-out infinite'
        }}
      />
      
      {/* Image Astérix & Obélix à droite */}
      <img 
        src="/images/asterix-obelix.png" 
        alt="Astérix et Obélix"
        style={{
          position: 'fixed',
          bottom: '50px',
          right: '50px',
          width: '180px',
          height: 'auto',
          zIndex: 10,
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
          animation: 'float 3s ease-in-out infinite'
        }}
      />

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
      `}</style>

      <div className="auth-container">
        <Link to="/" className="back-to-home">
          <ArrowLeft size={18} />
          Retour à l'accueil
        </Link>
        
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo">
              <Shield className="logo-icon" />
              <span>NIRD</span>
            </div>
            <h1>Connexion</h1>
            <p>Accédez à votre espace village gaulois</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                <span>Email</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <Lock size={18} />
                <span>Mot de passe</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Pas encore de compte ?{' '}
              <Link to="/register">Créer un compte</Link>
            </p>
          </div>

          <div className="demo-credentials">
            <p><strong>Compte de démonstration :</strong></p>
            <code>admin@lifecycle.local / admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

