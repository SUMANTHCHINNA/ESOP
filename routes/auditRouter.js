const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {auditFreezeController} = require('../controllers/auditController');


router.use(middleware);

router.post('/activate',auditFreezeController.activateFreeze);
router.get('/active',auditFreezeController.getActiveFreeze);
router.patch('/deactivate/:id',auditFreezeController.deactivateFreeze);



module.exports = router;