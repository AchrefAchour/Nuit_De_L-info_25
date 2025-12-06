import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { entitiesApi, contributorsApi } from '../services/api';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Loader2,
  User,
  Calendar,
  Tag as TagIcon,
  X,
} from 'lucide-react';

const EntityCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    type: 'article',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: [],
    contributors: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingContributors, setLoadingContributors] = useState(true);

  useEffect(() => {
    loadContributors();
  }, []);

  const loadContributors = async () => {
    try {
      const data = await contributorsApi.getAll({ limit: 100 });
      setContributors(data.contributors);
    } catch (err) {
      console.error('Error loading contributors:', err);
    } finally {
      setLoadingContributors(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleContributorToggle = (contributorId) => {
    setFormData((prev) => {
      const exists = prev.contributors.find((c) => c.id === contributorId);
      if (exists) {
        return {
          ...prev,
          contributors: prev.contributors.filter((c) => c.id !== contributorId),
        };
      }
      return {
        ...prev,
        contributors: [...prev.contributors, { id: contributorId, role: 'editor' }],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Clean and prepare data for submission
      const submitData = {
        name: formData.name.trim(),
        type: formData.type || 'article',
        description: formData.description.trim() || undefined,
        priority: formData.priority || 'medium',
        dueDate: formData.dueDate || undefined,
        tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
        contributors: formData.contributors && formData.contributors.length > 0 
          ? formData.contributors.map(c => ({ id: c.id, role: c.role || 'editor' }))
          : undefined,
      };

      // Remove undefined values
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      console.log('[EntityCreate] Submitting cleaned data:', submitData);
      const data = await entitiesApi.create(submitData);
      navigate(`/app/solutions/${data.entity.id}`);
    } catch (err) {
      console.error('[EntityCreate] Error creating entity:', err);
      // Show detailed validation errors if available
      if (err.message && err.message.includes('Validation failed')) {
        setError(err.message);
      } else if (err.details && Array.isArray(err.details)) {
        const errorDetails = err.details.map(d => `${d.field}: ${d.message}`).join(', ');
        setError(`Erreur de validation: ${errorDetails}`);
      } else {
        setError(err.message || 'Erreur lors de la création de l\'entité');
      }
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'article', label: 'Article' },
    { value: 'project', label: 'Projet' },
    { value: 'document', label: 'Document' },
    { value: 'task', label: 'Tâche' },
    { value: 'report', label: 'Rapport' },
    { value: 'other', label: 'Autre' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Faible', color: '#10b981' },
    { value: 'medium', label: 'Moyenne', color: '#f59e0b' },
    { value: 'high', label: 'Haute', color: '#ef4444' },
    { value: 'critical', label: 'Critique', color: '#7c3aed' },
  ];

  return (
    <div className="page entity-create-page">
      <header className="page-header">
        <Link to="/app" className="back-link">
          <ArrowLeft size={20} />
          <span>Retour</span>
        </Link>
        <div className="header-content">
          <h1>Créer une nouvelle entité</h1>
          <p>Remplissez les informations pour créer une nouvelle entité</p>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-grid">
          {/* Main Form */}
          <div className="form-main">
            <div className="form-card">
              <h2>Informations générales</h2>

              <div className="form-group">
                <label htmlFor="name">
                  Nom de l'entité <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Mon nouveau projet"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priorité</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez votre entité..."
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">
                  <Calendar size={16} />
                  Date d'échéance
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  <TagIcon size={16} />
                  Tags
                </label>
                <div className="tags-input-container">
                  <div className="tags-list">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="tag editable">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Appuyez sur Entrée pour ajouter un tag"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="form-sidebar">
            <div className="form-card">
              <h2>
                <User size={18} />
                Contributeurs
              </h2>

              {loadingContributors ? (
                <div className="loading-small">
                  <Loader2 className="spinner" size={20} />
                </div>
              ) : (
                <div className="contributors-select">
                  {contributors.map((contributor) => (
                    <label
                      key={contributor.id}
                      className={`contributor-option ${
                        formData.contributors.find((c) => c.id === contributor.id)
                          ? 'selected'
                          : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.contributors.some(
                          (c) => c.id === contributor.id
                        )}
                        onChange={() => handleContributorToggle(contributor.id)}
                      />
                      <div className="contributor-avatar">
                        {contributor.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="contributor-info">
                        <span className="name">{contributor.name}</span>
                        <span className="email">{contributor.email}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/')}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !formData.name.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner" size={18} />
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Créer l'entité</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EntityCreate;

