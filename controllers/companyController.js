const {createCompanyService,getCompanyService,updateCompanyService} = require('../services/companyService')
 
const createCompanyController = async (req, res) => {
    try {
        const adminId = req.user.id; // From Auth Middleware

        // Pass the body and the user ID to the service
        const company = await createCompanyService(req.body, adminId);

        return res.status(201).json({
            message: 'Company created successfully',
            company: company
        });

    } catch (err) {
        console.error('Error In createCompanyController:', err.message);

        const statusCode = err.statusCode || 500;

        // Check for Unique Constraint violations (CIN or PAN already exists)
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Company with this CIN, PAN, or Email already exists' });
        }

        return res.status(statusCode).json({
            message: err.message || 'Internal server error'
        });
    }
};


const getCompanyController = async (req, res) => {
    try {
        // Extract ID from Auth Middleware
        const userId = req.user.id;

        // Call the Service
        const company = await getCompanyService(userId);

        // Success Response
        return res.status(200).json({ 
            message: 'Company details retrieved successfully',
            company 
        });

    } catch (err) {
        console.error('Error In getCompanyController:', err.message);

        // Dynamic status code based on service error, or default to 500
        const statusCode = err.statusCode || 500;

        return res.status(statusCode).json({ 
            message: err.message || 'Internal server error' 
        });
    }
};

const updateCompanyController = async (req, res) => {
    try {
        const companyId = req.params.id;
        const adminUserId = req.user.id; // From Auth Middleware

        // Call Service
        const updatedCompany = await updateCompanyService(companyId, adminUserId, req.body);

        return res.status(200).json({
            message: 'Company updated successfully',
            company: updatedCompany
        });

    } catch (err) {
        console.error('Error In updateCompanyController:', err.message);
        
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || 'Internal server error'
        });
    }
};


module.exports = {
    createCompanyController,
    getCompanyController,
    updateCompanyController
}