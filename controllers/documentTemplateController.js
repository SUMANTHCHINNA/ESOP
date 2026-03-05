const { getCompanyId } = require('../repository/usersRepository');
const {createDocumentTemplateService,getDefaultTemplateService} = require('../services/documentTemplateService')

const createDocumentTemplateController = async (req, res) => {
    try {
        const companyId = await getCompanyId(req.user.user_email);
        const adminUserId = req.userId || req.user.id;

        // Ensure companyId is a valid string to avoid UUID syntax errors
        if (!companyId || typeof companyId !== 'string') {
            return res.status(400).json({ error: "Valid Company ID is required." });
        }

        const templateData = {
            ...req.body,
            company_id: companyId,
            created_by: adminUserId
        };

        const result = await createDocumentTemplateService(templateData);

        return res.status(201).json({
            success: true,
            message: "Document template created successfully.",
            data: result
        });
    } catch (err) {
        console.error('Error in createDocumentTemplateController:', err.message);
        return res.status(err.statusCode || 500).json({ error: err.message });
    }
};

const getDefaultTemplateController = async (req, res) => {
    try {
        const companyId = await getCompanyId(req.user.user_email);
        
        // Changed from req.params to req.body to match your request
        const { template_type } = req.body; 

        if (!companyId || typeof companyId !== 'string') {
            return res.status(400).json({ error: "Valid Company ID is required." });
        }

        // Pass the body variable to the service
        const result = await getDefaultTemplateService(companyId, template_type);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Error in getDefaultTemplateController:', err.message);
        return res.status(err.statusCode || 500).json({ error: err.message });
    }
};

module.exports = {
    createDocumentTemplateController,
    getDefaultTemplateController
}