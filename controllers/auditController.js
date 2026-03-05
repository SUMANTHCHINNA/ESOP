const {auditFreezeService} = require('../services/auditService')

const auditFreezeController = {
    activateFreeze: async (req, res) => {
        try {
            const companyId = await getCompanyId(req.user.user_email);
            const adminUserId = req.userId || req.user.id;
            const { freeze_date, notes } = req.body;

            const result = await auditFreezeService.activate(companyId, adminUserId, freeze_date, notes);
            return res.status(201).json({ success: true, data: result });
        } catch (err) {
            return res.status(err.statusCode || 500).json({ success: false, error: err.message });
        }
    },

    deactivateFreeze: async (req, res) => {
        try {
            const { id } = req.params; // The specific Freeze UUID
            const result = await auditFreezeService.deactivate(id);
            return res.status(200).json({ success: true, message: "Freeze deactivated successfully" });
        } catch (err) {
            return res.status(err.statusCode || 500).json({ success: false, error: err.message });
        }
    },

    getActiveFreeze: async (req, res) => {
        try {
            const companyId = await getCompanyId(req.user.user_email);
            const result = await auditFreezeService.getActive(companyId);
            return res.status(200).json({ success: true, data: result });
        } catch (err) {
            return res.status(err.statusCode || 500).json({ success: false, error: err.message });
        }
    }
};

module.exports = {
    auditFreezeController
}