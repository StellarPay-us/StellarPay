# Sender

The `Sender` application is a component of the Stellar Testnet Proof of Concept (PoC) focusing on cross-border microtransactions using the Stellar network.

## Key Features
- **Modified SEP-31 Endpoint**: Implements a custom version of the SEP-31 protocol optimized for microtransactions.
- **Funding Wallet**: Manages Stellar native assets within the sender's wallet for processing transactions.
- **Payment Information Processing**: Facilitates efficient cross-border payment operations via the Stellar network.

## Installation

To install dependencies, run the following command:

```bash
pnpm install
```

## Running the Server
To start the development server:
```bash
pnpm dev
```

Alternatively, to run the production server:
```bash
pnpm start
```

## Example Object
This is an example of the object used in disbursement creation and transactions:
```js
exampleObject: {
  msg_id: string;
  creation_date: DATE;
  num_of_transactions: number;
  control_sum: number;
  sender: {
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
    receiver: {
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

## Disbursement Creation
This is the structure for creating a disbursement:
```js
createDisbursement: {
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

