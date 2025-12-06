import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsApi } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Activity,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import StatsChart from '../components/StatsChart';
import ActivityChart from '../components/ActivityChart';
import LifecycleDiagram from '../components/LifecycleDiagram';
import AdvancedStats from '../components/AdvancedStats';
import Badges from '../components/Badges';
import Lifecycle3D from '../components/Lifecycle3D';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [topContributors, setTopContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, timelineData, contributorsData] = await Promise.all([
        statsApi.getGlobal(),
        statsApi.getTimeline(30),
        statsApi.getTopContributors(5),
      ]);

      setStats(statsData.stats);
      setTimeline(timelineData.timeline);
      setTopContributors(contributorsData.topContributors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page dashboard-page">
        <div className="loading-container">
          <Loader2 className="spinner" size={40} />
          <p>Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page dashboard-page">
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p>Vue d'ensemble de votre activité</p>
        </div>
      </header>

      {/* 3D Lifecycle Visualization */}
      <div className="dashboard-card full-width">
        <div className="card-header">
          <h3>🌐 Cycle de Vie 3D Interactif</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <Lifecycle3D 
            states={stats?.entitiesByState?.map(s => s.currentState) || []}
            entitiesByState={stats?.entitiesByState || []}
          />
        </div>
      </div>

      {/* Lifecycle Diagram 2D */}
      <LifecycleDiagram entityStats={stats} />

      {/* Advanced Stats - 3 métriques clés */}
      <AdvancedStats stats={stats} />

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
            <FileText size={24} style={{ color: '#6366f1' }} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalEntities || 0}</span>
            <span className="stat-label">Entités totales</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <Users size={24} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalContributors || 0}</span>
            <span className="stat-label">Contributeurs actifs</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <BarChart3 size={24} style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalVersions || 0}</span>
            <span className="stat-label">Versions créées</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <Activity size={24} style={{ color: '#ef4444' }} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.recentActivity || 0}</span>
            <span className="stat-label">Actions (30j)</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="dashboard-grid">
        {/* Entities by State */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Entités par état</h3>
          </div>
          <div className="card-body">
            {stats?.entitiesByState && stats.entitiesByState.length > 0 ? (
              <StatsChart data={stats.entitiesByState} />
            ) : (
              <div className="empty-chart">
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Activité (30 derniers jours)</h3>
          </div>
          <div className="card-body">
            {timeline?.activity && timeline.activity.length > 0 ? (
              <ActivityChart data={timeline} />
            ) : (
              <div className="empty-chart">
                <p>Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>

        {/* Entities by Type */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Entités par type</h3>
          </div>
          <div className="card-body">
            {stats?.entitiesByType && stats.entitiesByType.length > 0 ? (
              <div className="type-list">
                {stats.entitiesByType.map((item, index) => (
                  <div key={index} className="type-item">
                    <span className="type-name">{item.type || 'Non défini'}</span>
                    <span className="type-count">{item.count}</span>
                    <div
                      className="type-bar"
                      style={{
                        width: `${(item.count / stats.totalEntities) * 100}%`,
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-chart">
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Top contributeurs</h3>
            <Link to="/app/community" className="card-link">
              Voir tous
            </Link>
          </div>
          <div className="card-body">
            {topContributors && topContributors.length > 0 ? (
              <div className="contributors-list">
                {topContributors.map((item, index) => (
                  <div key={index} className="contributor-item">
                    <div className="contributor-rank">#{index + 1}</div>
                    <div className="contributor-avatar">
                      {item.changedBy?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="contributor-info">
                      <span className="contributor-name">
                        {item.changedBy?.name || 'Inconnu'}
                      </span>
                      <span className="contributor-email">
                        {item.changedBy?.email}
                      </span>
                    </div>
                    <span className="contributor-count">
                      {item.activityCount} actions
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-chart">
                <p>Aucun contributeur</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Stats */}
      <div className="dashboard-card full-width">
        <div className="card-header">
          <h3>Résumé des 30 derniers jours</h3>
        </div>
        <div className="card-body">
          <div className="summary-grid">
            <div className="summary-item">
              <TrendingUp size={20} style={{ color: '#10b981' }} />
              <span className="summary-value">{stats?.newEntitiesLast30Days || 0}</span>
              <span className="summary-label">Nouvelles entités</span>
            </div>
            <div className="summary-item">
              <Activity size={20} style={{ color: '#6366f1' }} />
              <span className="summary-value">{stats?.recentActivity || 0}</span>
              <span className="summary-label">Actions totales</span>
            </div>
            <div className="summary-item">
              <FileText size={20} style={{ color: '#f59e0b' }} />
              <span className="summary-value">{stats?.totalFiles || 0}</span>
              <span className="summary-label">Fichiers uploadés</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gamification - Badges */}
      <div className="dashboard-card full-width">
        <div className="card-header">
          <h3>🏆 Vos Accomplissements</h3>
        </div>
        <div className="card-body">
          <Badges userStats={{
            createdEntities: stats?.totalEntities || 0,
            transitions: stats?.recentActivity || 0,
            maxVersions: stats?.totalVersions || 0,
            published: stats?.entitiesByState?.find(s => s.state?.name === 'published')?.count || 0,
            collaborations: stats?.totalContributors || 0
          }} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

