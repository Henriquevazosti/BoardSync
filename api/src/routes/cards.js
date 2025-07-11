import express from 'express';
import Joi from 'joi';
import cardController from '../controllers/cardController.js';
import { validateRequest, validateParams, validateQuery } from '../middlewares/validation.js';

const router = express.Router();

// Schemas de validação
const createCardSchema = Joi.object({
  title: Joi.string().min(1).max(500).required().messages({
    'string.min': 'Título não pode estar vazio',
    'string.max': 'Título deve ter no máximo 500 caracteres',
    'any.required': 'Título é obrigatório'
  }),
  description: Joi.string().max(10000).optional(),
  priority: Joi.string().valid('baixa', 'media', 'alta').optional().default('media'),
  category: Joi.string().max(50).optional().default('tarefa'),
  due_date: Joi.date().iso().optional(),
  start_date: Joi.date().iso().optional(),
  estimated_hours: Joi.number().min(0).max(9999.99).optional(),
  parent_card_id: Joi.string().uuid().optional()
});

const updateCardSchema = Joi.object({
  title: Joi.string().min(1).max(500).optional(),
  description: Joi.string().max(10000).allow('').optional(),
  priority: Joi.string().valid('baixa', 'media', 'alta').optional(),
  category: Joi.string().max(50).optional(),
  is_blocked: Joi.boolean().optional(),
  block_reason: Joi.string().max(1000).allow('').optional(),
  due_date: Joi.date().iso().allow(null).optional(),
  start_date: Joi.date().iso().allow(null).optional(),
  estimated_hours: Joi.number().min(0).max(9999.99).allow(null).optional(),
  actual_hours: Joi.number().min(0).max(9999.99).allow(null).optional(),
  cover_image: Joi.string().uri().allow('').optional()
});

const moveCardSchema = Joi.object({
  new_list_id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID da nova lista deve ser um UUID válido',
    'any.required': 'ID da nova lista é obrigatório'
  }),
  new_position: Joi.number().integer().min(1).required().messages({
    'number.base': 'Nova posição deve ser um número',
    'number.integer': 'Nova posição deve ser um número inteiro',
    'number.min': 'Nova posição deve ser maior que 0',
    'any.required': 'Nova posição é obrigatória'
  }),
  old_list_id: Joi.string().uuid().optional()
});

const assignUsersSchema = Joi.object({
  user_ids: Joi.array().items(Joi.string().uuid()).required().messages({
    'array.base': 'IDs dos usuários devem ser um array',
    'any.required': 'IDs dos usuários são obrigatórios'
  })
});

const uuidSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID deve ser um UUID válido',
    'any.required': 'ID é obrigatório'
  })
});

const listParamsSchema = Joi.object({
  listId: Joi.string().uuid().required().messages({
    'string.uuid': 'ID da lista deve ser um UUID válido',
    'any.required': 'ID da lista é obrigatório'
  })
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(50)
});

/**
 * @route GET /api/v1/cards/list/:listId
 * @desc Listar cards de uma lista
 * @access Private
 */
router.get(
  '/list/:listId',
  validateParams(listParamsSchema),
  validateQuery(paginationSchema),
  cardController.list
);

/**
 * @route GET /api/v1/cards/:id
 * @desc Buscar card por ID
 * @access Private
 */
router.get('/:id', validateParams(uuidSchema), cardController.getById);

/**
 * @route POST /api/v1/cards/list/:listId
 * @desc Criar novo card
 * @access Private
 */
router.post(
  '/list/:listId',
  validateParams(listParamsSchema),
  validateRequest(createCardSchema),
  cardController.create
);

/**
 * @route PUT /api/v1/cards/:id
 * @desc Atualizar card
 * @access Private
 */
router.put(
  '/:id',
  validateParams(uuidSchema),
  validateRequest(updateCardSchema),
  cardController.update
);

/**
 * @route POST /api/v1/cards/:id/move
 * @desc Mover card entre listas
 * @access Private
 */
router.post(
  '/:id/move',
  validateParams(uuidSchema),
  validateRequest(moveCardSchema),
  cardController.move
);

/**
 * @route POST /api/v1/cards/:id/assign
 * @desc Atribuir/desatribuir usuários ao card
 * @access Private
 */
router.post(
  '/:id/assign',
  validateParams(uuidSchema),
  validateRequest(assignUsersSchema),
  cardController.assignUsers
);

/**
 * @route DELETE /api/v1/cards/:id
 * @desc Deletar card
 * @access Private
 */
router.delete('/:id', validateParams(uuidSchema), cardController.delete);

export default router;
