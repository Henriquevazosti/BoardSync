import express from 'express';

const router = express.Router();

/**
 * @route GET /api/v1/comments/card/:cardId
 * @desc Listar comentários de um card
 * @access Private
 */
router.get('/card/:cardId', (req, res) => {
  // TODO: Implementar listagem de comentários
  res.json({
    message: 'Funcionalidade em desenvolvimento'
  });
});

/**
 * @route POST /api/v1/comments/card/:cardId
 * @desc Criar novo comentário
 * @access Private
 */
router.post('/card/:cardId', (req, res) => {
  // TODO: Implementar criação de comentário
  res.json({
    message: 'Funcionalidade em desenvolvimento'
  });
});

export default router;
