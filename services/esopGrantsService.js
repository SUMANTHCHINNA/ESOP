const {createGrantsRepository,getGrantDetailsRepository} = require('../repository/esopGrantsRepository')
const createGrantsService = async(body) =>{
    await createGrantsRepository();
}

const getGrantDetailsService = async(body) =>{
    await getGrantDetailsRepository();
}

module.exports = {
    createGrantsService,
    getGrantDetailsService
}