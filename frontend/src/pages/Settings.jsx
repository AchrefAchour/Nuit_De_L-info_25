import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import {
  User,
  Mail,
  Lock,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  Settings as SettingsIcon,
} from 'lucide-react';

const Settings = () => {
  const { user, updateProfile } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setProfileSuccess(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordSuccess(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setProfileLoading(true);

    try {
      await updateProfile(profileData);
      setProfileSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setPasswordLoading(true);

    try {
      await authApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleLabels = {
    admin: 'Administrateur',
    contributor: 'Contributeur',
    viewer: 'Lecteur',
  };

  return (
    <div className="page settings-page">
      <header className="page-header">
        <div className="header-content">
          <h1>
            <SettingsIcon size={28} />
            Paramètres
          </h1>
          <p>Gérez votre profil et vos préférences</p>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="settings-grid">
        {/* Profile Section */}
        <section className="settings-section">
          <div className="section-header">
            <User size={24} />
            <div>
              <h2>Profil</h2>
              <p>Modifiez vos informations personnelles</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="settings-form">
            <div className="profile-preview">
              <div className="avatar-large editable">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt={profileData.name} />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="profile-info">
                <span className="email">{user?.email}</span>
                <span className="role">
                  <Shield size={14} />
                  {roleLabels[user?.role] || user?.role}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">
                <User size={16} />
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="avatar">
                URL de l'avatar (optionnel)
              </label>
              <input
                type="url"
                id="avatar"
                name="avatar"
                value={profileData.avatar}
                onChange={handleProfileChange}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="form-actions">
              {profileSuccess && (
                <span className="success-message">
                  <CheckCircle size={16} />
                  Profil mis à jour
                </span>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={profileLoading}
              >
                {profileLoading ? (
                  <Loader2 className="spinner" size={18} />
                ) : (
                  <>
                    <Save size={18} />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Password Section */}
        <section className="settings-section">
          <div className="section-header">
            <Lock size={24} />
            <div>
              <h2>Sécurité</h2>
              <p>Modifiez votre mot de passe</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="settings-form">
            <div className="form-group">
              <label htmlFor="currentPassword">
                Mot de passe actuel
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="form-actions">
              {passwordSuccess && (
                <span className="success-message">
                  <CheckCircle size={16} />
                  Mot de passe modifié
                </span>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <Loader2 className="spinner" size={18} />
                ) : (
                  <>
                    <Lock size={18} />
                    Changer le mot de passe
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Info Section */}
        <section className="settings-section info-section">
          <div className="section-header">
            <Shield size={24} />
            <div>
              <h2>À propos</h2>
              <p>Informations sur la plateforme</p>
            </div>
          </div>

          <div className="info-content">
            <div className="info-item">
              <span className="label">Version</span>
              <span className="value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="label">Plateforme</span>
              <span className="value">LifeCycle Tracker</span>
            </div>
            <div className="info-item">
              <span className="label">Hébergement</span>
              <span className="value">Local / Cloud Privé</span>
            </div>
            <div className="info-item description">
              <p>
                LifeCycle Tracker est une plateforme libre et indépendante pour
                gérer le cycle de vie de vos entités. Vos données restent sous
                votre contrôle, hébergées localement ou sur votre cloud privé.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;


