const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

require('dotenv').config();

const app = express();

connectDB();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donation', require('./routes/donationRoutes'));
app.use('/api/admin', require('./routes/AdminRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));