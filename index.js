const express = require('express');
const app = express();
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRouter');
const userRoutes = require('./routes/userRouter');
const companyRoutes = require('./routes/companyRouter');
const esopPlansRouter = require('./routes/esopPlansRouter');
const esopGrantsRouter = require('./routes/esopGrantsRouter');
const exerciseRouter = require('./routes/exerciseRouter')
const { createUsersTable,createCompaniesTable,createEsopPlanTable,createEnums,createEsopGrantsTable,createExercisesTable, createFvmValuationsTable } = require('./modals/tables');

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/esopPlans', esopPlansRouter);
app.use('/api/esopGrants', esopGrantsRouter);
app.use('/api/exercises', exerciseRouter);



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
    console.log('Users table creation initiated');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
  console.log(`Server running at http://localhost:${port}`);
}); 