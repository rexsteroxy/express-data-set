const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//custom jwt sigin function
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//Actors Signup
exports.actorSignUp = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are empty
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  //check if actor email already exit
  const actor = await db.Actor.findOne({ where: { email: email } });
  if (actor) {
    return next(new AppError('email Already exist!', 400));
  }

  //Create new actor
  let newActor = await db.Actor.create({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password),
    avater_url: req.body.avater_url,
  });

  //sign in new actor and send response
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

//Actors SignIn
exports.actorLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are empty
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // Check if actor email exists && password is correct
  const actor = await db.Actor.findOne({ where: { email: email } });
  let result;
  if (actor) {
    //check if incoming password matches encrypted password in the database
    result = await bcrypt.compare(password, actor.password);
    //check if incoming email matched the database email
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

//middleware for protecting actors routes
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

  //call the next funciton
  next();
});

//Get all actors with number of events the created
exports.getAllActorsWithNumberOfEvents = catchAsync(async (req, res, next) => {
  //find all using query association
  const actor = await db.Actor.findAll({
    //exclude unwanted query result
    attributes: {
      exclude: ['updatedAt', 'password'],
    },

    include: [
      {
        model: db.Event,
        attributes: {
          exclude: ['actorId', 'ActorId', 'updatedAt'],
        },
      },
    ],

    //sort implementation here
    order: [[db.Event, 'createdAt', 'DESC']],
  });

  // send response
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

//Add events by and actor
exports.addEvent = catchAsync(async (req, res, next) => {
  //accesssing the logged in user details from the global request.
  let actor = req.actor;

  //creating event using association functions
  const newEvent = await actor.createEvent({
    type: req.body.type,
  });

  if (newEvent) {
    await newEvent.createRepo({
      name: req.body.repo.name,
      url: req.body.repo.url,
    });

    // send response
    res.status(201).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: newEvent,
    });
  } else {
    res.status(400).json({
      status: 'Event Id already exists',
    });
  }
});

//Get all events
exports.getAllEvents = catchAsync(async (req, res, next) => {
  //query with association function
  const event = await db.Event.findAll({
    //exclude unwanted query result
    attributes: {
      exclude: ['updatedAt'],
    },
    include: [
      {
        model: db.Actor,
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
      {
        model: db.Repo,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'eventId', 'EventId'],
        },
      },
    ],
  });

  //send response
  if (event) {
    res.status(200).json({
      length: event.length,
      status: 'success',
      requestedAt: req.requestTime,
      data: event,
    });
  } else {
    res.status(401).json({
      status: 'Not Found',
      message: 'No event found',
      requestedAt: req.requestTime,
    });
  }
});

//Erase all events
exports.deleteAllEvents = catchAsync(async (req, res, next) => {
  // find all events
  const result = await db.Event.findAll();

  //destroy all events
  if (result) {
    const event = await db.Event.destroy({
      where: {},
      truncate: true,
    });
    if (event) {
      res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
      });
    }
  }

  // response when nothing is found
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    message: 'nothing to delete',
  });
});

//Get Events performed by an actor
exports.getEventsByItsActor = catchAsync(async (req, res, next) => {
  //accesssing passed in parameter
  const passedId = req.params.actorId;

  // Check if user still exits
  const freshActor = await db.Actor.findOne({ where: { id: passedId } });

  if (freshActor) {
    // query using association functions
    const actorsEvents = await db.Event.findAll({
      //exclude unwanted query result
      attributes: {
        exclude: ['updatedAt'],
      },
      where: { actorId: passedId },
      include: [
        {
          model: db.Actor,
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
        },
        {
          model: db.Repo,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'eventId', 'EventId'],
          },
        },
      ],
    });

    // send response
    if (actorsEvents) {
      res.status(200).json({
        status: 'success',
        length: actorsEvents.length,
        data: actorsEvents,
        requestedAt: req.requestTime,
      });
    }
  } else {
    res.status(404).json({
      status: 'Actor not found',
      requestedAt: req.requestTime,
    });
  }
});

//update actor avater url
exports.updateActorAvatarUrl = catchAsync(async (req, res, next) => {
  //using the logged in actor id to update its avater url
  const result = await db.Actor.update(
    { avater_url: req.body.avater_url },
    { where: { id: req.actor.id } }
  );

  // send response
  if (result) {
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
    });
  }

  res.status(400).json({
    status: 'something went wrong',
  });
});

//get actors by maximum streak
exports.getActorsByStreak = catchAsync(async (req, res, next) => {
  //getting all actors
  let actors = await db.Actor.findAll({
    attributes: {
      exclude: ['updatedAt', 'password'],
    },
  });

  //Implement the streak sort.(I did not understand the concepte)

  //send response
  if (actors) {
    res.status(200).json({
      status: 'success',
      length: actors.length,
      data: actors,
      requestedAt: req.requestTime,
    });
  }

  res.status(404).json({
    status: 'Not found',
    requestedAt: req.requestTime,
  });
});
