import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));
app.use(express.json());

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

let db;

// Inicializar conexión a la base de datos
async function initDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL exitosa');
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error);
    process.exit(1);
  }
}

// Rutas de API

// Obtener todos los datos de consumption
app.get('/api/consumption', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM consumption ORDER BY Date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener datos de expiration
app.get('/api/expiration', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM expiration ORDER BY Expiry_Date ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener datos de productivity
app.get('/api/productivity', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM productivity');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registro de usuarios
app.post('/api/users/register', async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body;
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [result] = await db.execute(
      'INSERT INTO users (nombre, apellido, email, password) VALUES (?, ?, ?, ?)',
      [nombre, apellido, email, hashedPassword]
    );
    
    res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      userId: result.insertId 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'El email ya existe' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Login de usuarios
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
});
