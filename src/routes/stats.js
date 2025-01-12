const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const auth = require('../middleware/auth');

router.post('/record', auth, studyController.recordStudy);
router.get('/weekly', auth, studyController.getWeeklyStats);

module.exports = router; 