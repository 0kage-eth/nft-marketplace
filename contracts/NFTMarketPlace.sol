// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @notice NFTMarketPlace contract manages all NFTs
 * @notice this includes listing, delisting of NFTs, buying NFTs
 * @notice also includes function for users to withdraw funds
 */
contract NFTMarketPlace {
    struct Listing {
        uint256 price;
        address owner;
    }
    mapping(address => mapping(uint256 => Listing)) private s_listings;

    error NFTMarketPlace__InvalidPrice();
    error NFTMarketPlace__UnApprovedNFT(address nftAddress, uint256 tokenId);
    error NFTMarketPlace__AlreadyListed(address nftAddress, uint256 tokenId);
    error NFTMarketPlace__NotOwner(address owner, address sender, uint256 tokenId);

    event NFTListed(
        address indexed owner,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    /**
     * @dev modifiers defined here
     * @dev Owner checks if transaction sender is indeed NFT owner of specific token id. Goes through only if sender = owner
     * @dev NotListed checks if a transaction is already listed. Goes through only if not listed.
     */

    // Not Listed modifier
    modifier NotListed(address nftAddress, uint256 tokenId) {
        if (s_listings[nftAddress][tokenId].price > 0) {
            revert NFTMarketPlace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    // Is Owner modifier
    modifier Owner(
        address nftAddress,
        uint256 tokenId,
        address sender
    ) {
        address owner = IERC721(nftAddress).ownerOf(tokenId);
        if (owner != sender) {
            revert NFTMarketPlace__NotOwner(owner, sender, tokenId);
        }
        _;
    }

    function listNFT(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external NotListed(nftAddress, tokenId) Owner(nftAddress, tokenId, msg.sender) {
        // Check if price >0
        if (price <= 0) {
            revert NFTMarketPlace__InvalidPrice();
        }

        // Check if owner has given an approval for NFT to be used
        IERC721 nft = IERC721(nftAddress);

        if (nft.getApproved(tokenId) != address(this)) {
            revert NFTMarketPlace__UnApprovedNFT(nftAddress, tokenId);
        }

        // Check if current sender is owner of NFT
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);

        // emit a listing event
        emit NFTListed(msg.sender, nftAddress, tokenId, price);
    }

    function delistNFT() public {}

    function buyNFT() public {}

    function withdrawProceeds() public payable {}
}
