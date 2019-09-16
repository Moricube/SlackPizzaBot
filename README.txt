Инструкция как запустить проект тестового задания для Standuply.

1. Скачать и установить MySQL database
2. Создать MySQL connection на localhost:3306
3. Создать новую схему БД под названием 'pizzabot'
4. Создать 3 таблицы в 'pizzabot' используя следующие скрипты

Таблица 'orders'
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `adress` varchar(50) NOT NULL,
  `message_ts` varchar(45) NOT NULL,
  `channel_id` varchar(45) NOT NULL,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

Таблица 'pizzas'
CREATE TABLE `pizzas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

Таблица 'orders_pizzas'
CREATE TABLE `orders_pizzas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `pizza_id` int(11) NOT NULL,
  `size` varchar(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_pizzas_ibfk_1` (`order_id`),
  KEY `orders_pizzas_ibfk_2` (`pizza_id`),
  CONSTRAINT `orders_pizzas_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `orders_pizzas_ibfk_2` FOREIGN KEY (`pizza_id`) REFERENCES `pizzas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

5. Заполнить несколькими записями таблицу 'pizzas'
6. При необходимости установить привелегии для root пользователя для доступа в MySQL 

GRANT ALL on *.* to 'root'@'localhost' identified by 'password';

Где 'password' - пароль созданный в процессе установки MySQL

7. Перейти на https://api.slack.com/apps и создать новое приложение
8. Перейти в настройки бота, во вкладку 'Basic Information' и скопировать ключ 'Signing Secret'
9. Открыть директорию проекта и далее открыть файл configs.js
10. Вставить ранее скопированное в поле 'SLACK_SIGNING_SECRET' 
11. Перейти в настройки бота, во вкладку 'OAuth & Permissions' и скопировать токен 'Bot User OAuth Access Token'
12. Открыть директорию проекта и далее открыть файл configs.js
13. Вставить ранее скопированное в поле 'SLACK_BOT_TOKEN'
14. В этом же файле, в поле 'password' нужно ввести пароль, созданный в процессе установки MySQL
15. Перейти в корневую директорию проекта, запустить консоль и после этого ввести 'npm start'
16. Перейти в корневую директорию проекта, после перейти в папку client, запустить консоль и после этого ввести 'npm start'

17. Скачать ngrok и запустить
18. В открывшемся окне ввести 'ngrok http 4000'
19. После скопировать адрес ngrok (например: http://06f1230c.ngrok.io)

20. Перейти на https://api.slack.com/apps и открыть приложение 'pizzabot'
21. Перейти во вкладку Event Subscriptions. Включить Ивенты и ввести URL (например: http://06f1230c.ngrok.io) дописав путь '/slack/events' (пример результата: http://06f1230c.ngrok.io/slack/events) 
22. Перейти во вкладку Interactive Components. Включить Интерактивные компоненты и ввести URL (например: http://06f1230c.ngrok.io) дописав путь '/slack/events' (пример результата: http://06f1230c.ngrok.io/slack/events)
23. Перейти во вкладку Slash Commands. Создать новую команду '/start' и ввести URL (например: http://06f1230c.ngrok.io) дописав путь '/slack/events' (пример результата: http://06f1230c.ngrok.io/slack/events)

24. Готово, теперь перейдя по адресу http://localhost:3000/ можно открыть клиент для заказов, а сделать сам заказ можно через бота на платформе slack!
