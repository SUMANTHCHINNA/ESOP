const validateFields = (fields, body) => {
    const missing = fields.filter(f => !body[f]);
    return missing.length > 0 ? `Missing fields: ${missing.join(', ')}` : null;
};

module.exports = {
    validateFields
}