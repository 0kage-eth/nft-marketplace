import { moveBlocks } from "../utils/moveBlocks"
import { developmentChains } from "../helper-hardhat-config"
import { network } from "hardhat"
const MOVE = 2 // number of blocks to moove
const SLEEP = 1000 // time in milliseconds

/**
 * @notice run the script to move blockchain ahead by fixed time and blocks
 * @param blocksToMove number of blocks to moove
 * @param timeToSleep time in milliseconds
 */
const mineAndMoveBlocks = async (blocksToMove: number, timeToSleep: number) => {
    if (developmentChains.includes(network.name)) {
        await moveBlocks(blocksToMove, timeToSleep)
    } else {
        console.log("Can move blocks only on local chains")
    }
}

mineAndMoveBlocks(MOVE, SLEEP)
    .then(() => {
        console.log("block mined successfully")
        process.exit(0)
    })
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
