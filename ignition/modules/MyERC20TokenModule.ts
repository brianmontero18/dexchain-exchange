import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const MyERC20TokenModule = buildModule('MyERC20TokenModule', (m) => {
  const tokenA = m.contract('MyERC20Token', ['Token A', 'TKA', BigInt(1000 * 10 ** 18)]);
  const tokenB = m.contract('MyERC20Token', ['Token B', 'TKB', BigInt(1000 * 10 ** 18)]);

  return { tokenA, tokenB };
});

export default MyERC20TokenModule;
