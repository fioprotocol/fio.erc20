// SPDX-License-Identifier: MIT
// FIO Protocol ERC20 and Oracle Contract
// Adam Androulidakis 2/2021
// Prototype: Do not use in production

pragma solidity ^0.6.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Pausable.sol";

contract WFIO is ERC20Burnable, ERC20Pausable {

    address owner;
    uint8 constant MINCUST = 7;
    uint64 constant MINCUSTMINTABLE = 10000000000000000;
    uint64 constant MINCUSTBURNABLE = MINCUSTMINTABLE;

    struct custodian {
      mapping ( address => bool) registered;
      int activation_count;
      bool active;
    }

    struct oracle {
      mapping ( address => bool) registered;
      int activation_count;
      bool active;
    }

    struct pending {
      mapping (address => bool) approver;
      int approvers;
      address account;
      uint256 amount;
    }

    event unwrapped(string fioaddress, uint256 amount);
    event wrapped(address ethaddress, uint256 amount);

    mapping ( address => oracle) oracles;
    mapping ( address => custodian) custodians;
    mapping ( uint256 => pending) approvals; // uint256 hash can be any obtid

    constructor(uint256 _initialSupply, address[] memory newcustodians ) public ERC20("FIO Protocol", "wFIO") {
      require(newcustodians.length == 10, "wFIO cannot deploy without 10 custodians");
      _mint(msg.sender, _initialSupply);
      _setupDecimals(9);
      owner = msg.sender;
      for (uint8 i = 0; i < 10; i++ ) {
        require(newcustodians[i] != owner, "Contract owner cannot be custodian");
        custodians[newcustodians[i]].activation_count = 0; // For clarity - activation_count is zero for these custodians so contract owner may unregister at will
        custodians[newcustodians[i]].active = true;
        custodians[newcustodians[i]].registered[msg.sender] = true;
      }
    }

    modifier oracleOnly {
      require(oracles[msg.sender].active == true,
         "Only a wFIO oracle may call this function."
      );
      _;
    }

    modifier custodianOnly {
      require(custodians[msg.sender].active == true,
         "Only a wFIO custodian may call this function."
      );
      _;
    }

    modifier ownerOnly {
      require( msg.sender == owner,
          "Only contract owner can call this function."
      );
      _;
    }

    function wrap(address account, uint256 amount, uint256 obtid) public oracleOnly {
      require(amount < MINCUSTBURNABLE);
      require(account != address(0), "Invalid account");
      require(obtid != uint256(0), "Invalid obtid");
      if (approvals[obtid].approvers < 3)
      {
        require(approvals[obtid].approver[msg.sender] == false, "oracle has already approved this obtid");
        approvals[obtid].approvers++;
        approvals[obtid].approver[msg.sender] = true;
      } else {
       require(approvals[obtid].approver[msg.sender] == true, "An approving oracle must execute unwrap");
         _mint(account, amount);
         emit wrapped(account, amount);
        delete approvals[obtid];
      }
      if (approvals[obtid].approvers == 1) {
        approvals[obtid].account = account;
        approvals[obtid].amount = amount;
      }
      if (approvals[obtid].approvers > 1) {
        require(approvals[obtid].account == account, "recipient account does not match prior approvals");
        require(approvals[obtid].amount == amount, "amount does not match prior approvals");
      }
    }

    function unwrap(string memory fioaddress, uint256 amount) public {
      _burn(msg.sender, amount);
      emit unwrapped(fioaddress, amount);
    }

    function oApprove(address spender, uint256 amount) public oracleOnly {
       approve(spender, amount);
    }

    function oTransferFrom(address from, address to, uint256 amount) public oracleOnly {
       transferFrom(from, to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    function getCustodian(address ethaddress) public view returns (int, bool) {
      require(ethaddress != address(0), "Invalid address");
      return (custodians[ethaddress].activation_count, custodians[ethaddress].active);
    }

    function getOracle(address ethaddress) public view returns (int, bool) {
      require(ethaddress != address(0), "Invalid address");
      return (oracles[ethaddress].activation_count, oracles[ethaddress].active);
    }

    function getApprovals(uint256 obtid) public view returns (int, address, uint256) {
      require(obtid != uint256(0), "Invalid obtid");
      return (approvals[obtid].approvers, approvals[obtid].account, approvals[obtid].amount);
    }

    function regoracle(address ethaddress) public custodianOnly {
      require(ethaddress != address(0), "Invalid address");
      require(ethaddress != msg.sender, "Cannot register self");
      require(oracles[ethaddress].active == false, "Oracle is already registered");
      require(oracles[ethaddress].registered[msg.sender] == false, "msg.sender has already registered this oracle");
      if (oracles[ethaddress].activation_count < MINCUST) {
        oracles[ethaddress].activation_count++;
        oracles[ethaddress].registered[msg.sender] = true;
      }
      if (oracles[ethaddress].activation_count == MINCUST){
        oracles[ethaddress].active=true;
      }
    }

    function unregoracle(address ethaddress) public custodianOnly {
      require(ethaddress != address(0), "Invalid address");
      require(ethaddress != msg.sender, "Cannot unregister self");
      require(oracles[ethaddress].active == true, "Oracle is not registered");
      require(oracles[ethaddress].registered[msg.sender] == true, "msg.sender has not registered this oracle");
      if (oracles[ethaddress].activation_count > 0) {
        oracles[ethaddress].activation_count--;
        delete oracles[ethaddress].registered[msg.sender];
      }
      if (oracles[ethaddress].activation_count == 0) {
          delete oracles[ethaddress];
      }

    } // unregoracle


    function regcust(address ethaddress) public custodianOnly {
      require(ethaddress != address(0), "Invalid address");
      require(ethaddress != msg.sender, "Cannot register self");
      require(custodians[ethaddress].active == false, "Custodian is already registered");
      require(custodians[ethaddress].registered[msg.sender] == false,  "msg.sender has already registered this custodian");
      if (custodians[ethaddress].activation_count < MINCUST) {
        custodians[ethaddress].activation_count++;
        custodians[ethaddress].registered[msg.sender] = true;
      }
      if (custodians[ethaddress].activation_count == MINCUST) {
        custodians[ethaddress].active = true;
      }
    }

    function unregcust(address ethaddress) public custodianOnly {
      require(ethaddress != address(0), "Invalid address");
      require(ethaddress != msg.sender, "Cannot unregister self");
      require(custodians[ethaddress].active == true, "Custodian is not registered");
      require(custodians[ethaddress].registered[msg.sender] == true, "msg.sender has not registered this custodian");
      if (custodians[ethaddress].activation_count > 0) {
        custodians[ethaddress].activation_count--;
        delete custodians[ethaddress].registered[msg.sender];
      }
      if (custodians[ethaddress].activation_count == 0) {
          delete custodians[ethaddress];
      }
    } //unregcustodian

    // ------------------------------------------------------------------------
    // Don't accept ETH
    // ------------------------------------------------------------------------
    receive () external payable {
        revert();
    }

}
