const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.actorSignUp = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  let newActor = await db.Actor.create({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password),
    photo_url: req.body.photo_url,
  });
  if (newActor) {
    const token = signToken(newActor.id);

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      token: token,
    });
  } else {
    res.status(501).json({
      status: 'fail',
      message: 'oops something went wrong',
      requestedAt: req.requestTime,
    });
  }
});

exports.actorLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // Check if actor exists && password is correct

  const actor = await db.Actor.findOne({ where: { email: email } });

 

  let result;
  if (actor) {
    result = await bcrypt.compare(password, actor.password);
    if (actor.email !== email) {
      return next(new AppError('Incorrect email or password', 401));
    }
  }

  if (!result) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // if everything is ok, send token to client
  const token = signToken(actor.id);
  res.status(200).json({
    status: 'success',
    token,
  });
});


exports.protectActorRoutes = catchAsync(async (req, res, next) => {
  // Getting token and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access.', 401)
    );
  }

  // Verify signToken
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exits
  const freshActor = await db.Actor.findOne({ where: { id: decoded.id } });

  if (!freshActor) {
    return next(
      new AppError('The actor that has this token no longer exist.', 401)
    );
  }



  // Grant access to protected routes

  // Put actor details in to the global request
  req.actor = freshActor;
  next();

  console.log(req.actor)


});



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
