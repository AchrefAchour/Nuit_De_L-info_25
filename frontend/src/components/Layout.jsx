import { useState, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Shield,
  BookOpen,
  Map,
  Volume2,
  VolumeX,
} from 'lucide-react';
import AiAssistant from './AiAssistant';
import { Idefix } from './GauloisCharacters';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

  const navItems = [
    { to: '/app', icon: Home, label: 'Solutions Libres' },
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/app/community', icon: Users, label: 'Communauté' },
    { to: '/app/settings', icon: Settings, label: 'Paramètres' },
  ];

  return (
    <div className="layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="logo">
          <Shield className="logo-icon" />
          <span>NIRD</span>
        </div>
      </header>

      {/* Audio element */}
      <audio ref={audioRef} src="/audio/background.mp3" loop preload="auto" />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
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
              marginRight: '10px',
              transition: 'all 0.3s ease'
            }}
            title={musicOn ? 'Couper la musique' : 'Jouer la musique'}
          >
            {musicOn ? <Volume2 size={18} color="white" /> : <VolumeX size={18} color="white" />}
          </button>
          <div className="logo">
            <Shield className="logo-icon" />
            <span>NIRD</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              end={item.to === '/'}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/app/solutions/new"
            className="create-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <PlusCircle size={20} />
            <span>Ajouter une Solution</span>
          </NavLink>

          <div className="sidebar-mascot">
            <Idefix size={50} animated={true} />
          </div>

          <div className="user-section">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* AI Assistant */}
      <AiAssistant />
    </div>
  );
};

export default Layout;

