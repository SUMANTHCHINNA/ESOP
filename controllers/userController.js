const { checkUserAlreadyExistInDBAndGetData } = require('../repository/query');

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

module.exports = {
    getUserDetailsController
};