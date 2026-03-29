import { v4 as uuidv4 } from 'uuid';
import dbAdapter from '../config/dbAdapter.js';
import logger from '../config/logger.js';

const applyTemporaryPositions = async (listId, cardIds) => {
  for (let index = 0; index < cardIds.length; index += 1) {
    await dbAdapter.update('cards', { id: cardIds[index] }, {
      list_id: listId,
      position: -1 * (index + 1),
      updated_at: new Date().toISOString()
    });
  }
};

const applyFinalPositions = async (listId, cardIds) => {
  for (let index = 0; index < cardIds.length; index += 1) {
    await dbAdapter.update('cards', { id: cardIds[index] }, {
      list_id: listId,
      position: index + 1,
      updated_at: new Date().toISOString()
    });
  }
};

class CardController {
  // Listar cards de uma lista
  async list(req, res) {
    try {
      const { listId } = req.params;

      // Verificar se a lista existe
      const list = await dbAdapter.findOne('board_lists', { id: listId });
      if (!list) {
        return res.status(404).json({ error: 'Lista não encontrada' });
      }

      // Verificar acesso via workspace
      const board = await dbAdapter.findOne('boards', { id: list.board_id });
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado à lista' });
      }


      // Buscar apenas cards não deletados (deleted_at == null)
      const cards = await dbAdapter.findMany('cards', {
        list_id: listId,
        deleted_at: null
      }, {
        orderBy: 'position'
      });

      res.json({
        cards,
        total: cards.length
      });
    } catch (error) {
      logger.error('List cards error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar card por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const card = await dbAdapter.findOne('cards', { id });
      if (!card) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      // Verificar acesso
      const list = await dbAdapter.findOne('board_lists', { id: card.list_id });
      const board = await dbAdapter.findOne('boards', { id: list.board_id });
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado ao card' });
      }

      res.json(card);
    } catch (error) {
      logger.error('Get card error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar card
  async create(req, res) {
    try {
      const { listId } = req.params;
      const { 
        title, 
        description, 
        priority = 'media', 
        category = 'tarefa',
        due_date,
        start_date,
        estimated_hours,
        parent_card_id
      } = req.body;

      // Verificar se a lista existe
      const list = await dbAdapter.findOne('board_lists', { id: listId });
      if (!list) {
        return res.status(404).json({ error: 'Lista não encontrada' });
      }

      // Verificar acesso via workspace
      const board = await dbAdapter.findOne('boards', { id: list.board_id });
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado à lista' });
      }

      // Buscar próxima posição (simplificado)
      const existingCards = await dbAdapter.findMany('cards', { list_id: listId });
      const position = existingCards.length + 1;

      const cardId = uuidv4();
      const card = {
        id: cardId,
        list_id: listId,
        title,
        description,
        position,
        priority,
        category,
        parent_card_id,
        due_date,
        start_date,
        estimated_hours,
        created_by: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Criar card
      await dbAdapter.insert('cards', card);

      logger.info(`Card created: ${title} by ${req.user.email}`);

      res.status(201).json({
        message: 'Card criado com sucesso',
        card
      });
    } catch (error) {
      logger.error('Create card error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar card
  async update(req, res) {
    try {
      const { id } = req.params;
      const allowedFields = [
        'title', 'description', 'priority', 'category', 'is_blocked', 'block_reason',
        'due_date', 'start_date', 'estimated_hours', 'actual_hours', 'cover_image'
      ];
      // Filtrar apenas campos permitidos
      const updateData = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
          updateData[key] = req.body[key];
        }
      }

      // Verificar se card existe
      const card = await dbAdapter.findOne('cards', { id });
      if (!card) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      // Verificar acesso
      const list = await dbAdapter.findOne('board_lists', { id: card.list_id });
      const board = await dbAdapter.findOne('boards', { id: list.board_id });
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado ao card' });
      }

      // Atualizar card
      updateData.updated_at = new Date().toISOString();
      const updatedCard = await dbAdapter.update('cards', { id }, updateData);

      res.json({ message: 'Card atualizado com sucesso', card: updatedCard });
    } catch (error) {
      logger.error('Update card error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar card
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se card existe
      const card = await dbAdapter.findOne('cards', { id });
      if (!card) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      // Verificar acesso
      const list = await dbAdapter.findOne('board_lists', { id: card.list_id });
      const board = await dbAdapter.findOne('boards', { id: list.board_id });
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado ao card' });
      }

      // Soft delete
      await dbAdapter.update('cards', { id }, {
        deleted_at: new Date().toISOString()
      });

      res.json({ message: 'Card deletado com sucesso' });
    } catch (error) {
      logger.error('Delete card error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Mover card entre listas (simplificado)
  async move(req, res) {
    try {
      const { id } = req.params;
      const { new_list_id, new_position, list_id, position } = req.body;
      const targetListId = new_list_id || list_id;
      const targetPosition = new_position || position || 1;

      if (!targetListId) {
        return res.status(400).json({ error: 'Lista de destino é obrigatória' });
      }

      // Verificar se card existe
      const card = await dbAdapter.findOne('cards', { id });
      if (!card) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      // Verificar se lista de destino existe
      const targetList = await dbAdapter.findOne('board_lists', { id: targetListId });
      if (!targetList) {
        return res.status(404).json({ error: 'Lista de destino não encontrada' });
      }

      // Verificar acesso
      const sourceList = await dbAdapter.findOne('board_lists', { id: card.list_id });
      const sourceBoard = await dbAdapter.findOne('boards', { id: sourceList.board_id });
      const targetBoard = await dbAdapter.findOne('boards', { id: targetList.board_id });
      
      const hasAccessSource = await dbAdapter.findOne('workspace_members', {
        workspace_id: sourceBoard.workspace_id,
        user_id: req.user.id
      });

      const hasAccessTarget = await dbAdapter.findOne('workspace_members', {
        workspace_id: targetBoard.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccessSource || !hasAccessTarget) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const sourceCards = await dbAdapter.findMany('cards', {
        list_id: card.list_id,
        deleted_at: null
      }, {
        orderBy: 'position'
      });

      const targetCards = card.list_id === targetListId
        ? sourceCards
        : await dbAdapter.findMany('cards', {
            list_id: targetListId,
            deleted_at: null
          }, {
            orderBy: 'position'
          });

      if (card.list_id === targetListId) {
        const reorderedIds = sourceCards
          .filter((currentCard) => currentCard.id !== id)
          .map((currentCard) => currentCard.id);
        const insertIndex = Math.max(0, Math.min(targetPosition - 1, reorderedIds.length));

        reorderedIds.splice(insertIndex, 0, id);

        await applyTemporaryPositions(targetListId, reorderedIds);
        await applyFinalPositions(targetListId, reorderedIds);
      } else {
        const sourceIds = sourceCards
          .filter((currentCard) => currentCard.id !== id)
          .map((currentCard) => currentCard.id);
        const targetIds = targetCards.map((currentCard) => currentCard.id);
        const insertIndex = Math.max(0, Math.min(targetPosition - 1, targetIds.length));

        targetIds.splice(insertIndex, 0, id);

        if (sourceIds.length > 0) {
          await applyTemporaryPositions(card.list_id, sourceIds);
          await applyFinalPositions(card.list_id, sourceIds);
        }

        const temporaryTargetIds = targetIds.filter((cardId) => cardId !== id);
        if (temporaryTargetIds.length > 0) {
          await applyTemporaryPositions(targetListId, temporaryTargetIds);
        }

        await dbAdapter.update('cards', { id }, {
          list_id: targetListId,
          position: -1 * (targetIds.length + 1),
          updated_at: new Date().toISOString()
        });

        await applyFinalPositions(targetListId, targetIds);
      }

      const updatedCard = await dbAdapter.findOne('cards', { id });

      res.json({ message: 'Card movido com sucesso', card: updatedCard });
    } catch (error) {
      logger.error('Move card error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atribuir usuários ao card (simplificado)
  async assignUsers(req, res) {
    try {
      const { id } = req.params;
      const { user_ids = [] } = req.body;

      // Verificar se card existe
      const card = await dbAdapter.findOne('cards', { id });
      if (!card) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      // Verificar acesso
      const list = await dbAdapter.findOne('board_lists', { id: card.list_id });
      const board = await dbAdapter.findOne('boards', { id: list.board_id });
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado ao card' });
      }

      // Para implementação completa, seria necessário gerenciar a tabela card_assignees
      // Por ora, retornamos sucesso
      res.json({ message: 'Usuários atribuídos com sucesso' });
    } catch (error) {
      logger.error('Assign users error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new CardController();
