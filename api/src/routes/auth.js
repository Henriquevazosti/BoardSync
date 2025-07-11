import express from 'express';
import Joi from 'joi';
import authController from '../controllers/authController.js';
import { validateRequest } from '../middlewares/validation.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Schemas de validação
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ser válido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória'
  }),
  name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  organizationId: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ser válido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Senha é obrigatória'
  })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ser válido',
    'any.required': 'Email é obrigatório'
  })
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  newPassword: Joi.string().min(6).required(),
  resetToken: Joi.string().required()
});

// Rotas públicas
/**
 * @route POST /api/v1/auth/register
 * @desc Registrar novo usuário
 * @access Public
 */
router.post('/register', validateRequest(registerSchema), authController.register);

/**
 * @route POST /api/v1/auth/login
 * @desc Login do usuário
 * @access Public
 */
router.post('/login', validateRequest(loginSchema), authController.login);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Solicitar reset de senha
 * @access Public
 */
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Redefinir senha
 * @access Public
 */
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

// Rotas protegidas
/**
 * @route GET /api/v1/auth/verify
 * @desc Verificar token JWT
 * @access Private
 */
router.get('/verify', authMiddleware, authController.verifyToken);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout do usuário
 * @access Private
 */
router.post('/logout', authMiddleware, authController.logout);

export default router;
