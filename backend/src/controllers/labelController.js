import { v4 as uuidv4 } from 'uuid';
import dbAdapter from '../config/dbAdapter.js';
import logger from '../config/logger.js';

class LabelController {
  // Listar labels de um board
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

      // Buscar labels do board
      let labels = await dbAdapter.findMany('labels', { 
        board_id: boardId 
      });

      // Garante que cada label tenha o campo 'logo' preenchido
      labels = labels.map(label => ({
        ...label,
        logo: label.logo || `/logos/${label.id}.png`
      }));

      res.json({
        labels,
        total: labels.length
      });
    } catch (error) {
      logger.error('Error listing board labels:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar label por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const label = await dbAdapter.findOne('labels', { id });
      if (!label) {
        return res.status(404).json({ error: 'Label não encontrada' });
      }

      // Verificar acesso via workspace
      const board = await dbAdapter.findOne('boards', { id: label.board_id });
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado à label' });
      }

      // Garante que a label tenha o campo 'logo' preenchido
      const labelWithLogo = {
        ...label,
        logo: label.logo || `/logos/${label.id}.png`
      };
      res.json({ label: labelWithLogo });
    } catch (error) {
      logger.error('Error getting label by ID:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar nova label
  async create(req, res) {
    try {
      const { boardId } = req.params;
      const { name, color, description } = req.body;

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

      // Criar label
      const labelData = {
        id: uuidv4(),
        board_id: boardId,
        name,
        color,
        bg_color: color, // A tabela usa bg_color em vez de color
        logo: `/logos/${name.toLowerCase().replace(/\s+/g, '-')}.png`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const label = await dbAdapter.insert('labels', labelData);

      res.status(201).json({
        message: 'Label criada com sucesso',
        label: {
          ...label,
          logo: label.logo || `/logos/${label.id}.png`
        }
      });
    } catch (error) {
      logger.error('Error creating label:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar label
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, color, description } = req.body;

      // Verificar se a label existe
      const label = await dbAdapter.findOne('labels', { id });
      if (!label) {
        return res.status(404).json({ error: 'Label não encontrada' });
      }

      // Verificar acesso via workspace
      const board = await dbAdapter.findOne('boards', { id: label.board_id });
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado à label' });
      }

      // Preparar dados para atualização
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (name !== undefined) updateData.name = name;
      if (color !== undefined) {
        updateData.color = color;
        updateData.bg_color = color; // Atualizar ambos os campos de cor
      }
      // Atualiza logo se nome mudar
      if (name !== undefined) {
        updateData.logo = `/logos/${name.toLowerCase().replace(/\s+/g, '-')}.png`;
      }

      // Atualizar label
      const updatedLabel = await dbAdapter.update('labels', { id }, updateData);

      res.json({
        message: 'Label atualizada com sucesso',
        label: {
          ...updatedLabel,
          logo: updatedLabel.logo || `/logos/${updatedLabel.id}.png`
        }
      });
    } catch (error) {
      logger.error('Error updating label:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar label
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a label existe
      const label = await dbAdapter.findOne('labels', { id });
      if (!label) {
        return res.status(404).json({ error: 'Label não encontrada' });
      }

      // Verificar acesso via workspace
      const board = await dbAdapter.findOne('boards', { id: label.board_id });
      const hasAccess = await dbAdapter.findOne('workspace_members', {
        workspace_id: board.workspace_id,
        user_id: req.user.id
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado à label' });
      }

      // Remover associações da label com cards
      await dbAdapter.delete('card_labels', { label_id: id });

      // Deletar label
      await dbAdapter.delete('labels', { id });

      res.json({
        message: 'Label deletada com sucesso'
      });
    } catch (error) {
      logger.error('Error deleting label:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new LabelController();
