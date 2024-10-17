# Receiver

The Receiver application is a component of the Stellar Testnet Proof of Concept (PoC) focusing on the receipt of cross-border microtransactions using the Stellar network.

## Key Features

- **Adjusted SEP-31 Endpoint**: Utilizes a custom version of the SEP-31 protocol optimized for receiving microtransactions.
- **Payment Processing**: Facilitates efficient receipt of cross-border payments via the Stellar network.
- **Wallet Management**: Manages Stellar native assets for receivers and processes transactions into the appropriate wallet.

## Installation

To`install dependencies, run the following command:
```bash
pnpm install
```

## Running the Server
To start the development server:
```bash
pnpm start
```

## Example Object

This is an example of the object used for transaction receipt and processing:
```js
exampleObject: {
  msg_id: string;
  creation_date: DATE;
  num_of_transactions: number;
  control_sum: number;
  receiver: {
    name: string;
    iban: string;
    currency: string;
    bic: string;
  };
  transactions: {
    transaction_id: string;
    amount: number;
    currency: string;
    exchange_rate: number;
    sender: {
      bic: string;
      iban: string;
    };
    asset: {
      code: string;
      issuer: string;
    };
  }[];
}
```

## Transaction Processing
```js
processTransaction: {
  name: string;
  wallet_id: string;
  asset_id: string;
  country_code: string; // Three-character ISO 3166 code
}
```

## Scripts
- Run Tests: `pnpm test`
- Start Server: `pnpm start`
- Development Mode: `pnpm dev`
- Linting: `pnpm lint`
- Code Formatting: `pnpm format`
