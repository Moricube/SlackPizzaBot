���������� ��� ��������� ������ ��������� ������� ��� Standuply.

1. ������� � ���������� MySQL database
2. ������� MySQL connection �� localhost:3306
3. ������� ����� ����� �� ��� ��������� 'pizzabot'
4. ������� 3 ������� � 'pizzabot' ��������� ��������� �������

������� 'orders'
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `adress` varchar(50) NOT NULL,
  `message_ts` varchar(45) NOT NULL,
  `channel_id` varchar(45) NOT NULL,
  `status` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

������� 'pizzas'
CREATE TABLE `pizzas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

������� 'orders_pizzas'
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

5. ��������� ����������� �������� ������� 'pizzas'
6. ��� ������������� ���������� ���������� ��� root ������������ ��� ������� � MySQL 

GRANT ALL on *.* to 'root'@'localhost' identified by 'password';

��� 'password' - ������ ��������� � �������� ��������� MySQL

7. ������� �� https://api.slack.com/apps � ������� ����� ����������
8. ������� � ��������� ����, �� ������� 'Basic Information' � ����������� ���� 'Signing Secret'
9. ������� ���������� ������� � ����� ������� ���� configs.js
10. �������� ����� ������������� � ���� 'SLACK_SIGNING_SECRET' 
11. ������� � ��������� ����, �� ������� 'OAuth & Permissions' � ����������� ����� 'Bot User OAuth Access Token'
12. ������� ���������� ������� � ����� ������� ���� configs.js
13. �������� ����� ������������� � ���� 'SLACK_BOT_TOKEN'
14. � ���� �� �����, � ���� 'password' ����� ������ ������, ��������� � �������� ��������� MySQL
15. ������� � �������� ���������� �������, ��������� ������� � ����� ����� ������ 'npm start'
16. ������� � �������� ���������� �������, ����� ������� � ����� client, ��������� ������� � ����� ����� ������ 'npm start'

17. ������� ngrok � ���������
18. � ����������� ���� ������ 'ngrok http 4000'
19. ����� ����������� ����� ngrok (��������: http://06f1230c.ngrok.io)

20. ������� �� https://api.slack.com/apps � ������� ���������� 'pizzabot'
21. ������� �� ������� Event Subscriptions. �������� ������ � ������ URL (��������: http://06f1230c.ngrok.io) ������� ���� '/slack/events' (������ ����������: http://06f1230c.ngrok.io/slack/events) 
22. ������� �� ������� Interactive Components. �������� ������������� ���������� � ������ URL (��������: http://06f1230c.ngrok.io) ������� ���� '/slack/events' (������ ����������: http://06f1230c.ngrok.io/slack/events)
23. ������� �� ������� Slash Commands. ������� ����� ������� '/start' � ������ URL (��������: http://06f1230c.ngrok.io) ������� ���� '/slack/events' (������ ����������: http://06f1230c.ngrok.io/slack/events)
























