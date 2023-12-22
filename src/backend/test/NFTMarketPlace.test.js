const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);
describe("NFTMarketPlace", async function () {
  let deployer, addr1, addr2, nft, marketplace;
  let feePercent = 1;
  let URI = "Sample URI";
  beforeEach(async function () {
    const NFT = await ethers.getContractFactory("NFT");
    const MarketPlace = await ethers.getContractFactory("MarketPlace");
    [deployer, addr1, addr2] = await ethers.getSigners();

    nft = await NFT.deploy({
      value: parseEther("10"),
    });
    marketplace = await MarketPlace.deploy(feePercent, {
      value: parseEther("10"),
    });
  });
  describe("deployment", function () {
    it("Should track name and symbol of the nft collection", async function () {
      expect(await nft.name()).to.equal("NFT-PARO");
      expect(await nft.symbol()).to.equal("PLY");
    });
    it("Should track account and feePercent of the market place", async function () {
      expect(await marketplace.feeAccount()).to.equal(deployer.address);
      expect(await marketplace.feePercent()).to.equal(feePercent);
    });
  });
  describe("Minting NFTs", function () {
    it("Sould track each minted NFT ", async function () {
      // addr1 mints an NFT
      await nft.connect(addr1).mint(URI);
      expect(await nft.tokenCount()).to.equal(1);
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      expect(await nft.tokenURI(1)).to.equal(URI);
      // addr2 mints an NFT
      await nft.connect(addr2).mint(URI);
      expect(await nft.tokenCount()).to.equal(2);
      expect(await nft.balanceOf(addr2.address)).to.equal(1);
      expect(await nft.tokenURI(2)).to.equal(URI);
    });
  });
  describe("Making marketplace items", function () {
    let price = 1;
    let result;
    beforeEach(async function () {
      //addr1 mints an nft
      await nft.connect(addr1).mint(URI);
      //addr1 approves market place to spend nft
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
    });
    it("Should track newly created item, transfer NFT from seller to marketplace and emit offered event", async function () {
      await expect(
        marketplace.connect(addr1).makeItem(nft.address, 1, toWei(price))
      )
        .to.emit(marketplace, "Offered")
        .withArgs(1, nft.address, 1, toWei(price), addr1.address),
        // owner of the nft should now be the marketplace
        expect(await nft.ownerOf(1)).to.equal(marketplace.address),
        expect(await marketplace.itemCount()).to.equal(1);
      const item = await marketplace.items(1);
      expect(item.itemId).to.equal(1);
      expect(item.nft).to.equal(nft.address);
      expect(item.tokenId).to.equal(1);
      expect(item.price).to.equal(toWei(price));
      expect(item.sold).to.equal(false);
    });
    it("Should fail if the price is zero", async function () {
      await expect(
        marketplace.connect(addr1).makeItem(nft.address, 1, 0)
      ).to.be.revertedWith("Price must be greater than zero");
    });
  });
  describe("Purchasing marketplace items", function () {
    let price = 2;
    let fee = (feePercent / 100) * price;
    let totalPriceInWei;
    beforeEach(async function () {
      //addr1 mints an nft
      await nft.connect(addr1).mint(URI);
      //addr1 approves marketplace to spend nft
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
      // addr1 makes their nft a marketplace item
      await marketplace.connect(addr1).makeItem(nft.address, 1, toWei(price));
    });
    it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async function () {
      const sellerInitialEthBal = await addr1.getBalance();
      const feeAccountInitialEthBal = await deployer.getBalance();
      //fetch item total price (market fees + item price)
      const totalPriceInWei = await marketplace.connect(addr2).getTotalPrice(1);
      console.log('hi', await marketplace.connect(addr2).getTotalPrice(1), totalPriceInWei)
      // addr2 will purchas that item
      await expect(
        marketplace.connect(addr2).purchaseItem(1, { value: totalPriceInWei })
      )
        .to.emit(marketplace, "Bought")
        .withArgs(
          1,
          nft.address,
          1,
          toWei(price),
          addr1.address,
          addr2.address
        );
      const sellerFinalEthBal = await addr1.getBalance();
      const feeAccountFinalEthBal = await deployer.getBalance();
      //Seller should receive payment for the price of the NFT sold
      expect(+fromWei(sellerFinalEthBal)).to.equal(
        +price + +fromWei(sellerInitialEthBal)
      );
      // feeAccount should receive fee
      expect(parseInt(+feeAccountFinalEthBal.toString())).to.equal(parseInt(+fee + +feeAccountInitialEthBal.toString()));
      //the buyer should now own the nft
      expect(await nft.ownerOf(1)).to.equal(addr2.address);
      // item should be marked as sold
      expect((await marketplace.items(1)).sold).to.equal(true);
    });
    it("Should fail for invalid item id, sold items and when not enough ether is paid", async function () {
      // fails for invalid item ids
      await expect(
        marketplace.connect(addr2).purchaseItem(2, { value: totalPriceInWei })
      ).to.be.revertedWith("item doesn't exist");
      await expect(
        marketplace.connect(addr2).purchaseItem(0, { value: totalPriceInWei })
      ).to.be.revertedWith("item doesn't exist");
      
      await expect(
        marketplace.connect(addr2).purchaseItem(1, { value: toWei(price) }))
      .to.be.revertedWith(
        "Gand marao"
      );
      // addr2 purchase item 1
      await expect(marketplace
        .connect(addr2)
        .purchaseItem(1, { value: totalPriceInWei })).to.be.revertedWith("Gand marao");
      // deployer tries purchasing item 1 after its beenn sold
      await expect(
        marketplace
          .connect(deployer)
          .purchaseItem(1, { value: totalPriceInWei })
      ).to.be.revertedWith("Gand marao"||"Item already sold");
    });
  });
});
