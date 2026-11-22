const HttpError = require('../helpers/httpError');

// Fallback for any request that no route matched.
const notFound = (req, res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Translate library errors into client errors; anything unrecognised is a 500
// whose details are logged but not sent to the client.
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let status = err.status || err.statusCode;
  let message = err.message;

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Not authorized';
  }

  if (!status || status >= 500) {
    console.error(err);
    status = status || 500;
    message = 'Internal server error';
  }

  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
