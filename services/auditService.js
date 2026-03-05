const {auditFreezeRepository} = require('../repository/auditRepository')

const auditFreezeService = {
    activate: async (companyId, adminUserId, freezeDate, notes) => {
        if (!freezeDate) {
            const error = new Error("Freeze date is required.");
            error.statusCode = 400;
            throw error;
        }
        return await auditFreezeRepository.setFreeze(companyId, adminUserId, freezeDate, notes);
    },

    deactivate: async (freezeId) => {
        return await auditFreezeRepository.updateStatus(freezeId, false);
    },

    getActive: async (companyId) => {
        const data = await auditFreezeRepository.fetchActive(companyId);
        if (!data) {
            const error = new Error("No active audit freeze found for this company.");
            error.statusCode = 404;
            throw error;
        }
        return data;
    }
};

module.exports = {
    auditFreezeService
}