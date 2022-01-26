// SPDX-License-Identifier: MIT
// FIO Protocol ERC20 and Oracle Contract
// Adam Androulidakis 2/2021
// Prototype: Do not use in production

pragma solidity 0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract WFIO is ERC20Upgradeable, ERC20BurnableUpgradeable, ERC20PausableUpgradeable, AccessControlUpgradeable {

    address owner;
    uint256 constant MINTABLE = 1e16;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant CUSTODIAN_ROLE = keccak256("CUSTODIAN_ROLE");

    struct pending {
      mapping (address => bool) approved;
      int approvals;
      address account;
      uint256 amount;
    }

    int custodian_count;
    int oracle_count;

    int uoracmapv;
    int roracmapv;
    int rcustmapv;
    int ucustmapv;

    event unwrapped(string fioaddress, uint256 amount);
    event wrapped(address account, uint256 amount, string obtid);
    event custodian_unregistered(address account, bytes32 eid);
    event custodian_registered(address account, bytes32 eid);
    event oracle_unregistered(address account, bytes32 eid);
    event oracle_registered(address account, bytes32 eid);

    address[] oraclelist;
    mapping ( bytes32 => pending) approvals; // bytes32 hash can be any obtid

    function initialize(uint256 _initialSupply, address[] memory newcustodians ) initializer public {

    __ERC20_init("FIO Protocol","wFIO");
    __AccessControl_init();
    __Pausable_init();
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(PAUSER_ROLE, msg.sender);
    _grantRole(MINTER_ROLE, msg.sender);
    _grantRole(OWNER_ROLE, msg.sender);

      require(newcustodians.length == 10, "wFIO cannot deploy without 10 custodians");
      _mint(msg.sender, _initialSupply);
      owner = msg.sender;
      for (uint8 i = 0; i < 10; i++ ) {
        require(newcustodians[i] != owner, "Contract owner cannot be custodian");
        require(!hasRole(CUSTODIAN_ROLE, newcustodians[i]), "custodian already entered");
        require(newcustodians[i] != address(0), "Invalid account");
        _grantRole(CUSTODIAN_ROLE, newcustodians[i]);
      }
      custodian_count = 10;
      oracle_count = 0;
    }

    function pause() external onlyRole(CUSTODIAN_ROLE) whenNotPaused {
        _pause();
    }

    function unpause() external onlyRole(CUSTODIAN_ROLE) whenPaused {
        _unpause();
    }

    function wrap(address account, uint256 amount, string memory obtid) external onlyRole(ORACLE_ROLE) whenNotPaused{
      require(amount < MINTABLE);
      require(bytes(obtid).length > 0, "Invalid obtid");
      require(account != address(0), "Invalid account");
      require(oracle_count >= 3, "Oracles must be 3 or greater");
      bytes32 obthash = keccak256(bytes(abi.encode(obtid)));
      if (approvals[obthash].approvals < oracle_count) {
        require(!approvals[obthash].approved[msg.sender], "oracle has already approved this obtid");
        approvals[obthash].approvals++;
        approvals[obthash].approved[msg.sender] = true;
      }
      if (approvals[obthash].approvals == 1) {
        approvals[obthash].account = account;
        approvals[obthash].amount = amount;
      }
      if (approvals[obthash].approvals > 1) {
        require(approvals[obthash].account == account, "recipient account does not match prior approvals");
        require(approvals[obthash].amount == amount, "amount does not match prior approvals");
      }
      if (approvals[obthash].approvals == oracle_count) {
       require(approvals[obthash].approved[msg.sender], "An approving oracle must execute wrap");
         _mint(account, amount);
         emit wrapped(account, amount, obtid);
        delete approvals[obthash];
      }

    }

    function unwrap(string memory fioaddress, uint256 amount) external whenNotPaused{
      require(bytes(fioaddress).length > 3 && bytes(fioaddress).length <= 64, "Invalid FIO Address");
      _burn(msg.sender, amount);
      emit unwrapped(fioaddress, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20Upgradeable, ERC20PausableUpgradeable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    function getCustodian(address account) external view returns (bool, int) {
      require(account != address(0), "Invalid address");
      return (hasRole(CUSTODIAN_ROLE, account), custodian_count);
    }

    function getOracle(address account) external view returns (bool, int) {
      require(account != address(0), "Invalid address");
      return (hasRole(ORACLE_ROLE, account), int(oraclelist.length));
    }

    function getOracles() external view returns(address[] memory) {
      return oraclelist;
    }

    function getApproval(string memory obtid) external view returns (int, address, uint256) {
      require(bytes(obtid).length > 0, "Invalid obtid");
      bytes32 obthash = keccak256(bytes(abi.encode(obtid)));
      return (approvals[obthash].approvals, approvals[obthash].account, approvals[obthash].amount);
    }

    function regoracle(address account) external onlyRole(CUSTODIAN_ROLE) {
      require(account != address(0), "Invalid address");
      require(account != msg.sender, "Cannot register self");
      require(!hasRole(ORACLE_ROLE, account), "Oracle is already registered");
      bytes32 id = keccak256(bytes(abi.encode("ro",account, roracmapv )));
      require(!approvals[id].approved[msg.sender],  "msg.sender has already approved this custodian");
      int reqcust = custodian_count * 2 / 3 + 1;
      if (approvals[id].approvals < reqcust) {
        approvals[id].approvals++;
        approvals[id].approved[msg.sender] = true;
      }
      if (approvals[id].approvals == reqcust){
        _grantRole(ORACLE_ROLE, account);
        oraclelist.push(account);
        oracle_count++;
        delete approvals[id];
        roracmapv++;
        emit oracle_registered(account, id);
      }
    }

    function unregoracle(address account) external onlyRole(CUSTODIAN_ROLE) {
      require(account != address(0), "Invalid address");
      require(oracle_count > 0, "No oracles remaining");
      bytes32 id = keccak256(bytes(abi.encode("uo",account, uoracmapv)));
      require(!approvals[id].approved[msg.sender],  "msg.sender has already approved this oracle deactivation");
      require(hasRole(ORACLE_ROLE, account), "Oracle is not registered");
      int reqcust = custodian_count * 2 / 3 + 1;
      if (approvals[id].approvals < reqcust) {
        approvals[id].approvals++;
        approvals[id].approved[msg.sender] = true;
      }
      if ( approvals[id].approvals == reqcust) {
          _revokeRole(ORACLE_ROLE, account);
          oracle_count--;
          delete approvals[id];
          uoracmapv++;

          for(uint16 i = 0; i <= oraclelist.length - 1; i++) {
            if(oraclelist[i] == account) {
              oraclelist[i] = oraclelist[oraclelist.length - 1];
              oraclelist.pop();
              break;
            }
          }

          emit oracle_unregistered(account, id);
      }

    } // unregoracle

    function regcust(address account) external onlyRole(CUSTODIAN_ROLE) {
      require(account != address(0), "Invalid address");
      require(account != msg.sender, "Cannot register self");
      bytes32 id = keccak256(bytes(abi.encode("rc",account, rcustmapv)));
      require(!hasRole(CUSTODIAN_ROLE, account), "Custodian is already registered");
      require(!approvals[id].approved[msg.sender],  "msg.sender has already approved this custodian");
      int reqcust = custodian_count * 2 / 3 + 1;
      if (approvals[id].approvals < reqcust) {
        approvals[id].approvals++;
        approvals[id].approved[msg.sender] = true;
      }
      if (approvals[id].approvals == reqcust) {
        _grantRole(CUSTODIAN_ROLE, account);
        custodian_count++;
        delete approvals[id];
        rcustmapv++;
        emit custodian_registered(account, id);
      }
    }

    function unregcust(address account) external onlyRole(CUSTODIAN_ROLE) {
      require(account != address(0), "Invalid address");
      require(hasRole(CUSTODIAN_ROLE, account), "Custodian is not registered");
      require(custodian_count > 7, "Must contain 7 custodians");
      bytes32 id = keccak256(bytes(abi.encode("uc",account, ucustmapv)));
      require(!approvals[id].approved[msg.sender], "msg.sender has already approved this custodian deactivation");
      int reqcust = custodian_count * 2 / 3 + 1;
      if (approvals[id].approvals < reqcust) {
        approvals[id].approvals++;
        approvals[id].approved[msg.sender] = true;
      }
      if ( approvals[id].approvals == reqcust) {
          _revokeRole(CUSTODIAN_ROLE, account);
          custodian_count--;
          delete approvals[id];
          ucustmapv++;
          emit custodian_unregistered(account, id);
      }
    } //unregcustodian

    // ------------------------------------------------------------------------
    // Don't accept ETH
    // ------------------------------------------------------------------------
    receive () external payable {
        revert();
    }

    function decimals() public view virtual override returns (uint8) {
        return 9;
    }

}
