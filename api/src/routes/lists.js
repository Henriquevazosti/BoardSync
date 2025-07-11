import express from 'express';

const router = express.Router();

/**
 * @route GET /api/v1/lists/board/:boardId
 * @desc Listar listas de um board
 * @access Private
 */
router.get('/board/:boardId', (req, res) => {
  // TODO: Implementar listagem de listas
  res.json({
    message: 'Funcionalidade em desenvolvimento'
  });
});

/**
 * @route POST /api/v1/lists/board/:boardId
 * @desc Criar nova lista
 * @access Private
 */
router.post('/board/:boardId', (req, res) => {
  // TODO: Implementar criação de lista
  res.json({
    message: 'Funcionalidade em desenvolvimento'
  });
});

export default router;
