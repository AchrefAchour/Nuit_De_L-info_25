-- LifeCycle Tracker - Script de creation de base de donnees
-- Executez ce script avec: psql -U postgres -f setup-db.sql

-- Creer la base de donnees
CREATE DATABASE lifecycle_tracker;

-- Se connecter a la base (si execution manuelle)
\c lifecycle_tracker;

-- Message de confirmation
SELECT 'Base de donnees lifecycle_tracker creee avec succes!' AS message;


