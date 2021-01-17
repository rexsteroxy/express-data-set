const express = require('express');
const actorController = require('../controllers/actorsController');


const router = express.Router();


//Authentication with JWT
router.post('/signup', actorController.actorSignUp);

router.post('/signin', actorController.actorLogin);



router.get('/',  actorController.getAllActorsWithNumberOfEvents);

router.post('/events', actorController.protectActorRoutes, actorController.addEvent);

router.get('/events', actorController.getAllEvents);

router.delete('/events/erase', actorController.protectActorRoutes, actorController.deleteAllEvents);

router.get('/streak', actorController.getActorsByStreak);




router.put('/update',actorController.protectActorRoutes, actorController.updateActorAvatarUrl);

router
  .route('/events/:actorId')
  .get(actorController.getEventsByItsActor)
  


module.exports = router;