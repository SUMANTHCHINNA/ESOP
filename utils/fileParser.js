const xlsx = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');

const parseFileToJson = async (file) => {
    const filePath = file.path;
    const extension = file.originalname.split('.').pop().toLowerCase();

    // Handle Excel Files
    if (extension === 'xlsx' || extension === 'xls') {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Get first sheet
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);
        
        // Clean up: delete temp file
        fs.unlinkSync(filePath);
        return jsonData;
    }

    // Handle CSV Files
    if (extension === 'csv') {
        return new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    fs.unlinkSync(filePath); // Delete temp file
                    resolve(results);
                })
                .on('error', (error) => reject(error));
        });
    }

    throw new Error('Unsupported file format. Please upload Excel or CSV.');
};

module.exports = { parseFileToJson };