// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract dEUR is ERC20, Ownable {
    bool private mintPaused;
    mapping(address => Investor) public whitelist;

    struct Investor {
        uint256 amount;
        bool claimed;
    }

    constructor() ERC20("Digital Euro", "dEUR") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address recipient, uint256 amount) public onlyOwner() {
        _mint(recipient, amount);
    }

    function setMintPaused(bool _state) public onlyOwner() {
        mintPaused = _state;
    }

    function claim() external {
        require(!mintPaused, "Mint paused!");
        require(whitelist[msg.sender].amount>0, "Not whitelisted");
        require(!whitelist[msg.sender].claimed, "Allocation claimed");
        whitelist[msg.sender].claimed = true;
        _mint(msg.sender, whitelist[msg.sender].amount);
    }

    function setWhitelist(address[] memory _wallets, uint256[] memory _amounts, bool _status) external {
        require(msg.sender == owner(), "Not an admin");
        for(uint i=0; i< _amounts.length; i++) {
            whitelist[_wallets[i]] = Investor(_amounts[i], _status);
        }
    }

}
