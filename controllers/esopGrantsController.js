const { createGrantService, getGrantDetailsOfAnCompanyService } = require('../services/esopGrantsService')
const { getCompanyId } = require('../repository/usersRepository')

const createGrantController = async (req, res) => {
    try {
        const grantData = req.body;

        // Ensure critical foreign keys are present
        if (!grantData.company_id || !grantData.employee_id || !grantData.esop_plan_id) {
            return res.status(400).json({ error: "Required IDs missing: company_id, employee_id, or esop_plan_id" });
        }

        const newGrant = await createGrantService(grantData);

        return res.status(201).json({
            message: 'Grant successfully assigned and initialized',
            data: newGrant
        });
    } catch (err) {
        console.error('Grant Creation Error:', err.message);
        return res.status(500).json({ error: err.message });
    }
};

const getGrantDetailsOfAnCompanyController = async (req, res) => {
    try {
        let email = req.user.user_email;
        const companyId = await getCompanyId(email);
        const grantDetailsOfAnCompany = await getGrantDetailsOfAnCompanyService(companyId);
        return res.status(201).json({
            message: 'Grant Details of an company Fetched Successfully',
            data: grantDetailsOfAnCompany
        });
    }
    catch (error) {
        console.error('Error in getGrantDetailsOfAnCompanyController :', err.message);
        return res.status(500).json({ error: err.message });
    }
}

const getEmployeeGrantsController = async(req,res) =>{
    
}

module.exports = {
    createGrantController,
    getGrantDetailsOfAnCompanyController,
    getEmployeeGrantsController
}