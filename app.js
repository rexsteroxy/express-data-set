const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const indexRouter = require('./routes/index');

const actorsRouter = require('./routes/actor');

const app = express();

//Implement cors
app.use(cors());

app.options('*', cors());

// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use(indexRouter);
app.use('/api/v1/actors', actorsRouter);


app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
