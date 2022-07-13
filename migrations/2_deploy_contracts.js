const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

var Contract = artifacts.require("WFIO");
var Custodians =[
  '0xf74634D31E30b7f9f06e30dDb7Be729C2f136bb7',
  '0x773171b2977059ffe47b2620bB52e2a5C456ed41',
  '0xDd8D967974b451cF25116E673b987DCD407bc9fc',
  '0x226172d1D968A975688Dcf72346ABBab93E97411',
  '0xDFaA71cAfa2624c403cC8FC18cbC2f9139290fc2',
  '0x61e3D238B0687b7c54F195776F91C2fDa452Fb66',
  '0xDbe7FA5bDab52EEAFfd79c9f382E57fb641C10FF',
  '0x4A66C0f2159989bfD7900658129d43019db9528D',
  '0x3f8d7D92513084318Eca0736806fc316C208cA47',
  '0x1e4a59E644C003FA8e3FdCE77ef9851fCBa2f0c6'
]

var custodianPubKeysDev = [
  "0x825abC908237521012d8e5Dff76Bfe7cb7c0140c",
  "0x8c796f8ECfc49020ECB92eE9bb2da7E91b92A3F7",
  "0x53d1C568085d9B87439532e828DB94f96EF11B36",
  "0xF7b5EaDD2F36Cc86066916c231FCbF9010b2C4F5",
  "0x8c97730Dbd3894b0fB50905aDabF34401c0E1E3e",
  "0xC1B7E208Ea318347d6E399ded98C4d5e78AC97cA",
  "0x74036589F9E1150fb80a4DC9918B67df15307cAA",
  "0xc31ddff97fC50ec0A045C940419fbf45b8EB2A38",
  "0x89BdE6E6b7503A49075F2D1609c6dF1d0E1F11C0",
  "0xC6770f6B7308Cc0b379D5A054A4a85aC85C2cFE4"
];
module.exports = async function(deployer, network) {
  if (network == "development") {
    await deployer.deploy(Contract, 0, custodianPubKeysDev);
  } else {
    const instance = await deployProxy(Contract, [0, Custodians], { deployer });
    //const upgraded = await upgradeProxy(instance.address, Contract, {deployer});
  }
};
