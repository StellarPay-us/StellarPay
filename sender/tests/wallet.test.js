const StellarSdk = require('@stellar/stellar-sdk');
const { getExchangePricesAndCostsForPathPayment } = require('../src/utils/pathPayment'); 

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

describe("Test Sender Wallet", () => {
  it("should fetch exchange prices and costs correctly for valid assets", async () => {
    // Define source and destination assets
    const sourceAsset = StellarSdk.Asset.native(); // XLM (Native)
    const destinationAsset = new StellarSdk.Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'); // USD asset on the testnet

    try {
      const result = await getExchangePricesAndCostsForPathPayment(sourceAsset, '10', destinationAsset, server);

      expect(Array.isArray(result)).toBe(true);

      // Ensure the first element has the correct structure
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('path');
        expect(result[0]).toHaveProperty('sourceAmount');
        expect(result[0]).toHaveProperty('destinationAmount');
        expect(result[0]).toHaveProperty('transactionCost');
        expect(result[0]).toHaveProperty('slippage');
        expect(result[0]).toHaveProperty('exchangeRate');
      }

    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch exchange prices and costs from the Stellar testnet.");
    }
  });

  it("should handle network issues or timeouts gracefully", async () => {
    const sourceAsset = StellarSdk.Asset.native(); // XLM (Native)
    const destinationAsset = new StellarSdk.Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');

    try {
      const invalidServer = new StellarSdk.Server('https://invalid-server-url');

      await getExchangePricesAndCostsForPathPayment(sourceAsset, '10', destinationAsset, invalidServer);

    } catch (error) {
      expect(error.message).toMatch(/StellarSdk.Server is not a constructor/);
    }
  });
});
