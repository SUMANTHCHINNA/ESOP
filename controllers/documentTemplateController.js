const { getCompanyId } = require('../repository/usersRepository');
const { createDocumentTemplateService, getDefaultTemplateService, deleteDocumentTemplateService, updateDocumentTemplateService,getDocumentTemplateByTypeService } = require('../services/documentTemplateService')

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
            status: true,
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
        const companyId = req.params.id;

        // Validation for UUID/String format
        if (!companyId) {
            return res.status(400).json({
                status: false,
                error: "Company ID is required."
            });
        }

        const result = await getDefaultTemplateService(companyId);

        return res.status(200).json({
            status: true,
            data: result
        });
    } catch (err) {
        console.error('Error in getDefaultTemplateController:', err.message);
        return res.status(err.statusCode || 500).json({
            status: false,
            error: err.message
        });
    }
};

const deleteDocumentTemplateController = async (req, res) => {
    try {
        // Typically for DELETE, the ID is passed as a query param or in the body
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ status: false, message: "Template ID is required." });
        }

        await deleteDocumentTemplateService(id);

        return res.status(200).json({
            status: true,
            message: "Document template deleted successfully."
        });
    }
    catch (err) {
        console.error('Error in deleteDocumentTemplateController:', err.message);
        return res.status(err.statusCode || 500).json({
            status: false,
            error: err.message
        });
    }
}

const updateDocumentTemplateController = async (req, res) => {
    try {
        const { id, ...updateData } = req.body;

        if (!id) {
            return res.status(400).json({ status: false, message: "Template ID is required." });
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ status: false, message: "No update fields provided." });
        }

        const updatedTemplate = await updateDocumentTemplateService(id, updateData);

        return res.status(200).json({
            status: true,
            message: "Document template updated successfully.",
            data: updatedTemplate
        });
    }
    catch (err) {
        console.error('Error in updateDocumentTemplateController:', err.message);
        return res.status(err.statusCode || 500).json({
            status: false,
            message: err.message
        });
    }
}

const getDocumentTemplateByTypeController = async (req, res) => {
    try {
        const companyId = req.params.id;
        const { type } = req.query; // Extract Type from req.query

        if (!companyId || !type) {
            return res.status(400).json({ 
                status: false, 
                message: "Both Company ID and Template Type are required." 
            });
        }

        const result = await getDocumentTemplateByTypeService(companyId, type);

        return res.status(200).json({
            status: true,
            data: result
        });
    }
    catch (err) {
        console.error('Error in getDocumentTemplateByTypeController:', err.message);
        return res.status(err.statusCode || 500).json({
            status: false,
            message: err.message
        });
    }
}


module.exports = {
    createDocumentTemplateController,
    getDefaultTemplateController,
    deleteDocumentTemplateController,
    updateDocumentTemplateController,
    getDocumentTemplateByTypeController
}