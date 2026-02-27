const express = require('express');
const app = express();
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');

app.use(express.json());
app.use('/api/users', userRoutes);
dotenv.config();

const { createUsersTable } = require('./modals/tables');

const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.listen(port, () => {
  createUsersTable();
  console.log('Users table creation initiated');
  console.log(`Server running at http://localhost:${port}`);
}); 