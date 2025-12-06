import {
  GitBranch,
  FileText,
  RefreshCw,
  Users,
  Clock,
  Calendar,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

const stateColors = {
  draft: '#6b7280',
  submitted: '#3b82f6',
  review: '#f59e0b',
  validated: '#10b981',
  published: '#8b5cf6',
  rejected: '#ef4444',
  initial: '#6b7280',
};

const stateLabels = {
  draft: 'Brouillon',
  submitted: 'Soumis',
  review: 'En révision',
  validated: 'Validé',
  published: 'Publié',
  rejected: 'Rejeté',
  initial: 'Initial',
};

const EntityStats = ({ stats }) => {
  if (!stats) return null;

  // Calculer le total du temps pour les pourcentages
  const totalTime = stats.timeInStates 
    ? Object.values(stats.timeInStates).reduce((sum, t) => sum + (t.milliseconds || 0), 0)
    : 0;

  return (
    <div className="entity-stats sidebar-section">
      <h3>📊 Statistiques du Cycle de Vie</h3>

      <div className="stats-list">
        <div className="stat-item">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
            <GitBranch size={16} style={{ color: '#8b5cf6' }} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.versionCount}</span>
            <span className="stat-label">Versions (itérations)</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <FileText size={16} style={{ color: '#3b82f6' }} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.fileCount}</span>
            <span className="stat-label">Fichiers attachés</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <RefreshCw size={16} style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.stateChangeCount}</span>
            <span className="stat-label">Transitions d'état</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <Users size={16} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.contributorCount}</span>
            <span className="stat-label">Contributeurs actifs</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <Calendar size={16} style={{ color: '#6366f1' }} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.ageInDays} jours</span>
            <span className="stat-label">Durée totale du cycle</span>
          </div>
        </div>
      </div>

      {/* Temps par état avec barres visuelles */}
      {stats.timeInStates && Object.keys(stats.timeInStates).length > 0 && (
        <div className="time-in-states">
          <h4>
            <Clock size={14} />
            ⏱️ Temps passé par état
          </h4>
          <div className="states-time-list">
            {Object.entries(stats.timeInStates).map(([state, time]) => {
              const percentage = totalTime > 0 ? Math.round((time.milliseconds / totalTime) * 100) : 0;
              const color = stateColors[state] || '#6b7280';
              const label = stateLabels[state] || state;
              
              return (
                <div key={state} className="state-time-item-visual">
                  <div className="state-time-header">
                    <span className="state-name" style={{ color }}>
                      {label}
                    </span>
                    <span className="state-time">{time.readable}</span>
                  </div>
                  <div className="state-time-bar">
                    <div 
                      className="state-time-fill"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                  <span className="state-percentage">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Indicateur de progression */}
      <div className="lifecycle-progress">
        <h4>
          <TrendingUp size={14} />
          Progression du cycle
        </h4>
        <div className="progress-indicator">
          <div className="progress-step completed">
            <CheckCircle size={16} />
            <span>Créé</span>
          </div>
          <div className="progress-line" />
          <div className={`progress-step ${stats.stateChangeCount > 0 ? 'completed' : ''}`}>
            <CheckCircle size={16} />
            <span>En cours</span>
          </div>
          <div className="progress-line" />
          <div className={`progress-step ${stats.stateChangeCount > 2 ? 'completed' : ''}`}>
            <CheckCircle size={16} />
            <span>Finalisé</span>
          </div>
        </div>
      </div>

      <style>{`
        .state-time-item-visual {
          margin-bottom: 12px;
        }
        
        .state-time-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 0.85rem;
        }
        
        .state-name {
          font-weight: 600;
          text-transform: capitalize;
        }
        
        .state-time {
          color: rgba(255,255,255,0.7);
        }
        
        .state-time-bar {
          height: 8px;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .state-time-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .state-percentage {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.5);
        }
        
        .lifecycle-progress {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        .lifecycle-progress h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.8);
        }
        
        .progress-indicator {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: rgba(255,255,255,0.3);
        }
        
        .progress-step.completed {
          color: #10b981;
        }
        
        .progress-step span {
          font-size: 0.7rem;
        }
        
        .progress-line {
          flex: 1;
          height: 2px;
          background: rgba(255,255,255,0.1);
          margin: 0 8px;
        }
      `}</style>
    </div>
  );
};

export default EntityStats;


