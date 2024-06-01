const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    //we set this flag on our Error class so we know that it is known error
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //programming or other error - dont leak it to the client
    //eg. in code or 3rd party libraries etc

    console.error('FATAL ERROR - no operational', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  console.log('handleCastErrorDB', message);
  return new AppError(message, 400); //bad request
};
const handleTokenError = () =>
  new AppError(`Invalid token. Please log in again`, 401); //bad request

const handleExpiredTokenError = () =>
  new AppError(`Token has expired). Please log in again`, 401); //bad request

const handleDuplicateFieldsDB = (err) => {
  const { name } = err.keyValue;
  //   console.log(err);
  //   const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/); //select phrase between quotes
  const message = `Duplicate field value: ${name}. please use another value.`;
  console.log('handleDuplicateFieldsDB', message);
  return new AppError(message, 400); //bad request
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  //   console.log(err);
  //   const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/); //select phrase between quotes
  const message = `Invalid iput data. ${errors.join(' ')}`;
  return new AppError(message, 400); //bad request
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; //default internal server error
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name }; //to create copy
    console.log('process.env.NODE_ENV === production', process.env.NODE_ENV);
    // console.log('err', error.name);
    // console.log(error);
    console.log('error.code', error.code);
    console.log('error.name', error.name);
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') error = handleTokenError();
    if (error.name === 'TokenExpiredError') error = handleExpiredTokenError();

    sendErrorProd(error, res);
  }
};
