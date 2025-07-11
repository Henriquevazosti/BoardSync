import Joi from 'joi';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));
      
      return res.status(400).json({
        error: 'Dados de entrada inválidos',
        details
      });
    }
    
    next();
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));
      
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details
      });
    }
    
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));
      
      return res.status(400).json({
        error: 'Parâmetros de consulta inválidos',
        details
      });
    }
    
    next();
  };
};
