# Stock-Portfolio-Manager

## Description:
This site allows users to record and track their current stock holdings.  After a user has purchased or sold a stock, they can enter the stock symbol and the number of shares bought or sold to update their current portfolio holdings.  The site will update holdings based on data queried from the IEX Stocks API.  Users can view their total portfolio value and a detailed list of stock holdings including stock symbol, company name, current price, shares owned, and total value.  The detailed stocks table can be sorted in ascending or descending order by any of the table columns.  The site uses HTML5 local storage to store stocks added/sold between sessions within the same browser.

## Instructions for Use:
This app queries data from IEX Stocks API using an API key. These keys are free and anyone can request one, but for general security purposes my API key has not been included in the uploaded code.  To test the full functionality of this app the perform the following steps:
- Sign up for a free API key from the [IEX Stocks API](https://iextrading.com/developer/)
- Download the stocks-app folder from this repository
- Open the App.js file within the src directory
- Insert your API key on line 11:
```javascript
const api_key = "INSERT_YOUR_API_KEY_HERE"
```
- Navigate into the stocks-app directory via the command line 
- Ensure necessary modules have been installed using the command line by running ```bash npm install```
- Start the local server and use the page by using the command line and  running  ```bash npm start```

## Sources:
- https://www.taniarascia.com/how-to-use-local-storage-with-javascript/
- https://react-bootstrap.github.io/getting-started/introduction/
- https://stackoverflow.com/questions/17745292/how-to-retrieve-all-localstorage-items-without-knowing-the-keys-in-advance
- https://stackoverflow.com/questions/7312468/javascript-round-to-a-number-of-decimal-places-but-strip-extra-zeros
- https://reactjs.org/docs/react-component.html#componentdidmount
- https://reactjs.org/docs/forms.html
- https://stackoverflow.com/questions/35191336/how-to-map-a-dictionary-in-reactjs
- https://stackoverflow.com/questions/1385871/how-to-remove-keyvalue-from-hash-in-javascript
- https://www.w3schools.com/css/tryit.asp?filename=trycss_table_fancy
- https://blog.bitsrc.io/build-a-full-featured-modal-dialog-form-with-react-651dcef6c571
- https://react-bootstrap.github.io/react-overlays/#modals
- https://react-bootstrap.github.io/components/modal/
- https://stackoverflow.com/questions/34438671/react-bootstrap-modal-how-do-i-get-it-to-show
- https://stackoverflow.com/questions/40769551/how-to-use-google-fonts-in-react-js
- https://www.pexels.com/search/stock%20market%20data/
- https://www.pexels.com/photo/top-view-of-man-holding-android-smartphone-near-macbook-and-newspaper-938965/
- https://www.carlrippon.com/formatting-dates-and-numbers-in-react/
- https://www.w3schools.com/jsref/jsref_sort.asp
- https://stackoverflow.com/questions/5767325/how-do-i-remove-a-particular-element-from-an-array-in-javascript
- https://jsfiddle.net/LLL38vea/
- https://react-bootstrap.github.io/components/alerts/
