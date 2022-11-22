/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
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

const HDWalletProvider = require('@truffle/hdwallet-provider');
// create a file at the root of your project and name it .env -- there you can set process variables
// like the mnemomic and Infura project key below. Note: .env is ignored by git to keep your private information safe
require('dotenv').config();
const mnemonicDevnet = process.env["MNEMONIC_DEVNET"];
const mnemonicTestnet = process.env["MNEMONIC_TESTNET"];
const mnemonicMainnet = process.env["MNEMONIC_MAINNET"];
const appid = process.env["APP_ID"];
const apikey = process.env["ETHERSCAN_API_KEY"];

module.exports = {
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
      goerli_devnet: {
        provider: () => new HDWalletProvider(mnemonicDevnet, 'https://goerli.infura.io/v3/' + appid),
        network_id: 5,
        gas: 9000000,        // Gas Limit, default is 6721975 (use gasPrice default is 20000000000 (20 Gwei) for price)
        confirmations: 2,    // # of confs to wait between deployments. (default: 0)
        timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
        skipDryRun: false     // Skip dry run before migrations? (default: false for public nets )
      },
      goerli_testnet: {
          provider: () => new HDWalletProvider(mnemonicTestnet, 'https://goerli.infura.io/v3/' + appid),
          network_id: 5,
          gas: 9000000,
          confirmations: 2,
          timeoutBlocks: 200,
          skipDryRun: false
      },
      mainnet: {
          provider: () => new HDWalletProvider(mnemonicMainnet, 'https://mainnet.infura.io/v3/' + appid),
          network_id: 1,
          gas: 3500000,
          gasPrice: 14000000000,
          confirmations: 2,
          timeoutBlocks: 200,
          skipDryRun: false
      },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
       version: "0.8.7",    // Fetch exact version from solc-bin (default: truffle's version)
       settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        },
      //  evmVersion: "byzantium"
       }
    }
  },

    // Used to automatically verify the contract on etherscan
    api_keys: {
        etherscan: apikey,
    },
    plugins: [
        'truffle-plugin-verify'
    ],
};
