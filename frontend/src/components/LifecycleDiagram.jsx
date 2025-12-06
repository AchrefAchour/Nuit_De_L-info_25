import { useState, useEffect } from 'react';
import { statesApi } from '../services/api';
import { ArrowRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const LifecycleDiagram = ({ entityStats }) => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      const data = await statesApi.getAll();
      setStates(data.states || []);
    } catch (err) {
      console.error('Error loading states:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="lifecycle-loading">Chargement...</div>;
  }

  // Calculer les statistiques par état si disponibles
  const getStateStats = (stateName) => {
    if (!entityStats?.stateStats) return null;
    return entityStats.stateStats.find(s => s.name === stateName);
  };

  return (
    <div className="lifecycle-diagram">
      <h3 className="lifecycle-title">🔄 Cycle de Vie des Solutions</h3>
      
      <div className="lifecycle-flow">
        {states.map((state, index) => {
          const stats = getStateStats(state.name);
          const isLast = index === states.length - 1;
          
          return (
            <div key={state.id} className="lifecycle-step">
              <div 
                className={`lifecycle-node ${state.isInitial ? 'initial' : ''} ${state.isFinal ? 'final' : ''}`}
                style={{ 
                  borderColor: state.color,
                  backgroundColor: `${state.color}15`
                }}
              >
                <div 
                  className="node-indicator"
                  style={{ backgroundColor: state.color }}
                >
                  {state.order + 1}
                </div>
                <span className="node-label">{state.label}</span>
                
                {stats && (
                  <div className="node-stats">
                    <span className="stat-count">{stats.count || 0} entités</span>
                    {stats.avgTime && (
                      <span className="stat-time">
                        <Clock size={12} />
                        {stats.avgTime}
                      </span>
                    )}
                  </div>
                )}

                {state.isInitial && (
                  <span className="node-badge initial-badge">Début</span>
                )}
                {state.isFinal && (
                  <span className="node-badge final-badge">Fin</span>
                )}
              </div>
              
              {!isLast && (
                <div className="lifecycle-arrow">
                  <ArrowRight size={24} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Légende */}
      <div className="lifecycle-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#10b981' }}></div>
          <span>État initial</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#6366f1' }}></div>
          <span>États intermédiaires</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#8b5cf6' }}></div>
          <span>État final</span>
        </div>
      </div>

      <style>{`
        .lifecycle-diagram {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .lifecycle-title {
          color: #ffd700;
          font-size: 1.25rem;
          margin-bottom: 24px;
          text-align: center;
        }

        .lifecycle-flow {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          padding: 20px 0;
        }

        .lifecycle-step {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lifecycle-node {
          position: relative;
          background: rgba(255,255,255,0.05);
          border: 2px solid;
          border-radius: 12px;
          padding: 16px 20px;
          min-width: 120px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .lifecycle-node:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .lifecycle-node.initial {
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }

        .lifecycle-node.final {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }

        .node-indicator {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: white;
        }

        .node-label {
          display: block;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          margin-top: 8px;
        }

        .node-stats {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-count {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.7);
        }

        .stat-time {
          font-size: 0.7rem;
          color: #ffd700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .node-badge {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.65rem;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .initial-badge {
          background: #10b981;
          color: white;
        }

        .final-badge {
          background: #8b5cf6;
          color: white;
        }

        .lifecycle-arrow {
          color: rgba(255,255,255,0.4);
          animation: pulse-arrow 2s ease-in-out infinite;
        }

        @keyframes pulse-arrow {
          0%, 100% { opacity: 0.4; transform: translateX(0); }
          50% { opacity: 1; transform: translateX(4px); }
        }

        .lifecycle-legend {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.7);
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .lifecycle-loading {
          text-align: center;
          padding: 40px;
          color: rgba(255,255,255,0.5);
        }

        @media (max-width: 768px) {
          .lifecycle-flow {
            flex-direction: column;
          }
          
          .lifecycle-arrow {
            transform: rotate(90deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LifecycleDiagram;

