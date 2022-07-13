const { ethers } = require("ethers");
const config = require("../config");

const fioABI = require("./FIO.json");
const fioContract = new web3.eth.Contract(fioABI, '0x7a67f5639b09F9402f60113376AA2bE7dDe4B33c');

const WFIO = artifacts.require("WFIO");
let registeredOracles;

const ethAddress = '0x1693F5557f1509E759e6c4D6B8deb5827e22e984';
const amount = 5000000000; // 5 wfio
const fioHandle = "casey@dapixdev";

module.exports = async (callback) => {
    let wfio;
    wfio = await WFIO.deployed();

    console.log('URL: ', wfio.contract._provider.host)
    const provider = new ethers.providers.JsonRpcProvider(wfio.contract._provider.host);

    const wfioAbi = config.wfio.abi;
    const wfioContract = new ethers.Contract(wfio.address, wfioAbi, provider)

    let block = await provider.getBlockNumber();
    console.log('Current block: ', block);


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
        const wfioBalance = await wfio.balanceOf(ethAddress);
        const newbal = wfioBalance.toNumber()  // Truffle returns a BN big number that needs to be converted
        console.log('wfio balance before: ', newbal)
    } catch (err) {
        console.log('getBalance Error: ', err);
    }

    // Unwrap
    try {
        const signer = provider.getSigner(ethAddress)
        const wfioWithSigner = wfioContract.connect(signer);

        console.log('address: ', signer._address)

        const result = await wfioWithSigner.unwrap(fioHandle,amount);
        console.log('result: ', result);
        console.log(`Success: unwrap from ${fioHandle}: ${result}`);

    } catch (error) {
        console.log('Error: ', error);
        //console.log(`Failure: unwrap to ${fioHandle}: ${JSON.parse(error.body).error.message} `);
    }

    console.log(`unwrapped ${amount} wfio`)

    try {
        const balance = await wfio.balanceOf(ethAddress);
        const newbal = balance.toNumber()  // Truffle returns a BN big number that needs to be converted
        console.log('wfio balance after: ', newbal)
    } catch (err) {
        console.log('getBalance Error: ', err);
    }
/*
    try {
        console.log('Increase chain time and mine block: ');
        await provider.send("evm_increaseTime", [100]);
        await provider.send("evm_mine", []);
        let block = await provider.getBlockNumber();
        console.log('Current block: ', block);
    } catch (err) {
        console.log('Increase time or block mine Error: ', err);
    }
*/

    //callback();
}