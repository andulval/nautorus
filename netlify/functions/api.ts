const mongoose = require('mongoose');
const dotenv = require('dotenv');
const serverless = require('serverless-http');
const express = require('express');

dotenv.config({ path: './config.env' });

// Database connection
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connected through mongoose');
  });

// Import Express app
const app = require('../../app'); // make sure './app' exports an express instance

// Error handling adjustments for serverless environment
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! Shutting down...');
  console.log(err.name, err.message);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! Shutting down...');
  console.log(err.name, err.message);
});

// Export wrapped serverless function
module.exports.handler = serverless(app);
