import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { Asterix } from './GauloisCharacters';

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Par Toutatis ! 🏛️ Je suis Panoramix, le druide de la communauté NIRD ! Je peux vous aider avec les solutions libres, vous guider dans votre résistance numérique, ou répondre à vos questions. Que puis-je faire pour vous, brave gaulois ?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState(
    localStorage.getItem('n8n_webhook_url') || ''
  );
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response;

      if (n8nWebhookUrl) {
        // Envoyer à n8n
        const res = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage.content,
            userId: localStorage.getItem('token') ? 'authenticated' : 'guest',
            timestamp: new Date().toISOString(),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          response = data.response || data.message || data.output || JSON.stringify(data);
        } else {
          response = "Erreur de connexion avec n8n. Vérifiez l'URL du webhook.";
        }
      } else {
        response = getLocalResponse(userMessage.content);
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Erreur: ${error.message}. ${!n8nWebhookUrl ? 'Configurez n8n pour des réponses IA avancées.' : ''}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalResponse = (message) => {
    const msg = message.toLowerCase();

    // NIRD et logiciels libres
    if (msg.includes('nird') || msg.includes('c\'est quoi')) {
      return "🏛️ NIRD signifie Numérique Inclusif, Responsable et Durable ! C'est une démarche née au lycée Carnot pour résister aux Big Tech en utilisant des logiciels libres. Comme notre village gaulois qui résiste à l'empire romain ! 💪";
    }
    if (msg.includes('linux') || msg.includes('système')) {
      return "🐧 Linux est un système d'exploitation libre qui peut redonner vie à vos vieux ordinateurs ! Il remplace Windows et permet de garder vos PC fonctionnels pendant des années. Par Toutatis, c'est notre potion magique contre l'obsolescence ! 🧪";
    }
    if (msg.includes('libre') || msg.includes('open source') || msg.includes('logiciel')) {
      return "🆓 Les logiciels libres sont gratuits, modifiables et respectueux de votre vie privée ! Exemples : Linux, LibreOffice, Firefox, Nextcloud, Jitsi... Ils remplacent les solutions payantes des Big Tech ! 🛡️";
    }
    if (msg.includes('big tech') || msg.includes('microsoft') || msg.includes('google') || msg.includes('apple')) {
      return "🏛️ Les Big Tech (Microsoft, Google, Apple, Amazon) créent une dépendance avec leurs licences coûteuses et l'obsolescence programmée. NIRD propose des alternatives libres pour reprendre le contrôle ! Résistons comme des Gaulois ! ⚔️";
    }
    if (msg.includes('windows') || msg.includes('windows 10')) {
      return "⚠️ La fin du support de Windows 10 menace des millions d'ordinateurs fonctionnels ! Mais pas de panique : Linux peut leur redonner vie gratuitement. C'est notre potion magique ! 🧪";
    }

    // Solutions libres spécifiques
    if (msg.includes('libreoffice') || msg.includes('office') || msg.includes('word') || msg.includes('excel')) {
      return "📝 LibreOffice est une suite bureautique libre et gratuite ! Elle remplace Microsoft Office (Word, Excel, PowerPoint) sans abonnement. Parfait pour les établissements scolaires ! 🏫";
    }
    if (msg.includes('nextcloud') || msg.includes('cloud') || msg.includes('drive')) {
      return "☁️ Nextcloud est un cloud privé auto-hébergé ! Il remplace Google Drive et OneDrive en gardant vos données chez vous, en toute souveraineté. Vos fichiers restent dans votre village ! 🏰";
    }
    if (msg.includes('firefox') || msg.includes('navigateur') || msg.includes('chrome')) {
      return "🦊 Firefox est un navigateur libre qui respecte votre vie privée ! Il bloque les traceurs et ne vend pas vos données, contrairement à Chrome. Par Toutatis, protégeons nos données ! 🛡️";
    }
    if (msg.includes('jitsi') || msg.includes('visio') || msg.includes('zoom') || msg.includes('teams')) {
      return "📹 Jitsi est une solution de visioconférence libre et gratuite ! Elle remplace Zoom et Teams sans compte obligatoire. Parfait pour les réunions en toute confidentialité ! 🔒";
    }

    // Fonctionnalités de la plateforme
    if (msg.includes('créer') || msg.includes('nouvelle') || msg.includes('ajouter')) {
      return "➕ Pour ajouter une nouvelle solution libre, cliquez sur 'Ajouter une Solution' dans le menu ! Vous pourrez documenter des alternatives aux logiciels propriétaires. 📚";
    }
    if (msg.includes('état') || msg.includes('statut') || msg.includes('cycle')) {
      return "🔄 Les états disponibles : Brouillon → Soumis → En révision → Validé → Publié. Cela permet de suivre le cycle de vie de chaque solution documentée !";
    }
    if (msg.includes('contributeur') || msg.includes('équipe') || msg.includes('communauté')) {
      return "👥 La communauté NIRD rassemble des contributeurs passionnés ! Chacun peut proposer des solutions libres et participer à la résistance numérique. Rejoignez le village ! 🏰";
    }
    if (msg.includes('statistique') || msg.includes('stats') || msg.includes('dashboard')) {
      return "📊 Le Dashboard affiche les statistiques : solutions documentées, contributeurs actifs, et l'activité récente de notre village gaulois !";
    }
    if (msg.includes('quiz') || msg.includes('test')) {
      return "🎯 Le Quiz évalue le niveau de dépendance numérique de votre établissement ! 10 questions pour savoir si vous êtes déjà un village gaulois ou encore sous l'empire des Big Tech. 📋";
    }

    // Salutations
    if (msg.includes('bonjour') || msg.includes('salut') || msg.includes('hello') || msg.includes('coucou')) {
      return "Bonjour, brave Gaulois ! 🏛️ Je suis Panoramix, le druide du village NIRD. Comment puis-je vous aider dans votre résistance numérique aujourd'hui ? 🧪";
    }
    if (msg.includes('merci')) {
      return "Par Toutatis, c'est un plaisir de vous aider ! 🙏 N'hésitez pas si vous avez d'autres questions sur les logiciels libres. Ensemble, résistons ! ⚔️";
    }
    if (msg.includes('aide') || msg.includes('help') || msg.includes('comment')) {
      return "🧙‍♂️ Je peux vous aider avec :\n• 🐧 Linux et les systèmes libres\n• 📝 LibreOffice, Nextcloud, Firefox...\n• 🏛️ La démarche NIRD\n• 🎯 Le quiz de dépendance numérique\n• ➕ Ajouter des solutions\n\nPosez-moi une question, par Toutatis ! 💪";
    }

    // Réponse par défaut améliorée
    return "🧙‍♂️ Par Toutatis ! Je suis Panoramix, druide spécialiste des logiciels libres. Posez-moi des questions sur NIRD, Linux, LibreOffice, Firefox, ou comment résister aux Big Tech ! Je suis là pour vous guider. 💪";
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const saveWebhookUrl = () => {
    localStorage.setItem('n8n_webhook_url', n8nWebhookUrl);
    setShowSettings(false);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: 'assistant',
        content: n8nWebhookUrl
          ? '✅ Webhook n8n configuré ! Je suis maintenant connecté à votre workflow IA.'
          : '⚠️ Webhook supprimé. Je fonctionne en mode hors-ligne.',
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) {
    return (
      <button className="ai-assistant-fab" onClick={() => setIsOpen(true)}>
        <Asterix size={40} animated={true} />
        <span className="fab-label">Panoramix</span>
      </button>
    );
  }

  return (
    <div className={`ai-assistant ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="ai-header">
        <div className="ai-title">
          <Asterix size={28} animated={false} />
          <span>Panoramix</span>
          {n8nWebhookUrl && <span className="connected-badge">n8n</span>}
        </div>
        <div className="ai-controls">
          <button onClick={() => setShowSettings(!showSettings)} title="Paramètres n8n">
            ⚙️
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Settings Panel */}
          {showSettings && (
            <div className="ai-settings">
              <label>URL Webhook n8n :</label>
              <input
                type="url"
                value={n8nWebhookUrl}
                onChange={(e) => setN8nWebhookUrl(e.target.value)}
                placeholder="https://votre-n8n.com/webhook/xxx"
              />
              <div className="settings-actions">
                <button onClick={() => setShowSettings(false)} className="btn-cancel">
                  Annuler
                </button>
                <button onClick={saveWebhookUrl} className="btn-save">
                  Enregistrer
                </button>
              </div>
              <p className="settings-help">
                Créez un workflow n8n avec un Webhook trigger et un nœud AI (OpenAI, Ollama, etc.)
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="ai-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'assistant' ? <Asterix size={32} animated={false} /> : <User size={16} />}
                </div>
                <div className="message-content">
                  <p>{msg.content}</p>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-content loading">
                  <Loader2 className="spinner" size={16} />
                  <span>Réflexion en cours...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="ai-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez une question..."
              rows={1}
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={!input.trim() || isLoading}>
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AiAssistant;

