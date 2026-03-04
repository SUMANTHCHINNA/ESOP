const { getCompanyId } = require('../repository/usersRepository');
const { createExerciseService } = require('../services/exerciseService')
const { getEmployeeGrantDetailsRepository } = require('../repository/esopGrantsRepository')

const createExerciseController = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const companyId = await getCompanyId(req.user.user_email);

        if (!req.body.grant_id) {
            return res.status(400).json({ message: "Grant ID is required" });
        }
        const grantDetails = await getEmployeeGrantDetailsRepository(req.body.grant_id);
        const grant = Array.isArray(grantDetails) ? grantDetails[0] : grantDetails;

        if (!grant) {
            return res.status(404).json({ message: "Grant not found" });
        }
        const exercisePrice = grant.exercise_price;
        const result = await createExerciseService(req.body, employeeId, companyId, exercisePrice);

        return res.status(201).json({
            message: 'Exercise created successfully',
            exercise: result 
        });
    }
    catch (err) {
        console.error('Error In createExerciseController:', err.message);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || 'Failed to create Exercise'
        });
    }
}

module.exports = {
    createExerciseController
}