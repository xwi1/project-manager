# Установка клиентской части приложения
Прежде чем приступить к установке клиентской части приложения, необходимо установить серверную, подробно можно узнать об этом в описании к репозиторию: https://github.com/xwi1/project-manager-backend

## 1. Клонируйте данный репозиторий в удобное место (в отдельную папку от серверной части)
```
git clone https://github.com/xwi1/project-manager.git
```

## 2. Перейдите в папку приложения и установите пакеты
```
cd project-manager
npm install
```

## 3. Измените URL поключения к серверной части приложения в файле api.js, который находится в папке src/utils
Измените значение в строке baseURL на URL серверной части приложения
```
const api = axios.create({
  baseURL: 'https://project-manager-backend-dskr.onrender.com/api',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})
```
Также не забудьте добавить в конце URL '/api', так как запросы обрабатываются именно по этой ссылке.
При разработке ссылка в подключении к серверной части выглядела так:
```
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})
```

## 4. Запустите приложение
```
npm run serve
```
При запуске вы увидите в терминале, по какой ссылке можно начать работать с сайтом.
