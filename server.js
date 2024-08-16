// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Создание или обновление пользователя
app.post('/users', (req, res) => {
  const { name, phone, role, is_business_client } = req.body;
  db.run(`
    INSERT INTO Users (name, phone, role, is_business_client) 
    VALUES (?, ?, ?, ?)
    ON CONFLICT(phone) DO UPDATE SET name = excluded.name, role = excluded.role, is_business_client = excluded.is_business_client
  `, [name, phone, role, is_business_client], function(err) {
    if (err) {
      console.error('Ошибка при записи в базу данных:', err.message);
      return res.status(500).send('Ошибка при добавлении пользователя');
    }
    res.status(200).send({ message: 'Пользователь добавлен/обновлен', id: this.lastID });
  });
});
// Добавление заказа
app.post('/orders', (req, res) => {
    const { phone, sawing, lamination } = req.body;
    const cost = sawing * 200 + lamination * 50;
  
    // Проверяем, существует ли пользователь
    db.get(`SELECT id FROM Users WHERE phone = ?`, [phone], (err, user) => {
      if (err) {
        console.error('Ошибка при поиске пользователя:', err.message);
        return res.status(500).json({ error: 'Ошибка при поиске пользователя' });
      }
  
      if (!user) {
        // Если пользователя нет, создаем его
        const name = req.body.name || 'Неизвестный клиент';
        const is_business_client = req.body.is_business_client || false;
  
        db.run(`
          INSERT INTO Users (name, phone, role, is_business_client) 
          VALUES (?, ?, 'клиент', ?)
        `, [name, phone, is_business_client], function(err) {
          if (err) {
            console.error('Ошибка при добавлении пользователя:', err.message);
            return res.status(500).json({ error: 'Ошибка при добавлении пользователя' });
          }
  
          // После создания пользователя, добавляем заказ
          const userId = this.lastID;
          addOrder(userId, sawing, lamination, cost, res);
        });
      } else {
        // Если пользователь найден, добавляем заказ
        addOrder(user.id, sawing, lamination, cost, res);
      }
    });
  });
  
  // Функция для добавления заказа
  function addOrder(userId, sawing, lamination, cost, res) {
    db.run(`
      INSERT INTO Orders (user_id, status, sawing, lamination, cost)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, 'заявка', sawing, lamination, cost], function(err) {
      if (err) {
        console.error('Ошибка при добавлении заказа:', err.message);
        return res.status(500).json({ error: 'Ошибка при добавлении заказа' });
      }
      res.status(200).json({ message: 'Заказ добавлен', id: this.lastID });
    });
  }
// Получение всех заказов для суперпользователя
app.get('/orders', (req, res) => {
    const query = `
      SELECT Orders.id, Users.name, Users.phone, Orders.status, Orders.sawing, Orders.lamination, Orders.cost, Orders.created_at
      FROM Orders
      JOIN Users ON Orders.user_id = Users.id
    `;
  
    db.all(query, [], (err, orders) => {
      if (err) {
        console.error('Ошибка при получении заказов:', err.message);
        return res.status(500).json({ error: 'Ошибка при получении заказов' });
      }
      res.status(200).json(orders);
    });
  });
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
  
  
  
  // Проверка существования пользователя
  app.get('/users/:phone', (req, res) => {
    const phone = req.params.phone;
    db.get(`SELECT id FROM Users WHERE phone = ?`, [phone], (err, user) => {
      if (err) {
        console.error('Ошибка при поиске пользователя:', err.message);
        return res.status(500).json({ error: 'Ошибка при поиске пользователя' });
      }
      if (user) {
        res.status(200).json({ found: true });
      } else {
        res.status(200).json({ found: false });
      }
    });
  });
    