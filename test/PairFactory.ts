import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';

describe('PairFactory', function () {
  async function deployFactoryFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const MyERC20Token = await hre.ethers.getContractFactory('MyERC20Token');
    const tokenA = await MyERC20Token.deploy('Token A', 'TKA', hre.ethers.parseEther('1000'));
    const tokenB = await MyERC20Token.deploy('Token B', 'TKB', hre.ethers.parseEther('1000'));

    const PairFactory = await hre.ethers.getContractFactory('PairFactory');
    const factory = await PairFactory.deploy();
    const tokenAAddress = await tokenA.getAddress();
    const tokenBAddress = await tokenB.getAddress();

    return { factory, tokenAAddress, tokenBAddress, owner, otherAccount };
  }

  it('Should create a new pair', async function () {
    const { factory, tokenAAddress, tokenBAddress } = await loadFixture(deployFactoryFixture);

    const tx = await factory.createPair(tokenAAddress, tokenBAddress);
    const pairAddress = await factory.pairs(tokenAAddress, tokenBAddress);

    // Verify that the event is correctly emitted with the newly created pair address
    await expect(tx).to.emit(factory, 'PairCreated').withArgs(tokenAAddress, tokenBAddress, pairAddress);

    // Verify that the pair address is not zero
    expect(pairAddress).to.not.equal(hre.ethers.ZeroAddress);
  });

  it('Should not allow creating a pair with the same token', async function () {
    const { factory, tokenAAddress } = await loadFixture(deployFactoryFixture);

    // Should fail if attempting to create a pair with the same token
    await expect(factory.createPair(tokenAAddress, tokenAAddress)).to.be.revertedWith('Factory: IDENTICAL_ADDRESSES');
  });

  it('Should not allow creating an existing pair', async function () {
    const { factory, tokenAAddress, tokenBAddress } = await loadFixture(deployFactoryFixture);

    // Create the pair initially
    await factory.createPair(tokenAAddress, tokenBAddress);

    // Should fail if attempting to create the same pair again
    await expect(factory.createPair(tokenAAddress, tokenBAddress)).to.be.revertedWith('Factory: PAIR_EXISTS');
  });

  it('Should return all pairs', async function () {
    const { factory, tokenAAddress, tokenBAddress } = await loadFixture(deployFactoryFixture);

    // Create a pair
    await factory.createPair(tokenAAddress, tokenBAddress);

    // Retrieve all pairs
    const allPairs = await factory.getAllPairs();

    // Verify that the array contains at least one pair
    expect(allPairs.length).to.equal(1);
  });
});
