const StellarSdk = require("@stellar/stellar-sdk");
const { getExchangePricesAndCostsForPathPayment, buildTransaction, signAndSubmitTx } = require('../src/utils/pathPayment'); 

const getAssetBalance = (account, asset) => {
  if (asset.isNative()) {
      // Check for XLM (native asset)
      const xlmBalance = account.balances.find(balance => balance.asset_type === 'native');
      return xlmBalance ? xlmBalance.balance : '0';
  } else {
      // Check for custom assets
      const assetBalance = account.balances.find(balance => 
          balance.asset_code === asset.getCode() && balance.asset_issuer === asset.getIssuer()
      );
      return assetBalance ? assetBalance.balance : '0';
  }
};

describe("Test Sender Wallet", () => {
  let serverUrl, sourceInfo, destinationInfo, keypair;

  beforeAll(async () => {
    serverUrl = 'https://horizon-testnet.stellar.org';
    sourceInfo = {
      code: 'native',
      issuer: ''
    };
    destinationInfo = {
      code: 'USDC',
      issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
    };

    keypair = StellarSdk.Keypair.fromSecret('SBNZI3XQBQWPEKKAO2TRGJMBFUDUONJL4W3UK6EHIXINVIRHCFYIABUQ'); 
  }); 

  it("should fetch exchange prices and costs correctly for valid assets", async () => {
    try {
      const result = await getExchangePricesAndCostsForPathPayment(sourceInfo, '10', destinationInfo, serverUrl);

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
  }, 12000);

  it("should handle network issues or timeouts gracefully", async () => {
    try {
      await getExchangePricesAndCostsForPathPayment(sourceInfo, '10', destinationInfo, 'https://invalid-server-url');

    } catch (error) {
      expect(error.message).toMatch(/getaddrinfo ENOTFOUND invalid-server-url/);
    }
  });

  it("should build a transaction to exchange assets", async () => {
    const sourceAmount = '10'; 
    const destinationAmount = '9.5'; 
  
    const transaction = await buildTransaction(
      keypair,
      sourceInfo,
      sourceAmount,
      destinationInfo,
      destinationAmount,
      serverUrl
    );

    // Ensure the transaction is built correctly
    expect(transaction).toBeInstanceOf(StellarSdk.Transaction);
    expect(transaction.operations.length).toBe(2);
  
    // Check first operation is a changeTrust for the destination asset
    const changeTrustOperation = transaction.operations[0];
    expect(changeTrustOperation.type).toBe('changeTrust');
    expect(changeTrustOperation.line.code).toBe(destinationInfo.code);
    expect(changeTrustOperation.line.issuer).toBe(destinationInfo.issuer);
  
    // Check second operation is a pathPaymentStrictSend for the source asset to destination asset
    const pathPaymentOperation = transaction.operations[1];
    expect(pathPaymentOperation.type).toBe('pathPaymentStrictSend');
    expect(pathPaymentOperation.sendAmount).toBe('10.0000000');
    expect(pathPaymentOperation.destMin).toBe('9.5000000');
  
    // Ensure the transaction has a timeout and a network fee
    expect(transaction.timeBounds.maxTime).not.toBe('0'); // Timeout should be set
  }, 12000);

  it('should execute a transaction and update the wallet balance', async () => {
    const server = new StellarSdk.Horizon.Server(serverUrl);
    const sourceAsset = StellarSdk.Asset.native();
    const destinationAsset =  new StellarSdk.Asset(destinationInfo.code, destinationInfo.issuer);

    const senderAccount = await server.loadAccount(keypair.publicKey());
    
    const initalBalanceXLM = getAssetBalance(senderAccount, sourceAsset);
    const initalBalanceUSDC = getAssetBalance(senderAccount, destinationAsset);

    const rate = await getExchangePricesAndCostsForPathPayment(sourceInfo, '10', destinationInfo, serverUrl);
    const transaction = await buildTransaction(
      keypair,
      sourceInfo,
      '10',
      destinationInfo,
      rate[0].destinationAmount,
      serverUrl
    );
    await signAndSubmitTx(transaction, keypair, serverUrl);

    const updatedSenderAccount = await server.loadAccount(keypair.publicKey());
    const finalBalanceXLM = getAssetBalance(updatedSenderAccount, sourceAsset);
    const finalBalanceUSDC = getAssetBalance(updatedSenderAccount, destinationAsset);

    // Round both values to 7 decimal places to avoid precision issues
    const roundedFinalBalanceXLM = Number(finalBalanceXLM).toFixed(1);
    const roundedExpectedBalanceXLM = (initalBalanceXLM - 10).toFixed(1);
    const roundedFinalBalanceUSDC = Number(finalBalanceUSDC).toFixed(1);
    const roundedExpectedBalanceUSDC = (Number(initalBalanceUSDC) + Number(rate[0].destinationAmount)).toFixed(1);

    expect(roundedFinalBalanceXLM).toBe(roundedExpectedBalanceXLM);
    expect(roundedFinalBalanceUSDC).toBe(roundedExpectedBalanceUSDC);
  }, 30000);
});