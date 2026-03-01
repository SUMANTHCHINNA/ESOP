const express = require('express');
const app = express();
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRouter');
const userRoutes = require('./routes/userRouter');
const companyRoutes = require('./routes/companyRouter');
const esopPlansRouter = require('./routes/espoPlansRouter');
const { createUsersTable,createCompaniesTable,createEsopPlanTable,createEnums } = require('./modals/tables');

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/esopPlans', esopPlansRouter);

const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  createUsersTable();
  createCompaniesTable();
  createEsopPlanTable();
  createEnums();
  console.log('Users table creation initiated');
  console.log(`Server running at http://localhost:${port}`);
}); 