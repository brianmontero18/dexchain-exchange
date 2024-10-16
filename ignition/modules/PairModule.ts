import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const PairModule = buildModule('PairModule', (m) => {
  const tokenA = m.contract('MyERC20Token', ['Token A', 'TKA', BigInt(1000 * 10 ** 18)]);
  const tokenB = m.contract('MyERC20Token', ['Token B', 'TKB', BigInt(1000 * 10 ** 18)]);

  const pair = m.contract('Pair', [tokenA, tokenB]);

  return { pair, tokenA, tokenB };
});

export default PairModule;
