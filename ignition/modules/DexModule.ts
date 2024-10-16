import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const DexModule = buildModule('DexModule', (m) => {
  const tokenA = m.contract('MyERC20Token', ['Token A', 'TKA', BigInt(1000 * 10 ** 18)]);
  const tokenB = m.contract('MyERC20Token', ['Token B', 'TKB', BigInt(1000 * 10 ** 18)]);
  const pairFactory = m.contract('PairFactory');
  const dex = m.contract('Dex', [pairFactory]);

  return { tokenA, tokenB, pairFactory, dex };
});

export default DexModule;
