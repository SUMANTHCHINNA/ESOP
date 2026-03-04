const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {createExerciseController} = require('../controllers/exerciseController')

router.use(middleware);
router.post('/createExercise',createExerciseController);

module.exports = router;