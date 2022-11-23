// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract MyNft is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string _baseTokenURI;
    uint256 public price = 0.01 ether;

    address private __vault = 0x4a5638221f9879C9cfC3D377FdC099697d23adDC; //todo: zastąp swoim adresem metamask

    event SetURI(string _uri);

    constructor(string memory baseURI) ERC721("MyNftName", "Ticker")  {
        setBaseURI(baseURI);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }


    function mint(uint _num) public payable {
        uint256 supply = totalSupply() + 1;
        require(msg.value == price * _num,               "Ether sent is not correct" );

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
//            tokensId[i] = ?? //todo: znajdź odpowiednią metodę w załączonych bibliotekach
        }
        return tokensId;
    }

    function setBaseURI(string memory baseURI) public onlyOwner() {
        _baseTokenURI = baseURI;
        emit SetURI(baseURI);
    }
}
