const { ethers, upgrades } = require('hardhat');

require('dotenv');

const { NAME='WFIO Token Staging', SYMBOL='WFIO', CUSTODIANS} = process.env

async function main() {
    const FioFactory = await ethers.getContractFactory('WFIO');
    const custodians = CUSTODIANS.split(',');
    console.log('Deploying WFIO Oracle Proxy...')
    const fio = await upgrades.deployProxy(
        FioFactory,
        [NAME, SYMBOL, 0, custodians],
        {
            initializer: 'initialize',
            timeout: 0,
            pollingInterval: 10000
        }
    );
    console.log('deployedProxy', JSON.stringify(fio));
    await fio.deployed();
    console.log("WFIO deployed to:", fio.address);
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1)
    });