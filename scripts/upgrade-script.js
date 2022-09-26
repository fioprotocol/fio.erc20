const { ethers, upgrades } = require('hardhat');
require('dotenv').config();

const { CONTRACT_PROXY_ADDRESS } = process.env;

async function main() {
    const WFIOV2 = await ethers.getContractFactory('WFIOV2');
    console.log(`Upgrading WFIOV2 at ${CONTRACT_PROXY_ADDRESS} to WFIOV2...`);
    const fioContractV2 = await upgrades.upgradeProxy(CONTRACT_PROXY_ADDRESS, WFIOV2);
    console.log(`Upgraded address at: ${fioContractV2.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log(err);
        process.exit(1)
    });