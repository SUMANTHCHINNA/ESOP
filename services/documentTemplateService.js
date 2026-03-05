const {createDocumentTemplateRepository,getDefaultTemplateRepository} = require('../repository/docuementTemplateRepository')
 
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

const getDefaultTemplateService = async (companyId, templateType) => {
    // This check was triggering the error because templateType was undefined
    if (!templateType) {
        const error = new Error('Template type is required.');
        error.statusCode = 400;
        throw error;
    }

    const template = await getDefaultTemplateRepository(companyId, templateType);

    if (!template) {
        const error = new Error(`No default template found for type: ${templateType}`);
        error.statusCode = 404;
        throw error;
    }

    return template;
};

module.exports = {
    createDocumentTemplateService,
    getDefaultTemplateService
}