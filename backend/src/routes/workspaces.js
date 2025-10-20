import express from 'express';
import Joi from 'joi';
import workspaceController from '../controllers/workspaceController.js';
import { validateRequest, validateParams } from '../middlewares/validation.js';

const router = express.Router();

// Schemas de validação
const createWorkspaceSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  description: Joi.string().max(1000).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
    'string.pattern.base': 'Cor deve estar no formato hexadecimal (#RRGGBB)'
  }),
  visibility: Joi.string().valid('public', 'private', 'team').optional()
});

const updateWorkspaceSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  description: Joi.string().max(1000).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  visibility: Joi.string().valid('public', 'private', 'team').optional()
});

const addMemberSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ser válido',
    'any.required': 'Email é obrigatório'
  }),
  role: Joi.string().valid('admin', 'member', 'viewer').optional().default('member')
});

const uuidSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID deve ser um UUID válido',
    'any.required': 'ID é obrigatório'
  })
});

const memberParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required()
});

/**
 * @route GET /api/v1/workspaces
 * @desc Listar workspaces do usuário
 * @access Private
 */
router.get('/', workspaceController.list);

/**
 * @route GET /api/v1/workspaces/:id
 * @desc Buscar workspace por ID
 * @access Private
 */
router.get('/:id', validateParams(uuidSchema), workspaceController.getById);

/**
 * @route POST /api/v1/workspaces
 * @desc Criar novo workspace
 * @access Private
 */
router.post('/', validateRequest(createWorkspaceSchema), workspaceController.create);

/**
 * @route PUT /api/v1/workspaces/:id
 * @desc Atualizar workspace
 * @access Private
 */
router.put(
  '/:id', 
  validateParams(uuidSchema),
  validateRequest(updateWorkspaceSchema),
  workspaceController.update
);

/**
 * @route DELETE /api/v1/workspaces/:id
 * @desc Deletar workspace
 * @access Private
 */
router.delete('/:id', validateParams(uuidSchema), workspaceController.delete);

/**
 * @route POST /api/v1/workspaces/:id/members
 * @desc Adicionar membro ao workspace
 * @access Private
 */
router.post(
  '/:id/members',
  validateParams(uuidSchema),
  validateRequest(addMemberSchema),
  workspaceController.addMember
);

/**
 * @route DELETE /api/v1/workspaces/:id/members/:userId
 * @desc Remover membro do workspace
 * @access Private
 */
router.delete(
  '/:id/members/:userId',
  validateParams(memberParamsSchema),
  workspaceController.removeMember
);

export default router;
