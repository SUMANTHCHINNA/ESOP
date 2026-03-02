const { createEsopPlanByEmployeer,getEsopPlansOfAnCompany } = require('../repository/esopPlansRepository')
const { validateFields } = require('../utils/validation');

const createEsopPlanService = async (planData) => {
    // 1. Define Fields that are ALWAYS required regardless of the vesting method
    const baseRequiredFields = [
        'company_id', 'plan_name', 'total_shares_reserved', 'effective_date', 'expiry_date',
        'plan_type', 'currency', 'vesting_start_reference', 'default_vesting_period_years',
        'default_vesting_frequency', 'default_cliff_months', 'vesting_method', 'strike_price_type',
        'default_strike_price', 'post_termination_exercise_days'
    ];

    // 2. Initial Validation
    const validationError = validateFields(baseRequiredFields, planData);
    if (validationError) {
        const error = new Error(validationError);
        error.statusCode = 400;
        throw error;
    }

    // 3. Conditional Validation for 'percentage' method
    if (planData.vesting_method === 'percentage') {
        if (!planData.vesting_percentages || !Array.isArray(planData.vesting_percentages) || planData.vesting_percentages.length === 0) {
            const error = new Error("vesting_percentages is required and must be an array when vesting_method is 'percentage'");
            error.statusCode = 400;
            throw error;
        }

        // Validate that total percentage adds up to 100
        const total = planData.vesting_percentages.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0);
        if (total !== 100) {
            const error = new Error(`Total vesting percentage must equal 100. Current total: ${total}`);
            error.statusCode = 400;
            throw error;
        }
    } else {
        // If 'linear', explicitly set to null so it doesn't cause DB issues
        planData.vesting_percentages = null;
    }

    // 4. Default shares_allocated to 0 if not provided
    planData.shares_allocated = planData.shares_allocated || 0;

    // 5. Call Repository
    const result = await createEsopPlanByEmployeer(planData);

    return result.rows[0];
};

const getEsopPlanService = async (companyId) => {
    try {
        const result = await getEsopPlansOfAnCompany(companyId);
        return result.rows;
    }
    catch (err) {
        return err;
    }
}
module.exports = {
    createEsopPlanService,
    getEsopPlanService
}