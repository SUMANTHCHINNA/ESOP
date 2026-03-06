const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRouter');
const userRoutes = require('./routes/userRouter');
const companyRoutes = require('./routes/companyRouter');
const esopPlansRouter = require('./routes/esopPlansRouter');
const esopGrantsRouter = require('./routes/esopGrantsRouter');
const exerciseRouter = require('./routes/exerciseRouter');
const fmvValuationRouter = require('./routes/fmvValiadtionRouter')
const documentTemplateRouter = require('./routes/documentTemplateRouter')
const auditRouter = require('./routes/auditRouter')
const exitSummary = require('./routes/exitSummaryRouter')
const { createUsersTable,createCompaniesTable,createEsopPlanTable,createEnums,createEsopGrantsTable,createExercisesTable, createFvmValuationsTable,createDocumentTemplateTable,auditFreezeTable,createExitSummariesTable } = require('./modals/tables');

dotenv.config();


const corsOptions = {
  origin: 'https://urban-giggle-g9rj5xgj9qv29695-8081.app.github.dev',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  // allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/esopPlans', esopPlansRouter);
app.use('/api/esopGrants', esopGrantsRouter);
app.use('/api/exercises', exerciseRouter);
app.use('/api/fmvValuation',fmvValuationRouter);
app.use('/api/documentTemplate',documentTemplateRouter);
app.use('/api/audit',auditRouter);
app.use('/api/exitSummary',exitSummary);



const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, async () => {
  try {
    await createUsersTable();
    await createCompaniesTable();
    await createEsopPlanTable();
    await createEnums();
    await createEsopGrantsTable();
    await createExercisesTable();
    await createFvmValuationsTable();
    await createDocumentTemplateTable();
    await auditFreezeTable();
    await createExitSummariesTable();
    console.log('Users table creation initiated');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
  console.log(`Server running at http://localhost:${port}`);
}); 