const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Секретный ключ для JWT
const JWT_SECRET = process.env.JWT_SECRET || 'b6989f4c50a0b46422a2d123e836c384';
let refreshTokens = []; // Хранение всех действующих Refresh Token

// Настройка статической папки для обслуживания файлов
app.use(express.static('public'));

// Корневой маршрут
app.get('/', (req, res) => {
  res.send('Добро пожаловать в CRM систему мебельной фабрики!');
});

// Маршрут для регистрации пользователя
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Необходимо указать имя пользователя и пароль' });
  }

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован', user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Маршрут для авторизации пользователя
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Необходимо указать имя пользователя и пароль' });
  }

  try {
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Неправильное имя пользователя или пароль' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Неправильное имя пользователя или пароль' });
    }

    const accessToken = jwt.sign({ user_id: user.rows[0].id }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ user_id: user.rows[0].id }, JWT_SECRET);

    refreshTokens.push(refreshToken); // Сохраняем Refresh Token

    res.json({ message: 'Авторизация прошла успешно', accessToken, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Маршрут для обновления токена
app.post('/refresh-token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: 'Token not provided' });

  if (!refreshTokens.includes(token)) return res.status(403).json({ error: 'Invalid Refresh Token' });

  try {
    jwt.verify(token, JWT_SECRET); // Проверяем валидность Refresh Token
    const newAccessToken = jwt.sign({ user_id: jwt.decode(token).user_id }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ error: 'Invalid Refresh Token' });
  }
});

// Маршрут для выхода пользователя
app.post('/logout', (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter(t => t !== token); // Удаляем токен из массива
  res.sendStatus(204);
});

// Защищенный маршрут
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Это защищенный маршрут', user: req.user });
});

// Middleware для проверки токена
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
