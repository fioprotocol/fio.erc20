const { ethers } = require("ethers");
const config = require("../config");

const WFIO = artifacts.require("WFIO");

module.exports = async (callback) => {
    let wfio;
    wfio = await WFIO.deployed();
    const provider = new ethers.providers.JsonRpcProvider(wfio.contract._provider.host);

    let block = await provider.getBlockNumber();
    console.log('block before: ', block);

    try {
        const result = await provider.send("evm_increaseTime", [100]);
        console.log('Result: ', result);
        const result2 = await provider.send("evm_mine", []);
        console.log('Result: ', result2);
    } catch (err) {
        console.log('increaseTimestamp error: ', err);
    }

    block = await provider.getBlockNumber();
    console.log('block after: ', block);
    //callback();
}