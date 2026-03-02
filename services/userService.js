const {checkUserAlreadyExistInDBAndGetData} = require('../repository/authRepository') 
const {checkAdminCompanyDetails,getAllEmployeesOfAnCompany,terminateUserById} = require('../repository/usersRepository')

const getUserDetailsService = async (userEmail) => {
    // 1. Validation (Optional but good practice)
    if (!userEmail) {
        const error = new Error('Email is required');
        error.statusCode = 400;
        throw error;
    }

    // 2. Repository Call
    const users = await checkUserAlreadyExistInDBAndGetData(userEmail);

    // 3. Check if user exists
    if (users.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const user = users[0];

    // 4. Format and return data (Filtering out sensitive fields like password)
    return {
        id: user.id,
        full_name: user.full_name,
        user_email: user.user_email,
        company_id: user.company_id,
        employment_type: user.employment_type
    };
};

const getCompanyAndEmployeesService = async (adminId) => {
    // 1. Fetch Company details where this user is the Admin
    const companyData = await checkAdminCompanyDetails(adminId);
    
    if (!companyData || companyData.length === 0) {
        const error = new Error('No company found for this admin');
        error.statusCode = 404;
        throw error;
    }

    const company = companyData[0];

    // 2. Fetch all employees associated with that company ID
    const employees = await getAllEmployeesOfAnCompany(company.id);

    return {
        company,
        employees
    };
};

const terminateUserService = async (userId) => {
    // 1. Basic validation of ID presence
    if (!userId) {
        const error = new Error('User ID is required');
        error.statusCode = 400;
        throw error;
    }

    // 2. Call repository to update the database
    const result = await terminateUserById(userId);

    // 3. Logic check: If rowCount is 0, user wasn't found or already updated
    if (result.rowCount === 0) {
        const error = new Error('User not found or already terminated');
        error.statusCode = 404;
        throw error;
    }

    // 4. Return the updated user data
    return result.rows[0];
};


module.exports = {
    getUserDetailsService,
    getCompanyAndEmployeesService,
    terminateUserService
}