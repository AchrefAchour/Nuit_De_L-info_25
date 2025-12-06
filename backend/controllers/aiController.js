const config = require('../config');

// Store conversation history per user (in production, use Redis or database)
const conversations = new Map();

// Send message to n8n AI workflow
const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Get or create conversation history
    if (!conversations.has(userId)) {
      conversations.set(userId, []);
    }
    const history = conversations.get(userId);

    // Add user message to history
    history.push({ role: 'user', content: message });

    // Check if n8n webhook is configured
    const n8nWebhookUrl = config.n8n?.webhookUrl;

    if (!n8nWebhookUrl) {
      // Fallback: Simple local response without n8n
      const aiResponse = generateLocalResponse(message, req.user);
      history.push({ role: 'assistant', content: aiResponse });
      
      // Keep only last 20 messages
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      return res.json({
        response: aiResponse,
        source: 'local',
      });
    }

    // Call n8n webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId,
        userName: req.user.name,
        history: history.slice(-10), // Send last 10 messages for context
        context: {
          platform: 'LifeCycle Tracker',
          userRole: req.user.role,
        },
      }),
    });

    if (!n8nResponse.ok) {
      throw new Error('n8n webhook failed');
    }

    const data = await n8nResponse.json();
    const aiResponse = data.response || data.output || data.message || 'Je n\'ai pas pu traiter votre demande.';

    // Add AI response to history
    history.push({ role: 'assistant', content: aiResponse });

    // Keep only last 20 messages
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    res.json({
      response: aiResponse,
      source: 'n8n',
    });
  } catch (error) {
    console.error('AI chat error:', error);
    
    // Fallback response
    const fallbackResponse = generateLocalResponse(req.body.message, req.user);
    
    res.json({
      response: fallbackResponse,
      source: 'fallback',
    });
  }
};

// Clear conversation history
const clearHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    conversations.delete(userId);
    res.json({ message: 'Conversation history cleared.' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear history.' });
  }
};

// Get conversation history
const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = conversations.get(userId) || [];
    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history.' });
  }
};

// Generate local response without n8n (fallback)
const generateLocalResponse = (message, user) => {
  const lowerMessage = message.toLowerCase();

  // Simple pattern matching for common questions
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello')) {
    return `Bonjour ${user.name} ! 👋 Je suis votre assistant LifeCycle Tracker. Comment puis-je vous aider aujourd'hui ?`;
  }

  if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
    return `Je peux vous aider avec :

📋 **Gestion des entités**
- Créer, modifier ou supprimer des entités
- Changer l'état d'une entité
- Ajouter des contributeurs

📊 **Statistiques**
- Voir les statistiques globales
- Analyser l'activité récente
- Suivre les performances

📁 **Fichiers**
- Uploader des fichiers
- Gérer les versions

💡 **Conseils**
- Bonnes pratiques de gestion de projet
- Organisation du workflow

Que souhaitez-vous faire ?`;
  }

  if (lowerMessage.includes('état') || lowerMessage.includes('status') || lowerMessage.includes('workflow')) {
    return `Les états disponibles dans LifeCycle Tracker sont :

1. **Brouillon** - Document en cours de rédaction
2. **Soumis** - Document soumis pour révision
3. **En révision** - Document en cours de révision
4. **Validé** - Document validé
5. **Publié** - Document publié (état final)
6. **Rejeté** - Document rejeté

Pour changer l'état d'une entité, ouvrez sa page de détail et cliquez sur "Changer l'état".`;
  }

  if (lowerMessage.includes('créer') || lowerMessage.includes('nouveau') || lowerMessage.includes('ajouter')) {
    return `Pour créer une nouvelle entité :

1. Cliquez sur **"Nouvelle Entité"** dans le menu
2. Remplissez le formulaire :
   - Nom de l'entité
   - Type (article, projet, document...)
   - Description
   - Priorité
3. Ajoutez des contributeurs si nécessaire
4. Cliquez sur **"Créer l'entité"**

Votre entité sera créée avec l'état "Brouillon" par défaut.`;
  }

  if (lowerMessage.includes('version')) {
    return `Les versions vous permettent de suivre l'évolution de vos entités :

📝 **Créer une version**
- Ouvrez une entité
- Cliquez sur "Nouvelle version"
- Ajoutez un résumé des modifications

📎 **Fichiers**
- Chaque version peut avoir des fichiers attachés
- Uploadez vos documents (ZIP, PDF, Word...)

🔄 **Restaurer**
- Vous pouvez restaurer une version précédente si nécessaire`;
  }

  if (lowerMessage.includes('statistique') || lowerMessage.includes('stats') || lowerMessage.includes('dashboard')) {
    return `Le Dashboard vous montre :

📈 **Statistiques globales**
- Nombre total d'entités
- Contributeurs actifs
- Versions créées
- Activité récente

📊 **Graphiques**
- Répartition par état
- Activité sur 30 jours
- Top contributeurs

Accédez au Dashboard via le menu latéral !`;
  }

  // Default response
  return `Je comprends votre question sur "${message.substring(0, 50)}...". 

Pour une assistance plus précise, vous pouvez :
- Consulter la page **Dashboard** pour les statistiques
- Aller dans **Accueil** pour gérer vos entités
- Vérifier les **Paramètres** pour votre profil

N'hésitez pas à me poser une question plus spécifique ! 😊

💡 *Pour activer l'IA avancée, configurez n8n avec votre modèle préféré (OpenAI, Claude, Ollama...)*`;
};

module.exports = {
  chat,
  clearHistory,
  getHistory,
};

