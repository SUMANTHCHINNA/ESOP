const { createUser } = require('../query');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const createUserController = async (req, res) => {
    const { full_name, user_email, user_pass } = req.body;
    if (!full_name || !user_email || !user_pass) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        let userId = uuidv4();
        console.log('Generated UUID:', userId);
        console.log('User data:', { userId, full_name, user_email, user_pass });
        const result = await createUser(userId, full_name, user_email, user_pass);
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ message: 'User registered successfully', user: result.rows[0], token });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

module.exports = {
    createUserController,
};