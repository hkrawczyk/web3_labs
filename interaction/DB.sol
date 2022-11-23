//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DB is Ownable {
    event Update(uint256 _amount, address indexed _who, bool _isDeposit);

    struct Depositor {
        uint256 amount;
        uint256 lastUpdate;
    }

    mapping(address => Depositor)                               private deposits;
//    mapping(address => mapping(address => Depositor))          private example; //for multi currency support


    ///////////////////
    //// @dev Offer management
    ///////////////////
    function update(
        address _wallet,
        uint256 _amount,
        bool _isDeposit
    ) external {
//        require(__admin.isAuth(msg.sender, 1), "NA");
        if(_isDeposit) {
            if(deposits[_wallet].amount>0) {
                deposits[_wallet].amount      += _amount;
                deposits[_wallet].lastUpdate   = block.timestamp;
            } else {
                deposits[_wallet] = Depositor(_amount, block.timestamp);
            }
        } else {
            deposits[_wallet].amount      -= _amount;
            deposits[_wallet].lastUpdate   = block.timestamp;
        }

        emit Update(_amount, _wallet, _isDeposit);
    }


    ///////////////////
    //// @dev Getters
    ///////////////////
    function getDepositor(address _wallet) external view returns (Depositor memory){
        return deposits[_wallet];
    }

}
