export const notFound = (req, res, next) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};
