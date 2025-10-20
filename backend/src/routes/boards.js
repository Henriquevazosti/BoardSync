import express from 'express';
import Joi from 'joi';
import boardController from '../controllers/boardController.js';
import { validateRequest, validateParams } from '../middlewares/validation.js';

const router = express.Router();

// Schemas de validação
const createBoardSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  description: Joi.string().max(1000).optional(),
  background_color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
    'string.pattern.base': 'Cor deve estar no formato hexadecimal (#RRGGBB)'
  }),
  background_image: Joi.string().uri().optional().messages({
    'string.uri': 'URL da imagem deve ser válida'
  })
});

const updateBoardSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  description: Joi.string().max(1000).optional(),
  background_color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  background_image: Joi.string().uri().optional()
});

const uuidSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID deve ser um UUID válido',
    'any.required': 'ID é obrigatório'
  })
});

const workspaceBoardSchema = Joi.object({
  workspaceId: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do workspace deve ser um UUID válido',
    'any.required': 'ID do workspace é obrigatório'
  })
});

/**
 * @route GET /api/v1/boards/workspace/:workspaceId
 * @desc Listar boards do workspace
 * @access Private
 */
router.get(
  '/workspace/:workspaceId',
  validateParams(workspaceBoardSchema),
  boardController.list
);

/**
 * @route GET /api/v1/boards/:id
 * @desc Buscar board por ID com listas e cards
 * @access Private
 */
router.get('/:id', validateParams(uuidSchema), boardController.getById);

/**
 * @route POST /api/v1/boards/workspace/:workspaceId
 * @desc Criar novo board
 * @access Private
 */
router.post(
  '/workspace/:workspaceId',
  validateParams(workspaceBoardSchema),
  validateRequest(createBoardSchema),
  boardController.create
);

/**
 * @route PUT /api/v1/boards/:id
 * @desc Atualizar board
 * @access Private
 */
router.put(
  '/:id',
  validateParams(uuidSchema),
  validateRequest(updateBoardSchema),
  boardController.update
);

/**
 * @route DELETE /api/v1/boards/:id
 * @desc Deletar board
 * @access Private
 */
router.delete('/:id', validateParams(uuidSchema), boardController.delete);

export default router;
