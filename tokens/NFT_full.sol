// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract MyNft_full is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string _baseTokenURI;
    uint256 public price = 0.01 ether;
    bool public paused = true;

    uint256 private __reserved = 100;
    address private __vault = 0x4a5638221f9879C9cfC3D377FdC099697d23adDC; //todo: zastąp swoim adresem metamask

    bool public onlyWhitelisted = true;
    mapping(address => bool) public whitelistedAddresses;

    event WithdrawAll(uint256 _amt, address _to);
    event SetURI(string _uri);
    event WhitelistStatus(bool _state);
    event WhitelistUsers(address[] _wallets, bool _state);

    constructor(string memory baseURI) ERC721("MyNftName", "Ticker")  {
        setBaseURI(baseURI);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function getURI() external view returns (string memory){
        return _baseTokenURI;
    }

    function mint(uint _num) public payable {
        uint256 supply = totalSupply() + 1;
        require(!paused,                                 "Sale paused" );
        require(msg.value == price * _num,               "Ether sent is not correct" );

        if(onlyWhitelisted) {
            require(whitelistedAddresses[msg.sender],    "Wallet is not whitelisted");
        }

        for(uint256 i; i < _num; i++){
            _safeMint(msg.sender, supply + i );
        }
        (bool success, ) = payable(__vault).call{value: msg.value}("");
        require(success,                                 "Can't transfer" );
    }
    function walletOfOwner(address _owner) public view returns(uint256[] memory) {
        uint256 tokenCount = balanceOf(_owner);
        uint256[] memory tokensId = new uint256[](tokenCount);
        for(uint256 i; i < tokenCount; i++){
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokensId;
    }
    function giveAway(address _to, uint256 _amount) external onlyOwner() {
        require( _amount <= __reserved, "Exceeds reserved NFT supply" );
        __reserved -= _amount;
        uint256 supply = totalSupply()+1;
        for(uint256 i; i < _amount; i++){
            _safeMint( _to, supply + i );
        }
    }
    function setVaultAddress(address _newAddress) external onlyOwner() {
        require( _newAddress != address(0), "Vault can not be set to the zero address" );
        __vault = _newAddress;
    }
    function setBaseURI(string memory baseURI) public onlyOwner() {
        _baseTokenURI = baseURI;
        emit SetURI(baseURI);
    }
    function setPause(bool _newState) external onlyOwner() {
        paused = _newState;
    }
    function setOnlyWhitelisted(bool _state) external onlyOwner() {
        onlyWhitelisted = _state;
        emit WhitelistStatus(_state);
    }
    function whitelistUsers(address[] calldata _wallets, bool _state) external onlyOwner() {
        for(uint256 i; i < _wallets.length; i++){
            whitelistedAddresses[_wallets[i]] = _state;
        }
        emit WhitelistUsers(_wallets, _state);
    }
}
