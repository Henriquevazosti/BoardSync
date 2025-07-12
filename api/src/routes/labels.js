import express from 'express';
import Joi from 'joi';
import labelController from '../controllers/labelController.js';
import { validateRequest, validateParams } from '../middlewares/validation.js';

const router = express.Router();

// Schemas de validação
const createLabelSchema = Joi.object({
  name: Joi.string().min(1).max(50).required().messages({
    'string.min': 'Nome não pode estar vazio',
    'string.max': 'Nome deve ter no máximo 50 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required().messages({
    'string.pattern.base': 'Cor deve estar no formato hexadecimal (#RRGGBB)',
    'any.required': 'Cor é obrigatória'
  }),
  description: Joi.string().max(255).optional()
});

const updateLabelSchema = Joi.object({
  name: Joi.string().min(1).max(50).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  description: Joi.string().max(255).allow('').optional()
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
 * @route GET /api/v1/labels/board/:boardId
 * @desc Listar labels de um board
 * @access Private
 */
router.get(
  '/board/:boardId',
  validateParams(boardParamsSchema),
  labelController.list
);

/**
 * @route GET /api/v1/labels/:id
 * @desc Buscar label por ID
 * @access Private
 */
router.get('/:id', validateParams(uuidSchema), labelController.getById);

/**
 * @route POST /api/v1/labels/board/:boardId
 * @desc Criar nova label
 * @access Private
 */
router.post(
  '/board/:boardId',
  validateParams(boardParamsSchema),
  validateRequest(createLabelSchema),
  labelController.create
);

/**
 * @route PUT /api/v1/labels/:id
 * @desc Atualizar label
 * @access Private
 */
router.put(
  '/:id',
  validateParams(uuidSchema),
  validateRequest(updateLabelSchema),
  labelController.update
);

/**
 * @route DELETE /api/v1/labels/:id
 * @desc Deletar label
 * @access Private
 */
router.delete('/:id', validateParams(uuidSchema), labelController.delete);

export default router;
