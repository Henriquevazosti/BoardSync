import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dbAdapter from '../config/dbAdapter.js';
import logger from '../config/logger.js';

class AuthController {
  // Registro de usuário
  async register(req, res) {
    try {
      const { email, password, name, organizationId } = req.body;

      // Verificar se o usuário já existe
      const existingUser = await dbAdapter.findOne('users', { email });
      if (existingUser) {
        return res.status(409).json({ 
          error: 'Usuário já existe com este email' 
        });
      }

      // Hash da senha
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Criar usuário
      const userId = uuidv4();
      const user = {
        id: userId,
        email,
        password_hash,
        name,
        organization_id: organizationId || 'default-org',
        avatar: '👤',
        color: '#0052cc',
        bg_color: '#e6f3ff',
        role: 'member',
        status: 'active'
      };

      const createdUser = await dbAdapter.insert('users', user);

      // Adicionar usuário ao workspace padrão se estiver usando SQLite
      if (process.env.DB_TYPE === 'sqlite') {
        const defaultWorkspace = await dbAdapter.findOne('workspaces', { 
          id: 'default-workspace' 
        });
        if (defaultWorkspace) {
          const memberData = {
            id: `member-${userId}`,
            workspace_id: 'default-workspace',
            user_id: userId,
            role: 'member',
            invited_by: 'admin-user'
          };
          await dbAdapter.insert('workspace_members', memberData);
        }
      }

      // Gerar token JWT
      const token = jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Buscar usuário criado (sem senha)
      const userResponse = await dbAdapter.findOne('users', { id: userId });
      
      // Remover senha da resposta
      delete userResponse.password_hash;

      logger.info(`User registered: ${email}`);

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: userResponse,
        token
      });
    } catch (error) {
      logger.error('Register error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Login de usuário
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuário
      const user = await dbAdapter.findOne('users', { email, status: 'active' });
      if (!user) {
        return res.status(401).json({ 
          error: 'Credenciais inválidas' 
        });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          error: 'Credenciais inválidas' 
        });
      }

      // Atualizar último login
      await dbAdapter.update('users', { id: user.id }, { last_login: new Date().toISOString() });

      // Gerar token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Resposta sem senha
      const { password_hash, ...userWithoutPassword } = user;

      logger.info(`User logged in: ${email}`);

      res.json({
        message: 'Login realizado com sucesso',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Verificar token
  async verifyToken(req, res) {
    try {
      const user = await dbAdapter.findOne('users', { id: req.user.id });

      if (!user) {
        return res.status(404).json({ 
          error: 'Usuário não encontrado' 
        });
      }

      res.json({
        message: 'Token válido',
        user
      });
    } catch (error) {
      logger.error('Verify token error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Logout (apenas para logs)
  async logout(req, res) {
    try {
      logger.info(`User logged out: ${req.user.email}`);
      
      res.json({
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Esqueceu a senha
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await db('users').where({ email }).first();
      if (!user) {
        // Por segurança, sempre retorna sucesso
        return res.json({
          message: 'Se o email existir, você receberá instruções para redefinir sua senha'
        });
      }

      // TODO: Implementar envio de email com token de reset
      // Para demonstração, apenas logamos
      logger.info(`Password reset requested for: ${email}`);

      res.json({
        message: 'Se o email existir, você receberá instruções para redefinir sua senha'
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Redefinir senha
  async resetPassword(req, res) {
    try {
      const { email, newPassword, resetToken } = req.body;

      // TODO: Verificar token de reset
      // Para demonstração, apenas alteramos a senha

      const saltRounds = 12;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);

      const updated = await db('users')
        .where({ email })
        .update({ password_hash });

      if (!updated) {
        return res.status(404).json({ 
          error: 'Usuário não encontrado' 
        });
      }

      logger.info(`Password reset for: ${email}`);

      res.json({
        message: 'Senha redefinida com sucesso'
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new AuthController();
