import React from 'react'
import './OrdersManager.css'
import axios from 'axios'
import PostButton from './../PostButton/PostButton.js'
import io from 'socket.io-client'

const configs = require('../../configs');

class OrdersManager extends React.Component {
  constructor(props) {
    super(props);

    let array = [];

    this.state = {
      orders: []
    }


    this.socket = io(configs.HTTP_SERVER_URL);
    this.socket.on('refreshOrders', async () => {
      try {
        let orders = await this.getOrders(configs.SERVER_URL + '/dbGetOrders');
        this.setState({ orders: orders.data.reverse() });
      } catch(e) {
        console.log(e);
      }
    });
  }

  async componentDidMount() {
    try {
      let orders = await this.getOrders(configs.SERVER_URL + '/dbGetOrders');
      this.setState({ orders: orders.data.reverse() });
      console.log(this.state.orders);
    } catch(e) {
      console.log(e);
    }
  }

  async getOrders(...params) {
    return await new Promise((resolve, reject) => {
      axios.get(...params)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      })
    })
  }

  async postOrder(...params) {
    return await new Promise((resolve, reject) => {
      axios.post(...params)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      })
    })
  }

  async buttonNewHandler(order) {
    console.clear();
    console.log('Confirm');
    console.log(order.order.id);
    try {
      await this.postOrder(configs.SERVER_URL + '/orderConfirm', {
        order: order
      });
      let orders = await this.getOrders(configs.SERVER_URL + '/dbGetOrders');
      this.setState({ orders: orders.data.reverse() }); 
    } catch (e) {
      console.log(e);
    }
  }

  async buttonConfirmHandler(order) {
    console.log(order.order.id);
    console.log(order.order.status);
    try {
      await this.postOrder(configs.SERVER_URL + '/orderDeliver', {
        order: order
      });
      let orders = await this.getOrders(configs.SERVER_URL + '/dbGetOrders');
      this.setState({ orders: orders.data.reverse() }); 
    } catch (e) {
      console.log(e);
    }
  }

  async buttonRejectHandler(order) {
    console.log('Reject');
    console.log(order.order.id);
    try {
      await this.postOrder(configs.SERVER_URL + '/orderReject', {
        order: order
      });
      let orders = await this.getOrders(configs.SERVER_URL + '/dbGetOrders');
      this.setState({ orders: orders.data.reverse() }); 
    } catch (e) {
      console.log(e);
    }
  }

  renderPostButton(order) {
    let text;
    let className;
    let onClick;
    if (order.order.status === 'New') {
      text = 'Confirm';
      className = 'btn btn-info';
      onClick = () => this.buttonNewHandler(order);

    } else if (order.order.status === 'Confirmed') {
      text = 'Deliver';
      className = 'btn btn-success';
      onClick = () => this.buttonConfirmHandler(order);
    } else if (order.order.status === 'Delivered') {
      return (
        <div className="alert alert-success">Order delivered</div>
      )
    } else if (order.order.status === 'Rejected') {
      return (
        <div className="alert alert-danger">Order rejected</div>
      )
    }

    return (
      <div>
        <PostButton 
          text={text} 
          className={className} 
          onClick={onClick}
          />
        <PostButton
          text='Reject'
          className='btn btn-danger'
          onClick={() => this.buttonRejectHandler(order)}
          />
      </div>
    );
  }

  render() {

    return (
      <div>
        <h1>Orders Manager</h1>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Adress</th>
              <th>Pizza</th>
              <th>Size</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {this.state.orders.map((order) => (
              <tr key={order.order.id.toString()}>
                <th>{order.order.id}</th>
                <td>{order.order.adress}</td>
                <td>
                  <table className="table table-striped">
                    <tbody>
                      {order.pizzas.map((pizza) => (
                        <tr key={pizza.id.toString()}>
                          <td>{pizza.pizza_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td>
                  <table className="table table-striped">
                    <tbody>
                      {order.pizzas.map((pizza) => (
                        <tr key={pizza.id.toString()}>
                          <td>{pizza.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td>{order.order.status}</td>
                <td>
                  {this.renderPostButton(order)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}



export default OrdersManager;