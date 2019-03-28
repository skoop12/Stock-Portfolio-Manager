import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Jumbotron from 'react-bootstrap/Jumbotron';
import image from './image.jpg';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

const api_key = "INSERT_YOUR_API_KEY_HERE"

class App extends Component {

  state = {
    stock: "",
    shares: "",
    sell_stock: "",
    sell_shares: "",
    stored_portfolio: localStorage,
    portfolio_value: 0,
    stocks_owned: {},
    current_prices: {},
    display_value: 0,
    showModal: false,
    showSellModal: false,
    row_ordering: [],
    order_shares_asc: false,
    order_val_asc: false,
    order_price_asc: false,
    order_symbol_asc: false,
    order_comp_asc: false,
    determine_order: "SYMBOL_ASC",
    stock_error: false,
    shares_error: false,
    error: false
  }

  // show/hideModalHandler are for showing and hiding the modal for adding stocks to portfolio
  // these functions are triggered by the click event on the 'Buy Shares' button
  showModalHandler = (event) => {
    this.setState({showModal:true});
  }

  hideModalHandler = (event) => {
    this.setState({showModal:false});
  }

  // show/hideSellModalHandler are for showing and hiding the modal for selling stocks from portfolio
  // these functions are triggered by the click event on the 'Sell Shares' button
  showSellModalHandler = (event) => {
    this.setState({showSellModal:true});
  }

  hideSellModalHandler = (event) => {
    this.setState({showSellModal:false});
  }

  // handle...Change functions below allow for typing in the buy/sell form fields by updating associated state variables
  // these functions are triggered by the onChange event of the forms
  handleStockChange = (event) => {
    this.setState({stock: event.target.value});
  }

  handleSharesChange = (event) => {
    this.setState({shares: event.target.value});
  }

  handleSellStockChange = (event) => {
    this.setState({sell_stock: event.target.value});
  }

  handleSellSharesChange = (event) => {
    this.setState({sell_shares: event.target.value});
  }

  // determineSort determines the sorting order of the current portfolio to re-sort after stocks are added/sold
  determineSort = () => {
    if (this.state.determine_order === "SYMBOL_ASC") {
      this.setState({order_symbol_asc: true})
      this.orderBySymbol()
    } else if (this.state.determine_order === "SYMBOL_DESC") {
      this.setState({order_symbol_asc: false})
      this.orderBySymbol()
    } else if (this.state.determine_order === "COMPANY_ASC") {
      this.setState({order_comp_asc: true})
      this.orderByComp()
    } else if (this.state.determine_order === "COMPANY_DESC") {
      this.setState({order_comp_asc: false})
      this.orderByComp()
    } else if (this.state.determine_order === "SHARES_ASC") {
      this.setState({order_shares_asc: true})
      this.orderByShares()
    } else if (this.state.determine_order === "SHARE_DESC") {
      this.setState({order_shares_asc: false})
      this.orderByShares()
    } else if (this.state.determine_order === "PRICE_ASC") {
      this.setState({order_price_asc: true})
      this.orderByPrice()
    } else if (this.state.determine_order === "PRICE_DESC") {
      this.setState({order_price_asc: false})
      this.orderByPrice()
    } else if (this.state.determine_order === "VALUE_ASC") {
      this.setState({order_val_asc: true})
      this.orderByStockValue()
    } else if (this.state.determine_order === "VALUE_DESC") {
      this.setState({order_val_asc: false})
      this.orderByStockValue()
    } else {

    }
  }

  // checkStatus performs error handling for the API call response
  // source: https://jsfiddle.net/LLL38vea/
  checkStatus = (response) => {
    const hasError = (response.status < 200 || response.status >= 300)
    if (hasError) {
      this.setState({error: true, stock_error: true});
      throw response.text();
    }
    return response;
  }

  parseResponse = (response) => {
    return response.json();
  }

  // handleAddSubmit calls the API and triggers a sequence of functions to add stock to the portfolio
  // the function also performs data validation on the number of shares input (not handled by the API error check)
  // the function is triggered by the clickEvent on the submit button of the add shares modal
  handleAddSubmit = (event) => {
    event.preventDefault();
    this.setState({error: false, stock_error: false, shares_error: false});
    console.log('Stock: ' + this.state.stock);
    console.log('Shares: ' + this.state.shares);

    if (isNaN(this.state.shares) | parseFloat(this.state.shares) < 0 | this.state.shares === true) {
      this.setState({error: true, shares_error: true});
      return
    }

    let stock_symbol = this.state.stock;
    let stock_price_url = 'https://cloud.iexapis.com/beta/stock/'+ stock_symbol + '/quote?token=' + api_key
    fetch(stock_price_url).then(this.checkStatus).then(this.parseResponse).then(this.addStock);
  }

  // handleSellSubmit calls the API and triggers a sequence of functions to sell stock from the portfolio
  // the function also performs data validation on the number of shares input (not handled by the API error check)
  // the function is triggered by the clickEvent on the submit button of the sell shares modal
  handleSellSubmit = (event) => {
    event.preventDefault();
    this.setState({error: false, stock_error: false, shares_error: false});
    console.log('Stock: ' + this.state.sell_stock);
    console.log('Shares: ' + -(this.state.sell_shares));

    if (isNaN(this.state.sell_shares) | (parseFloat(this.state.sell_shares) < 0) | (this.state.sell_shares === true)) {
      this.setState({error: true, shares_error: true});
      return
    }
    if (parseFloat(localStorage.getItem(this.state.sell_stock)) < this.state.sell_shares) {
      this.setState({error: true, shares_error: true});
      return
    }
    if (localStorage.getItem(this.state.sell_stock) === null){
      this.setState({error: true, shares_error: true});
      return
    }

    let stock_symbol = this.state.sell_stock;
    let stock_price_url = 'https://cloud.iexapis.com/beta/stock/'+ stock_symbol + '/quote?token=' + api_key
    fetch(stock_price_url).then(this.checkStatus).then(this.parseResponse).then(this.sellStock);
  }

  // sellStock takes the parsed json from the stock API call as data
  // the function updates the portfolio value for the sold stock and calls sellStockData
  sellStock = (data) => {
    console.log(data);
    let currentPrice = data["latestPrice"]
    let companyName = data["companyName"]
    this.sellStockData(this.state.sell_stock.toUpperCase(), companyName, currentPrice, this.state.sell_shares);
    let num_shares = this.state.sell_shares*1;
    let portfolio_value = this.state.portfolio_value;
    let new_value = (portfolio_value*1) - (currentPrice * num_shares)
    if (localStorage.length === 0){
      new_value = 0
    }
    let display = parseFloat(new_value).toFixed(2);
    this.setState({ portfolio_value: new_value, display_value: display, sell_stock: "", sell_shares: "" });
  }

  // sellStock takes the parsed json from the stock API call as data
  // the function updates the portfolio value for the added stock and calls addStockData
  addStock = (data) => {
    console.log(data);
    let currentPrice = data["latestPrice"]
    let companyName = data["companyName"]
    this.addStockData(this.state.stock.toUpperCase(), companyName, currentPrice, this.state.shares);
    let num_shares = this.state.shares*1;
    let portfolio_value = this.state.portfolio_value;
    let new_value = (portfolio_value*1) + (currentPrice * num_shares)
    let display = parseFloat(new_value).toFixed(2);
    this.setState({ portfolio_value: new_value, display_value: display, stock: "", shares: "" });
  }

  // addStock takes the stock symbol, compnay name, and price parsed from the JSON response, and the updated total number of shares owned of that stock as input
  // the function updates localStorage with the updated portfolio stock and number of shares
  // the function also calls determineSort() to resort the data based on updated values
  addStockData = (stockSymbol, companyName, price, shares) => {
    let stocks = this.state.stocks_owned
    if (localStorage.getItem(stockSymbol)){
      let info = localStorage.getItem(stockSymbol)
      let currentNum = info
      let newNum = parseFloat(shares) + parseFloat(currentNum)
      info = newNum
      localStorage.setItem(stockSymbol, info)
      stocks[stockSymbol] = [info, companyName, price]
    } else {
      localStorage.setItem(stockSymbol, parseFloat(shares))
      stocks[stockSymbol] = [parseFloat(shares), companyName, price]
    }
    let prices = this.state.current_prices
    prices[stockSymbol] = price
    this.setState({ stocks_owned: stocks, current_prices: prices})
    this.determineSort();
  }

  // addStock takes the stock symbol, compnay name, and price parsed from the JSON response, and the updated total number of shares owned of that stock as input
  // the function updates localStorage with the updated portfolio stock and number of shares
  // the function also calls determineSort() to resort the data based on updated values
  sellStockData = (stockSymbol, companyName, price, shares) => {
    let stocks = this.state.stocks_owned
    if (localStorage.getItem(stockSymbol)){
      let currentNum = localStorage.getItem(stockSymbol)
      let newNum = parseFloat(currentNum) - parseFloat(shares)
      if (newNum === 0) {
        localStorage.removeItem(stockSymbol)
        delete stocks[stockSymbol]
      } else {
        localStorage.setItem(stockSymbol, newNum)
        stocks[stockSymbol] = [newNum, companyName, price]
      }
    } else{

    }
    this.setState({ stocks_owned: stocks})
    this.determineSort();
  }

  // getStockShares sets the stocks_owned state variable based on the current localStorage items
  getStockShares = () => {
    let keys = Object.keys(localStorage)
    for (let i=0; i<keys.length; i++){
      let stocks = this.state.stocks_owned
      stocks[keys[i]] = [this.state.stored_portfolio[keys[i]],"",0.0]
      this.setState({stocks_owned: stocks})
    }
    this.getCurrentPortfolioValue()
  }

  // getCurrentPortfolioValue calls the API for the stocks owned to get the current price
  getCurrentPortfolioValue = () => {
    for (let key in this.state.stocks_owned) {
      let stock_price_url = 'https://cloud.iexapis.com/beta/stock/'+ key + '/quote?token=' + api_key
      fetch(stock_price_url).then(this.parseResponse).then(this.calculateValue).then(this.orderBySymbol);
    }
  }

  // calculateValue takes the parsed JSON data from the API call and calculates the stock value (price*shares)
  // this function updates the total portfolio value state variable
  calculateValue = (data) => {
    let price = data["latestPrice"];
    let stock = data["symbol"];
    let company = data["companyName"]
    let stocks = this.state.stocks_owned
    let prices = this.state.current_prices
    let info = stocks[stock]
    let shares = info[0]
    prices[stock] = price
    this.setState({current_prices: prices})
    let total_value = 0
    for (let key in this.state.current_prices) {
      let val = stocks[key]
      let num_shares = val[0]*1
      let value = this.state.current_prices[key] * num_shares
      total_value = total_value + value
    }
    stocks[stock] = [shares, company, price]
    if (total_value < 0) {
      total_value = 0.0
    }
    let display_value = parseFloat(total_value).toFixed(2);
    this.setState({portfolio_value: total_value, display_value: display_value, stocks_owned: stocks })
  }

  // The 5 orderBy... functions below are called to sort the data by shares, symbol, compnay name, total value, or stock price
  // The order_..._asc state variables are used to determine if calling the function should sort in ascending or descending order
  // This allows for double clicking on the same table header button to change the sorting order from ASC to DESC
  orderByShares = () => {
    if (this.state.order_shares_asc === true) {
      let ordered = [];
      let temp_stocks = [];
      for (let stock in this.state.stocks_owned) {
        ordered.push(this.state.stocks_owned[stock][0]);
        temp_stocks.push(stock);
      }
      ordered.sort(function(a, b){return a-b});

      let output_dict = {};

      for (let i = 0; i<ordered.length; i++){
        for (let j = 0; j<temp_stocks.length; j++) {
          if (this.state.stocks_owned[temp_stocks[j]][0] === ordered[i]) {
            let temp_list = this.state.stocks_owned[temp_stocks[j]]
            output_dict[i] = [temp_stocks[j], temp_list[0], temp_list[1], temp_list[2]]
            temp_stocks.splice(j,1)
            break
          }
        }
      }
      this.setState({row_ordering: output_dict, determine_order: "SHARES_ASC", order_shares_asc: false, order_val_asc: true, order_comp_asc: true, order_price_asc: true, order_symbol_asc: true })
    } else {
        let ordered = [];
        let temp_stocks = [];
        for (let stock in this.state.stocks_owned) {
          ordered.push(this.state.stocks_owned[stock][0]);
          temp_stocks.push(stock);
        }
        ordered.sort(function(a, b){return b-a});

        let output_dict = {};

        for (let i = 0; i<ordered.length; i++){
          for (let j = 0; j<temp_stocks.length; j++) {
            if (this.state.stocks_owned[temp_stocks[j]][0] === ordered[i]) {
              let temp_list = this.state.stocks_owned[temp_stocks[j]]
              output_dict[i] = [temp_stocks[j], temp_list[0], temp_list[1], temp_list[2]]
              temp_stocks.splice(j,1)
              break
            }
          }
        }
        this.setState({row_ordering: output_dict, determine_order: "SHARES_DESC", order_shares_asc: true, order_val_asc: true, order_comp_asc: true, order_price_asc: true, order_symbol_asc: true })
    }
  }

  orderByStockValue = () => {
    if (this.state.order_val_asc === true) {
      let ordered = [];
      let temp_stocks = [];
      for (let stock in this.state.stocks_owned) {
        ordered.push(this.state.stocks_owned[stock][0] * this.state.stocks_owned[stock][2]);
        temp_stocks.push(stock);
      }
      ordered.sort(function(a, b){return a-b});

      let output_dict = {};

      for (let i = 0; i<ordered.length; i++){
        for (let j = 0; j<temp_stocks.length; j++) {
          if ((this.state.stocks_owned[temp_stocks[j]][0] * this.state.stocks_owned[temp_stocks[j]][2]) === ordered[i]) {
            let temp_list = this.state.stocks_owned[temp_stocks[j]]
            output_dict[i] = [temp_stocks[j], temp_list[0], temp_list[1], temp_list[2]]
            temp_stocks.splice(j,1)
            break
          }
        }
      }
      this.setState({row_ordering: output_dict, determine_order: "VALUE_ASC", order_val_asc: false, order_shares_asc: true, order_comp_asc: true, order_price_asc: true, order_symbol_asc: true })
    } else {
        let ordered = [];
        let temp_stocks = [];
        for (let stock in this.state.stocks_owned) {
          ordered.push(this.state.stocks_owned[stock][0] * this.state.stocks_owned[stock][2]);
          temp_stocks.push(stock);
        }
        ordered.sort(function(a, b){return b-a});
        let output_dict = {};

        for (let i = 0; i<ordered.length; i++){
          for (let j = 0; j<temp_stocks.length; j++) {
            if ((this.state.stocks_owned[temp_stocks[j]][0] * this.state.stocks_owned[temp_stocks[j]][2]) === ordered[i]) {
              let temp_list = this.state.stocks_owned[temp_stocks[j]]
              output_dict[i] = [temp_stocks[j], temp_list[0], temp_list[1], temp_list[2]]
              temp_stocks.splice(j,1)
              break
            }
          }
        }
        this.setState({row_ordering: output_dict, determine_order: "VALUE_DESC", order_val_asc: true, order_shares_asc: true, order_comp_asc: true, order_price_asc: true, order_symbol_asc: true })
    }
  }

  orderByPrice = () => {
    if (this.state.order_price_asc === true) {
      let ordered = [];
      let temp_stocks = [];
      for (let stock in this.state.stocks_owned) {
        ordered.push(this.state.stocks_owned[stock][2]);
        temp_stocks.push(stock);
      }
      ordered.sort(function(a, b){return a-b});

      let output_dict = {};

      for (let i = 0; i<ordered.length; i++){
        for (let j = 0; j<temp_stocks.length; j++) {
          if (this.state.stocks_owned[temp_stocks[j]][2] === ordered[i]) {
            let temp_list = this.state.stocks_owned[temp_stocks[j]]
            output_dict[i] = [temp_stocks[j], temp_list[0], temp_list[1], temp_list[2]]
            temp_stocks.splice(j,1)
            break
          }
        }
      }
      this.setState({row_ordering: output_dict, determine_order: "PRICE_ASC", order_price_asc: false, order_shares_asc: true, order_comp_asc: true, order_val_asc: true, order_symbol_asc: true })
    } else {
        let ordered = [];
        let temp_stocks = [];
        for (let stock in this.state.stocks_owned) {
          ordered.push(this.state.stocks_owned[stock][2]);
          temp_stocks.push(stock);
        }
        ordered.sort(function(a, b){return b-a});
        let output_dict = {};

        for (let i = 0; i<ordered.length; i++){
          for (let j = 0; j<temp_stocks.length; j++) {
            if (this.state.stocks_owned[temp_stocks[j]][2] === ordered[i]) {
              let temp_list = this.state.stocks_owned[temp_stocks[j]];
              output_dict[i] = [temp_stocks[j], temp_list[0], temp_list[1], temp_list[2]]
              temp_stocks.splice(j,1)
              break
            }
          }
        }
        this.setState({row_ordering: output_dict, determine_order: "PRICE_DESC", order_price_asc: true, order_shares_asc: true, order_comp_asc: true, order_val_asc: true, order_symbol_asc: true })
    }
  }

  orderByCompany = () => {
    if (this.state.order_comp_asc === true) {
      let ordered = [];
      let temp_stocks = [];
      for (let stock in this.state.stocks_owned) {
        ordered.push(this.state.stocks_owned[stock][1].toUpperCase());
        temp_stocks.push(stock);
      }
      ordered.sort();

      let output_dict = {};

      for (let i = 0; i<ordered.length; i++){
        for (let j = 0; j<temp_stocks.length; j++) {
          if (this.state.stocks_owned[temp_stocks[j]][1].toUpperCase() === ordered[i]) {
            let temp_list = this.state.stocks_owned[temp_stocks[j]]
            output_dict[i] = [temp_stocks[j], temp_list[0], temp_list[1], temp_list[2]]
            temp_stocks.splice(j,1)
            break
          }
        }
      }
      this.setState({row_ordering: output_dict, determine_order: "COMPANY_ASC", order_comp_asc: false, order_shares_asc: true, order_price_asc: true, order_val_asc: true, order_symbol_asc: true })
    } else {
        let ordered = [];
        let temp_stocks = [];
        for (let stock in this.state.stocks_owned) {
          ordered.push(this.state.stocks_owned[stock][1].toUpperCase());
          temp_stocks.push(stock);
        }
        ordered.sort().reverse();
        let output_dict = {};

        for (let i = 0; i<ordered.length; i++){
          for (let j = 0; j<temp_stocks.length; j++) {
            if (this.state.stocks_owned[temp_stocks[j]][1].toUpperCase() === ordered[i]) {
              let temp_list = this.state.stocks_owned[temp_stocks[j]]
              output_dict[i] = [temp_stocks[j], temp_list[0], temp_list[1], temp_list[2]]
              temp_stocks.splice(j,1)
              break
            }
          }
        }
        this.setState({row_ordering: output_dict, determine_order: "COMPANY_DESC", order_comp_asc: true, order_shares_asc: true, order_price_asc: true, order_val_asc: true, order_symbol_asc: true })
    }
  }

  orderBySymbol = () => {
    if (this.state.order_symbol_asc === true) {
      let ordered = [];
      for (let stock in this.state.stocks_owned) {
        ordered.push(stock);
      }
      ordered.sort();
      let output_dict = {};

      for (let i = 0; i<ordered.length; i++){
          let temp_list = this.state.stocks_owned[ordered[i]]
          output_dict[i] = [ordered[i], temp_list[0], temp_list[1], temp_list[2]]
      }
      this.setState({row_ordering: output_dict, determine_order: "SYMBOL_ASC", order_symbol_asc: false, order_shares_asc: true, order_price_asc: true, order_val_asc: true, order_comp_asc: true })
    } else {
        let ordered = [];
        for (let stock in this.state.stocks_owned) {
          ordered.push(stock);
        }
        ordered.sort().reverse();

        let output_dict = {};

        for (let i=0; i<ordered.length; i++){
            let temp_list = this.state.stocks_owned[ordered[i]]
            output_dict[i] = [ordered[i], temp_list[0], temp_list[1], temp_list[2]]
        }
        this.setState({row_ordering: output_dict, determine_order: "SYMBOL_DESC", order_symbol_asc: true,  order_shares_asc: true, order_price_asc: true, order_val_asc: true, order_comp_asc: true })
    }
  }

  // componentDidMount calls the getStockShares function to populate the table and portofolio value based on localStorage when the page loads
  componentDidMount = () => {
    this.getStockShares()
  }

  // componentWillUnmount saves the current state
  componentWillUnmount = () => {
    this.saveState()
  }

  render() {

    let modalClose = () => this.setState({ showModal: false, error: false, stock_error: false, shares_error: false, stock: "", shares: "", sell_stock: "", sell_shares: ""});
    let sellModalClose = () => this.setState({ showSellModal: false, error: false, stock_error: false, shares_error: false, stock: "", shares: "", sell_stock: "", sell_shares: "" });

    return (
      <div>
        <div className="row">
          <div className="col-sm-12">
            <Jumbotron fluid className="jumbo">
              <img src={image} alt=""/>
            </Jumbotron>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-7">
            <h1>Portfolio Value: { new Intl.NumberFormat('en-US',
            {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(this.state.display_value)}</h1>
          </div>

          <div className="col-sm-2">
            <Button
              className="button"
              variant="primary"
              onClick={this.showModalHandler}
              size="lg"
            >
            Buy Shares
            </Button>
            <Modal
              className="modal"
              show={this.state.showModal}
              onHide={modalClose}
              size="md"
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter" className="modal_title">
                  Add Stock to Portfolio
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div>
                  <Form className="buyForm">
                    <Form.Label className="formLabel">Stock: </Form.Label>
                    <Form.Control className="formControl" type="text" value={this.state.stock} placeholder="Enter stock symbol" onChange={this.handleStockChange} />
                    <Form.Text className="text-muted">{this.state.stock_error ? 'Invalid stock symbol. Please try again.': ''}</Form.Text>
                    <Form.Label className="formLabel">Shares: </Form.Label>
                    <Form.Control className="formControl" type="text" value={this.state.shares} placeholder="Enter number of shares" onChange={this.handleSharesChange} />
                    <Form.Text className="text-muted">{this.state.shares_error ? 'Invalid number of shares. Please try again.': ''}</Form.Text>
                  </Form>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button className="button" type="submit" onClick={this.handleAddSubmit}>Add Shares</Button>
              </Modal.Footer>
            </Modal>
          </div>

          <div className="col-sm-2">
            <Button
              className="button"
              variant="primary"
              onClick={this.showSellModalHandler}
              size="lg"
            >
            Sell Shares
            </Button>
            <Modal
              className="modal"
              show={this.state.showSellModal}
              onHide={sellModalClose}
              size="md"
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter" className="modal_title">
                  Sell Stock from Portfolio
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
              <div>
                <Form className="buyForm">
                  <Form.Label className="formLabel">Stock: </Form.Label>
                  <Form.Control className="formControl" type="text" value={this.state.sell_stock} placeholder="Enter stock symbol" onChange={this.handleSellStockChange} />
                  <Form.Text className="text-muted">{this.state.stock_error ? 'Invalid stock symbol. Please try again.': ''}</Form.Text>
                  <Form.Label className="formLabel">Shares: </Form.Label>
                  <Form.Control className="formControl" type="text" value={this.state.sell_shares} placeholder="Enter number of shares" onChange={this.handleSellSharesChange} />
                  <Form.Text className="text-muted">{this.state.shares_error ? 'Invalid number of shares. Please try again.': ''}</Form.Text>
                </Form>
              </div>
              </Modal.Body>
              <Modal.Footer>
                <Button className="button" type="submit" onClick={this.handleSellSubmit}>Sell Shares</Button>
              </Modal.Footer>
            </Modal>
          </div>

          <div className="col-sm-1">
          </div>

        </div>

        <div className="row">
          <div className="col">
            <table>
              <thead>
                <tr>
                  <th><button className="btn btn-link text-light" onClick={this.orderBySymbol}>Stock Symbol</button></th>
                  <th className="company" ><button className="btn btn-link text-light" onClick={this.orderByCompany}>Company Name</button></th>
                  <th><button className="btn btn-link text-light" onClick={this.orderByShares}>Shares Owned</button></th>
                  <th><button className="btn btn-link text-light" onClick={this.orderByPrice}>Current Price</button></th>
                  <th><button className="btn btn-link text-light" onClick={this.orderByStockValue}>Stock Value</button></th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(this.state.row_ordering).map( ([key, value]) => {
                  return (
                    <tr key={value[0]+'0'}>
                    <td key={value[0]+'1'}>{value[0]}</td>
                    <td className="company" key={value[0]+'2'}>{value[2]}</td>
                    <td key={value[0]+'3'}>{value[1]}</td>
                    <td key={value[0]+'4'}>{ new Intl.NumberFormat('en-US',
                    {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(this.state.current_prices[value[0]])}</td>
                    <td key={value[0]+'5'}>{ new Intl.NumberFormat('en-US',
                    {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(this.state.current_prices[value[0]] * value[1])}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="alert">
            {localStorage.length === 0 ?
              <Alert dismissible variant="light">
                <Alert.Heading className="alertTitle">Welcome to your stock portfolio manager!</Alert.Heading>
                  <p className="alertText">You do not currently have any stocks in your portfolio. Click the <b>Buy Shares</b> button above to add stocks to your portfolio.</p>
                </Alert> : <div></div>
              }
            </div>

          </div>
        </div>

      </div>
    );
  }
}

export default App;
