import express from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: express.ErrorRequestHandler = (err, req, res, _next) => {
  console.error(`[Error] ${err.message}`);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: {
      message: err.message || 'Something went wrong',
      details: err.details || null,
    },
  });
};

export default errorHandler;
