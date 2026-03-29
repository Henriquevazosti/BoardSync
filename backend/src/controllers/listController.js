import { v4 as uuidv4 } from 'uuid';
import dbAdapter from '../config/dbAdapter.js';
import logger from '../config/logger.js';

const serializeList = (list) => ({
  ...list,
  boardId: list.board_id,
  createdAt: list.created_at,
  updatedAt: list.updated_at,
  deletedAt: list.deleted_at ?? null
});

class ListController {
  // Listar listas de um board
  async list(req, res) {
    try {
      const { boardId } = req.params;

      // Verificar se o board existe
      const board = await dbAdapter.findOne('boards', { id: boardId });
      if (!board) {
        return res.status(404).json({ error: 'Board não encontrado' });
      }

      // Verificar acesso via workspace
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado ao board' });
      }

      // Buscar listas do board
      const lists = await dbAdapter.findMany('board_lists', { 
        board_id: boardId 
      }, ['position', 'asc']);

      const serializedLists = lists.map(serializeList);

      res.json({
        success: true,
        data: {
          lists: serializedLists,
          total: serializedLists.length
        },
        lists: serializedLists,
        total: serializedLists.length
      });
    } catch (error) {
      logger.error('Error listing board lists:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar lista por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const list = await dbAdapter.findOne('board_lists', { id });
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

      const serializedList = serializeList(list);

      res.json({
        success: true,
        data: {
          list: serializedList
        },
        list: serializedList
      });
    } catch (error) {
      logger.error('Error getting list by ID:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar nova lista
  async create(req, res) {
    try {
      const { boardId } = req.params;
      const { name, color } = req.body;

      // Verificar se o board existe
      const board = await dbAdapter.findOne('boards', { id: boardId });
      if (!board) {
        return res.status(404).json({ error: 'Board não encontrado' });
      }

      // Verificar acesso via workspace
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado ao board' });
      }

      // Obter próxima posição
      const maxPosition = await dbAdapter.findMany('board_lists', { board_id: boardId });
      const position = maxPosition.length + 1;

      // Criar lista
      const listData = {
        id: uuidv4(),
        board_id: boardId,
        name,
        position,
        color: color || null,
        settings: JSON.stringify({}),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const list = await dbAdapter.insert('board_lists', listData);

      const serializedList = serializeList(list);

      res.status(201).json({
        success: true,
        message: 'Lista criada com sucesso',
        data: {
          list: serializedList
        },
        list: serializedList
      });
    } catch (error) {
      logger.error('Error creating list:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar lista
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, color, position } = req.body;

      // Verificar se a lista existe
      const list = await dbAdapter.findOne('board_lists', { id });
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

      // Preparar dados para atualização
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (name !== undefined) updateData.name = name;
      if (color !== undefined) updateData.color = color;
      if (position !== undefined) updateData.position = position;

      // Atualizar lista
      const updatedList = await dbAdapter.update('board_lists', { id }, updateData);

      const serializedList = serializeList(updatedList);

      res.json({
        success: true,
        message: 'Lista atualizada com sucesso',
        data: {
          list: serializedList
        },
        list: serializedList
      });
    } catch (error) {
      logger.error('Error updating list:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar lista
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a lista existe
      const list = await dbAdapter.findOne('board_lists', { id });
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

      // Verificar se há cards na lista
      const cards = await dbAdapter.findMany('cards', { list_id: id });
      if (cards.length > 0) {
        return res.status(400).json({ 
          error: 'Não é possível deletar lista com cards. Mova os cards primeiro.' 
        });
      }

      // Deletar lista
      await dbAdapter.delete('board_lists', { id });

      res.json({
        success: true,
        message: 'Lista deletada com sucesso',
        data: {
          id
        }
      });
    } catch (error) {
      logger.error('Error deleting list:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new ListController();
