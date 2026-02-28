const express = require('express');
const app = express();
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRouter');
const userRoutes = require('./routes/userRouter');
const { createUsersTable } = require('./modals/tables');

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  createUsersTable();
  console.log('Users table creation initiated');
  console.log(`Server running at http://localhost:${port}`);
}); 