require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createUserTable } = require('../models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize PostgreSQL Table
createUserTable();

// Routes
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/admin', require('../routes/adminRoutes'));

// Export for Vercel Serverless
module.exports = app;
