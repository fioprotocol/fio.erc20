var Contract = artifacts.require("WFIO");

const { CUSTODIANS_LOCAL, CUSTODIANS_DEVNET, CUSTODIANS_TESTNET, CUSTODIANS_MAINNET } = process.env;
const custodiansLocal = CUSTODIANS_LOCAL.split(',');
const custodiansDevnet = CUSTODIANS_DEVNET.split(',');
const custodiansTestnet = CUSTODIANS_TESTNET.split(',');
const custodiansMainnet = CUSTODIANS_MAINNET.split(',');

module.exports = async function (deployer, network) {
  if (network == "development") {
    await deployer.deploy(Contract, 0, custodiansLocal);
  } else if (network == "goerli_devnet") {
    await deployer.deploy(Contract, 0, custodiansDevnet);
  } else if (network == "goerli_testnet") {
    await deployer.deploy(Contract, 0, custodiansTestnet);
  } else if (network == "mainnet") {
    await deployer.deploy(Contract, 0, custodiansMainnet);
  }
};
