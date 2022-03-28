var Contract = artifacts.require("WFIO");
var Custodians = [
  '0xbb8963B0d68DE4669663e987e3a82EA41CA8Fd0d',
  '0xae176ba5407b1a263a60b8407b766e99518f9200',
  '0x12d859a3449c380968e09db799d842d3b45a336d',
  '0x4055ce6c030df8bb601ae512f0b22f64362b644c',
  '0x15c02834c5a35cb20161fb5384102547c1c848e3',
  '0xde8c0d016a775205f026de74cf3b5c8b428babb6',
  '0x91061cc71e1d6111c12460b270fe97511c232bd5',
  '0x0ab5bd2c66236280796bf670db93fdf6db3a092a',
  '0x56068fbfa2f63e675813a3238818c43eac94322b',
  '0x04322f672a03df7911855a796b600934eeda301b'
];
module.exports = function(deployer) {
  deployer.deploy(Contract, 0, Custodians);
};
