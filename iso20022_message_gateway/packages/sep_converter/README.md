# SEP Converter

This project provides a library to convert ISO20022 payment messages (pain.001) to SEP-31 formatted objects. The `castSEP31` function is the core utility for transforming the message head and payment information into SEP-31 compliant objects.

## Features

- **ISO20022 to SEP-31 Conversion**: Convert ISO20022 `pain.001` message data to SEP-31 format.
- **Support for Multiple Transactions**: Handle multiple transactions in the same message.
- **Customizable Asset Issuer**: Default asset issuer set to "Stellar", but can be customized.

## Usage
### Converting ISO20022 to SEP-31

To convert an ISO20022 message to SEP-31 format, use the `castSEP31` function. Below is an example:

```js
const { castSEP31 } = require('./src/index');

const messageHead = {
  groupHeader: {
    msgId: "MSG12345",
    creDtTm: "2023-09-01T12:00:00",
    nbOfTxs: "1",
    ctrlSum: "1000.00",
    initgPty: {
      name: "Test Initiator",
      orgId: "ORG123",
    },
  },
};

const paymentInfo = {
  dbtr: { name: "Debtor Name" },
  dbtrAcct: { iban: "DE89370400440532013000", currency: "EUR" },
  dbtrAgt: { bicfi: "DEUTDEFF" },
  transactions: [
    {
      endToEndId: "E2E12345",
      instdAmt: { amount: "1000.00", currency: "EUR" },
      xchgRateInf: { unitCcy: "EUR", xchgRate: "1.00" },
      cdtrAgt: { bicfi: "NDEAFIHH" },
      cdtrAcct: { iban: "FI2112345600000785" },
    },
  ],
};

const sep31Object = castSEP31(messageHead, paymentInfo);
console.log(sep31Object);
```

## Example SEP-31 Output

The output of the `castSEP31` function will be in the following format:

```js
{
  "msg_id": "MSG12345",
  "creation_date": "2023-09-01T12:00:00",
  "num_of_transactions": "1",
  "control_sum": "1000.00",
  "sender": {
    "name": "Debtor Name",
    "iban": "DE89370400440532013000",
    "currency": "EUR",
    "bic": "DEUTDEFF"
  },
  "transactions": [
    {
      "transaction_id": "E2E12345",
      "amount": "1000.00",
      "currency": "EUR",
      "exchange_rate": "1.00",
      "receiver": {
        "name": "FI2112345600000785",
        "bic": "NDEAFIHH",
        "iban": "FI2112345600000785"
      },
      "receiver_bic": "NDEAFIHH",
      "asset": {
        "code": "EUR",
        "issuer": "Stellar"
      }
    }
  ]
}
```

## Running Tests

To run tests for validation and parsing, make sure to have the appropriate test files available. 
Run the following command:

```bash
pnpm jest test
```