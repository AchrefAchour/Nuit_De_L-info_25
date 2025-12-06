import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  GitCommit,
  ArrowRight,
  User,
  FileText,
  Upload,
  Trash2,
  UserPlus,
  Edit2,
} from 'lucide-react';

const actionIcons = {
  created: FileText,
  state_change: ArrowRight,
  updated: Edit2,
  version_created: GitCommit,
  version_restored: GitCommit,
  file_uploaded: Upload,
  file_deleted: Trash2,
  contributor_added: UserPlus,
};

const actionLabels = {
  created: 'Entité créée',
  state_change: 'Changement d\'état',
  updated: 'Mise à jour',
  version_created: 'Nouvelle version',
  version_restored: 'Version restaurée',
  file_uploaded: 'Fichier uploadé',
  file_deleted: 'Fichier supprimé',
  contributor_added: 'Contributeur ajouté',
};

const Timeline = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="timeline-empty">
        <p>Aucun événement dans l'historique</p>
      </div>
    );
  }

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="timeline">
      {sortedEvents.map((event, index) => {
        const Icon = actionIcons[event.action] || GitCommit;
        const label = actionLabels[event.action] || event.action;

        return (
          <div key={event.id} className="timeline-item">
            <div className="timeline-line">
              <div
                className="timeline-dot"
                style={{
                  backgroundColor: event.newState?.color || '#6b7280',
                }}
              >
                <Icon size={14} />
              </div>
              {index < sortedEvents.length - 1 && (
                <div className="timeline-connector" />
              )}
            </div>

            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-action">{label}</span>
                <span className="timeline-date">
                  {format(new Date(event.createdAt), 'dd MMM yyyy à HH:mm', {
                    locale: fr,
                  })}
                </span>
              </div>

              {event.action === 'state_change' && (
                <div className="timeline-state-change">
                  {event.oldState && (
                    <>
                      <span
                        className="state-badge small"
                        style={{ backgroundColor: event.oldState.color }}
                      >
                        {event.oldState.label}
                      </span>
                      <ArrowRight size={14} className="arrow" />
                    </>
                  )}
                  <span
                    className="state-badge small"
                    style={{ backgroundColor: event.newState?.color }}
                  >
                    {event.newState?.label}
                  </span>
                </div>
              )}

              {event.comment && (
                <p className="timeline-comment">"{event.comment}"</p>
              )}

              <div className="timeline-author">
                <User size={12} />
                <span>{event.changedBy?.name || 'Système'}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;


