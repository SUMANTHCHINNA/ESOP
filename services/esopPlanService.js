const { createEsopPlanByEmployeer, getEsopPlansOfAnCompany, updateEsopPlanRepository,getEsopPlansPoolStatusOfAnCompany } = require('../repository/esopPlansRepository')
const { validateFields } = require('../utils/validation');

const createEsopPlanService = async (planData) => {
    // 1. Updated Required Fields
    const baseRequiredFields = [
        'company_id', 'plan_name', 'total_shares_reserved', 'face_value_per_share',
        'effective_date', 'plan_type', 'currency', 'vesting_method', 
        'strike_price_type', 'default_strike_price', 'post_termination_exercise_days'
    ];

    // 2. Initial Validation
    const validationError = validateFields(baseRequiredFields, planData);
    if (validationError) {
        const error = new Error(validationError);
        error.statusCode = 400;
        throw error;
    }

    // 3. SET STATUS CORRECTLY
    // If UI sends status, use it; otherwise, default to 'active'
    // This ensures it matches your 'esopplan_status_enum'
    planData.status = planData.status || 'active';

    // 4. Percentage Validation Logic
    if (planData.vesting_method === 'percentage') {
        if (!planData.vesting_percentages || !Array.isArray(planData.vesting_percentages)) {
            const error = new Error("vesting_percentages array is required for percentage method");
            error.statusCode = 400;
            throw error;
        }
        const total = planData.vesting_percentages.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0);
        if (total !== 100) {
            const error = new Error(`Total percentage must be 100. Current: ${total}`);
            error.statusCode = 400;
            throw error;
        }
    } else {
        planData.vesting_percentages = null;
    }

    // 5. Final Data Sanitization
    const sanitizedData = {
        ...planData,
        shares_allocated: planData.shares_allocated || 0,
        // Ensure strings are trimmed and nulls are handled for DB
        plan_document_url: planData.plan_document_url || null,
        board_resolution_url: planData.board_resolution_url || null,
        shareholder_resolution_url: planData.shareholder_resolution_url || null,
        fmv_source: planData.fmv_source || null,
        board_approval_date: planData.board_approval_date || null
    };

    // 6. Call Repository
    const result = await createEsopPlanByEmployeer(sanitizedData);
    
    if (!result || result.rows.length === 0) {
        throw new Error("Failed to create ESOP plan");
    }

    return result.rows[0];
};

const getEsopPlanService = async (companyId) => {
    try {
        const result = await getEsopPlansOfAnCompany(companyId);
        return result;
    }
    catch (err) {
        return err;
    }
}

const updateEsopPlanService = async (id, planData) => {
    if (planData.total_shares_reserved !== undefined && planData.total_shares_reserved < 0) {
        throw new Error('Total shares reserved cannot be negative');
    }

    try {
        const updatedPlan = await updateEsopPlanRepository(id, planData);
        if (!updatedPlan) {
            const error = new Error('ESOP Plan not found or no data provided');
            error.statusCode = 404;
            throw error;
        }
        return updatedPlan;
    } catch (err) {
        throw err;
    }
};



module.exports = {
    createEsopPlanService,
    getEsopPlanService,
    updateEsopPlanService
}