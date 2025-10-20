import { v4 as uuidv4 } from 'uuid';
import dbAdapter from '../config/dbAdapter.js';
import logger from '../config/logger.js';

class CommentController {
  // Listar comentários de um card
  async list(req, res) {
    try {
      const { cardId } = req.params;

      // Verificar se o card existe
      const card = await dbAdapter.findOne('cards', { id: cardId });
      if (!card) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      // Verificar acesso via workspace
      const list = await dbAdapter.findOne('board_lists', { id: card.list_id });
      const board = await dbAdapter.findOne('boards', { id: list.board_id });
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado ao card' });
      }

      // Buscar comentários do card
      const comments = await dbAdapter.findMany('comments', { 
        card_id: cardId 
      }, ['created_at', 'desc']);

      res.json({
        comments,
        total: comments.length
      });
    } catch (error) {
      logger.error('Error listing card comments:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar comentário por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const comment = await dbAdapter.findOne('comments', { id });
      if (!comment) {
        return res.status(404).json({ error: 'Comentário não encontrado' });
      }

      // Verificar acesso via workspace
      const card = await dbAdapter.findOne('cards', { id: comment.card_id });
      const list = await dbAdapter.findOne('board_lists', { id: card.list_id });
      const board = await dbAdapter.findOne('boards', { id: list.board_id });
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado ao comentário' });
      }

      res.json({ comment });
    } catch (error) {
      logger.error('Error getting comment by ID:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar novo comentário
  async create(req, res) {
    try {
      const { cardId } = req.params;
      const { content } = req.body;

      // Verificar se o card existe
      const card = await dbAdapter.findOne('cards', { id: cardId });
      if (!card) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      // Verificar acesso via workspace
      const list = await dbAdapter.findOne('board_lists', { id: card.list_id });
      const board = await dbAdapter.findOne('boards', { id: list.board_id });
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado ao card' });
      }

      // Criar comentário
      const commentData = {
        id: uuidv4(),
        card_id: cardId,
        user_id: req.user.id,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const comment = await dbAdapter.insert('comments', commentData);

      // Adicionar informações do usuário
      const user = await dbAdapter.findOne('users', { id: req.user.id });
      comment.user = {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      };

      res.status(201).json({
        message: 'Comentário criado com sucesso',
        comment
      });
    } catch (error) {
      logger.error('Error creating comment:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar comentário
  async update(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      // Verificar se o comentário existe
      const comment = await dbAdapter.findOne('comments', { id });
      if (!comment) {
        return res.status(404).json({ error: 'Comentário não encontrado' });
      }

      // Verificar se é o autor do comentário
      if (comment.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Apenas o autor pode editar o comentário' });
      }

      // Verificar acesso via workspace
      const card = await dbAdapter.findOne('cards', { id: comment.card_id });
      const list = await dbAdapter.findOne('board_lists', { id: card.list_id });
      const board = await dbAdapter.findOne('boards', { id: list.board_id });
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado ao comentário' });
      }

      // Atualizar comentário
      const updateData = {
        content,
        updated_at: new Date().toISOString()
      };

      const updatedComment = await dbAdapter.update('comments', { id }, updateData);

      res.json({
        message: 'Comentário atualizado com sucesso',
        comment: updatedComment
      });
    } catch (error) {
      logger.error('Error updating comment:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar comentário
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o comentário existe
      const comment = await dbAdapter.findOne('comments', { id });
      if (!comment) {
        return res.status(404).json({ error: 'Comentário não encontrado' });
      }

      // Verificar se é o autor do comentário
      if (comment.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Apenas o autor pode deletar o comentário' });
      }

      // Verificar acesso via workspace
      const card = await dbAdapter.findOne('cards', { id: comment.card_id });
      const list = await dbAdapter.findOne('board_lists', { id: card.list_id });
      const board = await dbAdapter.findOne('boards', { id: list.board_id });
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado ao comentário' });
      }

      // Deletar comentário
      await dbAdapter.delete('comments', { id });

      res.json({
        message: 'Comentário deletado com sucesso'
      });
    } catch (error) {
      logger.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new CommentController();
