const {createGrantRepository} = require('../repository/esopGrantsRepository')

const createGrantService = async (grantData) => {
    // 1. Handle vesting_end_date: Prioritize provided date, otherwise calculate
    const startDate = new Date(grantData.vesting_start_date);

    if (grantData.vesting_end_date) {
        // Validation: Ensure end date is actually after start date
        const providedEndDate = new Date(grantData.vesting_end_date);
        if (providedEndDate <= startDate) {
            throw new Error("Vesting end date must be after the vesting start date");
        }
    } else {
        // Fallback: Calculate based on duration months
        const durationMonths = parseInt(grantData.vesting_period_months) || 0;
        const calculatedEndDate = new Date(startDate);
        calculatedEndDate.setMonth(startDate.getMonth() + durationMonths);

        grantData.vesting_end_date = calculatedEndDate.toISOString().split('T')[0];
    }

    // 2. Initialize tracking fields (Ensure they are numbers and default to 0)
    grantData.vested_shares = parseFloat(grantData.vested_shares) || 0;
    grantData.exercised_shares = parseFloat(grantData.exercised_shares) || 0;
    grantData.lapsed_shares = parseFloat(grantData.lapsed_shares) || 0;
    const totalShares = parseFloat(grantData.total_shares) || 0;

    // 3. Logic Check: Vested + Lapsed cannot exceed Total
    if ((grantData.vested_shares + grantData.lapsed_shares) > totalShares) {
        throw new Error("The sum of vested and lapsed shares cannot exceed the total grant shares");
    }

    try {
        // Proceed to save the complete grant object
        return await createGrantRepository(grantData);
    } catch (err) {
        throw err;
    }
};

const getGrantDetailsService = async (body) => {
    await getGrantDetailsRepository();
}

module.exports = {
    createGrantService,
    getGrantDetailsService
}