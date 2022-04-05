const express = require('express');
const layoutController = require('../controllers/layout');

const router = express.Router();

router.get('/', layoutController.getIndex);
router.get('/form', layoutController.getForm);
router.get('/courses', layoutController.getCourses);
router.get('/about', layoutController.getAboutPage);
router.get('/:school/course/:code', layoutController.getCourseByID);
router.get('/add/node/form', layoutController.getAddNodeForm);
router.get('/show/participants', layoutController.getShowParticipants);
router.get('/show/vote-list', layoutController.getShowVoteList);

module.exports = router;