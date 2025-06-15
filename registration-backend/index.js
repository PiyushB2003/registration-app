import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: 3306
};


async function initializeDatabase() {
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.query(`USE ${dbConfig.database}`);
    await connection.query(`
    CREATE TABLE IF NOT EXISTS registration (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(15),
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
    await connection.end();
}


app.post('/register', async (req, res) => {
    const { name, email, phone, password } = req.body;

    console.log(req.body);
    
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        
        const [existingUsers] = await connection.query('SELECT email FROM registration WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            await connection.end();
            return res.status(400).json({ message: 'Email already exists' });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        
        await connection.query(
            'INSERT INTO registration (name, email, phone, password) VALUES (?, ?, ?, ?)',
            [name, email, phone || null, hashedPassword]
        );

        await connection.end();
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});


async function startServer() {
    try {
        await initializeDatabase();
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
}

startServer();