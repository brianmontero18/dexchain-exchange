import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import hre from 'hardhat';

describe('Pair', function () {
  async function deployPairFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const MyERC20Token = await hre.ethers.getContractFactory('MyERC20Token');
    const tokenA = await MyERC20Token.deploy('Token A', 'TKA', hre.ethers.parseEther('1000'));
    const tokenB = await MyERC20Token.deploy('Token B', 'TKB', hre.ethers.parseEther('1000'));
    const tokenAAddress = await tokenA.getAddress();
    const tokenBAddress = await tokenB.getAddress();

    const Pair = await hre.ethers.getContractFactory('Pair');
    const pair = await Pair.deploy(tokenAAddress, tokenBAddress);
    const pairAddress = await pair.getAddress();

    await tokenA.transfer(otherAccount.address, hre.ethers.parseEther('100'));
    await tokenB.transfer(otherAccount.address, hre.ethers.parseEther('100'));

    return { pair, pairAddress, tokenA, tokenB, tokenAAddress, tokenBAddress, owner, otherAccount };
  }

  describe('Liquidity Management', function () {
    it('Should add liquidity', async function () {
      const { pair, pairAddress, tokenA, tokenB, otherAccount } = await loadFixture(deployPairFixture);

      await tokenA.connect(otherAccount).approve(pairAddress, hre.ethers.parseEther('50'));
      await tokenB.connect(otherAccount).approve(pairAddress, hre.ethers.parseEther('50'));

      await expect(pair.addLiquidity(otherAccount, hre.ethers.parseEther('50'), hre.ethers.parseEther('50')))
        .to.emit(pair, 'LiquidityAdded')
        .withArgs(otherAccount.address, hre.ethers.parseEther('50'), hre.ethers.parseEther('50'));
    });

    it('Should fail to add liquidity without approval', async function () {
      const { pair, otherAccount } = await loadFixture(deployPairFixture);

      await expect(pair.addLiquidity(otherAccount, hre.ethers.parseEther('50'), hre.ethers.parseEther('50'))).to.be
        .reverted;
    });

    it('Should remove liquidity', async function () {
      const { pair, pairAddress, tokenA, tokenB, otherAccount } = await loadFixture(deployPairFixture);

      await tokenA.connect(otherAccount).approve(pairAddress, hre.ethers.parseEther('50'));
      await tokenB.connect(otherAccount).approve(pairAddress, hre.ethers.parseEther('50'));

      await pair.addLiquidity(otherAccount, hre.ethers.parseEther('50'), hre.ethers.parseEther('50'));

      await expect(pair.removeLiquidity(otherAccount, hre.ethers.parseEther('25'), hre.ethers.parseEther('25')))
        .to.emit(pair, 'LiquidityRemoved')
        .withArgs(otherAccount.address, hre.ethers.parseEther('25'), hre.ethers.parseEther('25'));
    });

    it('Should fail to remove liquidity if insufficient balance', async function () {
      const { pair, otherAccount } = await loadFixture(deployPairFixture);

      await expect(
        pair.removeLiquidity(otherAccount, hre.ethers.parseEther('50'), hre.ethers.parseEther('50'))
      ).to.be.revertedWith('Insufficient token A liquidity');
    });
  });

  describe('Token Swaps', function () {
    it('Should swap tokens', async function () {
      const { pair, pairAddress, tokenA, tokenAAddress, tokenB, tokenBAddress, otherAccount } =
        await loadFixture(deployPairFixture);

      // Approve the contract to transfer tokens from otherAccount
      await tokenA.connect(otherAccount).approve(pairAddress, hre.ethers.parseEther('50'));
      await tokenB.connect(otherAccount).approve(pairAddress, hre.ethers.parseEther('50'));

      // Add liquidity
      await pair.addLiquidity(otherAccount, hre.ethers.parseEther('50'), hre.ethers.parseEther('50'));

      // Approve the contract to execute the swap
      await tokenA.connect(otherAccount).approve(pairAddress, hre.ethers.parseEther('50'));

      // Execute the swap
      await expect(pair.swap(otherAccount, tokenAAddress, hre.ethers.parseEther('50')))
        .to.emit(pair, 'TokenSwapped')
        .withArgs(
          otherAccount.address,
          tokenAAddress,
          tokenBAddress,
          hre.ethers.parseEther('50'),
          anyValue // amountOut will vary
        );
    });
  });

  describe('Swap Calculations', function () {
    it('Should calculate swap amount with fee', async function () {
      const { pair, pairAddress, tokenA, tokenAAddress, tokenB, otherAccount } = await loadFixture(deployPairFixture);

      await tokenA.connect(otherAccount).approve(pairAddress, hre.ethers.parseEther('50'));
      await tokenB.connect(otherAccount).approve(pairAddress, hre.ethers.parseEther('50'));

      await pair.addLiquidity(otherAccount, hre.ethers.parseEther('50'), hre.ethers.parseEther('50'));

      const amountOut = await pair.getSwapAmount(tokenAAddress, hre.ethers.parseEther('10'));
      expect(amountOut).to.be.gt(0);
    });
  });
});
