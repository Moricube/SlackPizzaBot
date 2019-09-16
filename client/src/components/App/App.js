import React from 'react';
import logo from './../../assets/images/logo.svg';
import './App.css';
import OrdersManager from './../OrdersManager/OrdersManager.js'

function App() {
  console.log(`Client working on port 3000`);
  return (
    <div className="container bg-faded">
      <div className="row row-10 justify-content-center">
        <OrdersManager ></OrdersManager>
      </div>
    </div>
  );
}

export default App;
