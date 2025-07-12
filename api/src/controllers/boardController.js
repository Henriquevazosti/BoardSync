import { v4 as uuidv4 } from 'uuid';
import dbAdapter from '../config/dbAdapter.js';
import logger from '../config/logger.js';

class BoardController {
  // Listar boards do workspace
  async list(req, res) {
    try {
      const { workspaceId } = req.params;

      // Verificar acesso ao workspace
      const membership = await dbAdapter.findOne('workspace_members', {
        workspace_id: workspaceId,
        user_id: req.user.id
      });

      if (!membership) {
        return res.status(403).json({ 
          error: 'Acesso negado ao workspace' 
        });
      }

      // Buscar boards do workspace
      const boards = await dbAdapter.findMany('boards', {
        workspace_id: workspaceId
      });

      res.json({
        boards,
        total: boards.length
      });
    } catch (error) {
      logger.error('List boards error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar board por ID (versão simplificada)
  async getById(req, res) {
    try {
      const { id } = req.params;

      // Buscar board
      const board = await dbAdapter.findOne('boards', { id });

      if (!board) {
        return res.status(404).json({ 
          error: 'Board não encontrado' 
        });
      }

      // Verificar acesso através do workspace
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Acesso negado ao board' 
        });
      }

      // Buscar listas do board
      const lists = await dbAdapter.findMany('board_lists', {
        board_id: id
      });

      res.json({
        ...board,
        lists
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
      const membership = await dbAdapter.findOne('workspace_members', {
        workspace_id: workspaceId,
        user_id: req.user.id
      });

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
        created_by: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Criar board
      await dbAdapter.insert('boards', board);

      // Criar listas padrão
      const defaultLists = [
        { name: 'Para Fazer', position: 1 },
        { name: 'Em Andamento', position: 2 },
        { name: 'Concluído', position: 3 }
      ];

      for (let listData of defaultLists) {
        await dbAdapter.insert('board_lists', {
          id: uuidv4(),
          board_id: boardId,
          name: listData.name,
          position: listData.position,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

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
  // Atualizar board
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verificar se board existe
      const board = await dbAdapter.findOne('boards', { id });
      if (!board) {
        return res.status(404).json({ error: 'Board não encontrado' });
      }

      // Verificar acesso
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado ao board' });
      }

      // Atualizar board
      updateData.updated_at = new Date().toISOString();
      await dbAdapter.update('boards', { id }, updateData);

      res.json({ message: 'Board atualizado com sucesso' });
    } catch (error) {
      logger.error('Update board error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar board
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se board existe
      const board = await dbAdapter.findOne('boards', { id });
      if (!board) {
        return res.status(404).json({ error: 'Board não encontrado' });
      }

      // Verificar acesso
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado ao board' });
      }

      // Soft delete
      await dbAdapter.update('boards', { id }, {
        deleted_at: new Date().toISOString()
      });

      res.json({ message: 'Board deletado com sucesso' });
    } catch (error) {
      logger.error('Delete board error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new BoardController();
