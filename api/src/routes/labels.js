import express from 'express';

const router = express.Router();

/**
 * @route GET /api/v1/labels/board/:boardId
 * @desc Listar labels de um board
 * @access Private
 */
router.get('/board/:boardId', (req, res) => {
  // TODO: Implementar listagem de labels
  res.json({
    message: 'Funcionalidade em desenvolvimento'
  });
});

/**
 * @route POST /api/v1/labels/board/:boardId
 * @desc Criar nova label
 * @access Private
 */
router.post('/board/:boardId', (req, res) => {
  // TODO: Implementar criação de label
  res.json({
    message: 'Funcionalidade em desenvolvimento'
  });
});

export default router;
