const Web3 = require('web3');
const web3 = new Web3();
const data = {
      "id": 1,
      "name": "Leanne Graham",
      "username": "Bret",
      "email": "Sincere@april.biz",
      "address": {
        "street": "Kulas Light",
        "suite": "Apt. 556",
        "city": "Gwenborough",
        "zipcode": "92998-3874",
        "geo": {
          "lat": "-37.3159",
          "lng": "81.1496"
        }
      }
    }

let message = JSON.stringify(data);
console.log("version :", web3.version);
var signature = web3.eth.accounts.sign(message, '0xb5b1870957d373ef0eeffecc6e4812c0fd08f554b37b233526acc331bf1544f7');
console.log("signature :", signature);

// let {address, privateKey} =  web3.eth.accounts.privateKeyToAccount('0xb5b1870957d373ef0eeffecc6e4812c0fd08f554b37b233526acc331bf1544f7')
// let model = {...signature, address, privateKey}
let hash1 = web3.utils.sha3(message);
console.log(hash1)

let hash = web3.eth.accounts.hashMessage(message);
// model = {...model, hash};
console.log(hash);