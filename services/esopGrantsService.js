const {
  getGrantDetailsOfAnCompanyRepository,
  getEmployeeGrantsRepository,
  updateGrantsRepository,
} = require("../repository/esopGrantsRepository");

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

    grantData.vesting_end_date = calculatedEndDate.toISOString().split("T")[0];
  }

  // 2. Initialize tracking fields (Ensure they are numbers and default to 0)
  grantData.vested_shares = parseFloat(grantData.vested_shares) || 0;
  grantData.exercised_shares = parseFloat(grantData.exercised_shares) || 0;
  grantData.lapsed_shares = parseFloat(grantData.lapsed_shares) || 0;
  const totalShares = parseFloat(grantData.total_shares) || 0;

  // 3. Logic Check: Vested + Lapsed cannot exceed Total
  if (grantData.vested_shares + grantData.lapsed_shares > totalShares) {
    throw new Error(
      "The sum of vested and lapsed shares cannot exceed the total grant shares"
    );
  }

  try {
    // Proceed to save the complete grant object
    return await createGrantRepository(grantData);
  } catch (err) {
    throw err;
  }
};

const getGrantDetailsOfAnCompanyService = async (companyId) => {
  if (!companyId) {
    throw new Error(
      `Error in getGrantDetailsOfAnCompanyService - CompanyId is : ${companyId}`
    );
  }
  try {
    const result = await getGrantDetailsOfAnCompanyRepository(companyId);
    return result;
  } catch (err) {
    throw err;
  }
};

const getEmployeeGrantsService = async (empId) => {
  try {
    const result = await getEmployeeGrantsRepository(empId);
    return result;
  } catch (err) {
    throw err;
  }
};

const updateGrantsService = async (grantId, updateData) => {
  try {
    // Remove restricted fields
    const { id, created_at, total_shares, ...validData } = updateData;

    if (Object.keys(validData).length === 0) {
      const error = new Error("No valid fields provided for update");
      error.statusCode = 400;
      throw error;
    }

    return await updateGrantsRepository(grantId, validData);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createGrantService,
  getGrantDetailsOfAnCompanyService,
  getEmployeeGrantsService,
  updateGrantsService,
};
