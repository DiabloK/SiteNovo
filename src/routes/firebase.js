const admin = require('firebase-admin');
const serviceAccount = require('./paymaiu.json'); // Substitua pelo caminho correto

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = db;
