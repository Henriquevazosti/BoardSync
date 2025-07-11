import jwt from 'jsonwebtoken';
import dbAdapter from '../config/dbAdapter.js';
import logger from '../config/logger.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Token de acesso necessário' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se o usuário ainda existe e está ativo
    const user = await dbAdapter.findOne('users', { 
      id: decoded.userId, 
      status: 'active' 
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Token inválido ou usuário inativo' 
      });
    }

    // Adicionar informações do usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization_id: user.organization_id
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Permissão insuficiente para esta ação' 
      });
    }

    next();
  };
};

export const requireWorkspaceAccess = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'ID do workspace necessário' });
    }

    // Verificar se o usuário tem acesso ao workspace
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

    req.workspaceMembership = membership;
    next();
  } catch (error) {
    logger.error('Workspace access middleware error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const requireBoardAccess = async (req, res, next) => {
  try {
    const boardId = req.params.boardId || req.body.boardId;
    
    if (!boardId) {
      return res.status(400).json({ error: 'ID do board necessário' });
    }

    // Verificar acesso ao board (direto ou via workspace)
    const boardAccess = await db('boards as b')
      .leftJoin('board_members as bm', function() {
        this.on('b.id', '=', 'bm.board_id')
            .andOn('bm.user_id', '=', db.raw('?', [req.user.id]));
      })
      .leftJoin('workspace_members as wm', function() {
        this.on('b.workspace_id', '=', 'wm.workspace_id')
            .andOn('wm.user_id', '=', db.raw('?', [req.user.id]));
      })
      .where('b.id', boardId)
      .andWhere(function() {
        this.whereNotNull('bm.id').orWhereNotNull('wm.id');
      })
      .select('b.*', 'bm.role as board_role', 'wm.role as workspace_role')
      .first();

    if (!boardAccess) {
      return res.status(403).json({ 
        error: 'Acesso negado ao board' 
      });
    }

    req.boardAccess = boardAccess;
    next();
  } catch (error) {
    logger.error('Board access middleware error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
