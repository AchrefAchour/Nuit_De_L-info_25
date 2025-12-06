import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { entitiesApi, statesApi, versionsApi, filesApi, statsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  GitBranch,
  FileText,
  Clock,
  User,
  Tag,
  ChevronDown,
  Upload,
  Download,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Timeline from '../components/Timeline';
import EntityStats from '../components/EntityStats';
import ExportReport from '../components/ExportReport';
import SmartAlerts from '../components/SmartAlerts';

const EntityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [entity, setEntity] = useState(null);
  const [states, setStates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showStateMenu, setShowStateMenu] = useState(false);
  const [stateComment, setStateComment] = useState('');
  const [changingState, setChangingState] = useState(false);

  const [showVersionModal, setShowVersionModal] = useState(false);
  const [newVersionContent, setNewVersionContent] = useState('');
  const [newVersionSummary, setNewVersionSummary] = useState('');
  const [creatingVersion, setCreatingVersion] = useState(false);

  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedVersionForUpload, setSelectedVersionForUpload] = useState(null);
  const [downloadingFile, setDownloadingFile] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entityData, statesData, statsData] = await Promise.all([
        entitiesApi.getById(id),
        statesApi.getAll(),
        statsApi.getEntityStats(id),
      ]);

      setEntity(entityData.entity);
      setStates(statesData.states);
      setStats(statsData.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = async (newStateId) => {
    setChangingState(true);
    try {
      await entitiesApi.changeState(id, newStateId, stateComment);
      await loadData();
      setShowStateMenu(false);
      setStateComment('');
    } catch (err) {
      setError(err.message);
    } finally {
      setChangingState(false);
    }
  };

  const handleCreateVersion = async () => {
    setCreatingVersion(true);
    try {
      await versionsApi.create(id, {
        content: newVersionContent,
        summary: newVersionSummary,
      });
      await loadData();
      setShowVersionModal(false);
      setNewVersionContent('');
      setNewVersionSummary('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingVersion(false);
    }
  };

  const handleFileUpload = async (event, versionId) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      await filesApi.upload(versionId, file);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingFile(false);
      setSelectedVersionForUpload(null);
    }
  };

  const handleFileDownload = async (fileId, filename) => {
    setDownloadingFile(fileId);
    try {
      await filesApi.download(fileId, filename);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleDeleteEntity = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette entité ?')) {
      return;
    }

    try {
      await entitiesApi.delete(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const priorityColors = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
    critical: 'priority-critical',
  };

  const priorityLabels = {
    low: 'Faible',
    medium: 'Moyen',
    high: 'Haute',
    critical: 'Critique',
  };

  if (loading) {
    return (
      <div className="page entity-detail-page">
        <div className="loading-container">
          <Loader2 className="spinner" size={40} />
          <p>Chargement de l'entité...</p>
        </div>
      </div>
    );
  }

  if (error && !entity) {
    return (
      <div className="page entity-detail-page">
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <Link to="/app" className="btn btn-secondary">
          <ArrowLeft size={18} />
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="page entity-detail-page">
      {/* Header */}
      <header className="detail-header">
        <Link to="/app" className="back-link">
          <ArrowLeft size={20} />
          <span>Retour</span>
        </Link>

        <div className="header-content">
          <div className="header-main">
            <h1>{entity.name}</h1>
            <div className="header-badges">
              <span
                className="state-badge large"
                style={{ backgroundColor: entity.currentState?.color }}
              >
                {entity.currentState?.label}
              </span>
              <span className={`priority-badge ${priorityColors[entity.priority]}`}>
                {priorityLabels[entity.priority]}
              </span>
            </div>
          </div>

          <div className="header-actions">
            <div className="state-dropdown">
              <button
                className="btn btn-secondary"
                onClick={() => setShowStateMenu(!showStateMenu)}
              >
                Changer l'état
                <ChevronDown size={18} />
              </button>

              {showStateMenu && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <input
                      type="text"
                      placeholder="Commentaire (optionnel)"
                      value={stateComment}
                      onChange={(e) => setStateComment(e.target.value)}
                      className="comment-input"
                    />
                  </div>
                  <div className="dropdown-options">
                    {states.map((state) => (
                      <button
                        key={state.id}
                        className={`dropdown-option ${
                          state.id === entity.currentStateId ? 'active' : ''
                        }`}
                        onClick={() => handleStateChange(state.id)}
                        disabled={changingState}
                      >
                        <span
                          className="state-dot"
                          style={{ backgroundColor: state.color }}
                        />
                        <span>{state.label}</span>
                        {state.id === entity.currentStateId && (
                          <CheckCircle size={16} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className="btn btn-danger"
              onClick={handleDeleteEntity}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="detail-grid">
        {/* Left Column */}
        <div className="detail-main">
          {/* Description */}
          <section className="detail-section">
            <h2>Description</h2>
            <div className="description-content">
              {entity.description || (
                <span className="empty-text">Aucune description</span>
              )}
            </div>
          </section>

          {/* Timeline */}
          <section className="detail-section">
            <h2>
              <Clock size={20} />
              Historique
            </h2>
            {entity.history && entity.history.length > 0 ? (
              <Timeline events={entity.history} />
            ) : (
              <p className="empty-text">Aucun historique disponible</p>
            )}
          </section>

          {/* Versions */}
          <section className="detail-section">
            <div className="section-header">
              <h2>
                <GitBranch size={20} />
                Versions ({entity.versions?.length || 0})
              </h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowVersionModal(true)}
              >
                <Plus size={16} />
                Nouvelle version
              </button>
            </div>

            {entity.versions && entity.versions.length > 0 ? (
              <div className="versions-list">
                {entity.versions.map((version) => (
                  <div
                    key={version.id}
                    className={`version-card ${version.isCurrent ? 'current' : ''}`}
                  >
                    <div className="version-header">
                      <span className="version-number">
                        v{version.versionNumber}
                        {version.isCurrent && (
                          <span className="current-badge">Actuelle</span>
                        )}
                      </span>
                      <span className="version-date">
                        {format(new Date(version.createdAt), 'dd MMM yyyy HH:mm', {
                          locale: fr,
                        })}
                      </span>
                    </div>

                    {version.summary && (
                      <p className="version-summary">{version.summary}</p>
                    )}

                    <div className="version-author">
                      <User size={14} />
                      <span>{version.createdBy?.name || 'Inconnu'}</span>
                    </div>

                    {/* Files */}
                    {version.files && version.files.length > 0 && (
                      <div className="version-files">
                        {version.files.map((file) => (
                          <button
                            key={file.id}
                            onClick={() => handleFileDownload(file.id, file.originalName)}
                            className="file-item"
                            disabled={downloadingFile === file.id}
                          >
                            <FileText size={14} />
                            <span>{file.originalName}</span>
                            {downloadingFile === file.id ? (
                              <Loader2 size={14} className="spinner" />
                            ) : (
                              <Download size={14} />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="version-actions">
                      <label className="upload-btn">
                        <Upload size={14} />
                        <span>Ajouter fichier</span>
                        <input
                          type="file"
                          hidden
                          onChange={(e) => handleFileUpload(e, version.id)}
                          disabled={uploadingFile}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">Aucune version</p>
            )}
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="detail-sidebar">
          {/* Stats */}
          {stats && <EntityStats stats={stats} />}

          {/* Alertes intelligentes & Prédictions */}
          <SmartAlerts stats={stats} entity={entity} />

          {/* Export des rapports */}
          <ExportReport entity={entity} stats={stats} history={entity.history} />

          {/* Meta Info */}
          <div className="sidebar-section">
            <h3>Informations</h3>
            <div className="meta-list">
              <div className="meta-item">
                <span className="meta-label">Type</span>
                <span className="meta-value">{entity.type || 'article'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Créé par</span>
                <span className="meta-value">{entity.creator?.name || 'Inconnu'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Créé le</span>
                <span className="meta-value">
                  {format(new Date(entity.createdAt), 'dd MMM yyyy', { locale: fr })}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Dernière modification</span>
                <span className="meta-value">
                  {format(new Date(entity.updatedAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                </span>
              </div>
              {entity.dueDate && (
                <div className="meta-item">
                  <span className="meta-label">Échéance</span>
                  <span className="meta-value">
                    {format(new Date(entity.dueDate), 'dd MMM yyyy', { locale: fr })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {entity.tags && entity.tags.length > 0 && (
            <div className="sidebar-section">
              <h3>
                <Tag size={16} />
                Tags
              </h3>
              <div className="tags-list">
                {entity.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contributors */}
          {entity.contributors && entity.contributors.length > 0 && (
            <div className="sidebar-section">
              <h3>
                <User size={16} />
                Contributeurs
              </h3>
              <div className="contributors-list compact">
                {entity.contributors.map((contributor) => (
                  <div key={contributor.id} className="contributor-item">
                    <div className="contributor-avatar">
                      {contributor.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="contributor-info">
                      <span className="name">{contributor.name}</span>
                      <span className="role">
                        {contributor.EntityContributor?.role || 'editor'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* New Version Modal */}
      {showVersionModal && (
        <div className="modal-overlay" onClick={() => setShowVersionModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Créer une nouvelle version</h2>
              <button
                className="close-btn"
                onClick={() => setShowVersionModal(false)}
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Résumé des modifications</label>
                <input
                  type="text"
                  value={newVersionSummary}
                  onChange={(e) => setNewVersionSummary(e.target.value)}
                  placeholder="Ex: Correction de bugs, Ajout de fonctionnalités..."
                />
              </div>

              <div className="form-group">
                <label>Contenu</label>
                <textarea
                  value={newVersionContent}
                  onChange={(e) => setNewVersionContent(e.target.value)}
                  placeholder="Contenu de cette version..."
                  rows={6}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowVersionModal(false)}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateVersion}
                disabled={creatingVersion}
              >
                {creatingVersion ? (
                  <Loader2 className="spinner" size={18} />
                ) : (
                  'Créer la version'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityDetail;

