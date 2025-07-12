import { v4 as uuidv4 } from 'uuid';
import dbAdapter from '../config/dbAdapter.js';
import logger from '../config/logger.js';

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

      res.json({
        workspaces,
        total: workspaces.length
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
        organization_id: 'default-org',
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

      res.status(201).json({
        message: 'Workspace criado com sucesso',
        workspace: createdWorkspace
      });
    } catch (error) {
      logger.error('Create workspace error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new WorkspaceController();
