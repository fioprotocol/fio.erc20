const { ethers } = require("ethers");
const config = require("../config");

const WFIO = artifacts.require("WFIO");
let registeredOracles;

const oraclePubKey = config.oracles.publicKeys;

const ethAddress = '0x009310e41f4746AFeca3Ac713e070598067A32db';
const amount = 30000000000; // 20 wfio

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

    if (registeredOracles.length === 1) {
        //for (const oracle in oraclePubKey) {
        oracle = 0;
            try {
                const signer = provider.getSigner(oraclePubKey[oracle]);
                const wfioWithSigner = wfioContract.connect(signer);

                console.log('address: ', signer._address)

                const result = await wfioWithSigner.wrap(ethAddress,amount,'888817abe1b2e820203904f95fccb3a39a4e1084d5131296eab6deb558024b1');
                console.log(`Success: Wrap from ${oraclePubKey[oracle]}`);
                console.log('Result: ', result)

                console.log(`Wrapped ${amount} wfio`)

            } catch (error) {
                //console.log('Error: ', error);
                console.log(`Failure: Wrap ${oraclePubKey[oracle]}: ${JSON.parse(error.body).error.message} `);
            }
        //};
    };



    try {
        const balance = await wfio.balanceOf(ethAddress);
        const newbal = balance.toNumber()  // Truffle returns a BN big number that needs to be converted
        console.log('Balance after: ', newbal)
    } catch (err) {
        console.log('getBalance Error: ', err);
    }

    try {
        console.log('Increase chain time and mine block: ');
        await provider.send("evm_increaseTime", [100]);
        await provider.send("evm_mine", []);
    } catch (err) {
        console.log('Increase time or block mine Error: ', err);
    }

    //callback();
}