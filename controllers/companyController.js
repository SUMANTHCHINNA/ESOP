const { createCompanyByAdmin, getCompanyDetailsByAdminUserId,updateCompanyByAdmin } = require('../repository/query');

const createCompany = async (req, res) => {
    const { name, cin, pan_number, gstin, address_line1, city, state, pincode, company_email, phone, share_price, total_pool_shares } = req.body;

    if (!name || !cin || !pan_number || !gstin || !address_line1 || !city || !state || !pincode || !company_email || !phone || !share_price || !total_pool_shares) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const admin_user_id = req.user.id;

        // FIX: Ensure 'name' is first and 'admin_user_id' is second to match repository
        const result = await createCompanyByAdmin(
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
const getCompany = async (req, res) => {
    try {
        let userId = req.user.id;
        const companyDetails = await getCompanyDetailsByAdminUserId(userId);
        if (companyDetails.length === 0) {
            return res.status(404).json({ message: 'Company not found for the given admin user ID' });
        }
        res.status(200).json({ company: companyDetails[0] });
    } catch (err) {
        console.error('Error fetching company details:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
}
const updateCompany = async (req, res) => {
    // Method 1: Extracting ID directly from URL parameters
    const companyId = req.params.id; 
    
    /* // Method 2: Alternative using destructuring if the param name matches
    // const { id: companyId } = req.params; 
    */

    // Requirement: Only companyId is mandatory for targeting the record
    if (!companyId) {
        return res.status(400).json({ message: 'companyId is required in the URL path' });
    }

    try {
        // Retrieve the authenticated user's ID from the request object
        const admin_user_id = req.user.id;
        
        // Execute the repository function with dynamic field updates
        const result = await updateCompanyByAdmin(companyId, admin_user_id, req.body);

        // Check if the database actually found and updated a record
        if (!result || result.rowCount === 0) {
            return res.status(404).json({ message: 'Company not found or no changes made' });
        }

        res.status(200).json({
            message: 'Company updated successfully',
            company: result.rows[0]
        });
    } catch (err) {
        // Log the failure to the console for server-side debugging
        console.error('Error updating company:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};


module.exports = {
    createCompany,
    getCompany,
    updateCompany
}