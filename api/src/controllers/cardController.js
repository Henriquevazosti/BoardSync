import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import logger from '../config/logger.js';

class CardController {
  // Listar cards de uma lista
  async list(req, res) {
    try {
      const { listId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      // Verificar acesso à lista
      const listAccess = await this.checkListAccess(req.user.id, listId);
      if (!listAccess) {
        return res.status(403).json({ 
          error: 'Acesso negado à lista' 
        });
      }

      const cards = await db('cards as c')
        .leftJoin('users as creator', 'c.created_by', 'creator.id')
        .where('c.list_id', listId)
        .whereNull('c.deleted_at')
        .select(
          'c.*',
          'creator.name as created_by_name'
        )
        .orderBy('c.position')
        .limit(limit)
        .offset(offset);

      // Buscar dados relacionados para cada card
      for (let card of cards) {
        await this.populateCardData(card);
      }

      const total = await db('cards')
        .where('list_id', listId)
        .whereNull('deleted_at')
        .count('* as count')
        .first();

      res.json({
        cards,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.count),
          pages: Math.ceil(total.count / limit)
        }
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

      const card = await db('cards as c')
        .leftJoin('board_lists as bl', 'c.list_id', 'bl.id')
        .leftJoin('boards as b', 'bl.board_id', 'b.id')
        .leftJoin('users as creator', 'c.created_by', 'creator.id')
        .where('c.id', id)
        .whereNull('c.deleted_at')
        .select(
          'c.*',
          'bl.name as list_name',
          'b.name as board_name',
          'b.id as board_id',
          'creator.name as created_by_name'
        )
        .first();

      if (!card) {
        return res.status(404).json({ 
          error: 'Card não encontrado' 
        });
      }

      // Verificar acesso
      const hasAccess = await this.checkCardAccess(req.user.id, id);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Acesso negado ao card' 
        });
      }

      // Popular dados relacionados
      await this.populateCardData(card);

      // Buscar comentários
      const comments = await db('comments as c')
        .join('users as u', 'c.user_id', 'u.id')
        .where('c.card_id', id)
        .whereNull('c.deleted_at')
        .select(
          'c.*',
          'u.name as user_name',
          'u.avatar as user_avatar'
        )
        .orderBy('c.created_at', 'desc');

      // Buscar anexos
      const attachments = await db('attachments')
        .where('card_id', id)
        .orderBy('created_at', 'desc');

      // Buscar subtasks
      const subtasks = await db('cards')
        .where('parent_card_id', id)
        .whereNull('deleted_at')
        .orderBy('position');

      res.json({
        ...card,
        comments,
        attachments,
        subtasks
      });
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

      // Verificar acesso à lista
      const listAccess = await this.checkListAccess(req.user.id, listId);
      if (!listAccess) {
        return res.status(403).json({ 
          error: 'Acesso negado à lista' 
        });
      }

      // Buscar próxima posição
      const lastPosition = await db('cards')
        .where('list_id', listId)
        .whereNull('deleted_at')
        .max('position as max_position')
        .first();

      const position = (lastPosition.max_position || 0) + 1;

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
        created_by: req.user.id
      };

      await db.transaction(async (trx) => {
        // Criar card
        await trx('cards').insert(card);

        // Buscar board_id para atividade
        const list = await trx('board_lists').where('id', listId).first();

        // Registrar atividade
        await trx('activities').insert({
          id: uuidv4(),
          board_id: list.board_id,
          card_id: cardId,
          user_id: req.user.id,
          action_type: 'card_created',
          description: 'Card criado',
          new_value: { title, list_id: listId }
        });
      });

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
      const updateData = req.body;

      // Verificar acesso
      const hasAccess = await this.checkCardAccess(req.user.id, id);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Acesso negado ao card' 
        });
      }

      // Buscar card atual
      const currentCard = await db('cards').where('id', id).first();
      if (!currentCard) {
        return res.status(404).json({ 
          error: 'Card não encontrado' 
        });
      }

      // Filtrar campos permitidos
      const allowedFields = [
        'title', 'description', 'priority', 'category', 'is_blocked', 
        'block_reason', 'due_date', 'start_date', 'estimated_hours', 
        'actual_hours', 'cover_image'
      ];

      const filteredData = {};
      for (let field of allowedFields) {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      }

      if (Object.keys(filteredData).length === 0) {
        return res.status(400).json({ 
          error: 'Nenhum campo válido para atualizar' 
        });
      }

      await db.transaction(async (trx) => {
        // Atualizar card
        await trx('cards')
          .where({ id })
          .whereNull('deleted_at')
          .update(filteredData);

        // Buscar board_id para atividade
        const cardWithBoard = await trx('cards as c')
          .join('board_lists as bl', 'c.list_id', 'bl.id')
          .where('c.id', id)
          .select('bl.board_id')
          .first();

        // Registrar atividade
        await trx('activities').insert({
          id: uuidv4(),
          board_id: cardWithBoard.board_id,
          card_id: id,
          user_id: req.user.id,
          action_type: 'card_updated',
          description: 'Card atualizado',
          old_value: currentCard,
          new_value: filteredData
        });
      });

      logger.info(`Card updated: ${id} by ${req.user.email}`);

      res.json({
        message: 'Card atualizado com sucesso'
      });
    } catch (error) {
      logger.error('Update card error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Mover card entre listas
  async move(req, res) {
    try {
      const { id } = req.params;
      const { new_list_id, new_position } = req.body;

      // Verificar acesso ao card
      const hasAccess = await this.checkCardAccess(req.user.id, id);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Acesso negado ao card' 
        });
      }

      // Verificar acesso à nova lista
      const newListAccess = await this.checkListAccess(req.user.id, new_list_id);
      if (!newListAccess) {
        return res.status(403).json({ 
          error: 'Acesso negado à nova lista' 
        });
      }

      await db.transaction(async (trx) => {
        // Buscar posição atual
        const currentCard = await trx('cards').where('id', id).first();
        
        // Se mudou de lista
        if (currentCard.list_id !== new_list_id) {
          // Ajustar posições na lista antiga
          await trx('cards')
            .where('list_id', currentCard.list_id)
            .where('position', '>', currentCard.position)
            .whereNull('deleted_at')
            .decrement('position', 1);

          // Ajustar posições na nova lista
          await trx('cards')
            .where('list_id', new_list_id)
            .where('position', '>=', new_position)
            .whereNull('deleted_at')
            .increment('position', 1);
        } else {
          // Movimento dentro da mesma lista
          if (new_position > currentCard.position) {
            await trx('cards')
              .where('list_id', new_list_id)
              .whereBetween('position', [currentCard.position + 1, new_position])
              .whereNull('deleted_at')
              .decrement('position', 1);
          } else if (new_position < currentCard.position) {
            await trx('cards')
              .where('list_id', new_list_id)
              .whereBetween('position', [new_position, currentCard.position - 1])
              .whereNull('deleted_at')
              .increment('position', 1);
          }
        }

        // Mover o card
        await trx('cards')
          .where('id', id)
          .update({
            list_id: new_list_id,
            position: new_position
          });

        // Buscar board_id para atividade
        const list = await trx('board_lists').where('id', new_list_id).first();

        // Registrar atividade
        await trx('activities').insert({
          id: uuidv4(),
          board_id: list.board_id,
          card_id: id,
          user_id: req.user.id,
          action_type: 'card_moved',
          description: 'Card movido',
          old_value: { list_id: currentCard.list_id, position: currentCard.position },
          new_value: { list_id: new_list_id, position: new_position }
        });
      });

      // Emitir evento para WebSocket
      const io = req.app.get('io');
      const list = await db('board_lists').where('id', new_list_id).first();
      io.to(`board-${list.board_id}`).emit('card-moved', {
        cardId: id,
        oldListId: req.body.old_list_id,
        newListId: new_list_id,
        newPosition: new_position
      });

      logger.info(`Card moved: ${id} by ${req.user.email}`);

      res.json({
        message: 'Card movido com sucesso'
      });
    } catch (error) {
      logger.error('Move card error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atribuir/desatribuir usuários
  async assignUsers(req, res) {
    try {
      const { id } = req.params;
      const { user_ids } = req.body;

      // Verificar acesso
      const hasAccess = await this.checkCardAccess(req.user.id, id);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Acesso negado ao card' 
        });
      }

      await db.transaction(async (trx) => {
        // Remover assignees atuais
        await trx('card_assignees').where('card_id', id).del();

        // Adicionar novos assignees
        if (user_ids && user_ids.length > 0) {
          const assignees = user_ids.map(userId => ({
            id: uuidv4(),
            card_id: id,
            user_id: userId,
            assigned_by: req.user.id
          }));

          await trx('card_assignees').insert(assignees);
        }

        // Buscar board_id para atividade
        const cardWithBoard = await trx('cards as c')
          .join('board_lists as bl', 'c.list_id', 'bl.id')
          .where('c.id', id)
          .select('bl.board_id')
          .first();

        // Registrar atividade
        await trx('activities').insert({
          id: uuidv4(),
          board_id: cardWithBoard.board_id,
          card_id: id,
          user_id: req.user.id,
          action_type: 'users_assigned',
          description: 'Usuários atribuídos ao card',
          new_value: { user_ids }
        });
      });

      logger.info(`Users assigned to card: ${id} by ${req.user.email}`);

      res.json({
        message: 'Usuários atribuídos com sucesso'
      });
    } catch (error) {
      logger.error('Assign users error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar card
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar acesso
      const hasAccess = await this.checkCardAccess(req.user.id, id);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Acesso negado ao card' 
        });
      }

      const deleted = await db('cards')
        .where({ id })
        .whereNull('deleted_at')
        .update({ deleted_at: new Date() });

      if (!deleted) {
        return res.status(404).json({ 
          error: 'Card não encontrado' 
        });
      }

      // Buscar board_id para atividade
      const cardWithBoard = await db('cards as c')
        .join('board_lists as bl', 'c.list_id', 'bl.id')
        .where('c.id', id)
        .select('bl.board_id')
        .first();

      // Registrar atividade
      await db('activities').insert({
        id: uuidv4(),
        board_id: cardWithBoard.board_id,
        card_id: id,
        user_id: req.user.id,
        action_type: 'card_deleted',
        description: 'Card deletado'
      });

      logger.info(`Card deleted: ${id} by ${req.user.email}`);

      res.json({
        message: 'Card deletado com sucesso'
      });
    } catch (error) {
      logger.error('Delete card error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Métodos auxiliares
  async populateCardData(card) {
    // Assignees
    const assignees = await db('card_assignees as ca')
      .join('users as u', 'ca.user_id', 'u.id')
      .where('ca.card_id', card.id)
      .select(
        'u.id',
        'u.name',
        'u.email',
        'u.avatar',
        'u.color'
      );

    // Labels
    const labels = await db('card_labels as cl')
      .join('labels as l', 'cl.label_id', 'l.id')
      .where('cl.card_id', card.id)
      .select(
        'l.id',
        'l.name',
        'l.color',
        'l.bg_color'
      );

    // Contadores
    const counts = await db.raw(`
      SELECT 
        (SELECT COUNT(*) FROM comments WHERE card_id = ? AND deleted_at IS NULL) as comment_count,
        (SELECT COUNT(*) FROM attachments WHERE card_id = ?) as attachment_count,
        (SELECT COUNT(*) FROM cards WHERE parent_card_id = ? AND deleted_at IS NULL) as subtask_count
    `, [card.id, card.id, card.id]);

    card.assignees = assignees;
    card.labels = labels;
    card.comment_count = parseInt(counts.rows[0].comment_count) || 0;
    card.attachment_count = parseInt(counts.rows[0].attachment_count) || 0;
    card.subtask_count = parseInt(counts.rows[0].subtask_count) || 0;
  }

  async checkCardAccess(userId, cardId) {
    const access = await db('cards as c')
      .join('board_lists as bl', 'c.list_id', 'bl.id')
      .join('boards as b', 'bl.board_id', 'b.id')
      .leftJoin('workspace_members as wm', 'b.workspace_id', 'wm.workspace_id')
      .where('c.id', cardId)
      .where('wm.user_id', userId)
      .first();

    return !!access;
  }

  async checkListAccess(userId, listId) {
    const access = await db('board_lists as bl')
      .join('boards as b', 'bl.board_id', 'b.id')
      .leftJoin('workspace_members as wm', 'b.workspace_id', 'wm.workspace_id')
      .where('bl.id', listId)
      .where('wm.user_id', userId)
      .first();

    return !!access;
  }
}

export default new CardController();
