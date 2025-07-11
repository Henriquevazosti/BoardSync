import express from 'express';

const router = express.Router();

/**
 * @route GET /api/v1/activities/board/:boardId
 * @desc Listar atividades de um board
 * @access Private
 */
router.get('/board/:boardId', (req, res) => {
  // TODO: Implementar listagem de atividades
  res.json({
    message: 'Funcionalidade em desenvolvimento'
  });
});

/**
 * @route GET /api/v1/activities/workspace/:workspaceId
 * @desc Listar atividades de um workspace
 * @access Private
 */
router.get('/workspace/:workspaceId', (req, res) => {
  // TODO: Implementar listagem de atividades do workspace
  res.json({
    message: 'Funcionalidade em desenvolvimento'
  });
});

export default router;
