import * as fs from "fs"
import "dotenv/config"
import { network, ethers } from "hardhat"

const ADDRESS_FILE_PATH = "../nft-marketplace-frontend/constants/networkMapping.json"

/**
 * @dev Updates contract address and exports that list to 'constants' folder in marketplace-frontend project
 * @dev when we deploy script, it basically allows the front-end project to interact with contracts
 */

const updateContractAddresses = async () => {
    const shouldUpdateAddresses = process.env.UPDATE_FRONT_END
    if (shouldUpdateAddresses) {
        const contractAddresses = JSON.parse(fs.readFileSync(ADDRESS_FILE_PATH, "utf8"))
        const nftMarketPlaceContract = await ethers.getContract("NFTMarketPlace")

        const chainId = network.config.chainId
        if (chainId) {
            const chainIdString = chainId.toString()
            if (chainIdString in contractAddresses) {
                if (
                    !contractAddresses[chainIdString]["NftMarketPlace"].includes(
                        nftMarketPlaceContract.address
                    )
                ) {
                    contractAddresses[chainIdString].push(nftMarketPlaceContract.address)
                }
            } else {
                contractAddresses[chainIdString] = {
                    NftMarketPlace: [nftMarketPlaceContract.address],
                }
            }

            fs.writeFileSync(ADDRESS_FILE_PATH, JSON.stringify(contractAddresses))
        }
    }
}

export default updateContractAddresses

updateContractAddresses.tags = ["all", "updateContracts"]
