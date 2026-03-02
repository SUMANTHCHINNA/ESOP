const { getUserDetailsService,getCompanyAndEmployeesService,terminateUserService } = require('../services/userService') 

const getUserDetailsController = async (req, res) => {
    try {
        // req.user is usually populated by your auth middleware
        const userEmail = req.user.user_email;

        // Call the service
        const userDetails = await getUserDetailsService(userEmail);

        // Success Response
        return res.status(200).json({
            message: 'User details retrieved successfully',
            user: userDetails
        });

    } catch (err) {
        console.error('Error In getUserDetailsController:', err.message);

        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || 'Internal server error'
        });
    }
};

const getUserDetailsOfAnCompanyController = async (req, res) => {
    try {
        // adminId is extracted from the auth middleware (JWT)
        const adminId = req.user.id;

        // Call the service to get both company and employee data
        const { company, employees } = await getCompanyAndEmployeesService(adminId);

        return res.status(200).json({
            message: 'Company details and employee list retrieved successfully',
            company,
            employees
        });

    } catch (err) {
        console.error('Error In getUserDetailsOfAnCompanyController:', err.message);

        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || 'Internal server error'
        });
    }
};

const terminateUserByIdController = async (req, res) => {
    try {
        const userId = req.params.id;

        // Call the service
        const terminatedUser = await terminateUserService(userId);

        // Success Response
        return res.status(200).json({
            message: 'User terminated successfully',
            user: terminatedUser
        });

    } catch (err) {
        console.error('Error In terminateUserByIdController:', err.message);

        // Use the status code from the error, defaulting to 500
        const statusCode = err.statusCode || 500;
        
        return res.status(statusCode).json({
            message: err.message || 'Internal server error'
        });
    }
};

module.exports = {
    getUserDetailsController,
    getUserDetailsOfAnCompanyController,
    terminateUserByIdController
};