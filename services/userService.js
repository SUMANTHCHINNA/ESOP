const {
  checkUserAlreadyExistInDBAndGetData,
} = require("../repository/authRepository");
const {
  checkAdminCompanyDetails,
  getAllEmployeesOfAnCompany,
  terminateUserById,
  getUserRoleRepository,
  updateUserDetailsRepository,
  updatePasswordRepository,
  IspasswordChangedRepository,
} = require("../repository/usersRepository");

const getUserDetailsService = async (userId) => {
  // 1. Validation (Optional but good practice)
  if (!userId) {
    const error = new Error("userId is required");
    error.statusCode = 400;
    throw error;
  }

  // 2. Repository Call
  const users = await checkUserAlreadyExistInDBAndGetData(userId);

  // 3. Check if user exists
  if (users.length === 0) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const user = users[0];

  // 4. Format and return data (Filtering out sensitive fields like password)
  return {
    id: user.id,
    full_name: user.full_name,
    user_email: user.user_email,
    company_id: user.company_id,
    employment_type: user.employment_type,
  };
};

const getCompanyAndEmployeesService = async (adminId) => {
  // 1. Fetch Company details where this user is the Admin
  const companyData = await checkAdminCompanyDetails(adminId);

  if (!companyData || companyData.length === 0) {
    const error = new Error("No company found for this admin");
    error.statusCode = 404;
    throw error;
  }

  const company = companyData[0];

  // 2. Fetch all employees associated with that company ID
  const employees = await getAllEmployeesOfAnCompany(company.id);

  return {
    company,
    employees,
  };
};

const terminateUserService = async (userId) => {
  // 1. Basic validation of ID presence
  if (!userId) {
    const error = new Error("User ID is required");
    error.statusCode = 400;
    throw error;
  }

  // 2. Call repository to update the database
  const result = await terminateUserById(userId);

  // 3. Logic check: If rowCount is 0, user wasn't found or already updated
  if (result.rowCount === 0) {
    const error = new Error("User not found or already terminated");
    error.statusCode = 404;
    throw error;
  }

  // 4. Return the updated user data
  return result.rows[0];
};

const getUserRoleService = async (userId) => {
  try {
    const role = await getUserRoleRepository(userId);

    if (!role) {
      const error = new Error("User employment type not found");
      error.statusCode = 404;
      throw error;
    }

    return role;
  } catch (err) {
    // Must throw so the controller knows it failed
    throw err;
  }
};

const updateUserDetailsService = async (userId, body) => {
  // Prevent empty updates
  if (!body || Object.keys(body).length === 0) {
    const error = new Error("No fields provided for update");
    error.statusCode = 400;
    throw error;
  }

  try {
    return await updateUserDetailsRepository(userId, body);
  } catch (err) {
    throw err;
  }
};

const updatePasswordService = async (userId, newPassword) => {
  try {
    // 1. Hash the new password (Salt rounds = 10)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 2. Pass the hashed password to the repository
    return await updatePasswordRepository(userId, hashedPassword);
  } catch (err) {
    throw err;
  }
};

const IspasswordChangedService = async (userId) => {
  try {
    // Capture and return the data from the repository
    const data = await IspasswordChangedRepository(userId);
    return data;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getUserDetailsService,
  getCompanyAndEmployeesService,
  terminateUserService,
  getUserRoleService,
  updateUserDetailsService,
  updatePasswordService,
  IspasswordChangedService,
};
