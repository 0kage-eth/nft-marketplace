import { network, ethers, getNamedAccounts } from "hardhat"
import { developmentChains } from "../helper-hardhat-config"
import { BasicNFT } from "../typechain-types"
import { moveBlocks } from "../utils/moveBlocks"

const mintNFT = async () => {
    const { deployer } = await getNamedAccounts()

    const basicNFTContract: BasicNFT = await ethers.getContract("BasicNFT", deployer)

    const tx = await basicNFTContract.mint()
    const txReceipt = await tx.wait(1)
    const tokenId = txReceipt.events![1].args![1]

    console.log(`Token id minted: ${tokenId}`)
    console.log(`'NFT address: ${basicNFTContract.address}`)

    // if local chain mint additional blocks to ensure mstatus is confirmed in moralis db
    if (developmentChains.includes(network.name)) {
        console.log("Local chain detected...")
        console.log("minting 2 blocks and sleeping for 2 seconds")
        await moveBlocks(2, 2000)
    }
}

mintNFT()
    .then(() => {
        console.log("Successfully minted")
        process.exit(0)
    })
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
