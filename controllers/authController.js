const { createUser, checkUserAlreadyExistInDBAndGetData } = require('../repository/query');
const jwt = require('jsonwebtoken');
const bycrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const createUserController = async (req, res) => {
    const { full_name, user_email, user_pass } = req.body;
    if (!full_name || !user_email || !user_pass) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        let userId = uuidv4();
        let hasshedPassword = await bycrypt.hash(user_pass, 10);
        const result = await createUser(userId, full_name, user_email, hasshedPassword);
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.status(201).json({ message: 'User registered successfully', user: result.rows[0], token });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

const userLoginController = async (req, res) => {
    const { user_email, user_pass } = req.body;
    console.log(req.body);
    if (!user_email || !user_pass) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const checkUserExistAndGetData = await checkUserAlreadyExistInDBAndGetData(user_email);
        if (checkUserExistAndGetData.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const user = checkUserExistAndGetData[0];
        const isPasswordValid = await bycrypt.compare(user_pass, user.user_pass);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.status(200).json({ message: 'Login successful', user: { id: user.id, full_name: user.full_name, user_email: user.user_email }, token });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
}


const logoutController = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
}
 
module.exports = {
    createUserController,
    userLoginController,
    logoutController
};