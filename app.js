const express = require('express');

const tourRouter = require('./routes/tourRouters');
const userRouter = require('./routes/userRouters');
const reviewRouter = require('./routes/reviewRouters');
const rateLimit = require('express-rate-limit');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

//! 1- GLOBAL MIDDLEWARES - kolejnosc wywolywania taka jak w kodzie!
//route to tez middleware! app.use aplikuje sie do wszystkich requestów

//set security HTTP Headers *first!
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  //sth ontly in production - eg middlaware
}

//Limt requests from 1 IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP. Please try again in an hour.',
});
app.use('/api', limiter); //apply only to url starts with 'api'

//limit body size and  add 'body' to req object, when we POST new form
app.use(express.json({ limit: '10kb' })); //middlaware to add 'body' to req object, when we POST new form

//Data sanitization - against noSQL query injection
app.use(mongoSanitize());

//Data sanitization - against  XSS
app.use(xss());

//prevent parameter polution - clean up query string
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
); // allow duplicate some fields

//serving static files
//! 3 - ROUTES - RESTfull api
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

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
