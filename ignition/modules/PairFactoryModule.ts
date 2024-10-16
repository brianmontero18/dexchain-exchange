import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const PairFactoryModule = buildModule('PairFactoryModule', (m) => {
  const pairFactory = m.contract('PairFactory');

  return { pairFactory };
});

export default PairFactoryModule;
