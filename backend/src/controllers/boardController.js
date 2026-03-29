import { v4 as uuidv4 } from 'uuid';
import dbAdapter from '../config/dbAdapter.js';
import logger from '../config/logger.js';

const serializeBoard = (board) => ({
  ...board,
  workspaceId: board.workspace_id,
  backgroundColor: board.background_color,
  backgroundImage: board.background_image,
  createdBy: board.created_by,
  createdAt: board.created_at,
  updatedAt: board.updated_at,
  deletedAt: board.deleted_at ?? null
});

const serializeList = (list) => ({
  ...list,
  boardId: list.board_id,
  createdAt: list.created_at,
  updatedAt: list.updated_at,
  deletedAt: list.deleted_at ?? null
});

class BoardController {
  async list(req, res) {
    try {
      const { workspaceId } = req.params;

      const membership = await dbAdapter.findOne('workspace_members', {
        workspace_id: workspaceId,
        user_id: req.user.id
      });

      if (!membership) {
        return res.status(403).json({ error: 'Acesso negado ao workspace' });
      }

      const boards = await dbAdapter.findMany('boards', {
        workspace_id: workspaceId,
        deleted_at: null
      });
      const serializedBoards = boards.map(serializeBoard);

      res.json({
        success: true,
        data: {
          boards: serializedBoards,
          total: serializedBoards.length
        },
        boards: serializedBoards,
        total: serializedBoards.length
      });
    } catch (error) {
      logger.error('List boards error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const board = await dbAdapter.findOne('boards', { id });
      if (!board || board.deleted_at) {
        return res.status(404).json({ error: 'Board não encontrado' });
      }

      const membership = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!membership) {
        return res.status(403).json({ error: 'Acesso negado ao board' });
      }

      const lists = await dbAdapter.findMany('board_lists', {
        board_id: id,
        deleted_at: null
      });
      const serializedBoard = serializeBoard(board);
      const serializedLists = lists
        .map(serializeList)
        .sort((left, right) => (left.position || 0) - (right.position || 0));

      res.json({
        success: true,
        data: {
          board: {
            ...serializedBoard,
            lists: serializedLists
          }
        },
        board: serializedBoard,
        ...serializedBoard,
        lists: serializedLists
      });
    } catch (error) {
      logger.error('Get board error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req, res) {
    try {
      const { workspaceId } = req.params;
      const { name, description, background_color, background_image } = req.body;

      const membership = await dbAdapter.findOne('workspace_members', {
        workspace_id: workspaceId,
        user_id: req.user.id
      });

      if (!membership) {
        return res.status(403).json({ error: 'Acesso negado ao workspace' });
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
        updated_at: new Date().toISOString(),
        deleted_at: null
      };

      const createdBoard = await dbAdapter.insert('boards', board);

      const defaultLists = [
        { name: 'Para Fazer', position: 1 },
        { name: 'Em Andamento', position: 2 },
        { name: 'Concluído', position: 3 }
      ];

      for (const listData of defaultLists) {
        await dbAdapter.insert('board_lists', {
          id: uuidv4(),
          board_id: boardId,
          name: listData.name,
          position: listData.position,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        });
      }

      const serializedBoard = serializeBoard(createdBoard);

      logger.info(`Board created: ${name} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Board criado com sucesso',
        data: {
          board: serializedBoard
        },
        board: serializedBoard
      });
    } catch (error) {
      logger.error('Create board error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const board = await dbAdapter.findOne('boards', { id });

      if (!board || board.deleted_at) {
        return res.status(404).json({ error: 'Board não encontrado' });
      }

      const membership = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!membership) {
        return res.status(403).json({ error: 'Acesso negado ao board' });
      }

      const updateData = {};
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.background_color !== undefined) updateData.background_color = req.body.background_color;
      if (req.body.background_image !== undefined) updateData.background_image = req.body.background_image;
      updateData.updated_at = new Date().toISOString();

      const updatedBoard = await dbAdapter.update('boards', { id }, updateData);
      const serializedBoard = serializeBoard(updatedBoard);

      res.json({
        success: true,
        message: 'Board atualizado com sucesso',
        data: {
          board: serializedBoard
        },
        board: serializedBoard
      });
    } catch (error) {
      logger.error('Update board error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const board = await dbAdapter.findOne('boards', { id });

      if (!board || board.deleted_at) {
        return res.status(404).json({ error: 'Board não encontrado' });
      }

      const membership = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!membership) {
        return res.status(403).json({ error: 'Acesso negado ao board' });
      }

      await dbAdapter.update('boards', { id }, {
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Board deletado com sucesso',
        data: {
          id
        }
      });
    } catch (error) {
      logger.error('Delete board error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new BoardController();
