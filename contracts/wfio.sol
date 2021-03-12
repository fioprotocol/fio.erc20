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
    uint8 constant MAXENT = 7;
    uint64 constant MAXMINTABLE = 10000000000000000;
    uint64 constant MAXBURNABLE = MAXMINTABLE;

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
    }

    mapping ( address => oracle) oracles;
    mapping ( address => custodian) custodians;
    mapping ( uint256 => pending) approvals; // uint256 hash can be any obtid

    constructor(uint256 _initialSupply, address[] memory newcustodians ) public ERC20("FIO Protocol", "wFIO") {
      require(newcustodians.length == 10, "wFIO cannot deploy without 10 custodians");
      _mint(msg.sender, _initialSupply);
      _setupDecimals(9);
      owner = msg.sender;
      for (uint8 i = 0; i < 10; i++ ) {
        custodians[newcustodians[i]].activation_count = 7;
        custodians[newcustodians[i]].active = true;
        custodians[newcustodians[i]].registered[msg.sender] = true;
      }
    }

    modifier ownerAndCustodian {
      require(
        ((msg.sender == owner) ||
         (custodians[msg.sender].active == true)),
          "Only contract owner or custodians may call this function."
      );
      _;
    }
    /*
    modifier allPrincipals {
      require(
        ((msg.sender == owner) ||
         (custodians[msg.sender].active == true) ||
         (oracles[msg.sender].active == true )),
          "Only contract owner, custodians or oracles may call this function."
      );
      _;
    }
    */
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
       require(amount < MAXMINTABLE);
       require(account != address(0), "Invalid account");
       require(obtid != uint256(0), "Invalid obtid");
       require(account != msg.sender, "Cannot wrap wFIO to self");
       require(approvals[obtid].approver[msg.sender] == false, "oracle has already approved this obtid");
       if (approvals[obtid].approvers < 3)
       {
         approvals[obtid].approvers++;
       } else {
         _mint(account, amount);
         delete approvals[obtid];
       }

    }

    function unwrap(address account, uint256 amount, uint256 obtid) public oracleOnly {
      require(amount < MAXBURNABLE);
      require(account != address(0), "Invalid account");
      require(obtid != uint256(0), "Invalid obtid");
      require(approvals[obtid].approver[msg.sender] == false, "oracle has already approved this obtid");
      if (approvals[obtid].approvers < 3)
      {
        approvals[obtid].approvers++;
      } else {
        _burn(account, amount);
        delete approvals[obtid];
      }

    }

    function unapprove(address account, uint256 obtid) public oracleOnly {
      require(account != address(0), "Invalid account");
      require(obtid != uint256(0), "Invalid obtid");
      require(approvals[obtid].approver[msg.sender] == true, "oracle has not approved this obtid");
      approvals[obtid].approvers--;
      delete approvals[obtid].approver[msg.sender];
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

    function getApprovals(uint256 obtid) public view returns (int) {
      require(obtid != uint256(0), "Invalid obtid");
      return approvals[obtid].approvers;
    }

    function regoracle(address ethaddress) public custodianOnly {
      require(ethaddress != address(0), "Invalid address");
      require(ethaddress != msg.sender, "Cannot register self");
      require(oracles[ethaddress].active == false, "Oracle is already registered");
      require(oracles[ethaddress].registered[msg.sender] == false, "msg.sender has already registered this oracle");
      if (oracles[ethaddress].activation_count < MAXENT) {
        oracles[ethaddress].activation_count++;
        oracles[ethaddress].registered[msg.sender] = true;
      }
      if (oracles[ethaddress].activation_count == MAXENT){
        oracles[ethaddress].active=true;
      }
    }

    function unregoracle(address ethaddress) public ownerAndCustodian {
      require(ethaddress != address(0), "Invalid address");
      require(ethaddress != msg.sender, "Cannot unregister self");
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
      if (custodians[ethaddress].activation_count < MAXENT) {
        custodians[ethaddress].activation_count++;
        custodians[ethaddress].registered[msg.sender] = true;
      }
      if (custodians[ethaddress].activation_count == MAXENT) {
        custodians[ethaddress].active = true;
      }
    }

    function unregcust(address ethaddress) public ownerAndCustodian() {
      require(ethaddress != address(0), "Invalid address");
      require(ethaddress != msg.sender, "Cannot unregister self");
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
