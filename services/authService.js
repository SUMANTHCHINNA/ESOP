const {
  createUser,
  checkUserAlreadyExistInDBAndGetDataByEmail,
  createUserByAdmin,
  createBulkUsersByAdmin,
} = require("../repository/authRepository");
const bcrypt = require("bcrypt");
const { validateFields } = require("../utils/validation");
const { generateToken } = require("../utils/tokenServices");

const createUserService = async (body) => {
  const { fullName, email, password } = body;

  // 1. Validation
  const requiredFields = ["fullName", "email", "password"];
  const validationError = validateFields(requiredFields, body);

  if (validationError) {
    const error = new Error(validationError);
    error.statusCode = 400;
    throw error;
  }

  // 2. Logic: Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Repository Call
  const result = await createUser(fullName, email, hashedPassword);
  const newUser = result.rows[0];

  // 4. Generate JWT
  const token = await generateToken(newUser.id, newUser.email);
  return { newUser, token };
};

const userLoginService = async (body) => {
  const { email, password } = body;

  // 1. Validation using global helper
  const requiredFields = ["email", "password"];
  const validationError = validateFields(requiredFields, body);

  if (validationError) {
    const error = new Error(validationError);
    error.statusCode = 400;
    throw error;
  }

  // 2. Repository check
  const users = await checkUserAlreadyExistInDBAndGetDataByEmail(email);
  if (users.length === 0) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const user = users[0];

  // 3. Password Verification
  const isPasswordValid = await bcrypt.compare(password, user.user_pass);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // 4. Token Generation
  const token = await generateToken(user.id, user.user_email);
  console.log(user);
  return {
    user: {
      id: user.id,
      full_name: user.full_name,
      user_email: user.user_email,
      role: user.employment_type,
    },
    token,
  };
};

const createUserByAdminService = async (body) => {
  const {
    company_id,
    employee_name,
    email,
    employee_id,
    department,
    position,
    hire_date,
    employment_type,
    pan,
  } = body;

  // 1. Validation
  const requiredFields = [
    "company_id",
    "employee_name",
    "email",
    "employee_id",
    "department",
    "position",
    "hire_date",
    "employment_type",
    "pan",
  ];

  const validationError = validateFields(requiredFields, body);
  if (validationError) {
    const error = new Error(validationError);
    error.statusCode = 400;
    throw error;
  }

  // 2. Hash Default Password
  // Using a default password 'Password' as per your original code
  const hashedPassword = await bcrypt.hash("password", 10);

  const normalizedEmploymentType = body.employment_type.toUpperCase();
  // 3. Repository Call
  const result = await createUserByAdmin(
    employee_name,
    email,
    hashedPassword,
    company_id,
    employee_id,
    department,
    position,
    pan,
    hire_date,
    normalizedEmploymentType
  );

  return result.rows[0];
};

const createBulkUsersByAdminService = async (jsonData) => {
  if (!jsonData || jsonData.length === 0) {
    throw new Error("The uploaded file is empty.");
  }

  // 1. Hash the default password once to save CPU cycles during bulk insert
  const hashedPassword = await bcrypt.hash("password", 10);

  // 2. Map the JSON data to match the Repository's expected keys
  // We use .map() to handle all users from the Excel/CSV
  const usersList = jsonData.map((row, index) => {
    // Normalize employment type to UPPERCASE for the DB Enum
    const empType = (
      row.employment_type ||
      row["Employment Type"] ||
      "EMPLOYEE"
    ).toUpperCase();

    return {
      employeeName: row.employee_name || row["Full Name"],
      email: row.email || row["Email"],
      password: hashedPassword,
      companyId: row.company_id,
      employeeId: row.employee_id || row["Employee ID"],
      department: row.department || row["Department"],
      position: row.position || row["Position"],
      pan: row.pan || row["PAN"],
      hireDate: row.hire_date || row["Hire Date"] || new Date(),
      employmentType: empType,
    };
  });

  // 3. Optional: Add a simple check for missing required fields in the first row
  if (!usersList[0].email || !usersList[0].employeeName) {
    throw new Error(
      "Required columns (Email, Full Name) are missing in the file."
    );
  }

  // 4. Send the entire list to the Repository
  const result = await createBulkUsersByAdmin(usersList);

  return result.rows;
};

module.exports = {
  createUserService,
  userLoginService,
  createUserByAdminService,
  createBulkUsersByAdminService,
};
