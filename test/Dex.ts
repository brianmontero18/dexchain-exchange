import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';

describe('Dex', function () {
  async function deployDexFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const MyERC20Token = await hre.ethers.getContractFactory('MyERC20Token');
    const tokenA = await MyERC20Token.deploy('Token A', 'TKA', hre.ethers.parseEther('1000'));
    const tokenB = await MyERC20Token.deploy('Token B', 'TKB', hre.ethers.parseEther('1000'));

    const PairFactory = await hre.ethers.getContractFactory('PairFactory');
    const factory = await PairFactory.deploy();

    const Dex = await hre.ethers.getContractFactory('Dex');
    const dex = await Dex.deploy(await factory.getAddress());
    const tokenAAddress = await tokenA.getAddress();
    const tokenBAddress = await tokenB.getAddress();

    await tokenA.transfer(await otherAccount.getAddress(), hre.ethers.parseEther('100'));
    await tokenB.transfer(await otherAccount.getAddress(), hre.ethers.parseEther('100'));

    return { dex, factory, tokenA, tokenB, owner, otherAccount, tokenAAddress, tokenBAddress };
  }

  it('Should create and register a new pair', async function () {
    const { dex, factory, tokenAAddress, tokenBAddress } = await loadFixture(deployDexFixture);

    const tx = await dex.createAndRegisterPair(tokenAAddress, tokenBAddress);
    const pairAddress = await factory.pairs(tokenAAddress, tokenBAddress);

    await expect(tx).to.emit(dex, 'PairCreated').withArgs(tokenAAddress, tokenBAddress, pairAddress);

    // Verify that the pair address is not zero
    expect(pairAddress).to.not.equal(hre.ethers.ZeroAddress);

    // Verify that the pair is registered in registeredPairs
    const registeredPairs = await dex.getRegisteredPairs();
    expect(registeredPairs.length).to.equal(1);
  });

  it('Should add liquidity to an existing pair', async function () {
    const { dex, factory, tokenA, tokenAAddress, tokenB, tokenBAddress, otherAccount } =
      await loadFixture(deployDexFixture);

    // Create a pair in Dex
    await dex.createAndRegisterPair(tokenAAddress, tokenBAddress);

    // Retrieve the address of the newly created pair
    const pairAddress = await factory.pairs(tokenAAddress, tokenBAddress);

    // Approve tokens for the newly created pair
    const amountA = hre.ethers.parseEther('50');
    const amountB = hre.ethers.parseEther('50');
    await tokenA.connect(otherAccount).approve(pairAddress, amountA);
    await tokenB.connect(otherAccount).approve(pairAddress, amountB);

    // Now add liquidity to the pair
    await expect(dex.connect(otherAccount).addLiquidity(tokenAAddress, tokenBAddress, amountA, amountB))
      .to.emit(dex, 'LiquidityAdded')
      .withArgs(pairAddress, amountA, amountB);
  });

  it('Should not allow adding liquidity to a non-existent pair', async function () {
    const { dex, tokenAAddress, tokenBAddress } = await loadFixture(deployDexFixture);

    await expect(
      dex.addLiquidity(tokenAAddress, tokenBAddress, hre.ethers.parseEther('50'), hre.ethers.parseEther('50'))
    ).to.be.revertedWith('Pair does not exist');
  });

  it('Should swap tokens using an existing pair', async function () {
    const { dex, factory, tokenA, tokenAAddress, tokenB, tokenBAddress, otherAccount } =
      await loadFixture(deployDexFixture);

    // Create a pair in Dex
    await dex.createAndRegisterPair(tokenAAddress, tokenBAddress);
    const pairAddress = await factory.pairs(tokenAAddress, tokenBAddress);

    // Approvals in the Pair to add liquidity
    const amountA = hre.ethers.parseEther('50');
    const amountB = hre.ethers.parseEther('50');
    await tokenA.connect(otherAccount).approve(pairAddress, amountA);
    await tokenB.connect(otherAccount).approve(pairAddress, amountB);
    await dex.connect(otherAccount).addLiquidity(tokenAAddress, tokenBAddress, amountA, amountB);

    // Approval to perform the swap
    await tokenA.connect(otherAccount).approve(pairAddress, amountA);

    // Perform the swap
    await expect(dex.connect(otherAccount).swap(tokenAAddress, tokenBAddress, amountA)).to.emit(dex, 'SwapExecuted');
  });

  it('Should not swap tokens if pair does not exist', async function () {
    const { dex, tokenAAddress, tokenBAddress, otherAccount } = await loadFixture(deployDexFixture);

    await expect(
      dex.connect(otherAccount).swap(tokenAAddress, tokenBAddress, hre.ethers.parseEther('50'))
    ).to.be.revertedWith('Pair does not exist');
  });
});
