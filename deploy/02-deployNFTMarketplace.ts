import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import { verify } from "../utils/verify"

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

        //verify contract if not local chain
        if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
            await verify(deployTx.address, [])
        }

        log("-------------------")
    } else {
        log("Unknown chain. Exiting deployments...")
    }
}

export default deployNFTMarketplace

deployNFTMarketplace.tags = ["all", "marketplace"]
