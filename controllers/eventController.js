const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//function to get all actors
exports.createEvent = catchAsync(async (req, res, next) => {
    const actor = await db.Actor.findAll();
    if (actor) {
      res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: actor,
      });
    } else {
      res.status(401).json({
        status: 'Not Found',
        message: 'No actor found',
        requestedAt: req.requestTime,
      });
    }
  });