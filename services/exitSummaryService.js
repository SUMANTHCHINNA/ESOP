const { exitSummaryRepository,getExitSummaryRepository } = require('../repository/exitSummaryRepository');

const exitSummaryService = {
    processEmployeeExit: async (employeeId, adminId, terminationDate, terminationType) => {
        const rawData = await exitSummaryRepository.fetchEmployeeExitData(employeeId);
        if (!rawData) throw new Error("Employee not found");

        const pted = rawData.pted || 90;
        const totalVested = parseFloat(rawData.total_options_vested || 0);
        const totalExercised = parseFloat(rawData.total_options_exercised || 0);
        
        const windowEndDate = new Date(terminationDate);
        windowEndDate.setDate(windowEndDate.getDate() + pted);

        const summarySnapshot = {
            company_id: rawData.company_id,
            employee_id: rawData.employee_id,
            employee_name: rawData.employee_name,
            employee_code: rawData.employee_code,
            department: rawData.department,
            position: rawData.position,
            hire_date: rawData.hire_date,
            termination_date: terminationDate,
            termination_type: terminationType,
            grant_details: JSON.stringify(rawData.grant_details),
            total_options_granted: rawData.total_options_granted || 0,
            total_options_vested: totalVested,
            total_options_exercised: totalExercised,
            total_options_unvested: (rawData.total_options_granted || 0) - totalVested,
            total_options_lapsed: (rawData.total_options_granted || 0) - totalVested,
            total_options_exercisable: Math.max(0, totalVested - totalExercised),
            post_termination_exercise_days: pted,
            exercise_window_end_date: windowEndDate,
            generated_by: adminId
        };

        return await exitSummaryRepository.executeExitTransaction(
            employeeId, 
            terminationDate, 
            summarySnapshot
        );
    }
};


const getExitSummaryService = {
    // ... existing processEmployeeExit method ...

    getExitSummary: async (employeeId) => {
        const summary = await getExitSummaryRepository.getSummaryByEmployeeId(employeeId);
        
        if (!summary) {
            throw new Error("No exit summary found for this employee.");
        }

        return summary;
    }
};

module.exports = { exitSummaryService,getExitSummaryService };