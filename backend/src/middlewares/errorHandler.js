import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id
  });

  // Erro de validação do Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Erro de duplicação no banco (unique constraint)
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Dados duplicados',
      message: 'Já existe um registro com esses dados'
    });
  }

  // Erro de foreign key
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Referência inválida',
      message: 'Um ou mais IDs referenciados não existem'
    });
  }

  // Erro de not null
  if (err.code === '23502') {
    return res.status(400).json({
      error: 'Campo obrigatório',
      message: 'Um campo obrigatório não foi fornecido'
    });
  }

  // Erro de sintaxe SQL
  if (err.code === '42601') {
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro na consulta ao banco de dados'
    });
  }

  // Erros customizados
  if (err.status) {
    return res.status(err.status).json({
      error: err.message || 'Erro desconhecido'
    });
  }

  // Erro padrão
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
};
