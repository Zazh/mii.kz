const { Pool } = require('pg');

const pool = new Pool({
    user: 'zholamanoff',
    host: 'postgres', // имя сервиса, как в docker-compose.yml
    database: 'crm_db',
    password: 'kb971033',
    port: 5432,
});

pool.connect((err, client, done) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.stack);
    } else {
        console.log('Успешное подключение к базе данных');

        // Создаем таблицу users, если она еще не существует
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        client.query(createTableQuery, (err, res) => {
            done(); // освобождаем клиента обратно в пул

            if (err) {
                console.error('Ошибка при создании таблицы:', err.stack);
            } else {
                console.log('Таблица users успешно создана или уже существует');
            }
        });
    }
});

module.exports = pool;
