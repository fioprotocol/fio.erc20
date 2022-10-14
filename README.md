# WrappedFIO ERC20 Contract

### Prerequisites
- NPM 6.4.11
- Node 12.20.2
- Truffle v5.1.65 (core: 5.1.65)
- Solidity - ^0.8.0 (solc-js)
- @OpenZeppelin/contracts@4.3.0

### Truffle deployment

A .env file with following entries is needed for Truffle deployment:

MNEMONIC=                  # Mnemonic phrase for local Ganache testing
MNEMONIC_DEVNET=           # Mnemonic phrase for Devnet
MNEMONIC_TESTNET=          # Mnemonic phrase for Testnet
APP_ID=                    # Infura API key
ETHERSCAN_API_KEY=         # Etherscan API key
CUSTODIANS_DEVNET=         # Comma separated list of initial 10 custodians
CUSTODIANS_TESTNET=        # Comma separated list of initial 10 custodians
# Local testing only
CUSTODIANS_LOCAL=          # Comma separated list of initial 10 custodians
ORACLE=                    # Oracle public key used by reg-oracle.js