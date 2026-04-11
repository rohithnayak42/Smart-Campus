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

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Initialize PostgreSQL Table
createUserTable();

// API Routes
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/admin', require('../routes/adminRoutes'));

// Root route - explicitly serve the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle standard HTML routes (e.g., /auth -> auth.html)
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    if (page.startsWith('api')) return next();
    res.sendFile(path.join(__dirname, `../public/${page}.html`), (err) => {
        if (err) next();
    });
});

// Export for Vercel Serverless
module.exports = app;
