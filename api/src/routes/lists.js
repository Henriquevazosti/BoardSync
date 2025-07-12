import express from 'express';
import Joi from 'joi';
import listController from '../controllers/listController.js';
import { validateRequest, validateParams } from '../middlewares/validation.js';

const router = express.Router();

// Schemas de validação
const createListSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    'string.min': 'Nome não pode estar vazio',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
    'string.pattern.base': 'Cor deve estar no formato hexadecimal (#RRGGBB)'
  })
});

const updateListSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).allow(null).optional(),
  position: Joi.number().integer().min(1).optional()
});

const uuidSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID deve ser um UUID válido',
    'any.required': 'ID é obrigatório'
  })
});

const boardParamsSchema = Joi.object({
  boardId: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do board deve ser um UUID válido',
    'any.required': 'ID do board é obrigatório'
  })
});

/**
 * @route GET /api/v1/lists/board/:boardId
 * @desc Listar listas de um board
 * @access Private
 */
router.get(
  '/board/:boardId',
  validateParams(boardParamsSchema),
  listController.list
);

/**
 * @route GET /api/v1/lists/:id
 * @desc Buscar lista por ID
 * @access Private
 */
router.get('/:id', validateParams(uuidSchema), listController.getById);

/**
 * @route POST /api/v1/lists/board/:boardId
 * @desc Criar nova lista
 * @access Private
 */
router.post(
  '/board/:boardId',
  validateParams(boardParamsSchema),
  validateRequest(createListSchema),
  listController.create
);

/**
 * @route PUT /api/v1/lists/:id
 * @desc Atualizar lista
 * @access Private
 */
router.put(
  '/:id',
  validateParams(uuidSchema),
  validateRequest(updateListSchema),
  listController.update
);

/**
 * @route DELETE /api/v1/lists/:id
 * @desc Deletar lista
 * @access Private
 */
router.delete('/:id', validateParams(uuidSchema), listController.delete);

export default router;
