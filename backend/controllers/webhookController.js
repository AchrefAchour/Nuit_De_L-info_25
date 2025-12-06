const fetch = require('node-fetch');
const config = require('../config');

// Store for chat history (in production, use Redis or database)
const chatHistory = new Map();

// Send message to n8n AI agent
const sendToAgent = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create chat history for this session
    const historyKey = sessionId || `user_${userId}`;
    if (!chatHistory.has(historyKey)) {
      chatHistory.set(historyKey, []);
    }
    const history = chatHistory.get(historyKey);

    // Add user message to history
    history.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Prepare context about the user and system
    const context = {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      message,
      history: history.slice(-10), // Last 10 messages for context
      timestamp: new Date().toISOString(),
    };

    let assistantResponse;

    // Check if n8n webhook is configured
    if (config.n8n && config.n8n.webhookUrl) {
      try {
        const n8nResponse = await fetch(config.n8n.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.n8n.apiKey && { 'Authorization': `Bearer ${config.n8n.apiKey}` }),
          },
          body: JSON.stringify(context),
          timeout: 30000, // 30 second timeout
        });

        if (n8nResponse.ok) {
          const data = await n8nResponse.json();
          assistantResponse = data.response || data.message || data.output || 'Réponse reçue de n8n';
        } else {
          console.error('n8n response error:', n8nResponse.status);
          assistantResponse = getLocalResponse(message, req.user);
        }
      } catch (n8nError) {
        console.error('n8n connection error:', n8nError.message);
        assistantResponse = getLocalResponse(message, req.user);
      }
    } else {
      // No n8n configured, use local responses
      assistantResponse = getLocalResponse(message, req.user);
    }

    // Add assistant response to history
    history.push({
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 50 messages
    if (history.length > 50) {
      chatHistory.set(historyKey, history.slice(-50));
    }

    res.json({
      response: assistantResponse,
      sessionId: historyKey,
    });
  } catch (error) {
    console.error('Agent error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

// Local response generator (fallback when n8n is not configured)
const getLocalResponse = (message, user) => {
  const lowerMessage = message.toLowerCase();

  // Greetings
  if (lowerMessage.match(/^(salut|bonjour|hello|hi|hey|coucou)/)) {
    return `Bonjour ${user.name} ! 👋 Je suis votre assistant LifeCycle Tracker. Comment puis-je vous aider aujourd'hui ?\n\nJe peux vous aider avec :\n• La gestion de vos entités\n• Les changements d'état\n• Les statistiques\n• L'utilisation de la plateforme`;
  }

  // Help
  if (lowerMessage.match(/(aide|help|comment|how)/)) {
    return `Voici ce que je peux faire pour vous :\n\n📝 **Entités**\n• Créer une nouvelle entité : cliquez sur "Nouvelle Entité"\n• Modifier : ouvrez l'entité et modifiez les champs\n\n🔄 **États**\n• Brouillon → Soumis → Révision → Validé → Publié\n• Cliquez sur "Changer l'état" dans une entité\n\n📊 **Dashboard**\n• Statistiques globales\n• Activité récente\n• Top contributeurs\n\n📁 **Fichiers**\n• Uploadez via le bouton dans une version\n• Formats acceptés : ZIP, PDF, Word, Excel, images\n\nQue souhaitez-vous savoir de plus ?`;
  }

  // Create entity
  if (lowerMessage.match(/(créer|create|nouvelle|new|ajouter|add).*(entité|entity|projet|project|document)/)) {
    return `Pour créer une nouvelle entité :\n\n1. Cliquez sur **"Nouvelle Entité"** dans le menu\n2. Remplissez le formulaire :\n   • Nom (obligatoire)\n   • Type (article, projet, document...)\n   • Description\n   • Priorité\n   • Date d'échéance\n3. Ajoutez des contributeurs si nécessaire\n4. Cliquez sur **"Créer l'entité"**\n\nL'entité sera créée en état "Brouillon" par défaut.`;
  }

  // States
  if (lowerMessage.match(/(état|state|status|statut|workflow)/)) {
    return `**Les états du cycle de vie :**\n\n🔵 **Brouillon** - En cours de rédaction\n🔷 **Soumis** - Soumis pour révision\n🟡 **En révision** - En cours de révision\n🟢 **Validé** - Document approuvé\n🟣 **Publié** - Document final\n🔴 **Rejeté** - Document refusé\n\nPour changer l'état d'une entité, ouvrez-la et cliquez sur "Changer l'état".`;
  }

  // Statistics
  if (lowerMessage.match(/(stat|dashboard|tableau de bord|graphique|chart)/)) {
    return `Le **Dashboard** vous montre :\n\n📈 **Statistiques globales**\n• Nombre total d'entités\n• Contributeurs actifs\n• Versions créées\n• Activité récente\n\n📊 **Graphiques**\n• Répartition par état\n• Activité sur 30 jours\n• Entités par type\n\n👥 **Top contributeurs**\n• Classement par activité\n\nAccédez au Dashboard via le menu latéral.`;
  }

  // Files
  if (lowerMessage.match(/(fichier|file|upload|télécharger|download|document)/)) {
    return `**Gestion des fichiers :**\n\n📤 **Upload**\n• Ouvrez une entité\n• Trouvez une version\n• Cliquez "Ajouter fichier"\n• Formats : ZIP, PDF, Word, Excel, images\n• Taille max : 50 MB\n\n📥 **Download**\n• Cliquez sur le fichier dans la liste\n• Le téléchargement démarre automatiquement\n\nChaque fichier est associé à une version spécifique pour la traçabilité.`;
  }

  // n8n
  if (lowerMessage.match(/(n8n|automatisation|automation|webhook|intégration)/)) {
    return `**Intégration n8n :**\n\nPour connecter n8n :\n\n1. Installez n8n : \`npm install -g n8n\`\n2. Lancez : \`n8n start\`\n3. Créez un workflow avec un Webhook\n4. Configurez l'URL dans le backend\n\nExemples d'automatisations :\n• Notifications par email\n• Alertes Slack/Discord\n• Synchronisation avec d'autres outils\n• Rapports automatiques`;
  }

  // Contributors
  if (lowerMessage.match(/(contributeur|contributor|utilisateur|user|équipe|team)/)) {
    return `**Gestion des contributeurs :**\n\n👥 **Rôles disponibles**\n• **Admin** - Accès complet\n• **Contributeur** - Créer et modifier\n• **Lecteur** - Consultation seule\n\n➕ **Ajouter à une entité**\n• Ouvrez l'entité\n• Section "Contributeurs"\n• Assignez avec un rôle (owner, editor, viewer)\n\nAccédez à la liste complète via "Contributeurs" dans le menu.`;
  }

  // Thank you
  if (lowerMessage.match(/(merci|thanks|thank you)/)) {
    return `De rien ! 😊 N'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider ! 🚀`;
  }

  // Default response
  return `Je ne suis pas sûr de comprendre votre demande. 🤔\n\nVoici quelques sujets sur lesquels je peux vous aider :\n• Comment créer une entité\n• Les différents états du workflow\n• Le dashboard et les statistiques\n• La gestion des fichiers\n• Les contributeurs et les rôles\n• L'intégration avec n8n\n\nPouvez-vous reformuler votre question ?`;
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const historyKey = sessionId || `user_${req.user.id}`;
    const history = chatHistory.get(historyKey) || [];

    res.json({ history, sessionId: historyKey });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
};

// Clear chat history
const clearChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const historyKey = sessionId || `user_${req.user.id}`;
    chatHistory.delete(historyKey);

    res.json({ message: 'Chat history cleared', sessionId: historyKey });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
};

// Webhook endpoint for n8n to call back (for async workflows)
const n8nCallback = async (req, res) => {
  try {
    const { sessionId, response } = req.body;

    if (sessionId && chatHistory.has(sessionId)) {
      const history = chatHistory.get(sessionId);
      history.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('n8n callback error:', error);
    res.status(500).json({ error: 'Callback failed' });
  }
};

module.exports = {
  sendToAgent,
  getChatHistory,
  clearChatHistory,
  n8nCallback,
};

