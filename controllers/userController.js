const { checkUserAlreadyExistInDBAndGetData,checkAdminCompanyDetails,getAllEmployeesOfAnCompany,terminateUserById } = require('../repository/query');

const getUserDetailsController = async (req, res) => {
    try {
        const userEmail = req.user.user_email;
        const checkUserExistAndGetData = await checkUserAlreadyExistInDBAndGetData(userEmail);
        if (checkUserExistAndGetData.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const user = checkUserExistAndGetData[0];
        res.status(200).json({ message: 'User details retrieved successfully', user: { id: user.id, full_name: user.full_name, user_email: user.user_email } });
    } catch (err) {
        console.error('Error retrieving user details:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
}

const getUserDetailsOfAnCompanyController = async (req, res) => {
    try {
        const adminId = req.user.id; // Assuming admin_id is available in the JWT token payload
        const AdminCompanyDetails = await checkAdminCompanyDetails(adminId);
        if (AdminCompanyDetails.length === 0) {
            return res.status(404).json({ message: 'No company found for the given admin user ID' });
        }
        // Employee list of admin working company
        const userDetailsList = await getAllEmployeesOfAnCompany(AdminCompanyDetails[0].id); // Assuming company_id is stored in users table to link employees to their company
        res.status(200).json({ message: 'Company details retrieved successfully', company: AdminCompanyDetails[0], employees: userDetailsList });
    } catch (err) {
        console.error('Error retrieving company details:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
}

const terminateUserByIdController = async (req, res) => {
    try {
        const userId = req.params.id; // Employee ID to be terminated
        const result = await terminateUserById(userId); // Assuming this function updates the user's status to terminated in the database
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found or already terminated' });
        }
        res.status(200).json({ message: 'User terminated successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Error terminating user:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
}

module.exports = {
    getUserDetailsController,
    getUserDetailsOfAnCompanyController,
    terminateUserByIdController
};