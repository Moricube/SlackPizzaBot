const { App } = require('@slack/bolt');
const { WebClient } = require('@slack/web-api');
const MySql = require('mysql');
const OrderHandler = require('./js/Handler');
const axios = require('axios');
const socket = require('socket.io');
const configs = require('./configs.js');

const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const server = express();

const BotPort = process.env.PORT || configs.BOT_PORT;
const ServerPort = process.env.PORT || configs.EXPRESS_SERVER_PORT;
server.use(express.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.listen(ServerPort);
server.all('*', function(req, res, next) {
  
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  next();
});
console.clear();
console.log(`Server working on port ${ServerPort}`);

const SLACK_SIGNING_SECRET = configs.SLACK_SIGNING_SECRET;
const SLACK_BOT_TOKEN = configs.SLACK_BOT_TOKEN;

const app = new App({
  token: SLACK_BOT_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET
});

const web = new WebClient(SLACK_BOT_TOKEN);

const db = MySql.createConnection(configs.DB);
const handler = new OrderHandler(db);

///////////////////////////////////////////////////////////////

const http = require('http').createServer(server);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('\nServer message: Connected to server: ', socket.id);
});

http.listen(configs.HTTP_SERVER_PORT, function(){
  console.log('listening on *:5500');
});

///////////////////////////////////////////////////////////////

server.get('/', (req, res) => {
  res.send('Hello world');
});

server.get('/dbGetOrders', async (req, res) => {
  let orders = await handler.dbGetOrders();
  res.send(orders);
});

server.post('/orderConfirm', async (req, res) => {
  console.clear();
  console.log('Confirm order');
  let order = req.body.order.order;
  console.dir('OrderId: ' + order.id);
  handler.changeStatus(order.id, 'Confirmed');
  handler.changeStatusNotification(order.id, order.user_id, order.channel_id, 'Confirmed');
  res.end('200');
});

server.post('/orderDeliver', async (req, res) => {
  console.clear();
  console.log('Deliver order');  
  let order = req.body.order.order;
  console.dir('OrderId: ' + order.id);
  handler.changeStatus(order.id, 'Delivered');
  handler.changeStatusNotification(order.id, order.user_id, order.channel_id, 'Delivered');
  res.end('200');
});

server.post('/orderReject', async (req, res) => {
  console.clear();
  console.log('Reject order');
  let order = req.body.order.order;
  console.dir('OrderId: ' + order.id);
  handler.changeStatus(order.id, 'Rejected');
  handler.changeStatusNotification(order.id, order.user_id, order.channel_id, 'Rejected');
  res.end('200');
});

///////////////////////////////////////////////////////////////

app.command('/start', async ({ command, ack, say }) => {
  ack();

  if (handler.checkOrderingCustomer(command.user_id)) {
    let pleaseMessage = web.chat.postMessage({
      token: SLACK_BOT_TOKEN,
      channel: command.channel_id,
      text: "Please continue order"
    });

    setTimeout(() => {
      pleaseMessage.then((result) => {
        web.chat.delete({
          token: SLACK_BOT_TOKEN,
          channel: result.channel,
          ts: result.message.ts
        });
      });
    }, 3000);
  } else {  
    console.clear();
    
    let blocks = [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hello <@${command.user_id}>! Want some :pizza:?`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "New order",
            "emoji": true
          },
          "action_id": "new_order"
        }
      },
      {
        "type": "divider"
      }
    ];

    say({blocks});
  }
});

app.message('' , async({ message, say }) => {
  console.clear();

  let check = handler.fillingCheck(message.user);
  if (check) {
    
    if (handler.getOrderStep(message.user) === 2) {
      handler.setAdress(message.user, message.text);

      let blocks = [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `You order`
          }
        }
      ];
  
      let order = handler.getOrder(message.user);
      order.forEach(value => {
        blocks.push({
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `${value.pizza_name} ${value.size} cm`
          }
        });
      });
  
      blocks.push({
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Adress: ${handler.getAdress(message.user)}`
        }
      });
  
      blocks.push({
        "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": 'Confirm',
                "emoji": true
              },
              "action_id": `order_confirm`
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": 'Correct',
                "emoji": true
              },
              "action_id": `order_correct`
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": 'Cancel',
                "emoji": true
              },
              "action_id": `order_cancel`
            }
          ]
      });
  
      web.chat.update({
        token: SLACK_BOT_TOKEN,
        channel: message.channel,
        text: "Message has been updated",
        ts: handler.getMessageTs(message.user),
        blocks: blocks
      });
    }
  }
});

app.action('new_order', async({ body, ack, say }) => {
  console.clear();

  ack();  

  if (handler.checkOrderingCustomer(body.user.id)) {
    console.log('Такой клиент уже есть');    
  } else {
    handler.addOrderingCustomer(body.user.id);
    handler.setMessageTs(body.user.id, body.message.ts);
    handler.setChannelId(body.user.id, body.channel.id);

    let pizzas = await handler.getPizzas();
    let pizzaSelects = [];
    pizzas.forEach(pizza => {
      pizzaSelects.push({      
        "text": {
          "type": "plain_text",
          "text": `${pizza.name}`,
          "emoji": true
        },
        "value": `${pizza.id}`

      });
    });  

    let sizeSelects = [];
    sizeSelects.push({
      "text": {
        "type": "plain_text",
        "text": `30`,
        "emoji": true
      },
      "value": `30`
    });
    sizeSelects.push({
      "text": {
        "type": "plain_text",
        "text": `35`,
        "emoji": true
      },
      "value": `35`
    });
    sizeSelects.push({
      "text": {
        "type": "plain_text",
        "text": `40`,
        "emoji": true
      },
      "value": `40`
    });

    let blocks = [];
    //Message: Started order
    blocks.push({
      "type": "section",
      "text": {
        "type": "plain_text",
        "text": `<@${body.user.username}> started to order! 😋`,
        "emoji": true
      }
    });
    //Select: Pizza and Size
    blocks.push({
      "type": "actions",
      "elements": [
        {
          "action_id": "selected_pizza",
          "type": "static_select",
          "placeholder": {
              "type": "plain_text",
              "text": "Select pizza 🍕",
              "emoji": true
          },
          "options": pizzaSelects
        },
        {
          "action_id": "selected_size",
          "type": "static_select",
          "placeholder": {
              "type": "plain_text",
              "text": "Select size 📏",
              "emoji": true
          },
          "options": sizeSelects
        }
      ]
    });
    //Divider
    blocks.push({
      "type": "divider"
    });
    //Button: One more pizza and Finish order and Cancel order
    blocks.push({
      "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": 'Add pizza',
              "emoji": true
            },
            "action_id": `add_pizza`
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": 'Finish order',
              "emoji": true
            },
            "action_id": `finish_order`
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": 'Cancel',
              "emoji": true
            },
            "action_id": `order_cancel`
          }
        ]
    });

    web.chat.update({
      token: SLACK_BOT_TOKEN,
      channel: body.channel.id,
      text: "Message has been updated",
      ts: body.message.ts,
      blocks: blocks
    });
  }
});

app.action('selected_pizza', async({ body, ack, say }) => {
  console.clear();
  //console.log(body);
  let pizza_id = body.actions[0].selected_option.value;
  let block_id = body.actions[0].block_id;
  console.log(`Выбранная пицца: ${pizza_id}`);
  console.log(`block_id: ${block_id}`);
  
  ack();

  handler.addPizza(body.user.id, block_id, pizza_id);
});

app.action('selected_size', async({ body, ack, say }) => {
  console.clear();
  console.log('selected size')
  //console.log(body);
  let size = body.actions[0].selected_option.value;
  let block_id = body.actions[0].block_id;
  console.log(`Выбранный размер: ${size}`);
  console.log(`block_id: ${block_id}`);
  
  ack();

  handler.addSize(body.user.id, block_id, size);
});

app.action('add_pizza', async({ body, ack, say }) => {
  console.clear();
  
  ack();

  handler.setOrderStep(body.user.id, 1);
  handler.incCurrentNumbOfPizzas(body.user.id);

  let pizzas = await handler.getPizzas();
  let pizzaSelects = [];
  pizzas.forEach(pizza => {
    pizzaSelects.push({      
      "text": {
        "type": "plain_text",
        "text": `${pizza.name}`,
        "emoji": true
      },
      "value": `${pizza.id}`

    });
  });  

  let sizeSelects = [];
  sizeSelects.push({
    "text": {
      "type": "plain_text",
      "text": `30`,
      "emoji": true
    },
    "value": `30`
  });
  sizeSelects.push({
    "text": {
      "type": "plain_text",
      "text": `35`,
      "emoji": true
    },
    "value": `35`
  });
  sizeSelects.push({
    "text": {
      "type": "plain_text",
      "text": `40`,
      "emoji": true
    },
    "value": `40`
  });

  let blocks = body.message.blocks;
  let bottom_btns = blocks.pop();
  let divider = blocks.pop();

  //Divider
  blocks.push({
    "type": "divider"
  });
  //Select: Pizza and Size
  blocks.push({
    "type": "actions",
    "elements": [
      {
        "action_id": "selected_pizza",
        "type": "static_select",
        "placeholder": {
            "type": "plain_text",
            "text": "Select pizza 🍕",
            "emoji": true
        },
        "options": pizzaSelects
      },
      {
        "action_id": "selected_size",
        "type": "static_select",
        "placeholder": {
            "type": "plain_text",
            "text": "Select size 📏",
            "emoji": true
        },
        "options": sizeSelects
      }
    ]
  });

  blocks.push(divider);
  blocks.push(bottom_btns);

  blocks.shift();
  blocks.unshift({
    "type": "section",
    "text": {
      "type": "plain_text",
      "text": `<@${body.user.username}> started to order! 😋`,
      "emoji": true
    }
  });

  web.chat.update({
    token: SLACK_BOT_TOKEN,
    channel: body.channel.id,
    text: "Message has been updated",
    ts: body.message.ts,
    blocks: blocks
  });
});

app.action('finish_order', async({ body, ack, say }) => {
  console.clear();

  ack();

  handler.setOrderStep(body.user.id, 2);

  let check = handler.fillingCheck(body.user.id);
  if (check) {
    handler.setOrderBlockForm(body.user.id, body.message.blocks);

    let blocks = [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `You order`
        }
      }
    ];

    let order = handler.getOrder(body.user.id);
    order.forEach(value => {
      blocks.push({
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `${value.pizza_name} ${value.size} cm`
        }
      });
    });

    let adress = '\'type you adress in the message field\'';
    if (handler.getAdress(body.user.id) !== '') {
      adress = handler.getAdress(body.user.id);
    }

    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `Adress: ${adress}`
      }
    });

    blocks.push({
      "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": 'Confirm',
              "emoji": true
            },
            "action_id": `order_confirm`
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": 'Correct',
              "emoji": true
            },
            "action_id": `order_correct`
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": 'Cancel',
              "emoji": true
            },
            "action_id": `order_cancel`
          }
        ]
    });

    web.chat.update({
      token: SLACK_BOT_TOKEN,
      channel: body.channel.id,
      text: "Message has been updated",
      ts: body.message.ts,
      blocks: blocks
    });
  } else {
    let pleaseMessage = web.chat.postMessage({
      token: SLACK_BOT_TOKEN,
      channel: body.channel.id,
      text: "Please select all optons"
    });

    setTimeout(() => {
      pleaseMessage.then((result) => {
        web.chat.delete({
          token: SLACK_BOT_TOKEN,
          channel: result.channel,
          ts: result.message.ts
        });
      });
    }, 3000);
  }
});

app.action('order_correct', async({ body, ack, say }) => {
  ack();

  handler.setOrderStep(body.user.id, 1);
  let blocks = handler.getOrderBlockForm(body.user.id);

  web.chat.update({
    token: SLACK_BOT_TOKEN,
    channel: body.channel.id,
    text: "Message has been updated",
    ts: body.message.ts,
    blocks: blocks
  });
});

app.action('order_cancel', async({ body, ack, say }) => {
  ack();
  handler.deleteOrder(body.user.id);
  web.chat.delete({
    token: SLACK_BOT_TOKEN,
    channel: body.channel.id,
    ts: body.message.ts
  });
});

app.action('order_confirm', async({ body, ack, say }) => {
  console.clear();


  if (handler.completeOrderCheck(body.user.id)) {
    handler.saveOrder(body.user.id);

    let blocks = body.message.blocks;
    blocks.pop();
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `Status: Your order has been accepted for processing.`
      }
    });

    web.chat.update({
      token: SLACK_BOT_TOKEN,
      channel: body.channel.id,
      text: "Message has been updated",
      ts: body.message.ts,
      blocks: blocks
    });

    handler.deleteOrder(body.user.id);
    io.sockets.emit('refreshOrders');
  } else {
    let pleaseMessage = web.chat.postMessage({
      token: SLACK_BOT_TOKEN,
      channel: body.channel.id,
      text: "Please type you adress in the message field"
    });

    setTimeout(() => {
      pleaseMessage.then((result) => {
        web.chat.delete({
          token: SLACK_BOT_TOKEN,
          channel: result.channel,
          ts: result.message.ts
        });
      });
    }, 3000);
  }
  
  ack();
});

(async () => {
  await app.start(BotPort).then(() => {
    console.log(`Pizzabot working on port ${BotPort}`);
  });
})();
