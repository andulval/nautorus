//!!! for Netfliy - this file is not needed, but changed and moved to netflify/functions directory

const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  //start listening on top of the program
  //listener for any unhandled promises which crush during processing
  console.log(err.name, err.message);
  console.log('uncaughtException! shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' }); //przed app - bo tam wykorzystujemy ustawione zmienne

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connected thru mongoose');
  });

const app = require('./app'); //musi byc po dotenv.config!

//! 3 - START SERVER
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`server is running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  //listener for any unhadled promises which crush during processing
  console.log(err.name, err.message);
  console.log('unhandledRejection! shutting down...');
  server.close(() => {
    //server close all requests and shut down
    process.exit(1);
  });
});
