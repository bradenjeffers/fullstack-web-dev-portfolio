// Error carrying an HTTP status so services can `throw new HttpError(404, ...)`
// and let the central error handler build the response.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

module.exports = HttpError;
