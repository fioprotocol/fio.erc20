const { ethers } = require("ethers");
const config = require("../config");

const custodians = config.custodians.publicKeys;
const oracles = config.oracles.publicKeys;

const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
const wfioContractAddress = config.wfio.contractAddress;
const wfioAbi = config.wfio.abi;
const wfioContract = new ethers.Contract(wfioContractAddress, wfioAbi, provider);

async function main() {

    let registeredOracles = await wfioContract.getOracles();

    if (registeredOracles.length < 3) {
        for (const oracle in oracles) {
            for (const custodian in custodians) {
                try {
                    const signer = provider.getSigner(custodians[custodian])
                    const wfioWithSigner = wfioContract.connect(signer);

                    await wfioWithSigner.regoracle(oracles[oracle]);
                    console.log(`Success: Custodian ${custodians[custodian]} registered ${oracles[oracle]}`);

                } catch (error) {
                    console.log(`Failure: Custodian ${custodians[custodian]} registering ${oracles[oracle]}: ${JSON.parse(error.body).error.message} `);
                }
            };
        };
    };

    registeredOracles = await wfioContract.getOracles();
    if (registeredOracles.length >= 3) {
        console.log(`Success. Registered Oracles: ${registeredOracles}`)
    } else {
        console.log(`Failure. Less than 3 registered Oracles: ${registeredOracles}`)
    }
};

main();