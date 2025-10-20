import db from '../config/dbAdapter.js';

/**
 * @desc Listar todos os usuários
 * @route GET /api/v1/users
 * @access Private
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await db.findMany('users', {}, {
      orderBy: 'created_at',
      order: 'DESC'
    });

    // Remover senhas dos resultados
    const safeUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      data: safeUsers,
      count: safeUsers.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @desc Buscar perfil do usuário logado
 * @route GET /api/v1/users/profile
 * @access Private
 */
export const getUserProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * @desc Atualizar perfil do usuário
 * @route PUT /api/v1/users/profile
 * @access Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    // TODO: Implementar atualização de perfil
    res.json({
      success: true,
      message: 'Funcionalidade em desenvolvimento'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};
