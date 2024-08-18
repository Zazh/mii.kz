const { Pool } = require('pg');

const pool = new Pool({
    user: 'zholamanoff',
    host: 'postgres', // имя сервиса, как в docker-compose.yml
    database: 'crm_db',
    password: 'kb971033',
    port: 5432,
});

pool.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.stack);
    } else {
        console.log('Успешное подключение к базе данных');
    }
});

module.exports = pool;
