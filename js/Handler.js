const mysqlUtilities = require('mysql-utilities');
const Order = require('./Order');
const { WebClient } = require('@slack/web-api');
const configs = require('./../configs.js');

const SLACK_BOT_TOKEN = configs.SLACK_BOT_TOKEN;
const web = new WebClient(SLACK_BOT_TOKEN);

class Handler {
  constructor(db) {
    this.orders = new Map();
    this.avaliablePizzasList;

    this.help = [];

    this.db = db;
    this.db.connect((error) => {
      if (!!error) {
        console.log('Database connection error');
        console.dir(error);
      } else {
        //console.clear();
        console.log('Connected to pizzabot database');
      }
    });

    mysqlUtilities.upgrade(this.db);
    mysqlUtilities.introspection(this.db);
  }

  addOrderingCustomer(user) {
    let ord = new Order(user);
    this.orders.set(user, ord);
  }

  deleteOrder(user) {
    this.orders.delete(user);
  }

  checkOrderingCustomer(user) {
    return this.orders.has(user);
  }

  addPizza(user, block_id, pizza_id) {
    this.getPizza(pizza_id).then(
      pizza => this.orders.get(user).setPizza(block_id, pizza_id, pizza[0].name)
    );
  }

  addSize(user, block_id, size) {
    this.orders.get(user).setSize(block_id, size);
  }

  setMessageTs(user, message_ts) {
    this.orders.get(user).setMessageTs(message_ts);
  }

  getMessageTs(user) {
    return this.orders.get(user).getMessageTs();
  } 

  async getPizza(id) {
    try {
      let pizza = await this.dbSelect('pizzas', '*', {id: id});
      return pizza;
    } catch (e) {
      console.log(e);
    }
  }

  async getPizzas() {
    try {
      let pizzas = await this.dbSelect('pizzas', '*', '');
      console.clear();
      console.log(pizzas);
      return pizzas;
    } catch (e) {
      console.log(e);
    }
  }

  getCurrentNumbOfPizzas(user) {
    return this.orders.get(user).getCurrentNumbOfPizzas();
  }

  incCurrentNumbOfPizzas(user) {
    this.orders.get(user).incCurrentNumbOfPizzas();
  }

  getOrder(user) {
    return this.orders.get(user).getOrder();
  }

  fillingCheck(user) {
    if (!this.orders.has(user)) {
      return false;
    } else {
      return this.orders.get(user).fillingCheck();
    }
  }

  setOrderBlockForm(user, blocks) {
    this.orders.get(user).setOrderBlockForm(blocks);
  }

  getOrderBlockForm(user) {
    return this.orders.get(user).getOrderBlockForm(); 
  }

  setAdress(user, adress) {
    this.orders.get(user).setAdress(adress);
  }

  getAdress(user) {
    return this.orders.get(user).getAdress();
  }

  setOrderStep(user, stepNumb) {
    this.orders.get(user).setOrderStep(stepNumb);
  }

  getOrderStep(user) {
    return this.orders.get(user).getOrderStep();
  }

  setChannelId(user, channel_id) {
    this.orders.get(user).setChannelId(channel_id);
  }

  completeOrderCheck(user) {
    return this.orders.get(user).completeOrderCheck();
  }

  saveOrder(user) {
    this.orders.get(user).saveOrder(this.db);
  }

  async dbGetOrders() {
    try {
      let orders = await this.dbSelect('orders', '*', '');

      let help = [];
      
      for (let order of orders) {
        try {
          let pizzaRecords = await this.dbSelect('orders_pizzas', '*', {order_id: order.id});
          
          for (let pizzaRecord of pizzaRecords) {
            try {
              let pizza = await this.dbSelect('pizzas', '*', {id: pizzaRecord.pizza_id});
              pizzaRecord.pizza_name = pizza[0].name;
            } catch (e) {
              console.log(e);
            }
          }

          help.push({
            order, 
            pizzas: pizzaRecords
          });
        } catch (e) {
          console.log(e);
        }
      }
      return help;
    } catch (e) {
      console.log(e);
    }
    // return await this.handlerPromise('orders', '*', '');
    // this.db.select('orders', '*', '', (err, result) => {
    //   if (err) throw err;
    //   let order = result;

    //   order.forEach(element => {
    //     try {
    //       let result = await this.handlerPromise('orders_pizzas', '*', {order_id: element.id});
    //     } catch (e) {
    //       console.log(e);
    //     };
    //     // this.db.select('orders_pizzas', '*', {order_id: element.id}, (err, result) => {
    //     //   if (err) throw err;
    //     //   let pizzas = result;

    //     //   pizzas.forEach(element => {
    //     //     this.db.select('pizzas', '*', {id: element.pizza_id}, (err, result) => {
    //     //       element.pizza_name = result[0].name;
    //     //     });
    //     //   });
          
    //     //   this.help.push({
    //     //     order: element,
    //     //     pizzas: pizzas
    //     //   });
    //     // });
    //   });
    // });


    // return this.help;
  }

  dbSelect(...params) {
    return new Promise((resolve, reject) => {
      this.db.select(...params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
  
  async changeStatus(orderId, status) {
    let record = await this.dbUpdate('orders', { status: status }, { id: orderId });
  }

  changeStatusNotification(orderId, userId, channelId, status) {
    web.chat.postMessage({
      token: SLACK_BOT_TOKEN,
      channel: channelId,
      text: `<@${userId}>! Status of your order #${orderId} has been changed to \'${status}\'`
    });
  }

  dbUpdate(...params) {
    return new Promise((resolve, reject) => {
      this.db.update(...params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};



module.exports = Handler;