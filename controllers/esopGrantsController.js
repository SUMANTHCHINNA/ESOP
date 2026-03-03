const { createGrantsService, getGrantDetailsService } = require('../services/esopGrantsService')

const createGrantsController = async (req, res) => {
    try {
        const adminId = req.user.id;
        const grantDetails = await createGrantsService(req.body, adminId);

        return res.status(201).json({
            message: 'ESOP Grants created successfully',
            grantDetails: grantDetails
        });

    } catch (err) {
        console.error('Error In createGrantsController:', err.message);

        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || 'Internal server error'
        });
    }
}

const getGrantDetailsController = async (req, res) => {
    await getGrantDetailsService(req.body);
}

module.exports = {
    createGrantsController,
    getGrantDetailsController
}