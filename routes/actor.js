const express = require('express');
const actorController = require('../controllers/actorsController');


const router = express.Router();

router.get('/', actorController.protectActorRoutes, actorController.getAllActors);
router.post('/events', actorController.protectActorRoutes, actorController.createEvent);

router.put('/signup', actorController.actorSignUp);

router.put('/signin', actorController.actorLogin);


module.exports = router;