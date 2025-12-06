import { Award, Star, Zap, Target, Trophy, Shield, Rocket, Crown } from 'lucide-react';

const badgeDefinitions = [
  {
    id: 'first_entity',
    name: 'Première Pierre',
    description: 'Créer sa première entité',
    icon: Star,
    color: '#ffd700',
    check: (stats) => stats.createdEntities >= 1
  },
  {
    id: 'prolific',
    name: 'Prolifique',
    description: 'Créer 5 entités',
    icon: Rocket,
    color: '#3b82f6',
    check: (stats) => stats.createdEntities >= 5
  },
  {
    id: 'reviewer',
    name: 'Réviseur',
    description: 'Effectuer 10 transitions d\'état',
    icon: Target,
    color: '#10b981',
    check: (stats) => stats.transitions >= 10
  },
  {
    id: 'perfectionist',
    name: 'Perfectionniste',
    description: 'Créer 3 versions d\'une entité',
    icon: Zap,
    color: '#f59e0b',
    check: (stats) => stats.maxVersions >= 3
  },
  {
    id: 'publisher',
    name: 'Éditeur',
    description: 'Publier une entité',
    icon: Trophy,
    color: '#8b5cf6',
    check: (stats) => stats.published >= 1
  },
  {
    id: 'team_player',
    name: 'Esprit d\'équipe',
    description: 'Collaborer sur 3 entités différentes',
    icon: Shield,
    color: '#ec4899',
    check: (stats) => stats.collaborations >= 3
  },
  {
    id: 'champion',
    name: 'Champion',
    description: 'Publier 5 entités',
    icon: Crown,
    color: '#ffd700',
    check: (stats) => stats.published >= 5
  },
  {
    id: 'gaulois',
    name: 'Irréductible Gaulois',
    description: 'Contribuer à la résistance numérique',
    icon: Award,
    color: '#c9302c',
    check: () => true // Tout le monde l'a !
  }
];

const Badges = ({ userStats }) => {
  // Stats par défaut si non fournies
  const stats = userStats || {
    createdEntities: 1,
    transitions: 5,
    maxVersions: 2,
    published: 1,
    collaborations: 1
  };

  const earnedBadges = badgeDefinitions.filter(badge => badge.check(stats));
  const lockedBadges = badgeDefinitions.filter(badge => !badge.check(stats));

  return (
    <div className="badges-section">
      <h4>🏆 Badges & Achievements</h4>
      
      {/* Badges obtenus */}
      <div className="badges-earned">
        <span className="badges-label">Obtenus ({earnedBadges.length}/{badgeDefinitions.length})</span>
        <div className="badges-grid">
          {earnedBadges.map(badge => {
            const Icon = badge.icon;
            return (
              <div 
                key={badge.id} 
                className="badge-item earned"
                title={badge.description}
              >
                <div 
                  className="badge-icon"
                  style={{ backgroundColor: `${badge.color}20`, borderColor: badge.color }}
                >
                  <Icon size={20} style={{ color: badge.color }} />
                </div>
                <span className="badge-name">{badge.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges à obtenir */}
      {lockedBadges.length > 0 && (
        <div className="badges-locked">
          <span className="badges-label">À débloquer</span>
          <div className="badges-grid locked">
            {lockedBadges.map(badge => {
              const Icon = badge.icon;
              return (
                <div 
                  key={badge.id} 
                  className="badge-item locked"
                  title={badge.description}
                >
                  <div className="badge-icon locked">
                    <Icon size={20} />
                  </div>
                  <span className="badge-name">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progression */}
      <div className="badges-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(earnedBadges.length / badgeDefinitions.length) * 100}%` }}
          />
        </div>
        <span className="progress-text">
          {Math.round((earnedBadges.length / badgeDefinitions.length) * 100)}% complété
        </span>
      </div>

      <style>{`
        .badges-section {
          margin-top: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 12px;
          border: 1px solid rgba(255,215,0,0.2);
        }

        .badges-section h4 {
          margin-bottom: 16px;
          color: #ffd700;
          font-size: 0.95rem;
        }

        .badges-label {
          display: block;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .badges-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .badge-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          transition: all 0.2s ease;
          cursor: help;
        }

        .badge-item.earned:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(255,215,0,0.2);
        }

        .badge-item.locked {
          opacity: 0.4;
        }

        .badge-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid;
        }

        .badge-icon.locked {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.3);
        }

        .badge-name {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.8);
          text-align: center;
          max-width: 60px;
        }

        .badges-locked {
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .badges-progress {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .progress-bar {
          height: 8px;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ffd700, #ffed4a);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .progress-text {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.5);
        }
      `}</style>
    </div>
  );
};

export default Badges;

