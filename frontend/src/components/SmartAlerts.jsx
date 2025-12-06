import { AlertTriangle, Clock, TrendingDown, CheckCircle, Zap, AlertCircle } from 'lucide-react';

const SmartAlerts = ({ stats, entity }) => {
  const alerts = [];

  // Calculer les alertes intelligentes
  if (stats) {
    // Alerte: Processus trop long (plus de 7 jours dans le même état)
    if (stats.timeInStates) {
      const currentState = entity?.currentState?.name;
      const currentStateTime = stats.timeInStates[currentState];
      if (currentStateTime && currentStateTime.days > 7) {
        alerts.push({
          type: 'warning',
          icon: Clock,
          title: 'Processus lent',
          message: `Cette entité est dans l'état "${entity?.currentState?.label}" depuis ${currentStateTime.days} jours`,
          suggestion: 'Envisagez de faire avancer le processus ou de demander une révision'
        });
      }
    }

    // Alerte: Trop de révisions (plus de 5 changements d'état)
    if (stats.stateChangeCount > 5) {
      alerts.push({
        type: 'info',
        icon: TrendingDown,
        title: 'Nombreuses itérations',
        message: `${stats.stateChangeCount} changements d'état détectés`,
        suggestion: 'Ce cycle de vie a connu plusieurs allers-retours. Vérifiez les points de blocage.'
      });
    }

    // Alerte: Pas de version depuis longtemps
    if (stats.versionCount === 1 && stats.ageInDays > 3) {
      alerts.push({
        type: 'info',
        icon: AlertCircle,
        title: 'Version unique',
        message: 'Aucune nouvelle version depuis la création',
        suggestion: 'Pensez à créer une nouvelle version pour documenter les évolutions'
      });
    }

    // Alerte positive: Processus fluide
    if (stats.stateChangeCount > 0 && stats.stateChangeCount <= 3 && stats.ageInDays < 7) {
      alerts.push({
        type: 'success',
        icon: Zap,
        title: 'Progression rapide !',
        message: 'Le cycle de vie progresse de manière fluide',
        suggestion: 'Continuez ainsi pour une finalisation rapide'
      });
    }

    // Alerte: Entité prête à être publiée
    if (entity?.currentState?.name === 'validated') {
      alerts.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Prêt pour publication',
        message: 'Cette entité est validée et peut être publiée',
        suggestion: 'Passez à l\'état "Publié" pour finaliser le cycle'
      });
    }
  }

  // Prédiction basique du temps restant
  const getPrediction = () => {
    if (!stats || !entity) return null;

    const stateOrder = ['draft', 'submitted', 'review', 'validated', 'published'];
    const currentIndex = stateOrder.indexOf(entity.currentState?.name);
    
    if (currentIndex === -1 || currentIndex >= stateOrder.length - 1) return null;

    const remainingSteps = stateOrder.length - 1 - currentIndex;
    const avgTimePerStep = stats.ageInDays / Math.max(stats.stateChangeCount, 1);
    const estimatedDays = Math.round(remainingSteps * avgTimePerStep);

    return {
      remainingSteps,
      estimatedDays,
      probability: Math.max(20, 100 - (stats.stateChangeCount * 10)) // Probabilité basique
    };
  };

  const prediction = getPrediction();

  if (alerts.length === 0 && !prediction) {
    return null;
  }

  return (
    <div className="smart-alerts">
      <h4>🔔 Alertes & Prédictions</h4>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="alerts-list">
          {alerts.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <div key={index} className={`alert-item ${alert.type}`}>
                <div className="alert-icon">
                  <Icon size={18} />
                </div>
                <div className="alert-content">
                  <span className="alert-title">{alert.title}</span>
                  <span className="alert-message">{alert.message}</span>
                  <span className="alert-suggestion">💡 {alert.suggestion}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Prédictions */}
      {prediction && (
        <div className="prediction-box">
          <h5>🔮 Prédiction</h5>
          <div className="prediction-content">
            <div className="prediction-item">
              <span className="pred-label">Étapes restantes</span>
              <span className="pred-value">{prediction.remainingSteps}</span>
            </div>
            <div className="prediction-item">
              <span className="pred-label">Temps estimé</span>
              <span className="pred-value">~{prediction.estimatedDays} jours</span>
            </div>
            <div className="prediction-item">
              <span className="pred-label">Probabilité de succès</span>
              <div className="probability-bar">
                <div 
                  className="probability-fill"
                  style={{ width: `${prediction.probability}%` }}
                />
                <span className="probability-text">{prediction.probability}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .smart-alerts {
          margin-top: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #1e1e2e 0%, #2d2d3d 100%);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .smart-alerts h4 {
          margin-bottom: 12px;
          font-size: 0.95rem;
          color: #ffd700;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }

        .alert-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .alert-item.warning {
          background: rgba(245, 158, 11, 0.1);
          border-color: #f59e0b;
        }

        .alert-item.warning .alert-icon { color: #f59e0b; }

        .alert-item.info {
          background: rgba(59, 130, 246, 0.1);
          border-color: #3b82f6;
        }

        .alert-item.info .alert-icon { color: #3b82f6; }

        .alert-item.success {
          background: rgba(16, 185, 129, 0.1);
          border-color: #10b981;
        }

        .alert-item.success .alert-icon { color: #10b981; }

        .alert-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .alert-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .alert-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: white;
        }

        .alert-message {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.7);
        }

        .alert-suggestion {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
          font-style: italic;
        }

        .prediction-box {
          padding: 12px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .prediction-box h5 {
          margin-bottom: 12px;
          color: #a78bfa;
          font-size: 0.85rem;
        }

        .prediction-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .prediction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pred-label {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
        }

        .pred-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
        }

        .probability-bar {
          position: relative;
          width: 100px;
          height: 20px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          overflow: hidden;
        }

        .probability-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399);
          border-radius: 10px;
          transition: width 0.5s ease;
        }

        .probability-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default SmartAlerts;

