const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/mailer');

const addUser = async (req, res) => {
    try {
        const { name, loginEmail, realEmail, password, role } = req.body;
        
        // Check if login email already exists
        const { rows: existingUser } = await db.query('SELECT id FROM users WHERE email = $1', [loginEmail]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Login Email already in use' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { rows: newUser } = await db.query(
            'INSERT INTO users (name, email, real_email, password, role, is_first_login) VALUES ($1, $2, $3, $4, $5, true) RETURNING *',
            [name, loginEmail, realEmail, hashedPassword, role]
        );

        const user = newUser[0];

        // Professional Email Format
        const emailSubject = 'Welcome to Smart Campus - Your Credentials';
        const emailBody = `Hello ${name},

Welcome to Smart Campus.

You have been added as ${role}.

Login Details:
Login Email: ${loginEmail}
Password: ${password}

Please login and change your password immediately.

Regards,  
Smart Campus`;

        // Send email to realEmail
        await sendEmail(realEmail, emailSubject, emailBody);

        res.status(201).json({ 
            message: 'User created and credentials sent to personal email', 
            user: { 
                id: user.id, 
                name: user.name, 
                loginEmail: user.email, 
                realEmail: user.real_email,
                role: user.role 
            } 
        });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ error: 'Server error during user creation' });
    }
};

const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let query = 'SELECT id, name, email as login_email, real_email, role, is_first_login, created_at FROM users';
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

const getStats = async (req, res) => {
    try {
        const userStats = await db.query('SELECT role, count(*) FROM users GROUP BY role');
        const issueStats = await db.query('SELECT count(*) FROM campus_issues WHERE status = \'Pending\'');
        const subjectStats = await db.query('SELECT count(*) FROM subjects');
        const noticeStats = await db.query('SELECT count(*) FROM campus_notices');
        
        const stats = {
            roles: userStats.rows,
            pendingIssues: issueStats.rows[0].count,
            totalSubjects: subjectStats.rows[0].count,
            totalNotices: noticeStats.rows[0].count,
            totalUsers: userStats.rows.reduce((acc, curr) => acc + parseInt(curr.count), 0)
        };
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getIssues = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM campus_issues ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.query('UPDATE campus_issues SET status = $1 WHERE id = $2', [status, id]);
        res.json({ message: 'Issue status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Subjects CRUD
const addSubject = async (req, res) => {
    try {
        const { name, code, credits, assignedFaculty } = req.body;
        const { rows } = await db.query(
            'INSERT INTO subjects (name, code, credits, assigned_faculty) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, code, credits, assignedFaculty]
        );
        res.status(201).json({ message: 'Subject added successfully', subject: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getSubjects = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM subjects ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Timetable CRUD
const addSchedule = async (req, res) => {
    try {
        const { day, timeSlot, subjectName, facultyName, room, batch } = req.body;
        const { rows } = await db.query(
            'INSERT INTO timetable_schedules (day, time_slot, subject_name, faculty_name, room, batch) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [day, timeSlot, subjectName, facultyName, room, batch]
        );
        res.status(201).json({ message: 'Schedule added successfully', schedule: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getSchedules = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM timetable_schedules ORDER BY day, time_slot ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Notices
const addNotice = async (req, res) => {
    try {
        const { title, message, targetRoles } = req.body;
        const { rows } = await db.query(
            'INSERT INTO campus_notices (title, message, target_roles) VALUES ($1, $2, $3) RETURNING *',
            [title, message, targetRoles]
        );
        res.status(201).json({ message: 'Notice published successfully', notice: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getNotices = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM campus_notices ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// User Control (Reset PW)
const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await db.query('UPDATE users SET password = $1, is_first_login = true WHERE id = $2', [hashedPassword, id]);
        res.json({ message: 'Password reset and marked as first login' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { 
    addUser, getUsers, deleteUser, getStats, getIssues, updateIssueStatus, 
    addSubject, getSubjects, addSchedule, getSchedules, addNotice, getNotices, resetPassword 
};
