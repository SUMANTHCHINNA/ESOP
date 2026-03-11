const { validateFields } = require("../utils/validation");
const {
  createCompanyByAdmin,
  getCompanyDetailsByAdminUserId,
  updateCompanyByAdmin,
  getCompanyAdminDetailsRepository,
} = require("../repository/companyRepository");

const createCompanyService = async (body, adminId) => {
  // 1. Validation
  const requiredFields = [
    "name",
    "cin",
    "pan_number",
    "gstin",
    "address_line1",
    "city",
    "state",
    "pincode",
    "company_email",
    "phone",
    // 'share_price', 'total_pool_shares'
  ];

  const validationError = validateFields(requiredFields, body);
  if (validationError) {
    const error = new Error(validationError);
    error.statusCode = 400;
    throw error;
  }

  // 2. Prepare single object for repository
  const companyObj = {
    ...body,
    admin_user_id: adminId,
  };

  // 3. Call Repository
  const result = await createCompanyByAdmin(companyObj);
  return result.rows[0];
};

const getCompanyService = async (userId) => {
  // 1. Validation (Optional check for ID)
  if (!userId) {
    const error = new Error("Admin User ID is required");
    error.statusCode = 400;
    throw error;
  }

  // 2. Repository Call
  const companyDetails = await getCompanyDetailsByAdminUserId(userId);

  // 3. Logic: Check if data was found
  if (!companyDetails || companyDetails.length === 0) {
    const error = new Error("Company not found for the given admin user ID");
    error.statusCode = 404;
    throw error;
  }

  // 4. Return the primary company object
  return companyDetails[0];
};

const updateCompanyService = async (companyId, adminUserId, updateData) => {
  // 1. Validation: Ensure we have an ID
  if (!companyId) {
    const error = new Error("Company ID is required");
    error.statusCode = 400;
    throw error;
  }

  // 2. Repository Call
  const result = await updateCompanyByAdmin(companyId, adminUserId, updateData);

  // 3. Logic: Check if update actually happened
  if (result.rowCount === 0) {
    const error = new Error("Company not found or no changes made");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

const getCompanyAdminDetailsService = async (companyId) => {
  try {
    return await getCompanyAdminDetailsRepository(companyId);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createCompanyService,
  getCompanyService,
  updateCompanyService,
  getCompanyAdminDetailsService,
};
