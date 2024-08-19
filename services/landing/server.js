// services/landing/server.js
const express = require('express');
const path = require('path');

const app = express();

// Настройка статической папки для обслуживания файлов
app.use(express.static(path.join(__dirname, 'public')));

// Обработка корневого маршрута
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Запуск сервера на порту 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Landing сервис запущен на порту ${PORT}`);
});
