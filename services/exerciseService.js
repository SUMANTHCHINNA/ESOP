const { createExerciseRepository } = require('../repository/exerciseRepository')
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
module.exports = {
    createExerciseService
}