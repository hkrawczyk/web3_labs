// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/access/Ownable.sol';

contract dEUR_efficient is ERC20, Ownable {
    bool private mintPaused;

    mapping(address => uint256) public whitelist;

    constructor() ERC20("Digital Euro", "dEUR") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address recipient, uint256 amount) public onlyOwner() {
        _mint(recipient, amount);
    }

    function setMintPaused(bool _state) public {
        require(msg.sender == owner(), "Not an admin");
        mintPaused = _state;
    }

    function claim() external {
        require(whitelist[msg.sender] > 0, "Not whitelisted");
        uint256 amt = whitelist[msg.sender];
        whitelist[msg.sender] = 0;
        _mint(msg.sender, amt);
    }

    function setWhitelist(address[] memory _wallets, uint256[] memory _amounts) external {
        require(msg.sender == owner(), "Not an admin");
        for(uint i=0; i< _amounts.length; i++) {
            whitelist[_wallets[i]] = _amounts[i];
        }
    }

}
