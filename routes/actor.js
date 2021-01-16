const express = require('express');
const actorController = require('../controllers/actorsController');


const router = express.Router();

router.get('/', actorController.getAllActors);

router.put('/signup', actorController.actorSignUp);
module.exports = router;