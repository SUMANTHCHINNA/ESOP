const {createValuationRepository,getActiveValuationRepository,getValuationHistoryRepository,getValuationByDateRepository} = require('../repository/fmvValuationRepository')

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

const getActiveValuationService = async (companyId) => {
    const valuation = await getActiveValuationRepository(companyId);
    if (!valuation) {
        const error = new Error('No active valuation found for this company.');
        error.statusCode = 404;
        throw error;
    }
    return valuation;
};

const getValuationHistoryService = async (companyId) => {
    return await getValuationHistoryRepository(companyId);
};

const getValuationByDateService = async (companyId, targetDate) => {
    // Simple date format validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
        const error = new Error('Invalid date format. Use YYYY-MM-DD.');
        error.statusCode = 400;
        throw error;
    }

    const valuation = await getValuationByDateRepository(companyId, targetDate);

    if (!valuation) {
        const error = new Error(`No valuation was effective on ${targetDate}.`);
        error.statusCode = 404;
        throw error;
    }

    return valuation;
};

module.exports = {
    createValuationService,
    getActiveValuationService,
    getValuationHistoryService,
    getValuationByDateService
}