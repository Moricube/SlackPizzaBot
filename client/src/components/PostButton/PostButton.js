import React from 'react'
import axios from 'axios'
import './PostButton.css'

class PostButton extends React.Component {
  constructor(props) {
    super(props);

  }

  handlerClick(e) {
    console.dir(e);
    console.log('хендлер');
  }

  render() {
    return (
      // <button type="button" className={this.props.status === 'New' ? 'btn btn-success' : ''} onClick={this.props.onClick}>{this.props.status === 'New' ? 'Подтвердить' : ''}</button>
      <button type="button" className={this.props.className} onClick={this.props.onClick}>{this.props.text}</button>
    )
  }
}

export default PostButton;