import { v4 as uuidv4 } from 'uuid';
import dbAdapter from '../config/dbAdapter.js';
import logger from '../config/logger.js';

class WorkspaceController {
  // Listar workspaces do usuário
  async list(req, res) {
    try {
      let workspaces;
      
      if (process.env.DB_TYPE === 'sqlite') {
        // Versão simplificada para SQLite
        const userWorkspaces = await dbAdapter.findMany('workspace_members', { 
          user_id: req.user.id 
        });
        
        workspaces = [];
        for (const wm of userWorkspaces) {
          const workspace = await dbAdapter.findOne('workspaces', { 
            id: wm.workspace_id 
          });
          if (workspace && !workspace.deleted_at) {
            workspace.user_role = wm.role;
            workspace.joined_at = wm.joined_at;
            workspaces.push(workspace);
          }
        }
      } else {
        // Versão completa para PostgreSQL
        workspaces = await db('workspaces as w')
          .join('workspace_members as wm', 'w.id', 'wm.workspace_id')
          .join('organizations as o', 'w.organization_id', 'o.id')
          .leftJoin('users as creator', 'w.created_by', 'creator.id')
          .where('wm.user_id', req.user.id)
          .whereNull('w.deleted_at')
          .select(
            'w.*',
            'wm.role as user_role',
            'wm.joined_at',
            'o.name as organization_name',
            'creator.name as created_by_name'
          )
          .orderBy('w.created_at', 'desc');
      }

      res.json({
        workspaces,
        total: workspaces.length
      });
    } catch (error) {
      logger.error('List workspaces error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar workspace por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const workspace = await db('workspaces as w')
        .join('workspace_members as wm', 'w.id', 'wm.workspace_id')
        .join('organizations as o', 'w.organization_id', 'o.id')
        .leftJoin('users as creator', 'w.created_by', 'creator.id')
        .where('w.id', id)
        .where('wm.user_id', req.user.id)
        .whereNull('w.deleted_at')
        .select(
          'w.*',
          'wm.role as user_role',
          'o.name as organization_name',
          'creator.name as created_by_name'
        )
        .first();

      if (!workspace) {
        return res.status(404).json({ 
          error: 'Workspace não encontrado' 
        });
      }

      // Buscar membros do workspace
      const members = await db('workspace_members as wm')
        .join('users as u', 'wm.user_id', 'u.id')
        .where('wm.workspace_id', id)
        .select(
          'u.id',
          'u.name',
          'u.email',
          'u.avatar',
          'u.color',
          'wm.role',
          'wm.joined_at'
        )
        .orderBy('wm.joined_at');

      // Buscar estatísticas
      const stats = await db('boards as b')
        .leftJoin('board_lists as bl', 'b.id', 'bl.board_id')
        .leftJoin('cards as c', 'bl.id', 'c.list_id')
        .where('b.workspace_id', id)
        .whereNull('b.deleted_at')
        .whereNull('c.deleted_at')
        .select(
          db.raw('COUNT(DISTINCT b.id) as board_count'),
          db.raw('COUNT(DISTINCT c.id) as card_count'),
          db.raw('COUNT(DISTINCT CASE WHEN c.completed_at IS NOT NULL THEN c.id END) as completed_cards')
        )
        .first();

      res.json({
        ...workspace,
        members,
        stats: {
          boards: parseInt(stats.board_count) || 0,
          cards: parseInt(stats.card_count) || 0,
          completed_cards: parseInt(stats.completed_cards) || 0
        }
      });
    } catch (error) {
      logger.error('Get workspace error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar workspace
  async create(req, res) {
    try {
      const { name, description, color, visibility } = req.body;
      const workspaceId = uuidv4();

      const workspace = {
        id: workspaceId,
        organization_id: req.user.organization_id,
        name,
        description,
        color: color || '#0052cc',
        visibility: visibility || 'private',
        created_by: req.user.id
      };

      if (process.env.DB_TYPE === 'sqlite') {
        // Versão simplificada para SQLite
        const createdWorkspace = await dbAdapter.insert('workspaces', workspace);

        // Adicionar criador como admin
        const memberData = {
          id: uuidv4(),
          workspace_id: workspaceId,
          user_id: req.user.id,
          role: 'admin',
          invited_by: req.user.id
        };
        await dbAdapter.insert('workspace_members', memberData);

        logger.info(`Workspace created: ${name} by ${req.user.email}`);

        res.status(201).json({
          message: 'Workspace criado com sucesso',
          workspace: createdWorkspace
        });
      } else {
        // Versão completa para PostgreSQL com transação
        await db.transaction(async (trx) => {
          // Criar workspace
          await trx('workspaces').insert(workspace);

          // Adicionar criador como admin
          await trx('workspace_members').insert({
            id: uuidv4(),
            workspace_id: workspaceId,
            user_id: req.user.id,
            role: 'admin',
            invited_by: req.user.id
          });

          // Registrar atividade
          await trx('activities').insert({
            id: uuidv4(),
            workspace_id: workspaceId,
            user_id: req.user.id,
            action_type: 'workspace_created',
            description: 'Workspace criado',
            new_value: { name }
          });
        });

        logger.info(`Workspace created: ${name} by ${req.user.email}`);

        res.status(201).json({
          message: 'Workspace criado com sucesso',
          workspace
        });
      }
    } catch (error) {
      logger.error('Create workspace error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar workspace
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, color, visibility } = req.body;

      // Verificar permissão
      const membership = await db('workspace_members')
        .where({
          workspace_id: id,
          user_id: req.user.id
        })
        .first();

      if (!membership || !['admin'].includes(membership.role)) {
        return res.status(403).json({ 
          error: 'Permissão insuficiente' 
        });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (color !== undefined) updateData.color = color;
      if (visibility !== undefined) updateData.visibility = visibility;

      const updated = await db('workspaces')
        .where({ id })
        .whereNull('deleted_at')
        .update(updateData);

      if (!updated) {
        return res.status(404).json({ 
          error: 'Workspace não encontrado' 
        });
      }

      // Registrar atividade
      await db('activities').insert({
        id: uuidv4(),
        workspace_id: id,
        user_id: req.user.id,
        action_type: 'workspace_updated',
        description: 'Workspace atualizado',
        new_value: updateData
      });

      logger.info(`Workspace updated: ${id} by ${req.user.email}`);

      res.json({
        message: 'Workspace atualizado com sucesso'
      });
    } catch (error) {
      logger.error('Update workspace error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar workspace (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar permissão (apenas admin pode deletar)
      const membership = await db('workspace_members')
        .where({
          workspace_id: id,
          user_id: req.user.id,
          role: 'admin'
        })
        .first();

      if (!membership) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem deletar workspaces' 
        });
      }

      const deleted = await db('workspaces')
        .where({ id })
        .whereNull('deleted_at')
        .update({ deleted_at: new Date() });

      if (!deleted) {
        return res.status(404).json({ 
          error: 'Workspace não encontrado' 
        });
      }

      // Registrar atividade
      await db('activities').insert({
        id: uuidv4(),
        workspace_id: id,
        user_id: req.user.id,
        action_type: 'workspace_deleted',
        description: 'Workspace deletado'
      });

      logger.info(`Workspace deleted: ${id} by ${req.user.email}`);

      res.json({
        message: 'Workspace deletado com sucesso'
      });
    } catch (error) {
      logger.error('Delete workspace error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Adicionar membro ao workspace
  async addMember(req, res) {
    try {
      const { id } = req.params;
      const { email, role = 'member' } = req.body;

      // Verificar permissão
      const membership = await db('workspace_members')
        .where({
          workspace_id: id,
          user_id: req.user.id
        })
        .first();

      if (!membership || !['admin'].includes(membership.role)) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem adicionar membros' 
        });
      }

      // Buscar usuário por email
      const user = await db('users').where({ email }).first();
      if (!user) {
        return res.status(404).json({ 
          error: 'Usuário não encontrado' 
        });
      }

      // Verificar se já é membro
      const existingMember = await db('workspace_members')
        .where({
          workspace_id: id,
          user_id: user.id
        })
        .first();

      if (existingMember) {
        return res.status(409).json({ 
          error: 'Usuário já é membro do workspace' 
        });
      }

      // Adicionar membro
      await db('workspace_members').insert({
        id: uuidv4(),
        workspace_id: id,
        user_id: user.id,
        role,
        invited_by: req.user.id
      });

      // Registrar atividade
      await db('activities').insert({
        id: uuidv4(),
        workspace_id: id,
        user_id: req.user.id,
        action_type: 'member_added',
        description: 'Membro adicionado ao workspace',
        new_value: { user_email: email, role }
      });

      logger.info(`Member added to workspace: ${email} to ${id}`);

      res.json({
        message: 'Membro adicionado com sucesso'
      });
    } catch (error) {
      logger.error('Add member error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Remover membro do workspace
  async removeMember(req, res) {
    try {
      const { id, userId } = req.params;

      // Verificar permissão
      const membership = await db('workspace_members')
        .where({
          workspace_id: id,
          user_id: req.user.id
        })
        .first();

      if (!membership || !['admin'].includes(membership.role)) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem remover membros' 
        });
      }

      // Não permitir remoção do próprio admin se for o único admin
      if (userId === req.user.id) {
        const adminCount = await db('workspace_members')
          .where({ workspace_id: id, role: 'admin' })
          .count('* as count')
          .first();

        if (adminCount.count <= 1) {
          return res.status(400).json({ 
            error: 'Não é possível remover o último administrador' 
          });
        }
      }

      const removed = await db('workspace_members')
        .where({
          workspace_id: id,
          user_id: userId
        })
        .del();

      if (!removed) {
        return res.status(404).json({ 
          error: 'Membro não encontrado' 
        });
      }

      // Registrar atividade
      await db('activities').insert({
        id: uuidv4(),
        workspace_id: id,
        user_id: req.user.id,
        action_type: 'member_removed',
        description: 'Membro removido do workspace',
        old_value: { user_id: userId }
      });

      logger.info(`Member removed from workspace: ${userId} from ${id}`);

      res.json({
        message: 'Membro removido com sucesso'
      });
    } catch (error) {
      logger.error('Remove member error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new WorkspaceController();
