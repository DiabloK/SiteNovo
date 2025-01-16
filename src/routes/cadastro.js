const express = require('express');
const db = require('../firebase'); // Importa o Firestore configurado
const router = express.Router();

// Rota para cadastrar uma manutenção
router.post('/', async (req, res) => {
  try {
    const dados = req.body; // Dados enviados pelo frontend
    const docRef = await db.collection('manutencoes').add(dados); // Salva no Firestore
    res.status(201).json({ message: 'Cadastro realizado com sucesso!', id: docRef.id });
  } catch (error) {
    console.error('Erro ao cadastrar manutenção:', error);
    res.status(500).json({ error: 'Erro ao cadastrar manutenção.' });
  }
});

module.exports = router;
