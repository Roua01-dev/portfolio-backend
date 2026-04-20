// migrate-projects.js
// Lance avec : node migrate-projects.js
// Ce script met isActive=true sur tous les projets qui n'ont pas encore ce champ

require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const result = await mongoose.connection.collection('projects').updateMany(
    { isActive: { $exists: false } },
    { $set: { isActive: true } }
  );

  console.log(`Updated ${result.modifiedCount} documents`);
  await mongoose.disconnect();
}

migrate().catch(console.error);