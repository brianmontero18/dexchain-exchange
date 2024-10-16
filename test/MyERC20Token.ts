import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';

describe('MyERC20Token', function () {
  async function deployERC20TokenFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const initialSupply = hre.ethers.parseEther('1000');

    const MyERC20Token = await hre.ethers.getContractFactory('MyERC20Token');
    const token = await MyERC20Token.deploy('Test Token', 'TST', initialSupply);

    return { token, owner, otherAccount, initialSupply };
  }

  describe('Deployment', function () {
    it('Should assign the total supply to the owner', async function () {
      const { token, owner, initialSupply } = await loadFixture(deployERC20TokenFixture);
      const ownerBalance = await token.balanceOf(owner.address);
      expect(ownerBalance).to.equal(initialSupply);
    });

    it('Should have correct name and symbol', async function () {
      const { token } = await loadFixture(deployERC20TokenFixture);
      expect(await token.name()).to.equal('Test Token');
      expect(await token.symbol()).to.equal('TST');
    });
  });

  describe('Transactions', function () {
    it('Should transfer tokens between accounts', async function () {
      const { token, otherAccount } = await loadFixture(deployERC20TokenFixture);
      await token.transfer(otherAccount.address, 50);
      const otherAccountBalance = await token.balanceOf(otherAccount.address);
      expect(otherAccountBalance).to.equal(50);
    });

    it('Should emit a Transfer event', async function () {
      const { token, owner, otherAccount } = await loadFixture(deployERC20TokenFixture);
      await expect(token.transfer(otherAccount.address, 50))
        .to.emit(token, 'Transfer')
        .withArgs(owner.address, otherAccount.address, 50);
    });

    it('Should fail if sender does not have enough tokens', async function () {
      const { token, owner, otherAccount } = await loadFixture(deployERC20TokenFixture);
      const tokenWithSigner = await hre.ethers.getContractAt('MyERC20Token', await token.getAddress(), otherAccount);

      await expect(tokenWithSigner.transfer(owner.address, 1)).to.be.reverted;
    });
  });

  describe('Allowance', function () {
    it('Should approve tokens for delegated transfer', async function () {
      const { token, owner, otherAccount } = await loadFixture(deployERC20TokenFixture);
      await token.approve(otherAccount.address, 100);
      expect(await token.allowance(owner.address, otherAccount.address)).to.equal(100);
    });

    it('Should transfer tokens via transferFrom', async function () {
      const { token, owner, otherAccount } = await loadFixture(deployERC20TokenFixture);
      const tokenWithSigner = await hre.ethers.getContractAt('MyERC20Token', await token.getAddress(), otherAccount);

      await token.approve(otherAccount.address, 100);
      await tokenWithSigner.transferFrom(owner.address, otherAccount.address, 50);
      expect(await token.balanceOf(otherAccount.address)).to.equal(50);
    });
  });

  describe('Burn Functionality', function () {
    it('Should burn tokens from owner balance', async function () {
      const { token, owner } = await loadFixture(deployERC20TokenFixture);

      // Burn tokens
      await expect(token.burn(hre.ethers.parseEther('100')))
        .to.emit(token, 'Transfer')
        .withArgs(owner.address, hre.ethers.ZeroAddress, hre.ethers.parseEther('100'));

      // Check that the owner's balance has decreased
      const ownerBalance = await token.balanceOf(owner.address);
      expect(ownerBalance).to.equal(hre.ethers.parseEther('900'));

      // Check that the total supply has decreased
      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.equal(hre.ethers.parseEther('900'));
    });

    it('Should revert if trying to burn more than balance', async function () {
      const { token } = await loadFixture(deployERC20TokenFixture);

      await expect(
        token.burn(hre.ethers.parseEther('2000')) // Try to burn more than you have
      ).to.be.revertedWith('ERC20: burn amount exceeds balance');
    });
  });
});
