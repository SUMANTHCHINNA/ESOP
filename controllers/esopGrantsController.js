const {createGrantsService,getGrantDetailsService} = require('../services/esopGrantsService')

const createGrantsController = async(req,res) =>{
    await createGrantsService(req.body);

}

const getGrantDetailsController = async(req ,res) =>{
    await getGrantDetailsService(req.body);
}

module.exports = {
    createGrantsController,
    getGrantDetailsController
}