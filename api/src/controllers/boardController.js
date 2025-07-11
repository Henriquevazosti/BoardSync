import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import logger from '../config/logger.js';

class BoardController {
  // Listar boards do workspace
  async list(req, res) {
    try {
      const { workspaceId } = req.params;

      // Verificar acesso ao workspace
      const membership = await db('workspace_members')
        .where({
          workspace_id: workspaceId,
          user_id: req.user.id
        })
        .first();

      if (!membership) {
        return res.status(403).json({ 
          error: 'Acesso negado ao workspace' 
        });
      }

      const boards = await db('boards as b')
        .leftJoin('users as creator', 'b.created_by', 'creator.id')
        .where('b.workspace_id', workspaceId)
        .whereNull('b.deleted_at')
        .select(
          'b.*',
          'creator.name as created_by_name'
        )
        .orderBy('b.created_at', 'desc');

      // Adicionar estatísticas para cada board
      for (let board of boards) {
        const stats = await db('board_lists as bl')
          .leftJoin('cards as c', 'bl.id', 'c.list_id')
          .where('bl.board_id', board.id)
          .whereNull('c.deleted_at')
          .select(
            db.raw('COUNT(DISTINCT bl.id) as list_count'),
            db.raw('COUNT(DISTINCT c.id) as card_count'),
            db.raw('COUNT(DISTINCT CASE WHEN c.completed_at IS NOT NULL THEN c.id END) as completed_cards')
          )
          .first();

        board.stats = {
          lists: parseInt(stats.list_count) || 0,
          cards: parseInt(stats.card_count) || 0,
          completed_cards: parseInt(stats.completed_cards) || 0
        };
      }

      res.json({
        boards,
        total: boards.length
      });
    } catch (error) {
      logger.error('List boards error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar board por ID com listas e cards
  async getById(req, res) {
    try {
      const { id } = req.params;

      // Buscar board
      const board = await db('boards as b')
        .join('workspaces as w', 'b.workspace_id', 'w.id')
        .leftJoin('users as creator', 'b.created_by', 'creator.id')
        .where('b.id', id)
        .whereNull('b.deleted_at')
        .select(
          'b.*',
          'w.name as workspace_name',
          'creator.name as created_by_name'
        )
        .first();

      if (!board) {
        return res.status(404).json({ 
          error: 'Board não encontrado' 
        });
      }

      // Verificar acesso
      const hasAccess = await this.checkBoardAccess(req.user.id, id);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Acesso negado ao board' 
        });
      }

      // Buscar listas
      const lists = await db('board_lists')
        .where('board_id', id)
        .whereNull('deleted_at')
        .orderBy('position')
        .select('*');

      // Buscar cards para cada lista
      for (let list of lists) {
        const cards = await db('cards as c')
          .leftJoin('users as creator', 'c.created_by', 'creator.id')
          .where('c.list_id', list.id)
          .whereNull('c.deleted_at')
          .select(
            'c.*',
            'creator.name as created_by_name'
          )
          .orderBy('c.position');

        // Buscar assignees e labels para cada card
        for (let card of cards) {
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

        list.cards = cards;
      }

      // Buscar labels do board
      const boardLabels = await db('labels')
        .where('board_id', id)
        .orderBy('name')
        .select('*');

      res.json({
        ...board,
        lists,
        labels: boardLabels
      });
    } catch (error) {
      logger.error('Get board error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar board
  async create(req, res) {
    try {
      const { workspaceId } = req.params;
      const { name, description, background_color, background_image } = req.body;

      // Verificar acesso ao workspace
      const membership = await db('workspace_members')
        .where({
          workspace_id: workspaceId,
          user_id: req.user.id
        })
        .first();

      if (!membership) {
        return res.status(403).json({ 
          error: 'Acesso negado ao workspace' 
        });
      }

      const boardId = uuidv4();
      const board = {
        id: boardId,
        workspace_id: workspaceId,
        name,
        description,
        background_color: background_color || '#ffffff',
        background_image,
        created_by: req.user.id
      };

      await db.transaction(async (trx) => {
        // Criar board
        await trx('boards').insert(board);

        // Criar listas padrão
        const defaultLists = [
          { name: 'Para Fazer', position: 1 },
          { name: 'Em Andamento', position: 2 },
          { name: 'Concluído', position: 3 }
        ];

        for (let listData of defaultLists) {
          await trx('board_lists').insert({
            id: uuidv4(),
            board_id: boardId,
            name: listData.name,
            position: listData.position
          });
        }

        // Registrar atividade
        await trx('activities').insert({
          id: uuidv4(),
          workspace_id: workspaceId,
          board_id: boardId,
          user_id: req.user.id,
          action_type: 'board_created',
          description: 'Board criado',
          new_value: { name }
        });
      });

      logger.info(`Board created: ${name} by ${req.user.email}`);

      res.status(201).json({
        message: 'Board criado com sucesso',
        board
      });
    } catch (error) {
      logger.error('Create board error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar board
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, background_color, background_image } = req.body;

      // Verificar acesso
      const hasAccess = await this.checkBoardAccess(req.user.id, id);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Acesso negado ao board' 
        });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (background_color !== undefined) updateData.background_color = background_color;
      if (background_image !== undefined) updateData.background_image = background_image;

      const updated = await db('boards')
        .where({ id })
        .whereNull('deleted_at')
        .update(updateData);

      if (!updated) {
        return res.status(404).json({ 
          error: 'Board não encontrado' 
        });
      }

      // Registrar atividade
      await db('activities').insert({
        id: uuidv4(),
        board_id: id,
        user_id: req.user.id,
        action_type: 'board_updated',
        description: 'Board atualizado',
        new_value: updateData
      });

      logger.info(`Board updated: ${id} by ${req.user.email}`);

      res.json({
        message: 'Board atualizado com sucesso'
      });
    } catch (error) {
      logger.error('Update board error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar board
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar permissão (apenas criador ou admin do workspace)
      const board = await db('boards as b')
        .join('workspace_members as wm', 'b.workspace_id', 'wm.workspace_id')
        .where('b.id', id)
        .where('wm.user_id', req.user.id)
        .where(function() {
          this.where('b.created_by', req.user.id)
              .orWhere('wm.role', 'admin');
        })
        .select('b.*')
        .first();

      if (!board) {
        return res.status(403).json({ 
          error: 'Permissão insuficiente para deletar este board' 
        });
      }

      const deleted = await db('boards')
        .where({ id })
        .whereNull('deleted_at')
        .update({ deleted_at: new Date() });

      if (!deleted) {
        return res.status(404).json({ 
          error: 'Board não encontrado' 
        });
      }

      // Registrar atividade
      await db('activities').insert({
        id: uuidv4(),
        board_id: id,
        user_id: req.user.id,
        action_type: 'board_deleted',
        description: 'Board deletado'
      });

      logger.info(`Board deleted: ${id} by ${req.user.email}`);

      res.json({
        message: 'Board deletado com sucesso'
      });
    } catch (error) {
      logger.error('Delete board error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Método auxiliar para verificar acesso ao board
  async checkBoardAccess(userId, boardId) {
    const access = await db('boards as b')
      .leftJoin('workspace_members as wm', 'b.workspace_id', 'wm.workspace_id')
      .leftJoin('board_members as bm', 'b.id', 'bm.board_id')
      .where('b.id', boardId)
      .where(function() {
        this.where('wm.user_id', userId)
            .orWhere('bm.user_id', userId);
      })
      .first();

    return !!access;
  }
}

export default new BoardController();
