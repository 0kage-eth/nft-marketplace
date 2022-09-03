import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains, networkConfig } from "../helper-hardhat-config"

const deployNFTMarketplace = async (hre: HardhatRuntimeEnvironment) => {
    const { ethers, getNamedAccounts, deployments, network } = hre

    const { deployer } = await getNamedAccounts()

    const { deploy, log } = deployments
    const chainId = network.config.chainId

    if (chainId) {
        log("deploying marketplace contract...")
        const deployTx = await deploy("NFTMarketPlace", {
            from: deployer,
            args: [],
            waitConfirmations: networkConfig[chainId].blockConfirmations,
            log: true,
        })

        log(
            `NFT marketplace deployed at ${deployTx.address}. Txn hash is ${deployTx.transactionHash}`
        )
    } else {
        log("Unknown chain. Exiting deployments...")
    }
}

export default deployNFTMarketplace

deployNFTMarketplace.tags = ["all", "marketplace"]
