import { ethers, run } from 'hardhat';

async function main() {
  // Deploy MyERC20Token (Token A)
  const MyERC20Token = await ethers.getContractFactory('MyERC20Token');
  const tokenA = await MyERC20Token.deploy('Token A', 'TKA', ethers.parseEther('1000'));
  await tokenA.waitForDeployment();
  console.log('Token A deployed to:', await tokenA.getAddress());

  // Deploy MyERC20Token (Token B)
  const tokenB = await MyERC20Token.deploy('Token B', 'TKB', ethers.parseEther('1000'));
  await tokenB.waitForDeployment();
  console.log('Token B deployed to:', await tokenB.getAddress());

  // Deploy PairFactory
  const PairFactory = await ethers.getContractFactory('PairFactory');
  const pairFactory = await PairFactory.deploy();
  await pairFactory.waitForDeployment();
  console.log('PairFactory deployed to:', await pairFactory.getAddress());

  // Deploy Pair contract
  const Pair = await ethers.getContractFactory('Pair');
  const pair = await Pair.deploy(await tokenA.getAddress(), await tokenB.getAddress());
  await pair.waitForDeployment();
  console.log('Pair deployed to:', await pair.getAddress());

  // Deploy Dex contract with PairFactory address
  const Dex = await ethers.getContractFactory('Dex');
  const dex = await Dex.deploy(await pairFactory.getAddress());
  await dex.waitForDeployment();
  console.log('Dex deployed to:', await dex.getAddress());

  console.log('Verifying contracts...');

  try {
    // Verify Token A
    await run('verify:verify', {
      address: await tokenA.getAddress(),
      constructorArguments: ['Token A', 'TKA', ethers.parseEther('1000')],
    });
    console.log('Token A verified');

    // Verify Token B
    await run('verify:verify', {
      address: await tokenB.getAddress(),
      constructorArguments: ['Token B', 'TKB', ethers.parseEther('1000')],
    });
    console.log('Token B verified');

    // Verify PairFactory
    await run('verify:verify', {
      address: await pairFactory.getAddress(),
    });
    console.log('PairFactory verified');

    // Verify Pair
    await run('verify:verify', {
      address: await pair.getAddress(),
      constructorArguments: [await tokenA.getAddress(), await tokenB.getAddress()],
    });
    console.log('Pair verified');

    // Verify Dex
    await run('verify:verify', {
      address: await dex.getAddress(),
      constructorArguments: [await pairFactory.getAddress()],
    });
    console.log('Dex verified');
  } catch (error) {
    console.error('Error during verification:', error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
