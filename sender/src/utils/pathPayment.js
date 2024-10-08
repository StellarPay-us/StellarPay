const StellarSdk = require("@stellar/stellar-sdk");

/**
 * Get exchange prices, costs, and exchange rates for a path payment between two assets.
 *
 * @param {{code: string, issuer: string}} sourceInfo - The asset being sent (from).
 * @param {string} sourceAmount - The amount being sent.
 * @param {{code: string, issuer: string}} destinationInfo - The asset to be received (to).
 * @param {string} serverUrl - The Stellar server instance to use.
 * @returns {Promise<Array>} - Array of possible paths, exchange rates, and associated costs.
 */
const getExchangePricesAndCostsForPathPayment = async (
  sourceInfo,
  sourceAmount,
  destinationInfo,
  serverUrl,
) => {
  const sourceAsset = buildAsset(sourceInfo);
  const destinationAsset = buildAsset(destinationInfo);
  const server = setupServerConnection(serverUrl);
  const paths = await server
    .strictSendPaths(sourceAsset, sourceAmount, [destinationAsset])
    .call();

  const baseFee = await server.fetchBaseFee();

  const exchangePaths = paths.records.map(record => {
    // Total number of hops in the path
    const hops = record.path.length + 1; // +1 for the final destination asset

    // Transaction cost estimation: baseFee multiplied by the number of hops (one operation per hop)
    const transactionCost = (baseFee * hops) / 10000000; // Convert stroops to XLM

    // Calculate slippage (difference between source amount and final destination amount)
    const slippage = (record.source_amount - sourceAmount) / sourceAmount;

    // Calculate the exchange rate (destination amount per unit of source amount)
    const exchangeRate = record.destination_amount / record.source_amount;

    return {
      path: record.path.map(asset => {
        if (!asset.asset_code || !asset.asset_issuer) {
          return "XLM";
        }
        return `${asset.asset_code}:${asset.asset_issuer}`;
      }),
      sourceAmount: record.source_amount,
      destinationAmount: record.destination_amount,
      transactionCost: transactionCost.toFixed(7), // Cost in XLM for the transaction
      slippage: slippage.toFixed(4), // Percentage slippage for the path
      exchangeRate: exchangeRate.toFixed(7), // Exchange rate (destination per source)
    };
  });

  return exchangePaths;
};

/**
 * Build the transaction to exchange and accept the conversion from the source asset to the destination asset.
 *
 * @param {StellarSdk.Keypair} keypair - The keypair of the wallet to exchange the assets
 * @param {{code: string, issuer: string}} sourceInfo - The asset being sent (from).
 * @param {string} sourceAmount - The amount being sent.
 * @param {{code: string, issuer: string}} destinationInfo - The asset to be received (to).
 * @param {string} destinationAmount - The minimum amount to be received.
 * @param {string} serverUrl - The Stellar server instance to use.
 * @returns {Promise<StellarSdk.Transaction<StellarSdk.Memo<StellarSdk.MemoType>>} - Transaction to accept and exchange from the source asset to the destination asset.
 */

const buildTransaction = async (
  keypair,
  sourceInfo,
  sourceAmount,
  destinationInfo,
  destinationAmount,
  serverUrl,
) => {
  const server = setupServerConnection(serverUrl);
  const sourceAsset = buildAsset(sourceInfo);
  const destinationAsset = buildAsset(destinationInfo);
  const account = await server.loadAccount(keypair.publicKey());
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset: destinationAsset,
      }),
    )
    .addOperation(
      StellarSdk.Operation.pathPaymentStrictSend({
        sendAsset: sourceAsset,
        sendAmount: sourceAmount,
        destination: keypair.publicKey(),
        destAsset: destinationAsset,
        destMin: destinationAmount,
      }),
    )
    .setTimeout(30)
    .build();

  return transaction;
};

/**
 * Sign and submit (execute) a built transaction
 *
 * @param {StellarSdk.Keypair} keypair - The keypair of the wallet
 * @param {string} serverUrl - The Stellar server instance to use.
 */
const signAndSubmitTx = async (transaction, keypair, serverUrl) => {
  const server = setupServerConnection(serverUrl);
  transaction.sign(keypair);
  await server.submitTransaction(transaction);
};

// Helper functions
const buildAsset = assetInfo => {
  if (assetInfo.code === "native") {
    return StellarSdk.Asset.native();
  } else {
    return new StellarSdk.Asset(assetInfo.code, assetInfo.issuer);
  }
};

const setupServerConnection = serverUrl => {
  return new StellarSdk.Horizon.Server(serverUrl);
};

module.exports = {
  getExchangePricesAndCostsForPathPayment,
  buildTransaction,
  signAndSubmitTx,
};
