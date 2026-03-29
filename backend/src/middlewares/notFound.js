export const notFound = (req, res, next) => {
  // Retorna JSON direto para rotas não encontradas
  res.status(404).json({
    error: `Rota não encontrada - ${req.originalUrl}`
  });
};
