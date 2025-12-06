import { useState, useEffect } from 'react';
import { contributorsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Users,
  Mail,
  Shield,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Contributors = () => {
  const { user } = useAuth();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    loadContributors();
  }, [filters, pagination.page]);

  const loadContributors = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role }),
      };

      const data = await contributorsApi.getAll(params);
      setContributors(data.contributors);
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

  const handleDelete = async (contributorId, contributorName) => {
    if (contributorId === user?.id) {
      alert('Vous ne pouvez pas supprimer votre propre compte !');
      return;
    }
    
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${contributorName}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await contributorsApi.delete(contributorId);
      loadContributors();
    } catch (err) {
      setError(err.message);
    }
  };

  const isAdmin = user?.role === 'admin';

  const roleLabels = {
    admin: { label: 'Admin', color: '#7c3aed' },
    contributor: { label: 'Contributeur', color: '#3b82f6' },
    viewer: { label: 'Lecteur', color: '#6b7280' },
  };

  return (
    <div className="page contributors-page">
      <header className="page-header">
        <div className="header-content">
          <h1>Contributeurs</h1>
          <p>Gérez les utilisateurs de la plateforme</p>
        </div>
      </header>

      <div className="filters-bar">
        <div className="search-input">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher un contributeur..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
          >
            <option value="">Tous les rôles</option>
            <option value="admin">Admin</option>
            <option value="contributor">Contributeur</option>
            <option value="viewer">Lecteur</option>
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
          <p>Chargement des contributeurs...</p>
        </div>
      ) : contributors.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>Aucun contributeur trouvé</h3>
          <p>Aucun utilisateur ne correspond à vos critères</p>
        </div>
      ) : (
        <>
          <div className="contributors-grid">
            {contributors.map((contributor) => (
              <div key={contributor.id} className="contributor-card">
                <div className="card-header">
                  <div className="avatar-large">
                    {contributor.avatar ? (
                      <img src={contributor.avatar} alt={contributor.name} />
                    ) : (
                      contributor.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div
                    className="status-indicator"
                    style={{
                      backgroundColor: contributor.isActive ? '#10b981' : '#ef4444',
                    }}
                    title={contributor.isActive ? 'Actif' : 'Inactif'}
                  />
                </div>

                <div className="card-body">
                  <h3>{contributor.name}</h3>
                  <div className="info-row">
                    <Mail size={14} />
                    <span>{contributor.email}</span>
                  </div>
                  <div className="info-row">
                    <Shield size={14} />
                    <span
                      className="role-badge"
                      style={{
                        backgroundColor: roleLabels[contributor.role]?.color,
                      }}
                    >
                      {roleLabels[contributor.role]?.label}
                    </span>
                  </div>
                  {contributor.lastLogin && (
                    <div className="info-row">
                      <Clock size={14} />
                      <span>
                        Dernière connexion:{' '}
                        {format(new Date(contributor.lastLogin), 'dd MMM yyyy', {
                          locale: fr,
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <span
                    className={`status-badge ${
                      contributor.isActive ? 'active' : 'inactive'
                    }`}
                  >
                    {contributor.isActive ? (
                      <>
                        <CheckCircle size={14} />
                        Actif
                      </>
                    ) : (
                      <>
                        <XCircle size={14} />
                        Inactif
                      </>
                    )}
                  </span>
                  {contributor.id === user?.id && (
                    <span className="current-user-badge">Vous</span>
                  )}
                  {isAdmin && contributor.id !== user?.id && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(contributor.id, contributor.name)}
                      title="Supprimer ce contributeur"
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        marginLeft: 'auto'
                      }}
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
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

export default Contributors;


