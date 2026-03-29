import { v4 as uuidv4 } from 'uuid';
import dbAdapter from '../config/dbAdapter.js';
import logger from '../config/logger.js';

const serializeWorkspace = (workspace) => ({
  ...workspace,
  organizationId: workspace.organization_id,
  createdBy: workspace.created_by,
  createdAt: workspace.created_at,
  updatedAt: workspace.updated_at,
  deletedAt: workspace.deleted_at ?? null
});

class WorkspaceController {
  // Listar workspaces do usuário
  async list(req, res) {
    try {
      // Buscar memberships do usuário
      const userWorkspaces = await dbAdapter.findMany('workspace_members', { 
        user_id: req.user.id 
      });

      const workspaces = [];
      for (const membership of userWorkspaces) {
        const workspace = await dbAdapter.findOne('workspaces', { 
          id: membership.workspace_id 
        });
        if (workspace) {
          workspaces.push({
            ...workspace,
            role: membership.role
          });
        }
      }

      const serializedWorkspaces = workspaces.map(serializeWorkspace);

      res.json({
        success: true,
        data: {
          workspaces: serializedWorkspaces,
          total: serializedWorkspaces.length
        },
        workspaces: serializedWorkspaces,
        total: serializedWorkspaces.length
      });
    } catch (error) {
      logger.error('List workspaces error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar workspace
  async create(req, res) {
    try {
      const { name, description, color = '#0052cc', visibility = 'private' } = req.body;

      const workspaceId = uuidv4();
      const workspace = {
        id: workspaceId,
        organization_id: req.user.organization_id || null,
        name,
        description,
        color,
        visibility,
        created_by: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Criar workspace
      const createdWorkspace = await dbAdapter.insert('workspaces', workspace);

      // Adicionar criador como admin
      const memberData = {
        id: uuidv4(),
        workspace_id: workspaceId,
        user_id: req.user.id,
        role: 'admin',
        invited_by: req.user.id,
        joined_at: new Date().toISOString()
      };

      await dbAdapter.insert('workspace_members', memberData);

      logger.info(`Workspace created: ${name} by ${req.user.email}`);

      const serializedWorkspace = serializeWorkspace(createdWorkspace);

      res.status(201).json({
        success: true,
        message: 'Workspace criado com sucesso',
        data: {
          workspace: serializedWorkspace
        },
        workspace: serializedWorkspace
      });
    } catch (error) {
      logger.error('Create workspace error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar workspace por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const workspace = await dbAdapter.findOne('workspaces', { id });
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace não encontrado' });
      }

      // Verificar acesso
      const membership = await dbAdapter.findOne('workspace_members', {
        workspace_id: id,
        user_id: req.user.id
      });

      if (!membership) {
        return res.status(403).json({ error: 'Acesso negado ao workspace' });
      }

      const serializedWorkspace = {
        ...serializeWorkspace(workspace),
        user_role: membership.role,
        userRole: membership.role
      };

      res.json({
        success: true,
        data: {
          workspace: serializedWorkspace
        },
        workspace: serializedWorkspace,
        ...serializedWorkspace
      });
    } catch (error) {
      logger.error('Get workspace error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar workspace
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const workspace = await dbAdapter.findOne('workspaces', { id });
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace não encontrado' });
      }

      // Verificar permissão de admin
      const membership = await dbAdapter.findOne('workspace_members', {
        workspace_id: id,
        user_id: req.user.id,
        role: 'admin'
      });

      if (!membership) {
        return res.status(403).json({ error: 'Apenas administradores podem atualizar o workspace' });
      }

      updateData.updated_at = new Date().toISOString();
      const updatedWorkspace = await dbAdapter.update('workspaces', { id }, updateData);
      const serializedWorkspace = serializeWorkspace(updatedWorkspace);

      res.json({
        success: true,
        message: 'Workspace atualizado com sucesso',
        data: {
          workspace: serializedWorkspace
        },
        workspace: serializedWorkspace
      });
    } catch (error) {
      logger.error('Update workspace error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar workspace
  async delete(req, res) {
    try {
      const { id } = req.params;

      const workspace = await dbAdapter.findOne('workspaces', { id });
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace não encontrado' });
      }

      // Verificar permissão de admin
      const membership = await dbAdapter.findOne('workspace_members', {
        workspace_id: id,
        user_id: req.user.id,
        role: 'admin'
      });

      if (!membership) {
        return res.status(403).json({ error: 'Apenas administradores podem deletar o workspace' });
      }

      await dbAdapter.update('workspaces', { id }, {
        deleted_at: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Workspace deletado com sucesso',
        data: { id }
      });
    } catch (error) {
      logger.error('Delete workspace error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Adicionar membro
  async addMember(req, res) {
    try {
      const { id } = req.params;
      const { email, role = 'member' } = req.body;

      // Verificar permissão de admin
      const membership = await dbAdapter.findOne('workspace_members', {
        workspace_id: id,
        user_id: req.user.id,
        role: 'admin'
      });

      if (!membership) {
        return res.status(403).json({ error: 'Apenas administradores podem adicionar membros' });
      }

      // Buscar usuário por email
      const user = await dbAdapter.findOne('users', { email });
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Verificar se já é membro
      const existingMember = await dbAdapter.findOne('workspace_members', {
        workspace_id: id,
        user_id: user.id
      });

      if (existingMember) {
        return res.status(400).json({ error: 'Usuário já é membro do workspace' });
      }

      await dbAdapter.insert('workspace_members', {
        id: uuidv4(),
        workspace_id: id,
        user_id: user.id,
        role,
        invited_by: req.user.id,
        joined_at: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Membro adicionado com sucesso',
        data: {
          workspaceId: id,
          userId: user.id,
          role
        }
      });
    } catch (error) {
      logger.error('Add member error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Remover membro
  async removeMember(req, res) {
    try {
      const { id, userId } = req.params;

      // Verificar permissão de admin
      const membership = await dbAdapter.findOne('workspace_members', {
        workspace_id: id,
        user_id: req.user.id,
        role: 'admin'
      });

      if (!membership) {
        return res.status(403).json({ error: 'Apenas administradores podem remover membros' });
      }

      await dbAdapter.delete('workspace_members', {
        workspace_id: id,
        user_id: userId
      });

      res.json({
        success: true,
        message: 'Membro removido com sucesso',
        data: {
          workspaceId: id,
          userId
        }
      });
    } catch (error) {
      logger.error('Remove member error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new WorkspaceController();
