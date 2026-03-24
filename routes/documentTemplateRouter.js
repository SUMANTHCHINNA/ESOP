const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {createDocumentTemplateController,getDefaultTemplateController,deleteDocumentTemplateController,updateDocumentTemplateController,getDocumentTemplateByTypeController} = require('../controllers/documentTemplateController')

router.post('/createDocumentTemplate',createDocumentTemplateController)
router.get('/getDefaultTemplate/:id',getDefaultTemplateController)
router.delete('/deleteDocumentTemplate/:id',deleteDocumentTemplateController);
router.patch('/updateDocumentTemplate/:id',updateDocumentTemplateController);
router.get('/getDocumentTemplateByType/:id', getDocumentTemplateByTypeController);

router.use(middleware);


module.exports = router;