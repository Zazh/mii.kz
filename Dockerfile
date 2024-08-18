# Используем базовый образ Node.js
FROM node:20-alpine

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package*.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install --no-optional && npm cache clean --force

# Копируем весь проект после установки зависимостей
COPY . .

# Устанавливаем команду по умолчанию для запуска вашего приложения
CMD ["npm", "start"]
