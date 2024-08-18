const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db'); // Подключаемся к базе данных через файл db.js
const app = express();

app.use(bodyParser.json());
app.use(cors());

// Корневой маршрут
app.get('/', (req, res) => {
  res.send('Добро пожаловать в CRM систему мебельной фабрики!');
});

// Пример маршрута для создания пользователя (сотрудника)
app.post('/users', async (req, res) => {
  const { name, role } = req.body;
  try {
    const newUser = await pool.query(
      'INSERT INTO users (name, role) VALUES ($1, $2) RETURNING *',
      [name, role]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Пример маршрута для получения всех пользователей
app.get('/users', async (req, res) => {
  try {
    const allUsers = await pool.query('SELECT * FROM users');
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
