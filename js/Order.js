const mysqlUtilities = require('mysql-utilities');

class Order {
  constructor(user) {
    this.step = 1;
    this.currentNumbOfPizzas = 1;

    this.client = user;
    this.adress = '';
    this.message_ts = '';
    this.channel_id = '';

    this.pizzas = new Map();
    this.orderBlockForm;

    console.log(this.client)
  }

  setPizza(block_id, pizza_id, pizza_name) {
    if (!this.pizzas.has(block_id)) {
      this.pizzas.set(block_id, {
        pizza_id: pizza_id,
        pizza_name: pizza_name,
        size: ''
      });
    } else {
      this.pizzas.get(block_id).pizza_id = pizza_id;
      this.pizzas.get(block_id).pizza_name = pizza_name;
    }
    console.log(this.pizzas.get(block_id));
  }

  setSize(block_id, size) {
    if (!this.pizzas.has(block_id)) {
      this.pizzas.set(block_id, {
        pizza_id: '',
        pizza_name: '',
        size: size
      });
    } else {
      this.pizzas.get(block_id).size = size;
    }
    console.log(this.pizzas.get(block_id));
  }

  setMessageTs(messageTs) {
    this.message_ts = messageTs;
  }

  getMessageTs() {
    return this.message_ts
  }

  getCurrentNumbOfPizzas() {
    return this.currentNumbOfPizzas;
  }

  incCurrentNumbOfPizzas() {
    this.currentNumbOfPizzas++;
  }

  getOrder() {
    return this.pizzas;
  }

  fillingCheck() {
    let check = true;

    if (this.pizzas.size === 0) {
      check = false;
    } else {      
      this.pizzas.forEach(value => {
        if (value.pizza_id === '' || value.pizza_name === '' || value.size === '') {
          check = false;
        }
      });
    }
      
    return check;
  }

  setOrderBlockForm(blocks) {
    this.orderBlockForm = blocks;
  }

  getOrderBlockForm() {
    return this.orderBlockForm;
  }

  setAdress(adress) {
    this.adress = adress;
  }

  getAdress() {
    return this.adress;
  }

  setOrderStep(stepNumb) {
    this.step = stepNumb;
  }

  getOrderStep() {
    return this.step;
  }

  setChannelId(channel_id) {
    this.channel_id = channel_id;
  }

  setClient(client_id) {
    this.client = client_id;
  };

  completeOrderCheck() {
    let check = true;

    check = this.fillingCheck();
    if (this.adress === '') {
      check = false;
    }
    if (this.message_ts === '') {
      check = false;
    }
    if (this.channel_id === '') {
      check = false;
    }

    return check;
  }

  saveOrder(db) {
    db.insert(
      'orders',
      {
        user_id: this.client,
        adress: this.adress,
        message_ts: this.message_ts,
        channel_id: this.channel_id,
        status: 'New'
      },   
      (err, recordId) => {
        //console.dir(err || recordId);

        this.pizzas.forEach(value => {
          db.insert(
            'orders_pizzas',
            {
              order_id: recordId,
              pizza_id: value.pizza_id,
              size: value.size
            },
            (err, recordId) => {
              //console.dir(err || recordId);
            }
          );
        });
      }
    );
  }
};

module.exports = Order;