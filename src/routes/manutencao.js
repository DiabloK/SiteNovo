// Rota para buscar uma manutenção pelo ID
router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params; // ID do documento
      const doc = await db.collection('manutencoes').doc(id).get();
  
      if (!doc.exists) {
        return res.status(404).json({ error: 'Manutenção não encontrada.' });
      }
  
      res.status(200).json(doc.data());
    } catch (error) {
      console.error('Erro ao buscar manutenção:', error);
      res.status(500).json({ error: 'Erro ao buscar manutenção.' });
    }
  });
  
  module.exports = router;

  
  const express = require('express');
const db = require('../firebase');
const router = express.Router();

// Rota para atualizar uma manutenção
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params; // ID do documento
    const dadosAtualizados = req.body; // Dados enviados pelo frontend

    await db.collection('manutencoes').doc(id).update(dadosAtualizados); // Atualiza no Firestore
    res.status(200).json({ message: 'Manutenção atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar manutenção:', error);
    res.status(500).json({ error: 'Erro ao atualizar manutenção.' });
  }
});

module.exports = router;
// Rota para deletar uma manutenção pelo ID
router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params; // ID do documento
  
      await db.collection('manutencoes').doc(id).delete(); // Remove do Firestore
      res.status(200).json({ message: 'Manutenção deletada com sucesso!' });
    } catch (error) {
      console.error('Erro ao deletar manutenção:', error);
      res.status(500).json({ error: 'Erro ao deletar manutenção.' });
    }
  });
  
  module.exports = router;
  