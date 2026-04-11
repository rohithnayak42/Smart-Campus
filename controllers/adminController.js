const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/mailer');

const addUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const { rows: existingUser } = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { rows: newUser } = await db.query(
            'INSERT INTO users (name, email, password, role, is_first_login) VALUES ($1, $2, $3, $4, true) RETURNING *',
            [name, email, hashedPassword, role]
        );

        const user = newUser[0];

        // Send email with credentials
        const emailBody = `
Hello ${name},

Welcome to Smart Campus!

Your account has been created.

Login Details:
Email: ${email}
Password: ${password}

Please login and change your password immediately.

Regards,
Smart Campus Admin
        `;

        await sendEmail(email, 'Welcome to Smart Campus - Your Credentials', emailBody);

        res.status(201).json({ message: 'User added and email sent successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let query = 'SELECT id, name, email, role, is_first_login, created_at FROM users';
        let params = [];
        
        if (role && role !== 'All') {
            query += ' WHERE role = $1';
            params.push(role);
        }
        
        query += ' ORDER BY created_at DESC';

        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { addUser, getUsers, deleteUser };
