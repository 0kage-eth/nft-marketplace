import { ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains } from "../helper-hardhat-config"
import { BasicNFT, NFTMarketPlace } from "../typechain-types"
import { moveBlocks } from "../utils/moveBlocks"

const TOKEN_ID = 31
const PRICE = "0.2"

const updateNFT = async (tokenId: any, revisedPrice: any) => {
    const { deployer } = await getNamedAccounts()
    const nftMarketPlaceContract: NFTMarketPlace = await ethers.getContract(
        "NFTMarketPlace",
        deployer
    )
    const basicNFTContract: BasicNFT = await ethers.getContract("BasicNFT")

    const updateTx = await nftMarketPlaceContract.updateNFT(
        basicNFTContract.address,
        tokenId,
        ethers.utils.parseEther(revisedPrice)
    )

    const updateTxReceipt = await updateTx.wait(1)

    console.log(`update transaction completed, transaction hash ${updateTxReceipt.transactionHash}`)

    console.log("moving blocks for confirming txn")
    await moveBlocks(1, 2000)
}

updateNFT(TOKEN_ID, PRICE)
    .then(() => {
        console.log("NFT successfully updated!")
        process.exit(0)
    })
    .catch((e) => {
        console.log("Error in updating NFT")
        console.error(e)
        process.exit(1)
    })
