// SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Pausable.sol";

contract WFIO is ERC20Burnable, ERC20Pausable {

    address owner;
    uint8 constant MAXENT = 7;
    uint64 constant MAXMINTABLE = 10000000000000000;

    struct custodian {
      address[] registered;
      int activation_count;
      bool active;
    }

    struct oracle {
      address[] registered;
      int activation_count;
      bool active;
    }

    mapping ( address => oracle) oracles;
    mapping ( address => custodian) custodians;

    constructor(uint256 _initialSupply) public ERC20("FIO Protocol", "wFIO") {
        _mint(msg.sender, _initialSupply);
        _setupDecimals(9);
        owner = msg.sender;
    }

      modifier ownerAndCustodian {
      require(
        ((msg.sender == owner) ||
         (custodians[msg.sender].active == true)),
          "Only contract owner or custodians may call this function."
      );
      _;
      }

      modifier allPrincipals {
      require(
        ((msg.sender == owner) ||
         (custodians[msg.sender].active == true) ||
         (oracles[msg.sender].active == true )),
          "Only contract owner, custodians or oracles may call this function."
      );
      _;
      }

      modifier ownerOnly {
      require( msg.sender == owner,
          "Only contract owner can call this function."
      );
      _;
      }

    function mint(address to, uint256 amount) public allPrincipals {
       require(amount < MAXMINTABLE);
       _mint(to, amount);
    }

    function oApprove(address spender, uint256 amount) public allPrincipals{
       approve(spender, amount);
    }

    function oTransferFrom(address from, address to, uint256 amount) public allPrincipals {
       transferFrom(from, to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    function regoracle(address ethaddress) public ownerAndCustodian {
      require(ethaddress != address(0), "Must enter a valid eth address");
      require(oracles[ethaddress].active == false, "Oracle is already registered");
      for (uint8 i = 0; i < MAXENT; i++) {
        require(oracles[ethaddress].registered[i] != msg.sender, "msg.sender has already registered this ethaddress");
      }
      if (oracles[ethaddress].activation_count < MAXENT) {
        oracles[ethaddress].activation_count++;
        oracles[ethaddress].registered.push(msg.sender);
      }
      if (oracles[ethaddress].activation_count == MAXENT){
        oracles[ethaddress].active=true;
      }
    }

    function unregoracle(address ethaddress) public ownerAndCustodian {
      require(ethaddress != address(0), "Must enter a valid eth address");
      for (uint8 i = 0; i < MAXENT; i++) {
        if (oracles[ethaddress].registered[i] == msg.sender) {
          if (oracles[ethaddress].activation_count > 0) {
            oracles[ethaddress].activation_count--;
            oracles[ethaddress].registered[i] = address(0);
          }
          if (oracles[ethaddress].activation_count == 0) {
              delete oracles[ethaddress];
          }
        }
      }
    } // unregoracle


    function regcustodian(address ethaddress) public ownerAndCustodian {
      require(ethaddress != address(0), "Must enter a valid eth address");
      require(custodians[ethaddress].active == false, "Custodian is already registered");
      for (uint8 i = 0; i < MAXENT; i++) {
        require(custodians[ethaddress].registered[i] != msg.sender,  "msg.sender has already registered this ethaddress");
      }
      if (custodians[ethaddress].activation_count < MAXENT) {
        custodians[ethaddress].activation_count++;
        custodians[ethaddress].registered.push(msg.sender);
      }
      if (custodians[ethaddress].activation_count == MAXENT) {
        custodians[ethaddress].active = true;
      }
    }

    function unregcustodian(address ethaddress) public ownerAndCustodian {
      require(ethaddress != address(0), "Must enter a valid eth address");
      for (uint8 i = 0; i < MAXENT; i++) {
        if (custodians[ethaddress].registered[i] == msg.sender) {
          if (custodians[ethaddress].activation_count > 0) {
            custodians[ethaddress].activation_count--;
            custodians[ethaddress].registered[i] = address(0);
          }
          if (custodians[ethaddress].activation_count == 0) {
              delete custodians[ethaddress];
          }
        }
      }
    } //unregcustodian

    // ------------------------------------------------------------------------
    // Don't accept ETH
    // ------------------------------------------------------------------------
    receive () external payable {
        revert();
    }

}
