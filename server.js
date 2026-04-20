require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// IMPORTANT: Écouter sur toutes les interfaces réseau
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connecté');
  
  const db = mongoose.connection;
  console.log(`📊 Base de données: ${db.name}`);
  
  // ÉCOUTER SUR 0.0.0.0 pour accepter les connexions de toutes les interfaces
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`🌍 Accessible également via votre IP locale`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  });
})
.catch((error) => {
  console.error('❌ Erreur MongoDB:', error.message);
  process.exit(1);
});

// Gestion des erreurs MongoDB
mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB déconnecté');
});

// Arrêt propre
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB déconnecté - arrêt du serveur');
  process.exit(0);
});