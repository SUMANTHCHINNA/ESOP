const {createEsopPlanByEmployeer} = require('../repository/esopPlansRepository')
const {validateFields} = require('../utils/validation');

const createEsopPlanService = async (planData) => {
    // 1. Define Required Fields
    const requiredFields = [
        'company_id', 'plan_name', 'total_shares_reserved', 'effective_date', 'expiry_date',
        'plan_type', 'currency', 'vesting_start_reference', 'default_vesting_period_years'
    ];

    // 2. Run Global Validation Helper
    const validationError = validateFields(requiredFields, planData);
    if (validationError) {
        const error = new Error(validationError);
        error.statusCode = 400;
        throw error;
    }

    // 3. Call Repository with the object
    const result = await createEsopPlanByEmployeer(planData);
    
    return result.rows[0];
};

module.exports = {
    createEsopPlanService
}