/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const PrivateKeyProvider = require("truffle-privatekey-provider");
const privateKey = "...";
const gasPrice = 10000000000; // (10 gwei)

const network = {
  DEV: 'http://127.0.0.1:8545',
  ROPSTEN: 'https://ropsten.infura.io/v3/af1b1e69f5bf435db4f4199557f1d8f8',
  KOVAN: 'https://kovan.infura.io/v3/af1b1e69f5bf435db4f4199557f1d8f8',
  RINKEBY: 'https://rinkeby.infura.io/v3/af1b1e69f5bf435db4f4199557f1d8f8',
  MAINNET: 'https://mainnet.infura.io/v3/af1b1e69f5bf435db4f4199557f1d8f8'
}

module.exports = {
  solc: {
    optimizer: {
        enabled: true,
        runs: 200,
    },
  },
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },

    // Another network with more advanced options...
    ropsten: {
      provider: () => new PrivateKeyProvider(privateKey, network.ROPSTEN),
      network_id: 3,       // Ropsten's id
      gas: 2500000,        // Ropsten has a lower block limit than mainnet
      gasPrice:  gasPrice,
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    kovan: {
      provider: () => new PrivateKeyProvider(privateKey, network.KOVAN),
      network_id: 42,       // kovan's id
      gas: 2500000,        // kovan has a lower block limit than mainnet
      gasPrice:  gasPrice,
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    rinkeby: {
      provider: () => new PrivateKeyProvider(privateKey, network.RINKEBY),
      network_id: 4,       // Rinkeby's id
      gas: 2500000,        // Rinkeby has a lower block limit than mainnet
      gasPrice:  gasPrice,
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    mainnet: {
      provider: () => new PrivateKeyProvider(privateKey, network.MAINNET),
      network_id: 1,       // mainnet's id
      gas: 2500000,        // Ropsten has a lower block limit than mainnet
      gasPrice:  gasPrice,
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    }
  }
}
