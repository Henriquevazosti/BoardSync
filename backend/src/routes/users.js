import express from 'express';
import { getAllUsers, getUserProfile, updateUserProfile } from '../controllers/userController.js';

const router = express.Router();

/**
 * @route GET /api/v1/users
 * @desc Listar todos os usuários
 * @access Private
 */
router.get('/', getAllUsers);

/**
 * @route GET /api/v1/users/profile
 * @desc Buscar perfil do usuário logado
 * @access Private
 */
router.get('/profile', getUserProfile);

/**
 * @route PUT /api/v1/users/profile
 * @desc Atualizar perfil do usuário
 * @access Private
 */
router.put('/profile', updateUserProfile);

export default router;
