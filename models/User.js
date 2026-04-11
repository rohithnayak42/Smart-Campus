const db = require('../config/db');

const createUserTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        is_first_login BOOLEAN DEFAULT TRUE,
        otp VARCHAR(10),
        otp_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    
    try {
        await db.query(query);
        console.log('Users table ensured successfully.');
    } catch (err) {
        console.error('Error creating users table', err);
    }
};

module.exports = {
    createUserTable
};
