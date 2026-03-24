const { createExerciseRepository,getExerciseHistoryOfGrantRepository,getExercisesUponStatusRepository,approveOrRejectExerciseRepository } = require('../repository/exerciseRepository')
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

const getExercisesUponStatusService = async (empId, status) => {
  try {
    // If you specifically want to block certain statuses, do it here.
    // Otherwise, just pass it to the repository.
    return await getExercisesUponStatusRepository(empId, status);
  } catch (err) {
    throw err;
  }
};

const approveOrRejectExerciseService = async (exerciseId, action, adminUserId, rejectionReason) => {
    const normalizedAction = action?.toLowerCase();
    
    // Logic check: 'approve' becomes 'approved', 'reject' becomes 'rejected' to match Enum
    if (!normalizedAction || !['approve', 'reject'].includes(normalizedAction)) {
        const error = new Error('Action must be "approve" or "reject"');
        error.statusCode = 400;
        throw error;
    }

    if (normalizedAction === 'reject' && !rejectionReason) {
        const error = new Error('Rejection reason is required for rejection');
        error.statusCode = 400;
        throw error;
    }

    return await approveOrRejectExerciseRepository(exerciseId, normalizedAction, adminUserId, rejectionReason);
}

module.exports = {
    createExerciseService,
    getExerciseHistoryOfGrantService,
    getExercisesUponStatusService,
    approveOrRejectExerciseService
}