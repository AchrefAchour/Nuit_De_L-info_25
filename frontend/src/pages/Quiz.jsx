import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Zap,
  Trophy,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { Asterix, Obelix, Cauldron } from '../components/GauloisCharacters';

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      id: 1,
      question: "Quel système d'exploitation utilisent vos ordinateurs ?",
      options: [
        { text: 'Windows 10 ou 11 uniquement', score: 0, feedback: 'Dépendance totale à Microsoft' },
        { text: 'Majoritairement Windows avec quelques Linux', score: 1, feedback: 'Début de diversification' },
        { text: 'Mix équilibré Windows/Linux', score: 2, feedback: 'Bonne approche hybride' },
        { text: 'Majoritairement ou uniquement Linux', score: 3, feedback: 'Excellente autonomie !' },
      ],
      icon: '💻',
      category: 'Système',
    },
    {
      id: 2,
      question: "Quelle suite bureautique utilisez-vous principalement ?",
      options: [
        { text: 'Microsoft Office 365 (abonnement)', score: 0, feedback: 'Coûts récurrents et dépendance cloud' },
        { text: 'Microsoft Office (licence perpétuelle)', score: 1, feedback: 'Mieux, mais toujours dépendant' },
        { text: 'Google Docs / Workspace', score: 1, feedback: 'Gratuit mais données chez Google' },
        { text: 'LibreOffice ou OnlyOffice', score: 3, feedback: 'Bravo ! Solution libre et gratuite' },
      ],
      icon: '📝',
      category: 'Bureautique',
    },
    {
      id: 3,
      question: "Où sont stockées vos données (fichiers, documents) ?",
      options: [
        { text: 'Google Drive ou OneDrive', score: 0, feedback: 'Données hors UE, vie privée compromise' },
        { text: 'Serveur local sans sauvegarde externe', score: 1, feedback: 'Autonome mais risqué' },
        { text: 'Mix cloud commercial + local', score: 1, feedback: 'Transition en cours' },
        { text: 'Nextcloud ou solution auto-hébergée', score: 3, feedback: 'Souveraineté totale !' },
      ],
      icon: '☁️',
      category: 'Stockage',
    },
    {
      id: 4,
      question: "Quel navigateur est utilisé par défaut ?",
      options: [
        { text: 'Google Chrome', score: 0, feedback: 'Collecte massive de données' },
        { text: 'Microsoft Edge', score: 0, feedback: 'Même problème avec Microsoft' },
        { text: 'Safari', score: 1, feedback: 'Mieux mais écosystème Apple' },
        { text: 'Firefox ou Brave', score: 3, feedback: 'Excellent choix pour la vie privée !' },
      ],
      icon: '🌐',
      category: 'Navigation',
    },
    {
      id: 5,
      question: "Quel outil pour la visioconférence ?",
      options: [
        { text: 'Zoom', score: 0, feedback: 'Problèmes de sécurité documentés' },
        { text: 'Microsoft Teams', score: 0, feedback: 'Dépendance écosystème Microsoft' },
        { text: 'Google Meet', score: 0, feedback: 'Données chez Google' },
        { text: 'Jitsi, BigBlueButton ou solution Éducation Nationale', score: 3, feedback: 'Parfait ! Solutions souveraines' },
      ],
      icon: '📹',
      category: 'Communication',
    },
    {
      id: 6,
      question: "Que faites-vous des ordinateurs en fin de vie ?",
      options: [
        { text: 'Ils sont jetés / recyclés', score: 0, feedback: 'Gaspillage et pollution' },
        { text: 'Ils sont stockés en attente', score: 1, feedback: 'Ressources dormantes' },
        { text: 'Donnés à des associations', score: 2, feedback: 'Bonne démarche solidaire' },
        { text: 'Reconditionnés avec Linux pour réemploi', score: 3, feedback: 'Exemplaire ! Durabilité maximale' },
      ],
      icon: '♻️',
      category: 'Durabilité',
    },
    {
      id: 7,
      question: "Avez-vous des compétences internes en logiciels libres ?",
      options: [
        { text: 'Non, aucune', score: 0, feedback: 'Formation nécessaire' },
        { text: 'Quelques personnes intéressées', score: 1, feedback: 'Potentiel à développer' },
        { text: 'Un ou deux référents formés', score: 2, feedback: 'Bon début !' },
        { text: 'Équipe formée et communauté active', score: 3, feedback: 'Autonomie technique acquise !' },
      ],
      icon: '🎓',
      category: 'Compétences',
    },
    {
      id: 8,
      question: "Quel est le budget annuel en licences logicielles ?",
      options: [
        { text: 'Plus de 5000€', score: 0, feedback: 'Budget important pour du propriétaire' },
        { text: 'Entre 2000€ et 5000€', score: 1, feedback: 'Réduction possible' },
        { text: 'Entre 500€ et 2000€', score: 2, feedback: 'Déjà optimisé' },
        { text: 'Moins de 500€ ou 0€ (logiciels libres)', score: 3, feedback: 'Bravo ! Budget maîtrisé' },
      ],
      icon: '💰',
      category: 'Budget',
    },
    {
      id: 9,
      question: "Les élèves sont-ils sensibilisés aux enjeux du numérique libre ?",
      options: [
        { text: 'Non, pas du tout', score: 0, feedback: 'Opportunité pédagogique manquée' },
        { text: 'Ponctuellement, lors d\'événements', score: 1, feedback: 'À renforcer' },
        { text: 'Intégré dans certains cours', score: 2, feedback: 'Bonne intégration' },
        { text: 'Projet pédagogique avec participation active', score: 3, feedback: 'Exemplaire comme le lycée Carnot !' },
      ],
      icon: '👨‍🎓',
      category: 'Pédagogie',
    },
    {
      id: 10,
      question: "Votre établissement a-t-il une stratégie numérique responsable ?",
      options: [
        { text: 'Non, on suit les directives sans réfléchir', score: 0, feedback: 'Pas d\'autonomie décisionnelle' },
        { text: 'On commence à se poser des questions', score: 1, feedback: 'Prise de conscience en cours' },
        { text: 'Réflexion en cours avec quelques actions', score: 2, feedback: 'Sur la bonne voie' },
        { text: 'Stratégie NIRD définie et appliquée', score: 3, feedback: 'Vous êtes un village gaulois !' },
      ],
      icon: '🎯',
      category: 'Stratégie',
    },
  ];

  const handleAnswer = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: questions[currentQuestion].id,
      optionIndex,
      score: questions[currentQuestion].options[optionIndex].score,
    };
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
  };

  const calculateScore = () => {
    return answers.reduce((total, answer) => total + (answer?.score || 0), 0);
  };

  const getResultLevel = (score) => {
    const maxScore = questions.length * 3;
    const percentage = (score / maxScore) * 100;

    if (percentage >= 80) {
      return {
        level: 'Village Gaulois',
        icon: '🏆',
        color: '#4a7c23',
        message: 'Félicitations ! Votre établissement est un véritable village d\'irréductibles !',
        description: 'Vous avez atteint un excellent niveau d\'indépendance numérique. Continuez à montrer l\'exemple et partagez votre expérience avec d\'autres établissements.',
        emoji: '💪🍲⚔️',
      };
    } else if (percentage >= 60) {
      return {
        level: 'Résistant en herbe',
        icon: '🌱',
        color: '#2e5a88',
        message: 'Très bien ! Vous êtes sur la bonne voie vers l\'autonomie numérique.',
        description: 'Vous avez déjà fait des choix importants. Quelques ajustements et formations peuvent vous faire passer au niveau supérieur.',
        emoji: '📚🔧💡',
      };
    } else if (percentage >= 40) {
      return {
        level: 'Éveillé',
        icon: '👀',
        color: '#d4a017',
        message: 'Pas mal ! La prise de conscience est là, place à l\'action.',
        description: 'Vous commencez à questionner vos pratiques numériques. C\'est le moment idéal pour explorer les alternatives libres.',
        emoji: '🤔💭🎯',
      };
    } else {
      return {
        level: 'Sous l\'empire',
        icon: '⛓️',
        color: '#c9302c',
        message: 'Votre établissement est très dépendant des Big Tech.',
        description: 'Ne vous découragez pas ! La démarche NIRD peut vous aider à reprendre le contrôle progressivement. Chaque petit pas compte.',
        emoji: '🆘📢🚀',
      };
    }
  };

  const currentAnswer = answers[currentQuestion];
  const score = calculateScore();
  const result = getResultLevel(score);
  const maxScore = questions.length * 3;
  const percentage = Math.round((score / maxScore) * 100);

  if (showResult) {
    return (
      <div className="quiz-page">
        <div className="quiz-container result-container">
          <div className="result-header" style={{ '--result-color': result.color }}>
            <div className="result-character">
              {percentage >= 60 ? (
                <Asterix size={80} animated={true} />
              ) : (
                <Obelix size={100} animated={true} />
              )}
            </div>
            <span className="result-icon">{result.icon}</span>
            <h1>{result.level}</h1>
            <p className="result-emoji">{result.emoji}</p>
          </div>

          <div className="result-score">
            <div className="score-circle" style={{ '--score-color': result.color }}>
              <span className="score-value">{score}</span>
              <span className="score-max">/ {maxScore}</span>
            </div>
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{ width: `${percentage}%`, backgroundColor: result.color }}
              />
            </div>
            <p className="score-percentage">{percentage}% d'autonomie numérique</p>
          </div>

          <div className="result-message">
            <h2>{result.message}</h2>
            <p>{result.description}</p>
          </div>

          <div className="result-breakdown">
            <h3>Détail par catégorie</h3>
            <div className="breakdown-grid">
              {questions.map((q, index) => {
                const answer = answers[index];
                const answerScore = answer?.score || 0;
                return (
                  <div key={index} className="breakdown-item">
                    <span className="breakdown-icon">{q.icon}</span>
                    <span className="breakdown-category">{q.category}</span>
                    <div className="breakdown-score">
                      {[0, 1, 2, 3].map((s) => (
                        <span 
                          key={s} 
                          className={`score-dot ${s <= answerScore ? 'filled' : ''}`}
                          style={{ backgroundColor: s <= answerScore ? result.color : undefined }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="result-actions">
            <button onClick={resetQuiz} className="btn btn-secondary">
              <RefreshCw size={18} />
              Refaire le quiz
            </button>
            <Link to="/register" className="btn btn-primary">
              <Zap size={18} />
              Rejoindre NIRD
            </Link>
          </div>

          <div className="result-share">
            <p>Partagez votre résultat et encouragez d'autres établissements !</p>
            <button className="btn btn-secondary">
              <Share2 size={18} />
              Partager
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          Retour
        </Link>

        <div className="quiz-header">
          <div className="quiz-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span className="progress-text">
              Question {currentQuestion + 1} / {questions.length}
            </span>
          </div>
        </div>

        <div className="quiz-question">
          <span className="question-icon">{questions[currentQuestion].icon}</span>
          <span className="question-category">{questions[currentQuestion].category}</span>
          <h2>{questions[currentQuestion].question}</h2>
        </div>

        <div className="quiz-options">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${currentAnswer?.optionIndex === index ? 'selected' : ''}`}
              onClick={() => handleAnswer(index)}
            >
              <span className="option-indicator">
                {currentAnswer?.optionIndex === index ? (
                  <CheckCircle size={20} />
                ) : (
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                )}
              </span>
              <span className="option-text">{option.text}</span>
              {currentAnswer?.optionIndex === index && (
                <span className="option-feedback">{option.feedback}</span>
              )}
            </button>
          ))}
        </div>

        <div className="quiz-navigation">
          <button 
            onClick={prevQuestion} 
            className="btn btn-secondary"
            disabled={currentQuestion === 0}
          >
            <ArrowLeft size={18} />
            Précédent
          </button>
          
          <button 
            onClick={nextQuestion} 
            className="btn btn-primary"
            disabled={currentAnswer === undefined}
          >
            {currentQuestion === questions.length - 1 ? 'Voir mes résultats' : 'Suivant'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;

