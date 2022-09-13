import { ethers, network, getNamedAccounts } from "hardhat"
import * as fs from "fs"
import "dotenv/config"

const ADDRESS_FILE_PATH = "../nft-marketplace-frontend/constants/"

const updateContractAbis = async () => {
    const shouldUpdateFrontEnd = process.env.UPDATE_FRONT_END

    if (shouldUpdateFrontEnd) {
        const nftMarketPlaceContract = await ethers.getContract("NFTMarketPlace")
        const nftInterface: any = nftMarketPlaceContract.interface.format(
            ethers.utils.FormatTypes.json
        )

        fs.writeFileSync(`${ADDRESS_FILE_PATH}NFTMarketPlace.json`, nftInterface)

        const basicNftContract = await ethers.getContract("BasicNFT")
        const basicNftInterface: any = basicNftContract.interface.format(
            ethers.utils.FormatTypes.json
        )
        fs.writeFileSync(`${ADDRESS_FILE_PATH}BasicNFT.json`, basicNftInterface)
    }
}

export default updateContractAbis
updateContractAbis.tags = ["all", "updateAbis"]
