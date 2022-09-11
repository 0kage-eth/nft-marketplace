import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { getNamedAccounts, ethers, network } from "hardhat"
import { developmentChains } from "../helper-hardhat-config"
import { BasicNFT, NFTMarketPlace } from "../typechain-types"
import { moveBlocks } from "../utils/moveBlocks"

const TOKEN_ID = 30
const BUYER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
const BuyNFT = async (tokenId: any, buyer: string) => {
    const { deployer } = await getNamedAccounts()

    const nftMarketPlaceContract: NFTMarketPlace = await ethers.getContract(
        "NFTMarketPlace",
        deployer
    )
    const basicNFTContract: BasicNFT = await ethers.getContract("BasicNFT")
    const buyerAccount = await ethers.getSigner(BUYER)
    const buyTx = await nftMarketPlaceContract
        .connect(buyerAccount)
        .buyNFT(basicNFTContract.address, tokenId, {
            // from: BUYER,
            value: ethers.utils.parseEther("0.5"),
        })

    const receipt = await buyTx.wait(1)

    console.log(`buy txn successfully completed. txn hash ${receipt.transactionHash}`)

    if (developmentChains.includes(network.name)) {
        await moveBlocks(1, 2000)
    }
}

BuyNFT(TOKEN_ID, BUYER)
    .then(() => {
        console.log("NFT Bought successfully!")
        process.exit(0)
    })
    .catch((e) => {
        console.log("Error while buying NFT")
        console.error(e)
        process.exit(1)
    })
