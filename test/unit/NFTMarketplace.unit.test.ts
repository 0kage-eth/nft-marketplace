import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect, assert } from "chai"
import { BigNumber, Signer } from "ethers"
import { ethers, network, deployments, getNamedAccounts } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { NFTMarketPlace } from "../../typechain-types"
import { BasicNFT } from "../../typechain-types"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Marketplace unit tests", () => {
          let nftMarketPlace: NFTMarketPlace
          let basicNFT: BasicNFT

          let owner: SignerWithAddress,
              signer1: SignerWithAddress,
              signer2: SignerWithAddress,
              signer3: SignerWithAddress

          let nft1TokenId: BigNumber, nft2TokenId: BigNumber, nft3TokenId: BigNumber
          /**
           * @dev initialize the marketplace contract in beforeEach
           */
          beforeEach(async () => {
              await deployments.fixture(["basicnft", "marketplace"])
              const { deployer, nftOwner1, nftOwner2, nftOwner3 } = await getNamedAccounts()

              nftMarketPlace = await ethers.getContract("NFTMarketPlace", deployer)

              basicNFT = await ethers.getContract("BasicNFT", deployer)

              signer1 = await ethers.getSigner(nftOwner1)
              signer2 = await ethers.getSigner(nftOwner2)
              signer3 = await ethers.getSigner(nftOwner3)
              owner = await ethers.getSigner(deployer)

              // ****** Mint 1'st NFT *****
              const mint1Tx = await basicNFT.connect(signer1).mint()
              const mint1Receipt = await mint1Tx.wait(1)
              // console.log("mint 1 receipt", mint1Receipt)
              // console.log("mint 1 address", mint1Receipt.events![1].args!.minter)
              // console.log("mint 1 tokens", mint1Receipt.events![1].args!.tokenId)

              nft1TokenId = (await basicNFT.getTokenId()).sub(1)
              console.log("nft 1 token id", nft1TokenId.toString())

              // ****** Mint 2'nd NFT *****
              const mint2Tx = await basicNFT.connect(signer2).mint()
              const mint2Receipt = await mint2Tx.wait(1)

              //   console.log("mint 2 receipt", mint2Receipt)
              //   console.log("mint 2 address", mint2Receipt.events![1].args!.minter)
              //   console.log("mint 2 tokens", mint2Receipt.events![1].args!.tokenId)

              nft2TokenId = (await basicNFT.getTokenId()).sub(1)
              console.log("nft 2 token id", nft2TokenId.toString())

              const mint3Tx = await basicNFT.connect(signer3).mint()
              const mint3Receipt = await mint2Tx.wait(1)

              //   console.log("mint 3 receipt", mint3receipt)
              //   console.log("mint 3 address", mint3Receipt.events![1].args!.minter)
              //   console.log("mint 3 tokens", mint3Receipt.events![1].args!.tokenId)

              nft3TokenId = (await basicNFT.getTokenId()).sub(1)
              //   console.log("nft 3 token id", nft3TokenId.toString())
          })

          describe("List NFT Tests", () => {
              it("listing by non-owner", async () => {
                  await expect(
                      // I'm trying to connect signer2 but listing nft1
                      // signer2 is not an owner of nft1 - should throw a NotOwner error
                      nftMarketPlace
                          .connect(signer2)
                          .listNFT(basicNFT.address, nft1TokenId, ethers.utils.parseEther("1"))
                  )
                      .to.be.revertedWithCustomError(nftMarketPlace, "NFTMarketPlace__NotOwner")
                      .withArgs(signer1.address, signer2.address, () => true)
              })

              it("Listing price is zero", async () => {
                  // if price is zero, listing should fail with 'InvalidPrice' error
                  await expect(
                      nftMarketPlace
                          .connect(signer1)
                          .listNFT(basicNFT.address, nft1TokenId, ethers.utils.parseEther("0"))
                  ).to.revertedWithCustomError(nftMarketPlace, "NFTMarketPlace__InvalidPrice")
              })

              it("unapproved nft", async () => {
                  // since signer1 (owner of nft1) has not given approval
                  // listing should fail with error 'NFTMarketPlace__UnApprovedNFT'
                  await expect(
                      nftMarketPlace
                          .connect(signer1)
                          .listNFT(basicNFT.address, nft1TokenId, ethers.utils.parseEther("1"))
                  )
                      .to.revertedWithCustomError(nftMarketPlace, "NFTMarketPlace__UnApprovedNFT")
                      .withArgs(basicNFT.address, nft1TokenId)
              })

              it("emit listing event", async () => {
                  // first signer1 (who owns nft1) needs to approve permission to nftMarketplace to access NFT in BasicNFT contract
                  await basicNFT.connect(signer1).approve(nftMarketPlace.address, nft1TokenId)

                  // once done, nftMarket place should list NFT with 1 ether
                  // we check if 'NFTListed' event is emitted (on successful listing)
                  await expect(
                      nftMarketPlace
                          .connect(signer1)
                          .listNFT(basicNFT.address, nft1TokenId, ethers.utils.parseEther("1"))
                  )
                      .to.emit(nftMarketPlace, "NFTListed")
                      .withArgs(
                          signer1.address,
                          basicNFT.address,
                          nft1TokenId,
                          ethers.utils.parseEther("1")
                      )
              })

              it("already listed", async () => {
                  // list NFT1 and then try re-listing same NFT
                  // should throw an 'Already Listed' error

                  //give approval
                  await basicNFT.connect(signer1).approve(nftMarketPlace.address, nft1TokenId)

                  // signer1 lists nft1
                  await nftMarketPlace
                      .connect(signer1)
                      .listNFT(basicNFT.address, nft1TokenId, ethers.utils.parseEther("1"))

                  await expect(
                      nftMarketPlace
                          .connect(signer1)
                          .listNFT(basicNFT.address, nft1TokenId, ethers.utils.parseEther("0.5"))
                  )
                      .to.revertedWithCustomError(nftMarketPlace, "NFTMarketPlace__AlreadyListed")
                      .withArgs(basicNFT.address, nft1TokenId)
              })
          })

          describe("Buy NFT Tests", () => {
              it("cant buy a NFT currently not listed", async () => {
                  await expect(nftMarketPlace.buyNFT(basicNFT.address, nft1TokenId))
                      .to.be.revertedWithCustomError(nftMarketPlace, "NFTMarketPlace__NotListed")
                      .withArgs(basicNFT.address, nft1TokenId)
              })

              it("offer price less than listed price", async () => {
                  // approve nft
                  await basicNFT.connect(signer1).approve(nftMarketPlace.address, nft1TokenId)

                  const listingPrice = ethers.utils.parseEther("1")
                  const offerPrice = ethers.utils.parseEther("0.5")

                  // list nft
                  await nftMarketPlace
                      .connect(signer1)
                      .listNFT(basicNFT.address, nft1TokenId, listingPrice)

                  // buy nft with price lower than listed price
                  // connect as signer 2
                  // sending an offer price of 0.5 ethers. Less than 1 ethers listing price
                  await expect(
                      nftMarketPlace.connect(signer2).buyNFT(basicNFT.address, nft1TokenId, {
                          value: offerPrice,
                      })
                  )
                      .to.be.revertedWithCustomError(
                          nftMarketPlace,
                          "NFTMarketPlace__PriceNotMatched"
                      )
                      .withArgs(basicNFT.address, nft1TokenId, offerPrice, listingPrice)
              })

              it("owner of NFT changed to buyer on purchase", async () => {
                  // approve nft
                  await basicNFT.connect(signer1).approve(nftMarketPlace.address, nft1TokenId)

                  const listingPrice = ethers.utils.parseEther("1.0")
                  const offerPrice = ethers.utils.parseEther("1.5")

                  // list nft
                  await nftMarketPlace
                      .connect(signer1)
                      .listNFT(basicNFT.address, nft1TokenId, listingPrice)

                  // buy nft
                  // connect as signer 2
                  await nftMarketPlace.connect(signer2).buyNFT(basicNFT.address, nft1TokenId, {
                      value: offerPrice,
                  })

                  const [nftOwnerOnMarketplace, price] = await nftMarketPlace.getListing(
                      basicNFT.address,
                      nft1TokenId
                  )

                  expect(price).equals(0, "Price of sold NFT on marketplace should be 0")
                  expect(nftOwnerOnMarketplace).equals(
                      "0x0000000000000000000000000000000000000000",
                      "Owner of sold NFT on marketplace should default to 0x address"
                  )
              })

              it("seller balance should increase when NFT is bought", async () => {
                  await basicNFT.connect(signer1).approve(nftMarketPlace.address, nft1TokenId)

                  const listingPrice = ethers.utils.parseEther("1.0")
                  const offerPrice = ethers.utils.parseEther("1.5")

                  // list nft
                  await nftMarketPlace
                      .connect(signer1)
                      .listNFT(basicNFT.address, nft1TokenId, listingPrice)

                  // buy nft
                  // connect as signer 2
                  await nftMarketPlace.connect(signer2).buyNFT(basicNFT.address, nft1TokenId, {
                      value: offerPrice,
                  })

                  const balance = await nftMarketPlace.connect(signer1).getAccountBalance()

                  expect(balance).equals(
                      offerPrice,
                      "seller balance should equal offer price of buyer"
                  )
              })

              it("emit NFTBought event on successful purchase", async () => {
                  await basicNFT.connect(signer1).approve(nftMarketPlace.address, nft1TokenId)

                  const listingPrice = ethers.utils.parseEther("1.0")
                  const offerPrice = ethers.utils.parseEther("1.5")

                  // list nft
                  await nftMarketPlace
                      .connect(signer1)
                      .listNFT(basicNFT.address, nft1TokenId, listingPrice)

                  // buy nft
                  // connect as signer 2
                  await expect(
                      nftMarketPlace.connect(signer2).buyNFT(basicNFT.address, nft1TokenId, {
                          value: offerPrice,
                      })
                  )
                      .to.emit(nftMarketPlace, "NFTBought")
                      .withArgs(signer2.address, basicNFT.address, nft1TokenId, offerPrice)
              })
          })

          describe("Delist NFT Tests", () => {
              it("de-listing for NFT that doesn't exist on marketplace", async () => {
                  await expect(
                      nftMarketPlace.connect(signer1).delistNFT(basicNFT.address, nft1TokenId)
                  )
                      .to.be.revertedWithCustomError(nftMarketPlace, "NFTMarketPlace__NotListed")
                      .withArgs(basicNFT.address, nft1TokenId)
              })

              it("de-listing by non-owner", async () => {
                  await expect(
                      nftMarketPlace.connect(signer2).delistNFT(basicNFT.address, nft1TokenId)
                  )
                      .to.be.revertedWithCustomError(nftMarketPlace, "NFTMarketPlace__NotOwner")
                      .withArgs(signer1.address, signer2.address, nft1TokenId)
              })

              it("emit de-listing event", async () => {
                  // approve listing
                  await basicNFT.connect(signer1).approve(nftMarketPlace.address, nft1TokenId)
                  const listingPrice = ethers.utils.parseEther("1.0")
                  // list
                  await nftMarketPlace
                      .connect(signer1)
                      .listNFT(basicNFT.address, nft1TokenId, listingPrice)

                  // de-list & check for event emission

                  await expect(
                      nftMarketPlace.connect(signer1).delistNFT(basicNFT.address, nft1TokenId)
                  )
                      .to.emit(nftMarketPlace, "NFTDelisted")
                      .withArgs(signer1.address, basicNFT.address, nft1TokenId, listingPrice)
              })

              it("deleted listing once de-listed", async () => {
                  // approve
                  await basicNFT.connect(signer1).approve(nftMarketPlace.address, nft1TokenId)
                  const listingPrice = ethers.utils.parseEther("1.0")
                  // list nft
                  await nftMarketPlace
                      .connect(signer1)
                      .listNFT(basicNFT.address, nft1TokenId, listingPrice)

                  // delist
                  await nftMarketPlace.connect(signer1).delistNFT(basicNFT.address, nft1TokenId)

                  // check price of listing = 0; owner of listing = 0x address
                  const [ownerOnMarketPlace, price] = await nftMarketPlace.getListing(
                      basicNFT.address,
                      nft1TokenId
                  )

                  expect(ownerOnMarketPlace).equals(
                      "0x0000000000000000000000000000000000000000",
                      "on delisting, owner of nft shoulf be null address"
                  )
                  expect(price).equals(0, "on delisting, price should be reset back to 0")
              })
          })

          describe("Update NFT Tests", () => {
              it("not allow non-owner to update NFT listing", async () => {
                  // connecting signer 2 to update nft1 (whose owner is signer1)
                  await expect(
                      nftMarketPlace
                          .connect(signer2)
                          .updateNFT(basicNFT.address, nft1TokenId, ethers.utils.parseEther("1.0"))
                  )
                      .to.be.revertedWithCustomError(nftMarketPlace, "NFTMarketPlace__NotOwner")
                      .withArgs(signer1.address, signer2.address, nft1TokenId)
              })

              it("update only already listed NFT", async () => {
                  const revisedPrice = ethers.utils.parseEther("1.5")

                  await expect(
                      nftMarketPlace
                          .connect(signer1)
                          .updateNFT(basicNFT.address, nft1TokenId, revisedPrice)
                  )
                      .to.be.revertedWithCustomError(nftMarketPlace, "NFTMarketPlace__NotListed")
                      .withArgs(basicNFT.address, nft1TokenId)
              })

              it("updated price should not be <=0", async () => {
                  // approve
                  await basicNFT.connect(signer1).approve(nftMarketPlace.address, nft1TokenId)

                  //list nft
                  await nftMarketPlace
                      .connect(signer1)
                      .listNFT(basicNFT.address, nft1TokenId, ethers.utils.parseEther("1.0"))

                  // update nft with price
                  // expect error

                  await expect(
                      nftMarketPlace
                          .connect(signer1)
                          .updateNFT(basicNFT.address, nft1TokenId, ethers.utils.parseEther("0"))
                  ).to.be.revertedWithCustomError(nftMarketPlace, "NFTMarketPlace__InvalidPrice")
              })

              it("NFT updated event with new price", async () => {
                  // approve
                  await basicNFT.connect(signer1).approve(nftMarketPlace.address, nft1TokenId)

                  // list with price 1 ether
                  await nftMarketPlace
                      .connect(signer1)
                      .listNFT(basicNFT.address, nft1TokenId, ethers.utils.parseEther("1.0"))

                  // update with price 1.5 ether
                  // check event emission
                  const revisedPrice = ethers.utils.parseEther("1.5")
                  await expect(
                      nftMarketPlace
                          .connect(signer1)
                          .updateNFT(basicNFT.address, nft1TokenId, revisedPrice)
                  )
                      .to.emit(nftMarketPlace, "NFTUpdated")
                      .withArgs(signer1.address, basicNFT.address, nft1TokenId, revisedPrice)

                  // check new listing price
                  const [nftMarketplaceOwner, updatedPrice] = await nftMarketPlace.getListing(
                      basicNFT.address,
                      nft1TokenId
                  )

                  expect(updatedPrice).equals(revisedPrice, "Price should be updated to 1.5 ethers")
              })
          })

          describe("Withdraw Balance Tests", () => {
              it("random withdrawal throws zero balance error", async () => {
                  await expect(
                      nftMarketPlace.connect(signer1).withdrawProceeds()
                  ).to.be.revertedWithCustomError(nftMarketPlace, "NFTMarketPlace__ZeroBalance")
              })
              it("balance updated to zero after withdrawal", async () => {
                  // approve
                  await basicNFT.connect(signer1).approve(nftMarketPlace.address, nft1TokenId)

                  // list
                  const listPrice = ethers.utils.parseEther("1.0")
                  await nftMarketPlace
                      .connect(signer1)
                      .listNFT(basicNFT.address, nft1TokenId, listPrice)

                  // buy
                  const offerPrice = listPrice
                  await nftMarketPlace
                      .connect(signer2)
                      .buyNFT(basicNFT.address, nft1TokenId, { value: offerPrice })

                  // withdraw
                  await expect(nftMarketPlace.connect(signer1).withdrawProceeds())
                      .to.emit(nftMarketPlace, "WithdrawBalance")
                      .withArgs(signer1.address, listPrice)
                  // verify if balance == 0

                  const balanceAfterWithdrawal = await nftMarketPlace.getAccountBalance()

                  expect(balanceAfterWithdrawal).equals(
                      0,
                      "Marketplace balance after withdrawal should be zero"
                  )
              })
          })
      })
