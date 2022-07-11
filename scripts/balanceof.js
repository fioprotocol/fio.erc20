const WFIO = artifacts.require("WFIO");

module.exports = async (callback) => {
    let wfio;
    wfio = await WFIO.deployed();

    try {

        const balance = await wfio.balanceOf('0x1693F5557f1509E759e6c4D6B8deb5827e22e984');
        console.log('balance: ', balance)
        const newbal = balance.toNumber()  // Truffle returns a BN big number that needs to be converted
        console.log('newbal: ', newbal)

    } catch (err) {
        console.log('getBalance Error: ', err);
    }

    //callback();
}