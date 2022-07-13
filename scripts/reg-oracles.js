const { ethers } = require("ethers");
const config = require("../config");

const WFIO = artifacts.require("WFIO");
let registeredOracles;

const custodians = config.custodians.publicKeys;
const oracles = config.oracles.publicKeys;

module.exports = async (callback) => {
    let wfio;
    wfio = await WFIO.deployed();

    console.log('URL: ', wfio.contract._provider.host)
    const provider = new ethers.providers.JsonRpcProvider(wfio.contract._provider.host);

    const wfioAbi = config.wfio.abi;
    const wfioContract = new ethers.Contract(wfio.address, wfioAbi, provider);


    try {
        const wfioAddress = await wfio.address;
        console.log('wfio contract address: ', wfioAddress);
    } catch (error) {
        console.log('Contract address error: ', error);
    }

    try {
        registeredOracles = await wfio.getOracles();
        //console.log('Registered Oracles: ', registeredOracles);
    } catch (err) {
        console.log('getOracles Error: ', err);
    }

    if (registeredOracles.length < 3) {
        //for (const oracle in oracles) {
        oracle = 0;
            for (const custodian in custodians) {
                try {
                    const signer = provider.getSigner(custodians[custodian])
                    const wfioWithSigner = wfioContract.connect(signer);

                    await wfioWithSigner.regoracle(oracles[oracle]);
                    console.log(`Success: Custodian ${custodians[custodian]} registered ${oracles[oracle]}`);

                } catch (error) {
                    //console.log('Error: ', error);
                    console.log(`Failure: Custodian ${custodians[custodian]} registering ${oracles[oracle]}: ${JSON.parse(error.body).error.message} `);
                }
            };
        //};
    };

    try {
        registeredOracles = await wfio.getOracles();
        console.log('Registered Oracles: ', registeredOracles);
    } catch (err) {
        console.log('getOracles Error: ', err);
    }

    //callback();
}