const { createCompany, getCompanyDetailsByAdminUserId,updateCompany } = require('../repository/query');

const createComapany = async (req, res) => {
    const { name, cin, pan_number, gstin, address_line1, city, state, pincode, company_email, phone, share_price, total_pool_shares } = req.body;

    if (!name || !cin || !pan_number || !gstin || !address_line1 || !city || !state || !pincode || !company_email || !phone || !share_price || !total_pool_shares) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const admin_user_id = req.user.id;

        // FIX: Ensure 'name' is first and 'admin_user_id' is second to match repository
        const result = await createCompany(
            name,
            admin_user_id,
            cin,
            pan_number,
            gstin,
            address_line1,
            city,
            state,
            pincode,
            company_email,
            phone,
            share_price,
            total_pool_shares
        );

        res.status(201).json({
            message: 'Company created successfully',
            company: result.rows[0]
        });
    } catch (err) {
        console.error('Error creating company:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};
const getComapany = async (req, res) => {
    try {
        let userId = req.user.id;
        const comapanyDetails = await getCompanyDetailsByAdminUserId(userId);
        if (comapanyDetails.length === 0) {
            return res.status(404).json({ message: 'Company not found for the given admin user ID' });
        }
        res.status(200).json({ company: comapanyDetails[0] });
    } catch (err) {
        console.error('Error fetching company details:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
}
const updateComapany = async (req, res) => {
    // Need partial update logic here, so all fields are not mandatory except companyId
    let companyId = req.query.companyId; // Assuming company ID is passed as a query parameter
    const { name, cin, pan_number, gstin, address_line1, city, state, pincode, company_email, phone, share_price, total_pool_shares } = req.body;

    if (!name || !cin || !pan_number || !gstin || !address_line1 || !city || !state || !pincode || !company_email || !phone || !share_price || !total_pool_shares) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // update comapny APi logic will be implemented here
        let companyId = req.query.companyId; // Assuming company ID is passed as a query parameter

        const admin_user_id = req.user.id;
        const result = await updateCompany(
            companyId,
            name,
            admin_user_id,
            cin,
            pan_number,
            gstin,
            address_line1,
            city,
            state,
            pincode,
            company_email,
            phone,
            share_price,
            total_pool_shares
        );

        res.status(200).json({
            message: 'Company updated successfully',
            company: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating company:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
}


module.exports = {
    createComapany,
    getComapany,
    updateComapany
}