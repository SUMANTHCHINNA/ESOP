const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRouter");
const userRoutes = require("./routes/userRouter");
const companyRoutes = require("./routes/companyRouter");
const esopPlansRouter = require("./routes/esopPlansRouter");
const esopGrantsRouter = require("./routes/esopGrantsRouter");
const exerciseRouter = require("./routes/exerciseRouter");
const fmvValuationRouter = require("./routes/fmvValiadtionRouter");
const documentTemplateRouter = require("./routes/documentTemplateRouter");
const auditRouter = require("./routes/auditRouter");
const exitSummary = require("./routes/exitSummaryRouter");

const {
  createUsersTable,
  createCompaniesTable,
  createEsopPlanTable,
  createEnums,
  createEsopGrantsTable,
  createExercisesTable,
  createFvmValuationsTable,
  createDocumentTemplateTable,
  auditFreezeTable,
  createExitSummariesTable,
  createDocumentsTable
} = require("./modals/tables");

dotenv.config();

const corsOptions = {
  origin: " http://localhost:8080",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  // allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/esopPlans", esopPlansRouter);
app.use("/api/esopGrants", esopGrantsRouter);
app.use("/api/exercises", exerciseRouter);
app.use("/api/fmvValuation", fmvValuationRouter);
app.use("/api/documentTemplate", documentTemplateRouter);
app.use("/api/audit", auditRouter);
app.use("/api/exitSummary", exitSummary);

const port = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, async () => {
  try {
    // 1. Create Enums first (They define the custom types used in tables)
    await createEnums();

    // 2. Create Parent Tables (No foreign keys to others)
    await createCompaniesTable();

    // 3. Create Tables that depend on Companies
    await createUsersTable();
    await createEsopPlanTable();
    await createFvmValuationsTable();

    // 4. Create Tables that depend on Users and Plans
    await createEsopGrantsTable();
    await createDocumentTemplateTable();

    // 5. Create Tables that depend on Grants
    await createExercisesTable();
    await auditFreezeTable();
    await createExitSummariesTable();
    await createDocumentsTable();
    
    console.log("Database schema initialization completed.");
  } catch (error) {
    console.error("Database Initialization failed. Stopping server.", error);
    process.exit(1); // Exit if DB setup fails
  }
  console.log(`Server running at http://localhost:${port}`);
});