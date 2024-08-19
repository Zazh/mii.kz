const express = require('express');
const path = require('path');
const app = express();

// Обслуживание статических файлов
app.use(express.static('public'));

// Корневой маршрут
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Landing page сервис запущен на порту ${PORT}`);
});
