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

// Пример маршрута для проверки работы сервера
app.get('/', (req, res) => {
  res.send('Добро пожаловать в CRM систему мебе!');
});

// Другие маршруты для регистрации, авторизации и т.д.
// ... ваш код

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
