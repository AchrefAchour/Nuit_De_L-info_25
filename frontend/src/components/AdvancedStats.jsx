import { Clock, TrendingUp, RefreshCw, CheckCircle, XCircle, Zap } from 'lucide-react';

const AdvancedStats = ({ stats }) => {
  // Calculs des métriques avancées
  const calculateMetrics = () => {
    if (!stats) return null;

    const totalEntities = stats.totalEntities || 0;
    const publishedCount = stats.entitiesByState?.find(s => s.state?.name === 'published')?.count || 0;
    const rejectedCount = stats.entitiesByState?.find(s => s.state?.name === 'rejected')?.count || 0;
    const draftCount = stats.entitiesByState?.find(s => s.state?.name === 'draft')?.count || 0;

    // Taux de succès (publié / total - brouillons)
    const completedEntities = totalEntities - draftCount;
    const successRate = completedEntities > 0 
      ? Math.round((publishedCount / completedEntities) * 100) 
      : 0;

    // Taux de rejet
    const rejectionRate = completedEntities > 0 
      ? Math.round((rejectedCount / completedEntities) * 100) 
      : 0;

    // Activité moyenne par jour (30 derniers jours)
    const avgActivityPerDay = stats.recentActivity 
      ? Math.round(stats.recentActivity / 30 * 10) / 10 
      : 0;

    // Versions par entité
    const avgVersionsPerEntity = totalEntities > 0 
      ? Math.round((stats.totalVersions / totalEntities) * 10) / 10 
      : 0;

    return {
      successRate,
      rejectionRate,
      avgActivityPerDay,
      avgVersionsPerEntity,
      totalTransitions: stats.recentActivity || 0,
      publishedCount,
      totalEntities
    };
  };

  const metrics = calculateMetrics();

  if (!metrics) {
    return <div className="advanced-stats-loading">Chargement des statistiques...</div>;
  }

  return (
    <div className="advanced-stats">
      <h3 className="stats-title">📊 Métriques du Cycle de Vie</h3>
      
      <div className="metrics-grid">
        {/* Taux de succès */}
        <div className="metric-card success">
          <div className="metric-icon">
            <CheckCircle size={28} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{metrics.successRate}%</span>
            <span className="metric-label">Taux de succès</span>
            <span className="metric-detail">
              {metrics.publishedCount} publiés sur {metrics.totalEntities}
            </span>
          </div>
          <div 
            className="metric-progress"
            style={{ width: `${metrics.successRate}%` }}
          />
        </div>

        {/* Taux de rejet */}
        <div className="metric-card danger">
          <div className="metric-icon">
            <XCircle size={28} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{metrics.rejectionRate}%</span>
            <span className="metric-label">Taux de rejet</span>
            <span className="metric-detail">
              Solutions non validées
            </span>
          </div>
          <div 
            className="metric-progress danger"
            style={{ width: `${metrics.rejectionRate}%` }}
          />
        </div>

        {/* Activité moyenne */}
        <div className="metric-card info">
          <div className="metric-icon">
            <Zap size={28} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{metrics.avgActivityPerDay}</span>
            <span className="metric-label">Actions / jour</span>
            <span className="metric-detail">
              Moyenne sur 30 jours
            </span>
          </div>
        </div>

        {/* Itérations moyennes */}
        <div className="metric-card warning">
          <div className="metric-icon">
            <RefreshCw size={28} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{metrics.avgVersionsPerEntity}</span>
            <span className="metric-label">Versions / entité</span>
            <span className="metric-detail">
              Nombre d'itérations moyen
            </span>
          </div>
        </div>

        {/* Transitions totales */}
        <div className="metric-card primary">
          <div className="metric-icon">
            <TrendingUp size={28} />
          </div>
          <div className="metric-content">
            <span className="metric-value">{metrics.totalTransitions}</span>
            <span className="metric-label">Transitions</span>
            <span className="metric-detail">
              Changements d'état (30j)
            </span>
          </div>
        </div>

        {/* Temps estimé */}
        <div className="metric-card secondary">
          <div className="metric-icon">
            <Clock size={28} />
          </div>
          <div className="metric-content">
            <span className="metric-value">~3j</span>
            <span className="metric-label">Temps moyen</span>
            <span className="metric-detail">
              Du brouillon à la publication
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .advanced-stats {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .stats-title {
          color: #ffd700;
          font-size: 1.25rem;
          margin-bottom: 24px;
          text-align: center;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .metric-card {
          position: relative;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .metric-card.success .metric-icon { color: #10b981; }
        .metric-card.danger .metric-icon { color: #ef4444; }
        .metric-card.info .metric-icon { color: #3b82f6; }
        .metric-card.warning .metric-icon { color: #f59e0b; }
        .metric-card.primary .metric-icon { color: #8b5cf6; }
        .metric-card.secondary .metric-icon { color: #6366f1; }

        .metric-icon {
          flex-shrink: 0;
          padding: 12px;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
        }

        .metric-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metric-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          line-height: 1;
        }

        .metric-label {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.9);
          font-weight: 600;
        }

        .metric-detail {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
        }

        .metric-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 4px;
          background: linear-gradient(90deg, #10b981, #34d399);
          border-radius: 0 4px 4px 0;
          transition: width 1s ease-out;
        }

        .metric-progress.danger {
          background: linear-gradient(90deg, #ef4444, #f87171);
        }

        .advanced-stats-loading {
          text-align: center;
          padding: 40px;
          color: rgba(255,255,255,0.5);
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedStats;

