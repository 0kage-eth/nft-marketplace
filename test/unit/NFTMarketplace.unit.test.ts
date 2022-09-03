import { expect, assert } from "chai"
import { ethers, network, deployments, getNamedAccounts } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Marketplace unit tests", () => {
          beforeEach(async () => {})

          describe("List NFT Tests", () => {})

          describe("Buy NFT Tests", () => {})

          describe("Delist NFT Tests", () => {})

          describe("Update NFT Tests", () => {})

          describe("Withdraw Balance Tests", () => {})
      })
