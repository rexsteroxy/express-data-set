const db = require('../models');
const catchAsync = require('../utils/catchAsync');

//function to get all actors
exports.getAllActors = catchAsync(async (req, res, next) => {
  
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


exports.actorSignUp = catchAsync(async (req, res, next) => {
  

  let newActor = await db.Actor.create({
    email: req.body.email,
    password: req.body.password,
    photo_url: req.body.photo_url,
  });


  if (newActor) {
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: newActor,
    });
  } else {
    res.status(501).json({
      status: 'fail',
      message: 'oops something went wrong',
      requestedAt: req.requestTime,
    });
  }
});
