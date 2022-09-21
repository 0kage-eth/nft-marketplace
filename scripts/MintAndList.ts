import { network, ethers, getNamedAccounts } from "hardhat"
import { developmentChains } from "../helper-hardhat-config"
import { BasicNFT } from "../typechain-types"
import { NFTMarketPlace } from "../typechain-types"
import { moveBlocks, sleep } from "../utils/moveBlocks"
/**
 * @dev script to mint NFT and list it on marketplace
 */
const mintAndList = async () => {
    const { deployer } = await getNamedAccounts()

    console.log("deployer address", deployer)
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
    const txResponse = await basicNFTContract.approve(nftMarketplaceContract.address, tokenId)
    console.log("nft listing approved!")
    await txResponse.wait(1)
    const nftListTx = await nftMarketplaceContract.listNFT(
        basicNFTContract.address,
        tokenId,
        ethers.utils.parseEther("0.5")
    )

    const nftListingReceipt = await nftListTx.wait(1)
    const nftLister = nftListingReceipt.events![0].args![0]
    console.log("nft listed by:", nftLister)
    console.log(`NFT Listed successfuly. Txn hash ${nftListingReceipt.transactionHash}`)

    // move blocks if local chain
    // this is necessary for moralis to correctly capture events when we are
    // testing on our local machine
    if (developmentChains.includes(network.name)) {
        await moveBlocks(1, 2000)
    }
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
