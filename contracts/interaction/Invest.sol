//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface i_db {
    function update(address, uint256, bool) external;
}

contract Invest is Ownable {
    i_db private __db;

    event Interact(address indexed _wallet);

    address private __paymentToken;

    constructor(
        address _dbContract,
        address _token
    ) {
        __db = i_db(_dbContract);
        __paymentToken = _token;
    }


    ///////////////////
    //// @dev Owner management
    ///////////////////
    function setDbContract(address _dbContract) external onlyOwner()  {
        __db = i_db(_dbContract);
    }

    ///////////////////
    //// @dev Investment
    ///////////////////
    function stake(uint256 _amount) external {
        __db.update(msg.sender, _amount, true);
        bool success = IERC20(__paymentToken).transferFrom(msg.sender, address(this), _amount);
        require(success, "Transfer error");
        emit Interact(msg.sender);
    }

//    function deposit(uint256 _amount) external {
//
//    }
//    function withdraw(uint256 _amount) external {
//
//    }
}
