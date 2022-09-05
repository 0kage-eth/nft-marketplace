import { network, ethers, getNamedAccounts } from "hardhat"
import { BasicNFT } from "../typechain-types"
import { NFTMarketPlace } from "../typechain-types"

/**
 * @dev script to mint NFT and list it on marketplace
 */
const mintAndList = async () => {
    const { deployer } = await getNamedAccounts()

    // mint basic nft
    const basicNFTContract: BasicNFT = await ethers.getContract("BasicNFT", deployer)

    const nftMintTx = await basicNFTContract.mint()
    const nftMintReceipt = await nftMintTx.wait(1)
    const tokenId = nftMintReceipt.events![1].args!.tokenId.sub(1)
    console.log("token id", tokenId.toString())

    // list nft

    const nftMarketplaceContract: NFTMarketPlace = await ethers.getContract(
        "NFTMarketPlace",
        deployer
    )

    // approve use of nft token by marketplace
    await basicNFTContract.approve(nftMarketplaceContract.address, tokenId)
    const nftListTx = await nftMarketplaceContract.listNFT(
        basicNFTContract.address,
        tokenId,
        ethers.utils.parseEther("1.0")
    )

    const nftListingReceipt = await nftListTx.wait(1)

    console.log(`NFT Listed successfuly. Txn hash ${nftListingReceipt.transactionHash}`)
}

mintAndList()
    .then(() => {
        console.log("NFT Minting and Listing successful")
        process.exit(0)
    })
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
