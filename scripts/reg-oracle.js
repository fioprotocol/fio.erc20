const WFIO = artifacts.require("WFIO");

const oraclePubKey = process.env["ORACLE"];
const custodians = process.env["CUSTODIANS_LOCAL"];
const custodianPubKeys = custodians.split(',');

module.exports = async (callback) => {
    let wfio;
    wfio = await WFIO.deployed();

    try {
        const wfioAddress = await wfio.address;
        console.log('wfio contract address: ', wfioAddress);
    } catch (error) {
        console.log('Contract address error: ', error);
    }

    for (const i in custodianPubKeys) {
        try {
            await wfio.regoracle(oraclePubKey, {from: custodianPubKeys[i]});
            console.log(`Success: Custodian ${custodianPubKeys[i]} registered ${oraclePubKey}`);
        } catch (error) {
            console.log(`Failure: Custodian ${custodianPubKeys[i]} registering ${oraclePubKey}: ${error} `);
        }
    }

    try {
        const registeredOracles = await wfio.getOracles();
        console.log('Registered Oracle: ', registeredOracles);
    } catch (err) {
        console.log('getOracles Error: ', err);
    }

    callback();
}