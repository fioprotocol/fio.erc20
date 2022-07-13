//const Web3 = require('web3')
//const Contract = require('web3-eth-contract');
//const config = require("../config");
const fioABI = require("./FIO.json");
const fioContract = new web3.eth.Contract(fioABI, '0x231e42740351f0428970C5a7C408CA40cba2e447');
//const WFIO = artifacts.require("WFIO");

//const web3 = new Web3('http://127.0.0.1:8545');

module.exports = async (callback) => {
    //let wfio;
    //wfio = await WFIO.deployed();
    //console.log('URL: ', wfio.contract._provider.host)

    //Contract.setProvider(wfio.contract._provider.host);

    // 2 different ways, one uses web3 the other uses web3-eth-contract, using web3 to mimic fio.oracle
    // I think truffle exec gives you access to a web3 instance of the current provider.
    //var contract = new Contract(fioABI, '0x7a67f5639b09F9402f60113376AA2bE7dDe4B33c');


    const test = fioContract.getPastEvents('unwrapped', {
        fromBlock: 500,
        toBlock: 'latest'
    }, function(error, events){ console.log(events); })
        .then(function(events){
            console.log(events);
        })


    //callback();
}