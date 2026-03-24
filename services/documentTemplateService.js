const {createDocumentTemplateRepository,getDefaultTemplateRepository,deleteDocumentTemplateRepository,getDocumentTemplateByTypeRepository,updateDocumentTemplateRepository} = require('../repository/docuementTemplateRepository')
 
const createDocumentTemplateService = async (templateData) => {
    if (!templateData.company_id || !templateData.created_by) {
        const error = new Error('Authentication context missing.');
        error.statusCode = 401;
        throw error;
    }

    if (!templateData.content || !templateData.template_type) {
        const error = new Error('template_type and content are required fields.');
        error.statusCode = 400;
        throw error;
    }

    return await createDocumentTemplateRepository(templateData);
};

const getDefaultTemplateService = async (companyId) => {
    try {
        const template = await getDefaultTemplateRepository(companyId);
        
        if (!template) {
            const error = new Error("No default document template found for this company.");
            error.statusCode = 404;
            throw error;
        }

        return template;
    } catch (err) {
        throw err;
    }
};

const deleteDocumentTemplateService = async (id) => {
    try {
        const isDeleted = await deleteDocumentTemplateRepository(id);

        if (!isDeleted) {
            const error = new Error("Document template not found or already deleted.");
            error.statusCode = 404;
            throw error;
        }

        return true;
    }
    catch (err) {
        throw err;
    }
}
const updateDocumentTemplateService = async (id, updateData) => {
    try {
        // Business logic: automatically update the 'updated_at' timestamp
        updateData.updated_at = new Date();

        const result = await updateDocumentTemplateRepository(id, updateData);

        if (!result) {
            const error = new Error("Document template not found.");
            error.statusCode = 404;
            throw error;
        }

        return result;
    }
    catch (err) {
        throw err;
    }
}

const getDocumentTemplateByTypeService = async (companyId, type) => {
    try {
        const template = await getDocumentTemplateByTypeRepository(companyId, type);

        if (!template) {
            const error = new Error(`No template found for type: ${type}`);
            error.statusCode = 404;
            throw error;
        }

        return template;
    }
    catch (err) {
        // Re-throw the error to be caught by the controller
        throw err;
    }
};


module.exports = {
    createDocumentTemplateService,
    getDefaultTemplateService,
    deleteDocumentTemplateService,
    updateDocumentTemplateService,
    getDocumentTemplateByTypeService
}