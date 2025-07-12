import express from 'express';

const router = express.Router();

/**
 * @route GET /api/v1/users/profile
 * @desc Buscar perfil do usuário logado
 * @access Private
 */
router.get('/profile', (req, res) => {
  res.json({
    user: req.user
  });
});

/**
 * @route PUT /api/v1/users/profile
 * @desc Atualizar perfil do usuário
 * @access Private
 */
router.put('/profile', (req, res) => {
  // TODO: Implementar atualização de perfil
  res.json({
    message: 'Funcionalidade em desenvolvimento'
  });
});

export default router;
