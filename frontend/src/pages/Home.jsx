import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { entitiesApi, statesApi } from '../services/api';
import {
  Search,
  Filter,
  Plus,
  Clock,
  User,
  Tag,
  ChevronRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Home = () => {
  const [entities, setEntities] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    stateId: '',
    type: '',
    priority: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    loadStates();
  }, []);

  useEffect(() => {
    loadEntities();
  }, [filters, pagination.page]);

  const loadStates = async () => {
    try {
      const data = await statesApi.getAll();
      setStates(data.states);
    } catch (err) {
      console.error('Error loading states:', err);
    }
  };

  const loadEntities = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.stateId && { stateId: filters.stateId }),
        ...(filters.type && { type: filters.type }),
        ...(filters.priority && { priority: filters.priority }),
      };

      const data = await entitiesApi.getAll(params);
      setEntities(data.entities);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
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

  return (
    <div className="page home-page">
      <header className="page-header">
        <div className="header-content">
          <h1>Mes Entités</h1>
          <p>Gérez et suivez le cycle de vie de vos projets</p>
        </div>
        <Link to="/app/solutions/new" className="btn btn-primary">
          <Plus size={20} />
          <span>Nouvelle Entité</span>
        </Link>
      </header>

      <div className="filters-bar">
        <div className="search-input">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher une entité..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={filters.stateId}
            onChange={(e) => handleFilterChange('stateId', e.target.value)}
          >
            <option value="">Tous les états</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.label}
              </option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">Tous les types</option>
            <option value="article">Article</option>
            <option value="project">Projet</option>
            <option value="document">Document</option>
            <option value="task">Tâche</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">Toutes priorités</option>
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="critical">Critique</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <Loader2 className="spinner" size={40} />
          <p>Chargement des entités...</p>
        </div>
      ) : entities.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>Aucune entité trouvée</h3>
          <p>Commencez par créer votre première entité</p>
          <Link to="/app/solutions/new" className="btn btn-primary">
            <Plus size={20} />
            <span>Créer une entité</span>
          </Link>
        </div>
      ) : (
        <>
          <div className="entities-grid">
            {entities.map((entity) => (
              <Link
                key={entity.id}
                to={`/app/solutions/${entity.id}`}
                className="entity-card"
              >
                <div className="card-header">
                  <span
                    className="state-badge"
                    style={{ backgroundColor: entity.currentState?.color }}
                  >
                    {entity.currentState?.label}
                  </span>
                  <span className={`priority-badge ${priorityColors[entity.priority]}`}>
                    {priorityLabels[entity.priority]}
                  </span>
                </div>

                <h3 className="card-title">{entity.name}</h3>

                {entity.description && (
                  <p className="card-description">
                    {entity.description.substring(0, 100)}
                    {entity.description.length > 100 ? '...' : ''}
                  </p>
                )}

                <div className="card-meta">
                  <div className="meta-item">
                    <User size={14} />
                    <span>{entity.creator?.name || 'Anonyme'}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>
                      {format(new Date(entity.createdAt), 'dd MMM yyyy', {
                        locale: fr,
                      })}
                    </span>
                  </div>
                </div>

                {entity.tags && entity.tags.length > 0 && (
                  <div className="card-tags">
                    <Tag size={14} />
                    {entity.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                    {entity.tags.length > 3 && (
                      <span className="tag-more">+{entity.tags.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="card-footer">
                  <span className="view-link">
                    Voir les détails
                    <ChevronRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Précédent
              </button>
              <span className="pagination-info">
                Page {pagination.page} sur {pagination.pages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={pagination.page === pagination.pages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;

