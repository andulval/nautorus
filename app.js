const express = require('express');

const tourRouter = require('./routes/tourRouters');
const userRouter = require('./routes/userRouters');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//! 1- MIDDLEWARES - kolejnosc wywolywania taka jak w kodzie!
//route to tez middleware! app.use aplikuje sie do wszystkich requestów
app.use(express.json()); //middlaware to add 'body' to req object, when we POST new form

if (process.env.NODE_ENV === 'development') {
  //sth ontly in production - eg middlaware
}

//! 3 - ROUTES - RESTfull api
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  //   const err = new Error(`Can't find ${req.originalUrl} on this server`);
  //   err.status = 'fail';
  //   err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); //when next hasargument express know that it is error and it will call error callback (err, req, res, next)
  //   res.status(404).json({
  //     status: 'fail',
  //     message: `Can't find ${req.originalUrl} on this server`,
  //   });
});

app.use(globalErrorHandler);

module.exports = app;
