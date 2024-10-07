/**
 * Get exchange prices, costs, and exchange rates for a path payment between two assets.
 *
 * @param {StellarSdk.Asset} sourceAsset - The asset being sent (from).
 * @param {string} sourceAmount - The amount being sent.
 * @param {StellarSdk.Asset} destinationAsset - The asset to be received (to).
 * @param {StellarSdk.Server} server - The Stellar server instance to use.
 * @returns {Promise<Array>} - Array of possible paths, exchange rates, and associated costs.
 */
async function getExchangePricesAndCostsForPathPayment(
  sourceAsset,
  sourceAmount,
  destinationAsset,
  server,
) {
  try {
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
  } catch (error) {
    console.error("Error fetching exchange paths:", error);
    throw error;
  }
}

module.exports = {
  getExchangePricesAndCostsForPathPayment,
};
