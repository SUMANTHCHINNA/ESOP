const { createExerciseRepository,getExerciseHistoryOfGrantRepository,getExercisesUponStatusRepository } = require('../repository/exerciseRepository')
const {validateFields} = require('../utils/validation')

const createExerciseService = async (body, employeeId, companyId, exercise_price) => {
    try {
        let requiredFields = ['grant_id', 'shares_exercised', 'withheld'];
        const validationError = validateFields(requiredFields, body);
        
        if (validationError) {
            const error = new Error(validationError);
            error.statusCode = 400;
            throw error; 
        }

        const result = await createExerciseRepository(body, employeeId, companyId, exercise_price);
        return result; 
    }
    catch (err) {
        throw err; 
    }
}

const getExerciseHistoryOfGrantService = async (grantId) => {
    try {
        if (!grantId) {
            const error = new Error('Grant ID is required');
            error.statusCode = 400;
            throw error;
        }
        return await getExerciseHistoryOfGrantRepository(grantId);
    } catch (err) {
        // MUST throw here so the Controller's catch block is triggered
        throw err;
    }
};

const getExercisesUponStatusService = async (status) => {
    try {
        if (!status) {
            const error = new Error('Status parameter is required');
            error.statusCode = 400;
            throw error;
        }
        return await getExercisesUponStatusRepository(status);
    } catch (err) {
        throw err;
    }
};

module.exports = {
    createExerciseService,
    getExerciseHistoryOfGrantService,
    getExercisesUponStatusService
}