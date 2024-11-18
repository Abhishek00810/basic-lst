import * as dotenv from 'dotenv';
dotenv.config();

import express = require('express');

import { burnTokens, mintTokens, sendNativeTokens } from './mintTokens';

const app = express();

const API_CALL = 

{ "accountData": { "accounts": [ "oaPUrEFh7fawhpDh9fqhbUnWGtAm8nLbvoajVBsZgzg", 
    "CKfFbJLf9bzNHESELpMHYnpKWCdL3uCXwGSz1HnmnggQ"] }
}

//this account XD one sent some SOL and wants your token in return
//

app.post('/helius', async(req, res) => {
    const fromAddress = API_CALL.accountData.accounts[0];
    const toAddress = API_CALL.accountData.accounts[1];
    const amount = 1000000000; //1SOL
    const type = "received_native_sol";
    
    if (type === "received_native_sol") {
         await mintTokens(fromAddress, toAddress, amount);
         
    } else {
        // What could go wrong here?
        await burnTokens(fromAddress, toAddress, amount);
        await sendNativeTokens(fromAddress, toAddress, amount);
    }
// from address -> to address
// particular mint = > toaddress
    res.send('Transaction successful');
});

app.listen(3000, () => {
    console.log('PRIVATE_KEY:', process.env.PRIVATE_KEY);
console.log('URL:', process.env.URL);
  console.log('Server is running on port 3000');
});