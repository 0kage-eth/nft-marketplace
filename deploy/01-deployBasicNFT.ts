import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import { verify } from "../utils/verify"

const deployBasicNFT = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network } = hre

    const { log, deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const args = ["0Kage", "0k"]
    const chainId = network.config.chainId || 31337
    const tx = await deploy("BasicNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[chainId].blockConfirmations,
    })

    console.log(
        `Basic NFT contract deployed, tx has: ${tx.transactionHash}, address is ${tx.address}`
    )

    if (!developmentChains.includes(network.name)) {
        verify(tx.address, args)
    }
}

export default deployBasicNFT

deployBasicNFT.tags = ["all", "basicnft"]
