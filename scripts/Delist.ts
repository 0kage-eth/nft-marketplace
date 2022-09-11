import { BigNumber } from "ethers"
import { network, ethers, getNamedAccounts } from "hardhat"
import { developmentChains } from "../helper-hardhat-config"
import { BasicNFT, NFTMarketPlace } from "../typechain-types"
import { moveBlocks } from "../utils/moveBlocks"

const TOKEN_ID = 26

/**
 * @notice this function delists an already minted NFT
 * @param tokenId Token ID of NFT that needs to be delisted
 */
const delistNFT = async (tokenId: any) => {
    const { deployer } = await getNamedAccounts()
    const nftMarketPlaceContract: NFTMarketPlace = await ethers.getContract(
        "NFTMarketPlace",
        deployer
    )
    const basicNFTContract: BasicNFT = await ethers.getContract("BasicNFT")

    const tx = await nftMarketPlaceContract.delistNFT(basicNFTContract.address, tokenId)
    const delistTxReceipt = await tx.wait(1)

    console.log(`Delisting successful. Txn hash is ${delistTxReceipt.transactionHash}`)

    if (developmentChains.includes(network.name)) {
        console.log("moving blocks...and sleeping for 2 seconds")
        await moveBlocks(1, 2000)
    }
}

delistNFT(TOKEN_ID)
    .then(() => {
        console.log(`NFT with token id ${TOKEN_ID} delisted successfully`)
        process.exit(0)
    })
    .catch((e) => {
        console.log(`Delisting NFT with token id ${TOKEN_ID} failed`)
        console.error(e)
        process.exit(1)
    })
