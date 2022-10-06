const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

var Contract = artifacts.require("WFIO");

const { CUSTODIANS_LOCAL, CUSTODIANS_DEVNET, CUSTODIANS_TESTNET } = process.env;
const custodiansLocal = CUSTODIANS_LOCAL.split(',');
const custodiansDevnet = CUSTODIANS_DEVNET.split(',');
const custodiansTestnet = CUSTODIANS_TESTNET.split(',');

module.exports = async function (deployer, network) {
  if (network == "development") {
    await deployer.deploy(Contract, 0, custodiansLocal);
  } else if (network == "goerli_devnet") {
    await deployer.deploy(Contract, 0, custodiansDevnet);
  } else if (network == "goerli_testnet") {
    await deployer.deploy(Contract, 0, custodiansTestnet);
  }
};
