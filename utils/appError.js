class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; //we can use statusCode to caluate status
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor); //remove this class to be part of the error path
  }
}

module.exports = AppError;
