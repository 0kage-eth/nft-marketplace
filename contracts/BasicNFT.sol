//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

/**
 * @dev BasicNFT contract mints a simple NFT
 */
contract BasicNFT is ERC721 {
    // uinque ID for a given nft
    uint256 private s_tokenId;

    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    event NFTMinted(address minter, uint256 tokenId);

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        s_tokenId = 0;
    }

    /**
     * @dev mints a new NFT and incremenst token Id
     */
    function mint() public {
        _safeMint(msg.sender, s_tokenId);
        s_tokenId += 1;
        emit NFTMinted(msg.sender, s_tokenId);
    }

    /**
     * @dev returns latest token id
     */
    function getTokenId() public view returns (uint256) {
        return s_tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        console.log("tokenId inside token URI is %s", tokenId);
        require(tokenId >= 0, "Invalid token ID");
        return TOKEN_URI;
    }
}
