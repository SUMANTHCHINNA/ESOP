const { createUserService,userLoginService,createUserByAdminService } = require('../services/authService')
const dotenv = require('dotenv')
dotenv.config();

const createUserController = async (req, res) => {
    try {
        // Call service with just the data it needs
        const { newUser, token } = await createUserService(req.body);

        // Set Cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        // Send Success Response
        return res.status(201).json({
            message: 'User registered successfully',
            user: newUser,
            token
        });

    } catch (err) {
        console.error('Error In CreateUserController:', err.message);

        // Use the status code from the error, or default to 500
        const statusCode = err.statusCode || 500;

        // Handle Specific DB Errors (e.g., Unique Constraint)
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Email already exists' });
        }

        return res.status(statusCode).json({
            message: err.message || 'Internal server error'
        });
    }
};


const userLoginController = async (req, res) => {
    try {
        const { user, token } = await userLoginService(req.body);

        // Set secure cookie
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 
        });

        return res.status(200).json({ 
            message: 'Login successful', 
            user, 
            token 
        });

    } catch (err) {
        console.error('Error In userLoginController:', err.message);
        
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ 
            message: err.message || 'Internal server error' 
        });
    }
};


const logoutController = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
}

const createUserByAdminController = async (req, res) => {
    try {
        const employee = await createUserByAdminService(req.body);

        return res.status(201).json({ 
            message: 'Employee added successfully', 
            employee 
        });

    } catch (err) {
        console.error('Error In createUserByAdminController:', err.message);

        const statusCode = err.statusCode || 500;

        // Check for specific Postgres Unique Violations (Email or Employee ID)
        if (err.code === '23505') {
            return res.status(409).json({ 
                message: 'Email or Employee ID already exists' 
            });
        }

        return res.status(statusCode).json({ 
            message: err.message || 'Internal server error' 
        });
    }
};

module.exports = {
    createUserController,
    userLoginController,
    logoutController,
    createUserByAdminController
};