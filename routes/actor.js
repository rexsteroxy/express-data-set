const express = require('express');
const actorController = require('../controllers/actorsController');


const router = express.Router();

router.get('/', actorController.protectActorRoutes, actorController.getAllActors);
router.post('/events', actorController.protectActorRoutes, actorController.createEvent);

router.get('/events', actorController.protectActorRoutes, actorController.getAllEvents);
router.delete('/events', actorController.protectActorRoutes, actorController.deleteAllEvents);

router.put('/signup', actorController.actorSignUp);

router.put('/signin', actorController.actorLogin);


module.exports = router;