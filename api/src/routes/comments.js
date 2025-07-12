import express from 'express';
import Joi from 'joi';
import commentController from '../controllers/commentController.js';
import { validateRequest, validateParams } from '../middlewares/validation.js';

const router = express.Router();

// Schemas de validação
const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required().messages({
    'string.min': 'Comentário não pode estar vazio',
    'string.max': 'Comentário deve ter no máximo 2000 caracteres',
    'any.required': 'Conteúdo é obrigatório'
  })
});

const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required().messages({
    'string.min': 'Comentário não pode estar vazio',
    'string.max': 'Comentário deve ter no máximo 2000 caracteres',
    'any.required': 'Conteúdo é obrigatório'
  })
});

const uuidSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID deve ser um UUID válido',
    'any.required': 'ID é obrigatório'
  })
});

const cardParamsSchema = Joi.object({
  cardId: Joi.string().uuid().required().messages({
    'string.uuid': 'ID do card deve ser um UUID válido',
    'any.required': 'ID do card é obrigatório'
  })
});

/**
 * @route GET /api/v1/comments/card/:cardId
 * @desc Listar comentários de um card
 * @access Private
 */
router.get(
  '/card/:cardId',
  validateParams(cardParamsSchema),
  commentController.list
);

/**
 * @route GET /api/v1/comments/:id
 * @desc Buscar comentário por ID
 * @access Private
 */
router.get('/:id', validateParams(uuidSchema), commentController.getById);

/**
 * @route POST /api/v1/comments/card/:cardId
 * @desc Criar novo comentário
 * @access Private
 */
router.post(
  '/card/:cardId',
  validateParams(cardParamsSchema),
  validateRequest(createCommentSchema),
  commentController.create
);

/**
 * @route PUT /api/v1/comments/:id
 * @desc Atualizar comentário
 * @access Private
 */
router.put(
  '/:id',
  validateParams(uuidSchema),
  validateRequest(updateCommentSchema),
  commentController.update
);

/**
 * @route DELETE /api/v1/comments/:id
 * @desc Deletar comentário
 * @access Private
 */
router.delete('/:id', validateParams(uuidSchema), commentController.delete);

export default router;
