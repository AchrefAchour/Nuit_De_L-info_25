import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Zap,
  Users,
  BookOpen,
  ChevronRight,
  Star,
  Leaf,
  Lock,
  Globe,
  ArrowRight,
  CheckCircle,
  School,
  Laptop,
  Heart,
  LogIn,
  UserPlus,
  LayoutDashboard,
  FileQuestion,
  ExternalLink,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Asterix, Obelix, Idefix, Cauldron, GauloisScene } from '../components/GauloisCharacters';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef(null);

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

  const nirdPillars = [
    {
      icon: Users,
      title: 'Inclusif',
      description: 'Un numérique accessible à tous, sans barrière financière ni technique.',
      color: '#2e5a88',
    },
    {
      icon: Shield,
      title: 'Responsable',
      description: 'Protection des données, respect de la vie privée, souveraineté numérique.',
      color: '#4a7c23',
    },
    {
      icon: Leaf,
      title: 'Durable',
      description: 'Lutter contre l\'obsolescence programmée, prolonger la vie du matériel.',
      color: '#c9302c',
    },
  ];

  const bigTechProblems = [
    { icon: '💰', text: 'Licences coûteuses et abonnements obligatoires' },
    { icon: '🔒', text: 'Écosystèmes fermés et verrouillés' },
    { icon: '🌍', text: 'Données stockées hors UE' },
    { icon: '⏰', text: 'Obsolescence programmée du matériel' },
    { icon: '🔗', text: 'Dépendance structurelle aux géants du numérique' },
    { icon: '📉', text: 'Perte d\'autonomie technologique' },
  ];

  const solutions = [
    {
      name: 'Linux',
      description: 'Système d\'exploitation libre qui redonne vie aux vieux ordinateurs',
      icon: '🐧',
      replaces: 'Windows',
    },
    {
      name: 'LibreOffice',
      description: 'Suite bureautique complète, gratuite et sans abonnement',
      icon: '📝',
      replaces: 'Microsoft Office',
    },
    {
      name: 'Nextcloud',
      description: 'Cloud privé pour stocker vos données en toute souveraineté',
      icon: '☁️',
      replaces: 'Google Drive / OneDrive',
    },
    {
      name: 'Firefox',
      description: 'Navigateur respectueux de la vie privée',
      icon: '🦊',
      replaces: 'Chrome',
    },
    {
      name: 'Jitsi',
      description: 'Visioconférence sécurisée et auto-hébergeable',
      icon: '📹',
      replaces: 'Teams / Zoom',
    },
    {
      name: 'PeerTube',
      description: 'Plateforme vidéo décentralisée et éthique',
      icon: '🎬',
      replaces: 'YouTube',
    },
  ];

  const stats = [
    { value: '80%', label: 'des ordinateurs peuvent revivre avec Linux' },
    { value: '0€', label: 'coût des licences logiciels libres' },
    { value: '100%', label: 'de souveraineté sur vos données' },
    { value: '∞', label: 'possibilités de personnalisation' },
  ];

  return (
    <div className="landing-page">
      {/* Audio element */}
      <audio ref={audioRef} src="/audio/background.mp3" loop preload="auto" />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        
        <nav className="landing-nav">
          <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={toggleMusic}
              style={{
                background: musicOn ? '#2d7d2d' : '#c9302c',
                border: '2px solid #ffd700',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              title={musicOn ? 'Couper la musique' : 'Jouer la musique'}
            >
              {musicOn ? <Volume2 size={18} color="white" /> : <VolumeX size={18} color="white" />}
            </button>
            <Shield className="logo-icon" />
            <span>NIRD</span>
          </div>
          <div className="nav-links">
            <Link to="/quiz" className="btn btn-ghost">
              <FileQuestion size={18} />
              Quiz
            </Link>
            <a href="#decouvrir" className="btn btn-ghost">Découvrir</a>
            <a href="#solutions" className="btn btn-ghost">Solutions</a>
            {user ? (
              <Link to="/app" className="btn btn-primary">
                <LayoutDashboard size={18} />
                Ma plateforme
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  <LogIn size={18} />
                  Connexion
                </Link>
                <Link to="/register" className="btn btn-primary">
                  <UserPlus size={18} />
                  Rejoindre
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-badge">
            <Star size={16} />
            <span>Nuit de l'Info 2025</span>
          </div>
          
          <h1>
            <span className="highlight">Le Village</span> qui résiste
            <br />aux Big Tech
          </h1>
          
          <p className="hero-subtitle">
            Face à l'empire numérique des géants du web, les établissements scolaires 
            peuvent devenir des <strong>villages gaulois</strong> : autonomes, ingénieux et libres.
            <br /><br />
            Bienvenue dans la démarche <strong>NIRD</strong> !
          </p>

          <div className="hero-actions">
            <Link to="/quiz" className="btn btn-primary btn-lg">
              <Zap size={20} />
              Tester mon établissement
            </Link>
            <a href="#decouvrir" className="btn btn-secondary btn-lg">
              Découvrir NIRD
              <ChevronRight size={20} />
            </a>
          </div>

          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Personnages Gaulois animés */}
          <div className="hero-characters">
            <Asterix size={120} animated={true} />
            <Cauldron size={80} animated={true} />
            <Obelix size={150} animated={true} />
          </div>
          <Idefix size={45} className="idefix-running" />
        </div>

        <div className="scroll-indicator">
          <span>Découvrir</span>
          <ChevronRight size={20} className="rotate-90" />
        </div>
      </section>

      {/* Problem Section */}
      <section className="problem-section" id="decouvrir">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Le problème</span>
            <h2>L'Empire Numérique des Big Tech</h2>
            <p>
              La fin du support de Windows 10 révèle notre dépendance structurelle 
              aux géants du numérique. Des millions d'ordinateurs parfaitement fonctionnels 
              risquent de finir à la poubelle.
            </p>
          </div>

          <div className="problems-grid">
            {bigTechProblems.map((problem, index) => (
              <div key={index} className="problem-card">
                <span className="problem-icon">{problem.icon}</span>
                <p>{problem.text}</p>
              </div>
            ))}
          </div>

          <div className="empire-visual">
            <div className="empire-center">
              <span>🏛️</span>
              <p>Big Tech</p>
            </div>
            <div className="empire-satellites">
              <div className="satellite">Microsoft</div>
              <div className="satellite">Google</div>
              <div className="satellite">Apple</div>
              <div className="satellite">Amazon</div>
            </div>
          </div>
        </div>
      </section>

      {/* NIRD Section */}
      <section className="nird-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">La solution</span>
            <h2>La Démarche NIRD</h2>
            <p>
              <strong>N</strong>umérique <strong>I</strong>nclusif, 
              <strong> R</strong>esponsable et <strong>D</strong>urable
            </p>
          </div>

          <div className="pillars-grid">
            {nirdPillars.map((pillar, index) => (
              <div 
                key={index} 
                className="pillar-card"
                style={{ '--pillar-color': pillar.color }}
              >
                <div className="pillar-icon">
                  <pillar.icon size={32} />
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </div>
            ))}
          </div>

          <div className="nird-origin">
            <div className="origin-content">
              <School size={48} />
              <div>
                <h3>Né au Lycée Carnot</h3>
                <p>
                  Le projet NIRD est né au lycée Carnot de Bruay-la-Buissière (Hauts-de-France). 
                  Porté par des élèves et enseignants passionnés, il prouve qu'un autre numérique 
                  est possible dans l'Éducation nationale.
                </p>
                <a 
                  href="https://nird.forge.apps.education.fr/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  Visiter le site NIRD officiel
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="solutions-section" id="solutions">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Les alternatives</span>
            <h2>La Potion Magique du Libre</h2>
            <p>
              Des solutions libres, gratuites et performantes pour chaque usage. 
              Le logiciel libre, c'est notre potion magique !
            </p>
          </div>

          <div className="solutions-grid">
            {solutions.map((solution, index) => (
              <div key={index} className="solution-card">
                <span className="solution-icon">{solution.icon}</span>
                <h3>{solution.name}</h3>
                <p>{solution.description}</p>
                <div className="solution-replaces">
                  <span>Remplace</span>
                  <strong>{solution.replaces}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="quick-access-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Accès rapide</span>
            <h2>Que voulez-vous faire ?</h2>
          </div>
          
          <div className="quick-access-grid">
            <Link to="/quiz" className="quick-access-card quiz-card">
              <div className="card-icon">🎯</div>
              <h3>Faire le Quiz</h3>
              <p>Évaluez le niveau de dépendance numérique de votre établissement en 10 questions</p>
              <span className="card-action">
                Commencer le quiz
                <ArrowRight size={18} />
              </span>
            </Link>

            <Link to="/register" className="quick-access-card register-card">
              <div className="card-icon">🏰</div>
              <h3>Rejoindre le Village</h3>
              <p>Créez un compte pour accéder à la plateforme et contribuer à la communauté NIRD</p>
              <span className="card-action">
                Créer un compte
                <ArrowRight size={18} />
              </span>
            </Link>

            <Link to="/login" className="quick-access-card login-card">
              <div className="card-icon">🔑</div>
              <h3>Se Connecter</h3>
              <p>Vous avez déjà un compte ? Connectez-vous pour accéder à votre espace</p>
              <span className="card-action">
                Connexion
                <ArrowRight size={18} />
              </span>
            </Link>

            <a href="https://nird.forge.apps.education.fr/" target="_blank" rel="noopener noreferrer" className="quick-access-card external-card">
              <div className="card-icon">🌐</div>
              <h3>Site Officiel NIRD</h3>
              <p>Découvrez le projet NIRD en détail sur le site officiel</p>
              <span className="card-action">
                Visiter le site
                <ExternalLink size={18} />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Rejoignez le Village des Irréductibles !</h2>
            <p>
              Testez le niveau de dépendance numérique de votre établissement, 
              découvrez les solutions adaptées et rejoignez la communauté NIRD.
            </p>
            <div className="cta-actions">
              <Link to="/quiz" className="btn btn-primary btn-lg">
                <Zap size={20} />
                Faire le quiz
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                <Users size={20} />
                Créer un compte
              </Link>
            </div>
          </div>
          <div className="cta-visual">
            <div className="cta-characters">
              <Asterix size={100} animated={true} />
              <Obelix size={130} animated={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Shield size={24} />
              <span>NIRD</span>
              <p>Numérique Inclusif, Responsable et Durable</p>
            </div>
            <div className="footer-links">
              <a href="https://nird.forge.apps.education.fr/" target="_blank" rel="noopener noreferrer">
                Site officiel NIRD
              </a>
              <a href="https://www.cafepedagogique.net/2025/04/27/bruay-labuissiere-voyage-au-centre-du-libre-educatif/" target="_blank" rel="noopener noreferrer">
                Article Café Pédagogique
              </a>
            </div>
            <div className="footer-credits">
              <p>Projet réalisé lors de la Nuit de l'Info 2025</p>
              <p>Sous licence libre 🧡</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

