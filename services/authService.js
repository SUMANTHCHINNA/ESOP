const { createUser, checkUserAlreadyExistInDBAndGetData, createUserByAdmin } = require('../repository/authRepository')
const bcrypt = require('bcrypt');
const { validateFields } = require('../utils/validation')
const {generateToken} = require('../utils/tokenServices')

const createUserService = async (body) => {
    const { full_name, user_email, user_pass } = body;

    // 1. Validation
    const requiredFields = ['full_name', 'user_email', 'user_pass'];
    const validationError = validateFields(requiredFields, body);

    if (validationError) {
        const error = new Error(validationError);
        error.statusCode = 400;
        throw error;
    }

    // 2. Logic: Hash Password
    const hashedPassword = await bcrypt.hash(user_pass, 10);

    // 3. Repository Call
    const result = await createUser(full_name, user_email, hashedPassword);
    const newUser = result.rows[0];

    // 4. Generate JWT
    const token = await generateToken(newUser.id, newUser.user_email);
    return { newUser, token };
};

const userLoginService = async (body) => {
    const { user_email, user_pass } = body;

    // 1. Validation using global helper
    const requiredFields = ['user_email', 'user_pass'];
    const validationError = validateFields(requiredFields, body);

    if (validationError) {
        const error = new Error(validationError);
        error.statusCode = 400;
        throw error;
    }

    // 2. Repository check
    const users = await checkUserAlreadyExistInDBAndGetData(user_email);
    if (users.length === 0) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    const user = users[0];

    // 3. Password Verification
    const isPasswordValid = await bcrypt.compare(user_pass, user.user_pass);
    if (!isPasswordValid) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // 4. Token Generation
   const token = await generateToken(user.id, user.user_email);

    return {
        user: { id: user.id, full_name: user.full_name, user_email: user.user_email },
        token
    };
};


const createUserByAdminService = async (body) => {
    const { 
        company_id, employee_name, email, employee_id, 
        department, position, hire_date, employment_type, pan 
    } = body;

    // 1. Validation
    const requiredFields = [
        'company_id', 'employee_name', 'email', 'employee_id', 
        'department', 'position', 'hire_date', 'employment_type', 'pan'
    ];
    
    const validationError = validateFields(requiredFields, body);
    if (validationError) {
        const error = new Error(validationError);
        error.statusCode = 400;
        throw error;
    }

    // 2. Hash Default Password
    // Using a default password 'Password' as per your original code
    const hashedPassword = await bcrypt.hash('Password', 10);

    const normalizedEmploymentType = body.employment_type.toUpperCase();
    // 3. Repository Call
    const result = await createUserByAdmin(
        employee_name, 
        email, 
        hashedPassword, 
        company_id, 
        employee_id, 
        department, 
        position, 
        pan, 
        hire_date, 
        normalizedEmploymentType
    );

    return result.rows[0];
};

module.exports = {
    createUserService,
    userLoginService,
    createUserByAdminService
}