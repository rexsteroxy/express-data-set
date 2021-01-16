const express = require('express');
const actorController = require('../controllers/actorsController');
const eventController = require('../controllers/eveController');

const router = express.Router();

router.get('/events', actorController.protectActorRoutes, eventController.createEvent);




module.exports = router;