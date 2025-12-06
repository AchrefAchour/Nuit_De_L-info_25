import { useState } from 'react';
import { Download, FileText, Table, Loader2 } from 'lucide-react';

const ExportReport = ({ entity, stats, history }) => {
  const [exporting, setExporting] = useState(false);

  // Export CSV
  const exportCSV = () => {
    setExporting(true);
    
    try {
      // Préparer les données de l'historique
      const csvRows = [
        ['Date', 'Action', 'État précédent', 'Nouvel état', 'Auteur', 'Commentaire']
      ];

      if (history && history.length > 0) {
        history.forEach(event => {
          csvRows.push([
            new Date(event.createdAt).toLocaleString('fr-FR'),
            event.action || 'N/A',
            event.oldState?.label || 'N/A',
            event.newState?.label || 'N/A',
            event.changedBy?.name || 'Système',
            event.comment || ''
          ]);
        });
      }

      // Ajouter les statistiques
      csvRows.push([]);
      csvRows.push(['=== STATISTIQUES ===']);
      csvRows.push(['Métrique', 'Valeur']);
      csvRows.push(['Nombre de versions', stats?.versionCount || 0]);
      csvRows.push(['Nombre de fichiers', stats?.fileCount || 0]);
      csvRows.push(['Transitions d\'état', stats?.stateChangeCount || 0]);
      csvRows.push(['Contributeurs', stats?.contributorCount || 0]);
      csvRows.push(['Âge (jours)', stats?.ageInDays || 0]);

      // Temps par état
      if (stats?.timeInStates) {
        csvRows.push([]);
        csvRows.push(['=== TEMPS PAR ÉTAT ===']);
        Object.entries(stats.timeInStates).forEach(([state, time]) => {
          csvRows.push([state, time.readable]);
        });
      }

      // Créer le CSV
      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-${entity?.name || 'entite'}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  // Export format texte (pseudo-PDF)
  const exportPDF = () => {
    setExporting(true);
    
    try {
      let content = `
╔══════════════════════════════════════════════════════════════╗
║           RAPPORT DE CYCLE DE VIE - NIRD                     ║
╚══════════════════════════════════════════════════════════════╝

📋 ENTITÉ: ${entity?.name || 'N/A'}
📅 Date du rapport: ${new Date().toLocaleDateString('fr-FR')}
🏷️ État actuel: ${entity?.currentState?.label || 'N/A'}
⏱️ Âge: ${stats?.ageInDays || 0} jours

══════════════════════════════════════════════════════════════
                      STATISTIQUES
══════════════════════════════════════════════════════════════

📊 Métriques clés:
   • Versions créées: ${stats?.versionCount || 0}
   • Fichiers attachés: ${stats?.fileCount || 0}
   • Transitions d'état: ${stats?.stateChangeCount || 0}
   • Contributeurs actifs: ${stats?.contributorCount || 0}

⏱️ Temps par état:
`;

      if (stats?.timeInStates) {
        Object.entries(stats.timeInStates).forEach(([state, time]) => {
          content += `   • ${state}: ${time.readable}\n`;
        });
      }

      content += `
══════════════════════════════════════════════════════════════
                      HISTORIQUE
══════════════════════════════════════════════════════════════
`;

      if (history && history.length > 0) {
        history.forEach(event => {
          const date = new Date(event.createdAt).toLocaleString('fr-FR');
          content += `
[${date}]
   Action: ${event.action || 'N/A'}
   ${event.oldState ? `De: ${event.oldState.label} → ` : ''}${event.newState ? `À: ${event.newState.label}` : ''}
   Par: ${event.changedBy?.name || 'Système'}
   ${event.comment ? `Commentaire: "${event.comment}"` : ''}
`;
        });
      }

      content += `
══════════════════════════════════════════════════════════════
           Généré par NIRD - Le Village Numérique
              Nuit de l'Info 2025 🏰
══════════════════════════════════════════════════════════════
`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-${entity?.name || 'entite'}-${new Date().toISOString().split('T')[0]}.txt`;
      link.click();
      
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-report">
      <h4>📤 Exporter le rapport</h4>
      <div className="export-buttons">
        <button 
          className="export-btn csv"
          onClick={exportCSV}
          disabled={exporting}
        >
          {exporting ? <Loader2 size={16} className="spinner" /> : <Table size={16} />}
          Export CSV
        </button>
        <button 
          className="export-btn pdf"
          onClick={exportPDF}
          disabled={exporting}
        >
          {exporting ? <Loader2 size={16} className="spinner" /> : <FileText size={16} />}
          Export Rapport
        </button>
      </div>

      <style>{`
        .export-report {
          margin-top: 16px;
          padding: 16px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .export-report h4 {
          margin-bottom: 12px;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.8);
        }

        .export-buttons {
          display: flex;
          gap: 8px;
        }

        .export-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .export-btn.csv {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .export-btn.pdf {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .export-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ExportReport;

