const {createCompany} = require('../repository/query');
const { v4: uuidv4 } = require('uuid');

const createComapany = async (req, res) => {
    const {name,cin,pan_number,gstin,address_line1,city,state,pincode,company_email,phone,share_price,total_pool_shares} = req.body;
    if(!name || !cin || !pan_number || !gstin || !address_line1 || !city || !state || !pincode || !company_email || !phone || !share_price || !total_pool_shares){
        return res.status(400).json({message:'All fields are required'});
    }
    try {
        const admin_user_id = req.user.id;
        const result = await createCompany(admin_user_id,name,cin,pan_number,gstin,address_line1,city,state,pincode,company_email,phone,share_price,total_pool_shares);
        res.status(201).json({message:'Company created successfully', company: result.rows[0]});
    } catch (err) {
        console.error('Error creating company:', err);
        res.status(500).json({message:'Internal server error', error: err.message});
    }
}
const getComapany = async (req, res) => {}
const updateComapany = async (req, res) => {}


module.exports = {
    createComapany,
    getComapany,
    updateComapany
}