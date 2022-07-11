const { ethers } = require("ethers");
const config = require("../config");

const WFIO = artifacts.require("WFIO");
let registeredOracles;

const custodians = config.custodians.publicKeys;
const oraclePubKey = config.oracles.publicKeys;

const ethAddress = '0x1693F5557f1509E759e6c4D6B8deb5827e22e984';
const amount = 20000000000; //20 wfio

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
        console.log('Registered Oracles: ', registeredOracles);
    } catch (err) {
        console.log('getOracles Error: ', err);
    }

    try {
        const balance = await wfio.balanceOf(ethAddress);
        const newbal = balance.toNumber()  // Truffle returns a BN big number that needs to be converted
        console.log('Balance before: ', newbal)
    } catch (err) {
        console.log('getBalance Error: ', err);
    }

    if (registeredOracles.length === 3) {
        for (const oracle in oraclePubKey) {
            try {
                const signer = provider.getSigner(oraclePubKey[oracle])
                const wfioWithSigner = wfioContract.connect(signer);

                console.log('address: ', signer._address)

                const result = await wfioWithSigner.wrap(ethAddress,amount,'0e45418abe0b1e770403904f95fccb3a39a4e1084d5131296eab6deb558024b1');
                console.log(`Success: Wrap from ${oraclePubKey[oracle]}: ${result}`);
                //console.log('Result: ', result)

            } catch (error) {
                //console.log('Error: ', error);
                console.log(`Failure: Wrap ${oraclePubKey[oracle]}: ${JSON.parse(error.body).error.message} `);
            }
        };
    };

    console.log(`Wrapped ${amount} wfio`)

    try {
        const balance = await wfio.balanceOf(ethAddress);
        const newbal = balance.toNumber()  // Truffle returns a BN big number that needs to be converted
        console.log('Balance after: ', newbal)
    } catch (err) {
        console.log('getBalance Error: ', err);
    }

    //callback();
}