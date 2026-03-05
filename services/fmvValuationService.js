const {createValuationRepository} = require('../repository/fmvValuationRepository')

const createValuationService = async (valuationData) => {
    if (!valuationData.share_price || valuationData.share_price <= 0) {
        const error = new Error('A valid share price is required.');
        error.statusCode = 400;
        throw error;
    }

    if (!valuationData.effective_from) {
        const error = new Error('Effective From date is required.');
        error.statusCode = 400;
        throw error;
    }

    try {
        return await createValuationRepository(valuationData);
    } catch (err) {
        throw err;
    }
};

module.exports = {
    createValuationService
}