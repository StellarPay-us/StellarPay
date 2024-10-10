# Sender

The sender application for the Stellar Testnet PoC (Proof of Conecpt).

# Key Features
- Adjusted SEP-31 Endpoint: Utilizes a modified SEP-31 protocol tailored for microtransactions.
- Funding Wallet: Manages the Sender's wallet containing Stellar native assets for transactions.
- Payment Information: Enables efficient processing of cross-border payments using the Stellar network.

# Setup
```bash
pnpm install
```

# Start Server
```bash
pnpm dev
```

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

createDisbursement: {
  name: string
  wallet_id: string
  asset_id: string
  country_code: string // Three-character ISO 3166 code
}
